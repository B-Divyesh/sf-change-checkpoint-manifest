use base64::{engine::general_purpose::STANDARD as B64, Engine};
use clap::{Parser, Subcommand};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{env, fs, io, path::{Path, PathBuf}, process::{Command, ExitCode}, time::{Instant, SystemTime, UNIX_EPOCH}};

#[derive(Parser)]
#[command(name = "cpc", version, about = "Record portable, signed git checkpoints without command output.")]
struct Cli {
    #[command(subcommand)] command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Record git state and validation exit statuses.
    Checkpoint {
        /// A short checkpoint name (letters, numbers, dash, underscore, dot).
        name: String,
        /// Run a validation command. Repeat for each command.
        #[arg(short = 'c', long = "check", required = true)] checks: Vec<String>,
        /// Explain how a teammate should roll this change back. Required; never executed by cpc.
        #[arg(long)] rollback: String,
        /// Assert an environment value without recording it. Use NAME or NAME=value.
        #[arg(long = "env")] environment: Vec<String>,
        /// Also write the exact working-tree patch beside the manifest. Inspect it before sharing.
        #[arg(long)] include_diff: bool,
        /// Print a machine-readable result.
        #[arg(long)] json: bool,
    },
    /// Verify a manifest signature, current git state, environment assertions, and optionally checks.
    Verify {
        /// JSON manifest path.
        manifest: PathBuf,
        /// Re-run recorded validation commands. Command output is still not saved.
        #[arg(long)] rerun: bool,
        /// Print a machine-readable result.
        #[arg(long)] json: bool,
    },
    /// Show the verified rollback note without changing any files.
    Restore {
        /// JSON manifest path.
        manifest: PathBuf,
        /// Print a machine-readable result.
        #[arg(long)] json: bool,
    },
    /// Run the bundled sample in a temporary git repository.
    Demo {
        /// Print a machine-readable result.
        #[arg(long)] json: bool,
    },
}

#[derive(Serialize, Deserialize, Clone)]
struct Manifest {
    format: String,
    name: String,
    created_unix: u64,
    repository: Repository,
    workspace: Workspace,
    checks: Vec<Check>,
    environment: Vec<EnvironmentAssertion>,
    rollback: String,
    patch: Option<Patch>,
    signature: SignatureBlock,
}

#[derive(Serialize, Deserialize, Clone)]
struct Repository { root: String, head: String, branch: String }
#[derive(Serialize, Deserialize, Clone)]
struct Workspace { status: String, diff_sha256: String, untracked: Vec<Artifact> }
#[derive(Serialize, Deserialize, Clone, PartialEq, Eq)]
struct Artifact { path: String, sha256: String }
#[derive(Serialize, Deserialize, Clone)]
struct Check { command: String, exit_code: i32, duration_ms: u128, environment_dependent: bool }
#[derive(Serialize, Deserialize, Clone)]
struct EnvironmentAssertion { name: String, present: bool, value_sha256: Option<String> }
#[derive(Serialize, Deserialize, Clone)]
struct Patch { path: String, sha256: String }
#[derive(Serialize, Deserialize, Clone)]
struct SignatureBlock { algorithm: String, public_key: String, value: String }

fn main() -> ExitCode {
    match run(Cli::parse()) {
        Ok(code) => ExitCode::from(code),
        Err(error) => { eprintln!("cpc: {error}"); ExitCode::from(1) }
    }
}

fn run(cli: Cli) -> Result<u8, String> {
    match cli.command {
        Commands::Checkpoint { name, checks, rollback, environment, include_diff, json } => checkpoint(&name, &checks, &rollback, &environment, include_diff, json),
        Commands::Verify { manifest, rerun, json } => verify(&manifest, rerun, json),
        Commands::Restore { manifest, json } => restore(&manifest, json),
        Commands::Demo { json } => demo(json),
    }
}

fn checkpoint(name: &str, commands: &[String], rollback: &str, environment: &[String], include_diff: bool, json: bool) -> Result<u8, String> {
    valid_name(name)?;
    if rollback.trim().is_empty() { return Err("--rollback needs a specific rollback instruction".into()); }
    let root = git_root()?;
    let head = git(&root, ["rev-parse", "HEAD"])?;
    let branch = git(&root, ["branch", "--show-current"]).unwrap_or_else(|_| "DETACHED".into());
    let status = filtered_status(&git(&root, ["status", "--porcelain=v1"])?)?;
    let diff = git_bytes(&root, ["diff", "--binary", "HEAD"])?;
    let untracked = untracked_artifacts(&root, &status)?;
    let runs = commands.iter().map(|command| run_check(&root, command)).collect::<Vec<_>>();
    let env_assertions = environment.iter().map(|value| parse_environment(value)).collect::<Result<Vec<_>, _>>()?;
    let directory = root.join(".change-checkpoints");
    fs::create_dir_all(&directory).map_err(io_error)?;
    let patch = if include_diff {
        let path = directory.join(format!("{name}.patch"));
        fs::write(&path, &diff).map_err(io_error)?;
        Some(Patch { path: relative(&root, &path), sha256: hash(&diff) })
    } else { None };
    let key = load_or_make_key(&directory)?;
    let public = B64.encode(key.verifying_key().to_bytes());
    let mut manifest = Manifest {
        format: "change-checkpoints/v1".into(), name: name.into(),
        created_unix: SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| e.to_string())?.as_secs(),
        repository: Repository { root: root.display().to_string(), head: head.trim().into(), branch: branch.trim().into() },
        workspace: Workspace { status: status.trim_end().into(), diff_sha256: hash(&diff), untracked },
        checks: runs, environment: env_assertions, rollback: rollback.into(), patch,
        signature: SignatureBlock { algorithm: "ed25519".into(), public_key: public, value: String::new() },
    };
    let payload = unsigned_bytes(&manifest)?;
    manifest.signature.value = B64.encode(key.sign(&payload).to_bytes());
    let json_path = directory.join(format!("{name}.json"));
    let markdown_path = directory.join(format!("{name}.md"));
    fs::write(&json_path, serde_json::to_vec_pretty(&manifest).map_err(|e| e.to_string())?).map_err(io_error)?;
    fs::write(&markdown_path, render_markdown(&manifest, &json_path)).map_err(io_error)?;
    if json { println!("{}", serde_json::json!({"manifest": json_path, "summary": markdown_path, "checks": manifest.checks})); }
    else {
        println!("Checkpoint recorded: {}", json_path.display());
        println!("Checks: {} passed / {} total", manifest.checks.iter().filter(|c| c.exit_code == 0).count(), manifest.checks.len());
        println!("Verify: cpc verify {} --rerun", json_path.display());
        println!("Rollback note: {}", rollback);
        if !include_diff { println!("Patch not saved. Add --include-diff only after checking it contains no secrets."); }
    }
    Ok(if manifest.checks.iter().all(|c| c.exit_code == 0) { 0 } else { 2 })
}

fn verify(path: &Path, rerun: bool, json: bool) -> Result<u8, String> {
    let manifest = read_manifest(path)?;
    let mut findings = Vec::new();
    if !signature_valid(&manifest)? { findings.push("signature is invalid".into()); }
    let root = git_root()?;
    let head = git(&root, ["rev-parse", "HEAD"])?;
    if head.trim() != manifest.repository.head { findings.push(format!("HEAD differs (recorded {}, found {})", manifest.repository.head, head.trim())); }
    let diff = git_bytes(&root, ["diff", "--binary", "HEAD"])?;
    if hash(&diff) != manifest.workspace.diff_sha256 { findings.push("working-tree diff differs".into()); }
    let status = filtered_status(&git(&root, ["status", "--porcelain=v1"])?)?;
    if status.trim_end() != manifest.workspace.status { findings.push("workspace status differs".into()); }
    if untracked_artifacts(&root, &status)? != manifest.workspace.untracked { findings.push("untracked artifact fingerprints differ".into()); }
    for assertion in &manifest.environment {
        let current = env::var(&assertion.name).ok();
        if current.is_some() != assertion.present || current.as_ref().map(|v| hash(v.as_bytes())) != assertion.value_sha256 { findings.push(format!("environment assertion differs: {}", assertion.name)); }
    }
    if rerun { for check in &manifest.checks { let fresh = run_check(&root, &check.command); if fresh.exit_code != check.exit_code { findings.push(format!("check exit differs: {}", check.command)); } } }
    if json { println!("{}", serde_json::json!({"valid": findings.is_empty(), "findings": findings, "rerun": rerun})); }
    else if findings.is_empty() { println!("Verified: signature, git state, environment{} match.", if rerun { ", and check exit statuses" } else { "" }); }
    else { for finding in &findings { eprintln!("Mismatch: {finding}"); } }
    Ok(if findings.is_empty() { 0 } else { 2 })
}

fn restore(path: &Path, json: bool) -> Result<u8, String> {
    let manifest = read_manifest(path)?;
    if !signature_valid(&manifest)? { return Err("refusing to show a rollback note from an invalid manifest".into()); }
    if json { println!("{}", serde_json::json!({"verified": true, "rollback": manifest.rollback, "head": manifest.repository.head})); }
    else { println!("Verified rollback note (not executed):\n{}", manifest.rollback); }
    Ok(0)
}

fn demo(json: bool) -> Result<u8, String> {
    let target = env::temp_dir().join(format!("change-checkpoints-demo-{}", std::process::id()));
    if target.exists() { fs::remove_dir_all(&target).map_err(io_error)?; }
    fs::create_dir_all(target.join("src")).map_err(io_error)?;
    fs::write(target.join("src/lib.rs"), "pub fn checkpoint_label() -> &'static str { \"ready\" }\n").map_err(io_error)?;
    git_status(&target, ["init"])?; git_status(&target, ["config", "user.email", "demo@example.invalid"])?; git_status(&target, ["config", "user.name", "Checkpoint Demo"])?;
    git_status(&target, ["add", "."])?; git_status(&target, ["commit", "-m", "sample base"])?;
    fs::write(target.join("src/lib.rs"), "pub fn checkpoint_label() -> &'static str { \"tested change\" }\n").map_err(io_error)?;
    let current = env::current_exe().map_err(io_error)?;
    let output = Command::new(current).current_dir(&target).args(["checkpoint", "agent-edit", "--check", "git diff --check", "--check", "git status --porcelain", "--rollback", "git restore src/lib.rs", "--include-diff", "--json"]).output().map_err(io_error)?;
    if !output.status.success() { return Err(String::from_utf8_lossy(&output.stderr).into_owned()); }
    let manifest = target.join(".change-checkpoints/agent-edit.json");
    if json { println!("{}", serde_json::json!({"demo_directory": target, "manifest": manifest})); }
    else { println!("Demo checkpoint created in {}\nOpen the manifest: {}\nReset by deleting that temporary directory.", target.display(), manifest.display()); }
    Ok(0)
}

fn git_root() -> Result<PathBuf, String> { Ok(PathBuf::from(git(&env::current_dir().map_err(io_error)?, ["rev-parse", "--show-toplevel"])?)) }
fn git<const N: usize>(dir: &Path, args: [&str; N]) -> Result<String, String> { String::from_utf8(git_bytes(dir, args)?).map_err(|e| e.to_string()).map(|s| s.trim_end().to_string()) }
fn git_bytes<const N: usize>(dir: &Path, args: [&str; N]) -> Result<Vec<u8>, String> { let result = Command::new("git").args(args).current_dir(dir).output().map_err(io_error)?; if result.status.success() { Ok(result.stdout) } else { Err(String::from_utf8_lossy(&result.stderr).trim().to_string()) } }
fn git_status<const N: usize>(dir: &Path, args: [&str; N]) -> Result<(), String> { git_bytes(dir, args).map(|_| ()) }
fn run_check(root: &Path, command: &str) -> Check { let start = Instant::now(); let result = Command::new("sh").args(["-c", command]).current_dir(root).output(); Check { command: command.into(), exit_code: result.map(|s| s.status.code().unwrap_or(1)).unwrap_or(1), duration_ms: start.elapsed().as_millis(), environment_dependent: is_environment_dependent(command) } }
fn is_environment_dependent(command: &str) -> bool { ["curl", "wget", "http", "date", "time", "network", "docker", "ssh"].iter().any(|word| command.to_lowercase().contains(word)) }
fn parse_environment(value: &str) -> Result<EnvironmentAssertion, String> { let (name, given) = value.split_once('=').unwrap_or((value, "")); if name.is_empty() || !name.chars().all(|c| c.is_ascii_alphanumeric() || c == '_') { return Err(format!("invalid environment name: {name}")); } let actual = if value.contains('=') { Some(given.to_owned()) } else { env::var(name).ok() }; Ok(EnvironmentAssertion { name: name.into(), present: actual.is_some(), value_sha256: actual.as_ref().map(|s| hash(s.as_bytes())) }) }
fn untracked_artifacts(root: &Path, status: &str) -> Result<Vec<Artifact>, String> { status.lines().filter(|line| line.starts_with("?? ")).map(|line| { let name = &line[3..]; let bytes = fs::read(root.join(name)).map_err(io_error)?; Ok(Artifact { path: name.into(), sha256: hash(&bytes) }) }).collect() }
fn filtered_status(status: &str) -> Result<String, String> { Ok(status.lines().filter(|line| !line.get(3..).unwrap_or_default().starts_with(".change-checkpoints/") && !line.get(3..).unwrap_or_default().starts_with(".change-checkpoints\\")).collect::<Vec<_>>().join("\n")) }
fn load_or_make_key(directory: &Path) -> Result<SigningKey, String> { let path = directory.join("signing.key"); if path.exists() { let bytes = fs::read(&path).map_err(io_error)?; let data: [u8; 32] = bytes.as_slice().try_into().map_err(|_| "invalid local signing key")?; Ok(SigningKey::from_bytes(&data)) } else { let key = SigningKey::generate(&mut OsRng); fs::write(&path, key.to_bytes()).map_err(io_error)?; let ignore = directory.join(".gitignore"); if !ignore.exists() { fs::write(ignore, "signing.key\n").map_err(io_error)?; } Ok(key) } }
fn unsigned_bytes(manifest: &Manifest) -> Result<Vec<u8>, String> { let mut unsigned = manifest.clone(); unsigned.signature.value.clear(); serde_json::to_vec(&unsigned).map_err(|e| e.to_string()) }
fn signature_valid(manifest: &Manifest) -> Result<bool, String> { if manifest.signature.algorithm != "ed25519" { return Ok(false); } let public = B64.decode(&manifest.signature.public_key).map_err(|_| "invalid public key")?; let bytes: [u8; 32] = public.as_slice().try_into().map_err(|_| "invalid public key")?; let verifying = VerifyingKey::from_bytes(&bytes).map_err(|_| "invalid public key")?; let signed = B64.decode(&manifest.signature.value).map_err(|_| "invalid signature")?; let sig = Signature::from_slice(&signed).map_err(|_| "invalid signature")?; Ok(verifying.verify(&unsigned_bytes(manifest)?, &sig).is_ok()) }
fn read_manifest(path: &Path) -> Result<Manifest, String> { serde_json::from_slice(&fs::read(path).map_err(io_error)?).map_err(|e| format!("could not parse manifest: {e}")) }
fn render_markdown(manifest: &Manifest, json_path: &Path) -> String { let checks = manifest.checks.iter().map(|c| format!("| `{}` | {} | {} ms | {} |", c.command, c.exit_code, c.duration_ms, if c.environment_dependent { "environment-dependent" } else { "local" })).collect::<Vec<_>>().join("\n"); format!("# Change checkpoint: {}\n\n- Git commit: `{}`\n- Branch: `{}`\n- Diff fingerprint: `{}`\n- Signed with: Ed25519\n- JSON manifest: `{}`\n\n## Validation\n\n| Command | Exit | Time | Reproducibility |\n| --- | ---: | ---: | --- |\n{}\n\n## Verify\n\n```sh\ncpc verify {} --rerun\n```\n\n## Roll back\n\nThis is a note only. `cpc` never runs it.\n\n```sh\n{}\n```\n", manifest.name, manifest.repository.head, manifest.repository.branch, manifest.workspace.diff_sha256, json_path.display(), checks, json_path.display(), manifest.rollback) }
fn hash(bytes: &[u8]) -> String { format!("{:x}", Sha256::digest(bytes)) }
fn relative(root: &Path, path: &Path) -> String { path.strip_prefix(root).unwrap_or(path).display().to_string() }
fn valid_name(name: &str) -> Result<(), String> { if name.is_empty() || !name.chars().all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.')) { Err("name may contain only letters, numbers, dash, underscore, and dot".into()) } else { Ok(()) } }
fn io_error(error: io::Error) -> String { error.to_string() }

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn environment_values_are_hashed_not_stored() { let assertion = parse_environment("TOKEN=not-a-secret").unwrap(); assert_eq!(assertion.name, "TOKEN"); assert_ne!(assertion.value_sha256.unwrap(), "not-a-secret"); }
    #[test] fn suspicious_commands_are_marked() { assert!(is_environment_dependent("curl https://example.com")); assert!(!is_environment_dependent("git diff --check")); }
    #[test] fn rejects_unsafe_checkpoint_names() { assert!(valid_name("two words").is_err()); }
}
