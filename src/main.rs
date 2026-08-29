use base64::{engine::general_purpose::STANDARD as B64, Engine};
use clap::{Parser, Subcommand};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::HashSet,
    env, fs,
    fs::{File, OpenOptions},
    io::{self, Read, Write},
    path::{Path, PathBuf},
    process::{Command, ExitCode},
    time::{Instant, SystemTime, UNIX_EPOCH},
};

#[cfg(unix)]
use std::os::unix::fs::{OpenOptionsExt, PermissionsExt};

#[derive(Parser)]
#[command(
    name = "cpc",
    version,
    about = "Record portable, signed Git checkpoints without command output."
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Record Git state and validation exit statuses.
    Checkpoint {
        /// A short checkpoint name (letters, numbers, dash, underscore, dot).
        name: String,
        /// Run a validation command. Repeat for each command.
        #[arg(short = 'c', long = "check", required = true)]
        checks: Vec<String>,
        /// Explain how a teammate should roll this change back. Required; never executed by cpc.
        #[arg(long)]
        rollback: String,
        /// Assert an environment value without recording it. Use NAME or NAME=value.
        #[arg(long = "env")]
        environment: Vec<String>,
        /// Also write the exact working-tree patch beside the manifest. Inspect it before sharing.
        #[arg(long)]
        include_diff: bool,
        /// Print a machine-readable result.
        #[arg(long)]
        json: bool,
    },
    /// Verify a manifest signature, current Git state, environment assertions, and optionally checks.
    Verify {
        /// JSON manifest path.
        manifest: PathBuf,
        /// Preview the exact recorded commands. Add --approve-rerun to run them.
        #[arg(long)]
        rerun: bool,
        /// Confirm that the exact recorded commands may run after trust and state checks pass.
        #[arg(long, requires = "rerun")]
        approve_rerun: bool,
        /// Public key obtained from a trusted source. Defaults to this repository's local pinned key.
        #[arg(long)]
        trusted_key: Option<PathBuf>,
        /// Print a machine-readable result.
        #[arg(long)]
        json: bool,
    },
    /// Check current state, then show the rollback note without executing it.
    Restore {
        /// JSON manifest path.
        manifest: PathBuf,
        /// Preview the exact recorded commands. Add --approve-rerun to run them before showing the note.
        #[arg(long)]
        rerun: bool,
        /// Confirm that the exact recorded commands may run after trust and state checks pass.
        #[arg(long, requires = "rerun")]
        approve_rerun: bool,
        /// Public key obtained from a trusted source. Defaults to this repository's local pinned key.
        #[arg(long)]
        trusted_key: Option<PathBuf>,
        /// Print a machine-readable result.
        #[arg(long)]
        json: bool,
    },
    /// Run the bundled sample in a temporary Git repository.
    Demo {
        /// Print a machine-readable result.
        #[arg(long)]
        json: bool,
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
struct Repository {
    head: String,
    branch: String,
}
#[derive(Serialize, Deserialize, Clone, PartialEq, Eq)]
struct Workspace {
    status: String,
    diff_sha256: String,
    untracked: Vec<Artifact>,
}
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
struct Artifact {
    path: String,
    sha256: String,
}
#[derive(Serialize, Deserialize, Clone)]
struct Check {
    command: String,
    exit_code: i32,
    duration_ms: u128,
    environment_dependent: bool,
}
#[derive(Serialize, Deserialize, Clone)]
struct EnvironmentAssertion {
    name: String,
    present: bool,
    value_sha256: Option<String>,
}
#[derive(Serialize, Deserialize, Clone)]
struct Patch {
    path: String,
    sha256: String,
}
#[derive(Serialize, Deserialize, Clone)]
struct SignatureBlock {
    algorithm: String,
    public_key: String,
    value: String,
}

#[derive(Debug, PartialEq, Eq)]
struct StatusEntry {
    code: String,
    path: String,
    original_path: Option<String>,
}

#[derive(Debug, PartialEq, Eq)]
struct WorkspaceSnapshot {
    status: String,
    tracked_diff: Vec<u8>,
    untracked: Vec<Artifact>,
    exact_patch: Option<Vec<u8>>,
}

fn main() -> ExitCode {
    let json_requested = env::args_os().any(|argument| argument == "--json");
    let cli = match Cli::try_parse() {
        Ok(cli) => cli,
        Err(error) => {
            if json_requested {
                print_json_error("invalid_arguments", &error.to_string());
            } else {
                let _ = error.print();
            }
            return ExitCode::from(2);
        }
    };
    let json_requested = cli.json_requested();
    match run(cli) {
        Ok(code) => ExitCode::from(code),
        Err(error) => {
            if json_requested {
                print_json_error(error_code(&error), &error);
            } else {
                eprintln!("cpc: {error}");
            }
            ExitCode::from(1)
        }
    }
}

impl Cli {
    fn json_requested(&self) -> bool {
        match &self.command {
            Commands::Checkpoint { json, .. }
            | Commands::Verify { json, .. }
            | Commands::Restore { json, .. }
            | Commands::Demo { json } => *json,
        }
    }
}

fn print_json_error(code: &str, message: &str) {
    println!(
        "{}",
        serde_json::json!({
            "ok": false,
            "error": {"code": code, "message": message.trim()}
        })
    );
}

fn error_code(message: &str) -> &'static str {
    if message.contains("environment") {
        "invalid_environment"
    } else if message.contains("name may contain") {
        "invalid_name"
    } else if message.contains("not a git repository") {
        "git_required"
    } else if message.contains("checkpoint output")
        || message.contains("checkpoint name already exists")
    {
        "output_conflict"
    } else if message.contains("must be a regular file")
        || message.contains("must not alias another file")
    {
        "unsafe_path"
    } else if message.contains("manifest") {
        "invalid_manifest"
    } else if message.contains("trusted public key") {
        "invalid_trusted_key"
    } else {
        "operation_failed"
    }
}

fn run(cli: Cli) -> Result<u8, String> {
    match cli.command {
        Commands::Checkpoint {
            name,
            checks,
            rollback,
            environment,
            include_diff,
            json,
        } => checkpoint(&name, &checks, &rollback, &environment, include_diff, json),
        Commands::Verify {
            manifest,
            rerun,
            approve_rerun,
            trusted_key,
            json,
        } => verify(
            &manifest,
            rerun,
            approve_rerun,
            trusted_key.as_deref(),
            json,
        ),
        Commands::Restore {
            manifest,
            rerun,
            approve_rerun,
            trusted_key,
            json,
        } => restore(
            &manifest,
            rerun,
            approve_rerun,
            trusted_key.as_deref(),
            json,
        ),
        Commands::Demo { json } => demo(json),
    }
}

fn checkpoint(
    name: &str,
    commands: &[String],
    rollback: &str,
    environment: &[String],
    include_diff: bool,
    json: bool,
) -> Result<u8, String> {
    valid_name(name)?;
    if rollback.trim().is_empty() {
        return Err("--rollback needs a specific rollback instruction".into());
    }
    let env_assertions = parse_environment_inputs(environment)?;
    let root = git_root()?;
    let head = git(&root, ["rev-parse", "HEAD"])?;
    let branch = git(&root, ["branch", "--show-current"]).unwrap_or_else(|_| "DETACHED".into());
    let directory = prepare_checkpoint_directory(&root)?;
    let json_path = directory.join(format!("{name}.json"));
    let markdown_path = directory.join(format!("{name}.md"));
    let patch_path = directory.join(format!("{name}.patch"));
    reject_existing_checkpoint_outputs([&json_path, &markdown_path, &patch_path])?;
    let key = load_or_make_key(&root, &directory)?;
    let runs = commands
        .iter()
        .map(|command| run_check(&root, command))
        .collect::<Vec<_>>();
    let snapshot = capture_stable_workspace(&root, include_diff)?;
    let patch = if include_diff {
        let bytes = snapshot
            .exact_patch
            .as_ref()
            .expect("requested snapshots include a patch");
        Some(Patch {
            path: relative(&root, &patch_path),
            sha256: hash(bytes),
        })
    } else {
        None
    };
    let public = B64.encode(key.verifying_key().to_bytes());
    let mut manifest = Manifest {
        format: "change-checkpoints/v1".into(),
        name: name.into(),
        created_unix: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| e.to_string())?
            .as_secs(),
        repository: Repository {
            head: head.trim().into(),
            branch: branch.trim().into(),
        },
        workspace: Workspace {
            status: snapshot.status.clone(),
            diff_sha256: hash(&snapshot.tracked_diff),
            untracked: snapshot.untracked.clone(),
        },
        checks: runs,
        environment: env_assertions,
        rollback: rollback.into(),
        patch,
        signature: SignatureBlock {
            algorithm: "ed25519".into(),
            public_key: public,
            value: String::new(),
        },
    };
    let payload = unsigned_bytes(&manifest)?;
    manifest.signature.value = B64.encode(key.sign(&payload).to_bytes());
    let mut outputs = vec![
        (
            json_path.as_path(),
            serde_json::to_vec_pretty(&manifest).map_err(|e| e.to_string())?,
        ),
        (
            markdown_path.as_path(),
            render_markdown(&manifest).into_bytes(),
        ),
    ];
    if let Some(bytes) = snapshot.exact_patch {
        outputs.push((patch_path.as_path(), bytes));
    }
    write_new_checkpoint_outputs(outputs)?;
    if json {
        println!(
            "{}",
            serde_json::json!({"manifest": json_path, "summary": markdown_path, "checks": manifest.checks})
        );
    } else {
        println!("Checkpoint recorded: {}", json_path.display());
        println!(
            "Checks: {} passed / {} total",
            manifest.checks.iter().filter(|c| c.exit_code == 0).count(),
            manifest.checks.len()
        );
        println!("Verify: cpc verify {} --rerun", json_path.display());
        println!("Rollback note: {}", rollback);
        if !include_diff {
            println!(
                "Patch not saved. Add --include-diff only after checking it contains no secrets."
            );
        }
    }
    Ok(if manifest.checks.iter().all(|c| c.exit_code == 0) {
        0
    } else {
        2
    })
}

fn verify(
    path: &Path,
    rerun: bool,
    approve_rerun: bool,
    trusted_key: Option<&Path>,
    json: bool,
) -> Result<u8, String> {
    let manifest = read_manifest(path)?;
    let findings = verification_findings(&manifest, trusted_key, rerun && approve_rerun)?;
    if findings.is_empty() && rerun && !approve_rerun {
        let commands = manifest
            .checks
            .iter()
            .map(|check| check.command.clone())
            .collect::<Vec<_>>();
        if json {
            println!(
                "{}",
                serde_json::json!({
                    "valid": true,
                    "approval_required": true,
                    "commands": commands,
                    "rerun": false
                })
            );
        } else {
            println!("Trust and recorded state match. These commands have not run:");
            for command in &commands {
                println!("  {command}");
            }
            println!("Run again with --rerun --approve-rerun to approve these exact commands.");
        }
        return Ok(3);
    }
    if json {
        println!(
            "{}",
            serde_json::json!({"valid": findings.is_empty(), "findings": findings, "rerun": rerun && approve_rerun})
        );
    } else if findings.is_empty() {
        println!(
            "Verified: signature, Git state, environment{} match.",
            if rerun {
                ", and check exit statuses"
            } else {
                ""
            }
        );
    } else {
        for finding in &findings {
            eprintln!("Mismatch: {finding}");
        }
    }
    Ok(if findings.is_empty() { 0 } else { 2 })
}

fn verification_findings(
    manifest: &Manifest,
    trusted_key: Option<&Path>,
    rerun: bool,
) -> Result<Vec<String>, String> {
    let mut findings = Vec::new();
    let root = git_root()?;
    let trusted = match read_trusted_key(&root, trusted_key) {
        Ok(key) => key,
        Err(error) => {
            findings.push(error);
            return Ok(findings);
        }
    };
    match signature_valid(manifest, &trusted) {
        Ok(true) => {}
        Ok(false) => findings.push("signature is invalid".into()),
        Err(error) => findings.push(error),
    }
    if !findings.is_empty() {
        return Ok(findings);
    }
    let head = git(&root, ["rev-parse", "HEAD"])?;
    if head.trim() != manifest.repository.head {
        findings.push(format!(
            "HEAD differs (recorded {}, found {})",
            manifest.repository.head,
            head.trim()
        ));
    }
    append_workspace_findings(&root, manifest, &mut findings)?;
    append_patch_artifact_findings(&root, manifest, &mut findings);
    for assertion in &manifest.environment {
        let current = env::var(&assertion.name).ok();
        if current.is_some() != assertion.present
            || current.as_ref().map(|v| hash(v.as_bytes())) != assertion.value_sha256
        {
            findings.push(format!("environment assertion differs: {}", assertion.name));
        }
    }
    if rerun && findings.is_empty() {
        for check in &manifest.checks {
            let fresh = run_check(&root, &check.command);
            if fresh.exit_code != check.exit_code {
                findings.push(format!("check exit differs: {}", check.command));
            }
        }
        append_workspace_findings(&root, manifest, &mut findings)?;
        append_patch_artifact_findings(&root, manifest, &mut findings);
    }
    Ok(findings)
}

fn append_patch_artifact_findings(root: &Path, manifest: &Manifest, findings: &mut Vec<String>) {
    let Some(saved) = &manifest.patch else {
        return;
    };
    let expected = format!(".change-checkpoints/{}.patch", manifest.name);
    if saved.path != expected {
        push_finding(findings, true, "saved patch path is invalid");
        return;
    }
    let path = root.join(&saved.path);
    match read_regular_file(&path, "saved patch") {
        Ok(bytes) => push_finding(
            findings,
            hash(&bytes) != saved.sha256,
            "saved patch artifact differs",
        ),
        Err(error) => push_finding(findings, true, &error),
    }
}

fn append_workspace_findings(
    root: &Path,
    manifest: &Manifest,
    findings: &mut Vec<String>,
) -> Result<(), String> {
    let snapshot = capture_workspace(root, manifest.patch.is_some())?;
    push_finding(
        findings,
        hash(&snapshot.tracked_diff) != manifest.workspace.diff_sha256,
        "working-tree diff differs",
    );
    push_finding(
        findings,
        snapshot.status != manifest.workspace.status,
        "workspace status differs",
    );
    push_finding(
        findings,
        snapshot.untracked != manifest.workspace.untracked,
        "untracked artifact fingerprints differ",
    );
    if let (Some(saved), Some(current)) = (&manifest.patch, snapshot.exact_patch) {
        push_finding(
            findings,
            hash(&current) != saved.sha256,
            "exact working-tree patch differs",
        );
    }
    Ok(())
}

fn push_finding(findings: &mut Vec<String>, differs: bool, finding: &str) {
    if differs && !findings.iter().any(|current| current == finding) {
        findings.push(finding.into());
    }
}

fn restore(
    path: &Path,
    rerun: bool,
    approve_rerun: bool,
    trusted_key: Option<&Path>,
    json: bool,
) -> Result<u8, String> {
    let manifest = read_manifest(path)?;
    let findings = verification_findings(&manifest, trusted_key, rerun && approve_rerun)?;
    if findings.is_empty() && rerun && !approve_rerun {
        let commands = manifest
            .checks
            .iter()
            .map(|check| check.command.clone())
            .collect::<Vec<_>>();
        if json {
            println!(
                "{}",
                serde_json::json!({
                    "valid": true,
                    "approval_required": true,
                    "commands": commands,
                    "checks_rerun": false
                })
            );
        } else {
            println!("Trust and recorded state match. These commands have not run:");
            for command in &commands {
                println!("  {command}");
            }
            println!("Run again with --rerun --approve-rerun to approve these exact commands.");
        }
        return Ok(3);
    }
    if findings.is_empty() {
        if json {
            println!(
                "{}",
                serde_json::json!({
                    "valid": true,
                    "rollback": manifest.rollback,
                    "head": manifest.repository.head,
                    "checks_rerun": rerun && approve_rerun
                })
            );
        } else {
            println!(
                "Current state verified{}; rollback note not executed:\n{}",
                if rerun && approve_rerun {
                    " with recorded checks"
                } else {
                    "; recorded checks not rerun"
                },
                manifest.rollback
            );
        }
        Ok(0)
    } else {
        if json {
            println!(
                "{}",
                serde_json::json!({
                    "valid": false,
                    "findings": findings,
                    "checks_rerun": rerun && approve_rerun
                })
            );
        } else {
            for finding in &findings {
                eprintln!("Mismatch: {finding}");
            }
            eprintln!(
                "Rollback note hidden because the current state does not match the manifest."
            );
        }
        Ok(2)
    }
}

fn demo(json: bool) -> Result<u8, String> {
    let target = env::temp_dir().join(format!("change-checkpoints-demo-{}", std::process::id()));
    if target.exists() {
        fs::remove_dir_all(&target).map_err(io_error)?;
    }
    fs::create_dir_all(target.join("src")).map_err(io_error)?;
    fs::write(
        target.join("src/lib.rs"),
        "pub fn checkpoint_label() -> &'static str { \"ready\" }\n",
    )
    .map_err(io_error)?;
    git_status(&target, ["init"])?;
    git_status(&target, ["config", "user.email", "demo@example.invalid"])?;
    git_status(&target, ["config", "user.name", "Checkpoint Demo"])?;
    git_status(&target, ["add", "."])?;
    git_status(&target, ["commit", "-m", "sample base"])?;
    fs::write(
        target.join("src/lib.rs"),
        "pub fn checkpoint_label() -> &'static str { \"tested change\" }\n",
    )
    .map_err(io_error)?;
    let current = env::current_exe().map_err(io_error)?;
    let output = Command::new(current)
        .current_dir(&target)
        .args([
            "checkpoint",
            "agent-edit",
            "--check",
            "git diff --check",
            "--check",
            "git status --porcelain",
            "--rollback",
            "git restore src/lib.rs",
            "--include-diff",
            "--json",
        ])
        .output()
        .map_err(io_error)?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).into_owned());
    }
    let manifest = target.join(".change-checkpoints/agent-edit.json");
    if json {
        println!(
            "{}",
            serde_json::json!({"demo_directory": target, "manifest": manifest})
        );
    } else {
        println!("Demo checkpoint created in {}\nOpen the manifest: {}\nReset by deleting that temporary directory.", target.display(), manifest.display());
    }
    Ok(0)
}

fn git_root() -> Result<PathBuf, String> {
    Ok(PathBuf::from(git(
        &env::current_dir().map_err(io_error)?,
        ["rev-parse", "--show-toplevel"],
    )?))
}
fn git<const N: usize>(dir: &Path, args: [&str; N]) -> Result<String, String> {
    String::from_utf8(git_bytes(dir, args)?)
        .map_err(|e| e.to_string())
        .map(|s| s.trim_end().to_string())
}
fn git_bytes<const N: usize>(dir: &Path, args: [&str; N]) -> Result<Vec<u8>, String> {
    let result = Command::new("git")
        .args(args)
        .current_dir(dir)
        .output()
        .map_err(io_error)?;
    if result.status.success() {
        Ok(result.stdout)
    } else {
        Err(String::from_utf8_lossy(&result.stderr).trim().to_string())
    }
}
fn git_status<const N: usize>(dir: &Path, args: [&str; N]) -> Result<(), String> {
    git_bytes(dir, args).map(|_| ())
}
fn run_check(root: &Path, command: &str) -> Check {
    let start = Instant::now();
    let result = Command::new("sh")
        .args(["-c", command])
        .current_dir(root)
        .output();
    Check {
        command: command.into(),
        exit_code: result.map(|s| s.status.code().unwrap_or(1)).unwrap_or(1),
        duration_ms: start.elapsed().as_millis(),
        environment_dependent: is_environment_dependent(command),
    }
}
fn is_environment_dependent(command: &str) -> bool {
    [
        "curl", "wget", "http", "date", "time", "network", "docker", "ssh",
    ]
    .iter()
    .any(|word| command.to_lowercase().contains(word))
}
fn parse_environment(value: &str) -> Result<EnvironmentAssertion, String> {
    let (name, given) = value.split_once('=').unwrap_or((value, ""));
    let mut characters = name.chars();
    if !matches!(characters.next(), Some(first) if first.is_ascii_alphabetic() || first == '_')
        || !characters.all(|character| character.is_ascii_alphanumeric() || character == '_')
    {
        return Err(format!("invalid environment name: {name}"));
    }
    let current = env::var(name).ok();
    if value.contains('=') && current.as_deref() != Some(given) {
        return Err(format!(
            "environment assertion does not match the current value: {name}"
        ));
    }
    Ok(EnvironmentAssertion {
        name: name.into(),
        present: current.is_some(),
        value_sha256: current.as_ref().map(|item| hash(item.as_bytes())),
    })
}

fn parse_environment_inputs(values: &[String]) -> Result<Vec<EnvironmentAssertion>, String> {
    let mut names = HashSet::new();
    values
        .iter()
        .map(|value| {
            let assertion = parse_environment(value)?;
            if !names.insert(assertion.name.clone()) {
                return Err(format!(
                    "environment assertion is repeated: {}",
                    assertion.name
                ));
            }
            Ok(assertion)
        })
        .collect()
}

fn capture_stable_workspace(root: &Path, include_patch: bool) -> Result<WorkspaceSnapshot, String> {
    let snapshot = capture_workspace(root, include_patch)?;
    let confirmed = capture_workspace(root, include_patch)?;
    if snapshot != confirmed {
        return Err(
            "workspace changed while Git state was being recorded; rerun the checkpoint".into(),
        );
    }
    Ok(snapshot)
}

fn capture_workspace(root: &Path, include_patch: bool) -> Result<WorkspaceSnapshot, String> {
    let tracked_diff = git_bytes(root, ["diff", "--binary", "HEAD"])?;
    let (status, untracked) = workspace_state(root)?;
    let exact_patch = if include_patch {
        Some(exact_working_tree_patch(root)?)
    } else {
        None
    };
    Ok(WorkspaceSnapshot {
        status,
        tracked_diff,
        untracked,
        exact_patch,
    })
}

fn exact_working_tree_patch(root: &Path) -> Result<Vec<u8>, String> {
    use rand::RngCore;
    let mut random = [0_u8; 16];
    OsRng.fill_bytes(&mut random);
    let temporary_index = env::temp_dir().join(format!("cpc-index-{}", hash(&random)));
    let run = |arguments: &[&str]| {
        Command::new("git")
            .args(arguments)
            .current_dir(root)
            .env("GIT_INDEX_FILE", &temporary_index)
            .output()
            .map_err(io_error)
    };
    let result = (|| {
        let read_tree = run(&["read-tree", "HEAD"])?;
        if !read_tree.status.success() {
            return Err(String::from_utf8_lossy(&read_tree.stderr)
                .trim()
                .to_string());
        }
        let add = run(&[
            "add",
            "-A",
            "--",
            ".",
            ":(exclude).change-checkpoints",
            ":(exclude).change-checkpoints/**",
        ])?;
        if !add.status.success() {
            return Err(String::from_utf8_lossy(&add.stderr).trim().to_string());
        }
        let diff = run(&["diff", "--cached", "--binary", "HEAD"])?;
        if diff.status.success() {
            Ok(diff.stdout)
        } else {
            Err(String::from_utf8_lossy(&diff.stderr).trim().to_string())
        }
    })();
    let _ = fs::remove_file(&temporary_index);
    let lock = temporary_index.with_extension("lock");
    let _ = fs::remove_file(lock);
    result
}

fn workspace_state(root: &Path) -> Result<(String, Vec<Artifact>), String> {
    let raw = git_bytes(
        root,
        ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
    )?;
    let entries = parse_status(&raw)?
        .into_iter()
        .filter(|entry| !is_checkpoint_path(&entry.path))
        .collect::<Vec<_>>();
    let status = entries
        .iter()
        .map(|entry| {
            let path = serde_json::to_string(&entry.path).expect("strings serialize");
            match &entry.original_path {
                Some(original) => format!(
                    "{} {} <- {}",
                    entry.code,
                    path,
                    serde_json::to_string(original).expect("strings serialize")
                ),
                None => format!("{} {}", entry.code, path),
            }
        })
        .collect::<Vec<_>>()
        .join("\n");
    let untracked = entries
        .iter()
        .filter(|entry| entry.code == "??")
        .map(|entry| {
            let path = root.join(&entry.path);
            let metadata = fs::symlink_metadata(&path).map_err(io_error)?;
            if !metadata.is_file() {
                return Err(format!(
                    "untracked path is not a regular file: {}",
                    entry.path
                ));
            }
            let bytes = fs::read(&path).map_err(io_error)?;
            Ok(Artifact {
                path: entry.path.clone(),
                sha256: hash(&bytes),
            })
        })
        .collect::<Result<Vec<_>, _>>()?;
    Ok((status, untracked))
}

fn parse_status(raw: &[u8]) -> Result<Vec<StatusEntry>, String> {
    let mut fields = raw
        .split(|byte| *byte == 0)
        .filter(|field| !field.is_empty());
    let mut entries = Vec::new();
    while let Some(field) = fields.next() {
        if field.len() < 4 || field[2] != b' ' {
            return Err("Git returned an invalid status record".into());
        }
        let code = std::str::from_utf8(&field[..2])
            .map_err(|_| "Git returned an invalid status code")?
            .to_string();
        let path = std::str::from_utf8(&field[3..])
            .map_err(|_| "a Git path is not valid UTF-8; rename it before recording")?
            .to_string();
        let original_path = if code.contains('R') || code.contains('C') {
            let original = fields
                .next()
                .ok_or("Git omitted the original path for a rename")?;
            Some(
                std::str::from_utf8(original)
                    .map_err(|_| "a Git path is not valid UTF-8; rename it before recording")?
                    .to_string(),
            )
        } else {
            None
        };
        entries.push(StatusEntry {
            code,
            path,
            original_path,
        });
    }
    Ok(entries)
}

fn is_checkpoint_path(path: &str) -> bool {
    path == ".change-checkpoints"
        || path.starts_with(".change-checkpoints/")
        || path.starts_with(".change-checkpoints\\")
}

fn prepare_checkpoint_directory(root: &Path) -> Result<PathBuf, String> {
    let directory = root.join(".change-checkpoints");
    match fs::symlink_metadata(&directory) {
        Ok(metadata) => {
            if metadata.file_type().is_symlink() || !metadata.is_dir() {
                return Err(format!(
                    "checkpoint output directory must be a real directory: {}",
                    directory.display()
                ));
            }
        }
        Err(error) if error.kind() == io::ErrorKind::NotFound => {
            fs::create_dir(&directory).map_err(io_error)?;
        }
        Err(error) => return Err(io_error(error)),
    }
    let canonical_root = fs::canonicalize(root).map_err(io_error)?;
    let canonical_directory = fs::canonicalize(&directory).map_err(io_error)?;
    if canonical_directory.parent() != Some(canonical_root.as_path()) {
        return Err(format!(
            "checkpoint output directory resolves outside the repository: {}",
            directory.display()
        ));
    }
    Ok(directory)
}

fn reject_existing_checkpoint_outputs<const N: usize>(paths: [&Path; N]) -> Result<(), String> {
    for path in paths {
        match fs::symlink_metadata(path) {
            Ok(metadata) => {
                if metadata.file_type().is_symlink() {
                    return Err(format!(
                        "checkpoint output must not be a symlink: {}",
                        path.display()
                    ));
                }
                return Err(format!(
                    "checkpoint name already exists; choose another name: {}",
                    path.display()
                ));
            }
            Err(error) if error.kind() == io::ErrorKind::NotFound => {}
            Err(error) => return Err(io_error(error)),
        }
    }
    Ok(())
}

fn write_new_checkpoint_outputs(outputs: Vec<(&Path, Vec<u8>)>) -> Result<(), String> {
    let mut files: Vec<(PathBuf, File, Vec<u8>)> = Vec::new();
    for (path, bytes) in outputs {
        match OpenOptions::new().write(true).create_new(true).open(path) {
            Ok(file) => files.push((path.to_path_buf(), file, bytes)),
            Err(error) => {
                cleanup_created_outputs(&files);
                return Err(format!(
                    "checkpoint output appeared before it could be written: {} ({})",
                    path.display(),
                    error
                ));
            }
        }
    }
    let write_result = files
        .iter_mut()
        .try_for_each(|(_, file, bytes)| file.write_all(bytes).and_then(|_| file.sync_all()));
    if let Err(error) = write_result {
        cleanup_created_outputs(&files);
        return Err(io_error(error));
    }
    let validation_result = files.iter().try_for_each(|(path, file, _)| {
        let opened = file.metadata().map_err(io_error)?;
        let current = fs::symlink_metadata(path).map_err(io_error)?;
        if same_file(&opened, &current) {
            Ok(())
        } else {
            Err(format!(
                "checkpoint output changed while it was being written: {}",
                path.display()
            ))
        }
    });
    if let Err(error) = validation_result {
        cleanup_created_outputs(&files);
        return Err(error);
    }
    Ok(())
}

fn cleanup_created_outputs(files: &[(PathBuf, File, Vec<u8>)]) {
    for (path, file, _) in files {
        let opened = file.metadata();
        let current = fs::symlink_metadata(path);
        if matches!((opened, current), (Ok(left), Ok(right)) if same_identity(&left, &right)) {
            let _ = fs::remove_file(path);
        }
    }
}

fn validate_regular_unaliased(path: &Path, label: &str) -> Result<(), String> {
    let metadata = fs::symlink_metadata(path).map_err(io_error)?;
    if metadata.file_type().is_symlink() || !metadata.is_file() {
        return Err(format!(
            "{label} must be a regular file: {}",
            path.display()
        ));
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::MetadataExt;
        if metadata.nlink() != 1 {
            return Err(format!(
                "{label} must not alias another file: {}",
                path.display()
            ));
        }
    }
    Ok(())
}

fn read_regular_file(path: &Path, label: &str) -> Result<Vec<u8>, String> {
    validate_regular_unaliased(path, label)?;
    let mut file = File::open(path).map_err(io_error)?;
    let opened = file.metadata().map_err(io_error)?;
    let current = fs::symlink_metadata(path).map_err(io_error)?;
    if !same_file(&opened, &current) {
        return Err(format!(
            "{label} changed while it was being opened: {}",
            path.display()
        ));
    }
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes).map_err(io_error)?;
    let finished = fs::symlink_metadata(path).map_err(io_error)?;
    if !same_file(&opened, &finished) {
        return Err(format!(
            "{label} changed while it was being read: {}",
            path.display()
        ));
    }
    Ok(bytes)
}

#[cfg(unix)]
fn same_file(left: &fs::Metadata, right: &fs::Metadata) -> bool {
    use std::os::unix::fs::MetadataExt;
    same_identity(left, right) && right.nlink() == 1
}

#[cfg(not(unix))]
fn same_file(left: &fs::Metadata, right: &fs::Metadata) -> bool {
    same_identity(left, right)
}

#[cfg(unix)]
fn same_identity(left: &fs::Metadata, right: &fs::Metadata) -> bool {
    use std::os::unix::fs::MetadataExt;
    left.dev() == right.dev() && left.ino() == right.ino()
}

#[cfg(not(unix))]
fn same_identity(left: &fs::Metadata, right: &fs::Metadata) -> bool {
    left.is_file() && right.is_file() && left.len() == right.len()
}

fn replace_regular_file(path: &Path, bytes: &[u8], label: &str) -> Result<(), String> {
    validate_regular_unaliased(path, label)?;
    let parent = path
        .parent()
        .ok_or_else(|| format!("invalid output path: {}", path.display()))?;
    let mut random = [0_u8; 16];
    use rand::RngCore;
    OsRng.fill_bytes(&mut random);
    let temporary = parent.join(format!(".cpc-write-{}", hash(&random)));
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&temporary)
        .map_err(io_error)?;
    if let Err(error) = file.write_all(bytes).and_then(|_| file.sync_all()) {
        let _ = fs::remove_file(&temporary);
        return Err(io_error(error));
    }
    drop(file);
    fs::rename(&temporary, path).map_err(|error| {
        let _ = fs::remove_file(&temporary);
        io_error(error)
    })
}

fn load_or_make_key(root: &Path, directory: &Path) -> Result<SigningKey, String> {
    ensure_key_ignore(root, directory)?;
    let path = directory.join("signing.key");
    let key = if fs::symlink_metadata(&path).is_ok() {
        validate_regular_unaliased(&path, "local signing key")?;
        restrict_private_key(&path)?;
        let bytes = fs::read(&path).map_err(io_error)?;
        let data: [u8; 32] = bytes
            .as_slice()
            .try_into()
            .map_err(|_| "invalid local signing key")?;
        SigningKey::from_bytes(&data)
    } else {
        let key = SigningKey::generate(&mut OsRng);
        write_private_key(&path, &key.to_bytes())?;
        key
    };
    let public = B64.encode(key.verifying_key().to_bytes());
    pin_public_key(root, directory, &public)?;
    Ok(key)
}

fn ensure_key_ignore(root: &Path, directory: &Path) -> Result<(), String> {
    let ignore = directory.join(".gitignore");
    let mut contents = if fs::symlink_metadata(&ignore).is_ok() {
        validate_regular_unaliased(&ignore, "checkpoint ignore file")?;
        fs::read_to_string(&ignore).map_err(io_error)?
    } else {
        String::new()
    };
    if !contents.lines().any(|line| line.trim() == "/signing.key") {
        if !contents.is_empty() && !contents.ends_with('\n') {
            contents.push('\n');
        }
        contents.push_str("/signing.key\n");
        if fs::symlink_metadata(&ignore).is_ok() {
            replace_regular_file(&ignore, contents.as_bytes(), "checkpoint ignore file")?;
        } else {
            write_new_file(&ignore, contents.as_bytes())?;
        }
    }
    let ignored = Command::new("git")
        .args([
            "check-ignore",
            "--quiet",
            "--",
            ".change-checkpoints/signing.key",
        ])
        .current_dir(root)
        .status()
        .map_err(io_error)?;
    if !ignored.success() {
        return Err(
            "the signing key is not ignored by Git; add /signing.key to .change-checkpoints/.gitignore"
                .into(),
        );
    }
    Ok(())
}

fn write_private_key(path: &Path, bytes: &[u8]) -> Result<(), String> {
    let mut options = OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)]
    options.mode(0o600);
    let mut file = options.open(path).map_err(io_error)?;
    file.write_all(bytes).map_err(io_error)?;
    restrict_private_key(path)
}

fn write_new_file(path: &Path, bytes: &[u8]) -> Result<(), String> {
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(path)
        .map_err(io_error)?;
    file.write_all(bytes).map_err(io_error)?;
    file.sync_all().map_err(io_error)
}

fn restrict_private_key(path: &Path) -> Result<(), String> {
    #[cfg(unix)]
    {
        fs::set_permissions(path, fs::Permissions::from_mode(0o600)).map_err(io_error)?;
    }
    Ok(())
}

fn pin_public_key(root: &Path, directory: &Path, public: &str) -> Result<(), String> {
    let portable = directory.join("signing.pub");
    ensure_key_matches_or_write(&portable, public, "portable public key")?;
    let local = local_trusted_key_path(root)?;
    if let Some(parent) = local.parent() {
        fs::create_dir_all(parent).map_err(io_error)?;
    }
    ensure_key_matches_or_write(&local, public, "repository's pinned public key")
}

fn ensure_key_matches_or_write(path: &Path, public: &str, label: &str) -> Result<(), String> {
    if fs::symlink_metadata(path).is_ok() {
        validate_regular_unaliased(path, label)?;
        if fs::read_to_string(path).map_err(io_error)?.trim() != public {
            return Err(format!(
                "the signing key does not match the {label} at {}",
                path.display()
            ));
        }
    } else {
        write_new_file(path, format!("{public}\n").as_bytes())?;
    }
    Ok(())
}

fn local_trusted_key_path(root: &Path) -> Result<PathBuf, String> {
    let git_directory = PathBuf::from(git(root, ["rev-parse", "--git-dir"])?);
    let git_directory = if git_directory.is_absolute() {
        git_directory
    } else {
        root.join(git_directory)
    };
    Ok(git_directory
        .join("change-checkpoints")
        .join("trusted-public.key"))
}

fn read_trusted_key(root: &Path, provided: Option<&Path>) -> Result<VerifyingKey, String> {
    let path = provided
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| local_trusted_key_path(root))?;
    if fs::symlink_metadata(&path).is_err() {
        return Err(format!(
            "trusted public key is unavailable at {}; use --trusted-key with a key obtained from a trusted source",
            path.display()
        ));
    }
    let encoded = String::from_utf8(read_regular_file(&path, "trusted public key")?)
        .map_err(|_| format!("trusted public key is invalid: {}", path.display()))?;
    let decoded = B64
        .decode(encoded.trim())
        .map_err(|_| format!("trusted public key is invalid: {}", path.display()))?;
    let bytes: [u8; 32] = decoded
        .as_slice()
        .try_into()
        .map_err(|_| format!("trusted public key is invalid: {}", path.display()))?;
    VerifyingKey::from_bytes(&bytes)
        .map_err(|_| format!("trusted public key is invalid: {}", path.display()))
}
fn unsigned_bytes(manifest: &Manifest) -> Result<Vec<u8>, String> {
    let mut unsigned = manifest.clone();
    unsigned.signature.value.clear();
    serde_json::to_vec(&unsigned).map_err(|e| e.to_string())
}
fn signature_valid(manifest: &Manifest, trusted: &VerifyingKey) -> Result<bool, String> {
    if manifest.signature.algorithm != "ed25519" {
        return Ok(false);
    }
    let public = B64
        .decode(&manifest.signature.public_key)
        .map_err(|_| "invalid public key")?;
    let bytes: [u8; 32] = public
        .as_slice()
        .try_into()
        .map_err(|_| "invalid public key")?;
    let verifying = VerifyingKey::from_bytes(&bytes).map_err(|_| "invalid public key")?;
    if verifying != *trusted {
        return Err("manifest public key does not match the trusted public key".into());
    }
    let signed = B64
        .decode(&manifest.signature.value)
        .map_err(|_| "invalid signature")?;
    let sig = Signature::from_slice(&signed).map_err(|_| "invalid signature")?;
    Ok(verifying.verify(&unsigned_bytes(manifest)?, &sig).is_ok())
}
fn read_manifest(path: &Path) -> Result<Manifest, String> {
    serde_json::from_slice(&read_regular_file(path, "manifest input")?)
        .map_err(|e| format!("could not parse manifest: {e}"))
}
fn render_markdown(manifest: &Manifest) -> String {
    let checks = manifest
        .checks
        .iter()
        .map(|c| {
            format!(
                "| `{}` | {} | {} ms | {} |",
                c.command,
                c.exit_code,
                c.duration_ms,
                if c.environment_dependent {
                    "environment-dependent"
                } else {
                    "local"
                }
            )
        })
        .collect::<Vec<_>>()
        .join("\n");
    let json_path = format!(".change-checkpoints/{}.json", manifest.name);
    format!("# Change checkpoint: {}\n\n- Git commit: `{}`\n- Branch: `{}`\n- Changes hash: `{}`\n- Signed with: Ed25519\n- JSON manifest: `{}`\n\n## Validation\n\n| Command | Exit | Time | Reproducibility |\n| --- | ---: | ---: | --- |\n{}\n\n## Verify safely\n\nInspect the commands first. No command runs in this step.\n\n```sh\ncpc verify {} --rerun\n```\n\nThen approve those exact commands.\n\n```sh\ncpc verify {} --rerun --approve-rerun\n```\n\n## Roll back\n\nThis is a note only. `cpc` never runs it.\n\n```sh\n{}\n```\n", manifest.name, manifest.repository.head, manifest.repository.branch, manifest.workspace.diff_sha256, json_path, checks, json_path, json_path, manifest.rollback)
}
fn hash(bytes: &[u8]) -> String {
    format!("{:x}", Sha256::digest(bytes))
}
fn relative(root: &Path, path: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .display()
        .to_string()
}
fn valid_name(name: &str) -> Result<(), String> {
    if name.is_empty()
        || !name
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.'))
    {
        Err("name may contain only letters, numbers, dash, underscore, and dot".into())
    } else {
        Ok(())
    }
}
fn io_error(error: io::Error) -> String {
    error.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn environment_values_are_hashed_not_stored() {
        env::set_var("CPC_TEST_SECRET_VALUE", "not-a-secret");
        let assertion = parse_environment("CPC_TEST_SECRET_VALUE=not-a-secret").unwrap();
        env::remove_var("CPC_TEST_SECRET_VALUE");
        assert_eq!(assertion.name, "CPC_TEST_SECRET_VALUE");
        assert_ne!(assertion.value_sha256.unwrap(), "not-a-secret");
    }
    #[test]
    fn suspicious_commands_are_marked() {
        assert!(is_environment_dependent("curl https://example.com"));
        assert!(!is_environment_dependent("git diff --check"));
    }
    #[test]
    fn rejects_unsafe_checkpoint_names() {
        assert!(valid_name("two words").is_err());
    }
    #[test]
    fn parses_nul_delimited_paths_and_renames_without_git_quoting() {
        let entries = parse_status(
            b"?? new directory/r\xc3\xa9sum\xc3\xa9.txt\0R  src/new name.rs\0src/old.rs\0",
        )
        .unwrap();
        assert_eq!(
            entries,
            vec![
                StatusEntry {
                    code: "??".into(),
                    path: "new directory/résumé.txt".into(),
                    original_path: None,
                },
                StatusEntry {
                    code: "R ".into(),
                    path: "src/new name.rs".into(),
                    original_path: Some("src/old.rs".into()),
                },
            ]
        );
    }
}
