import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { execFileSync, spawnSync } from "node:child_process";
import { generateKeyPairSync, sign } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  linkSync,
  statSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const projectManifest = join(process.cwd(), "Cargo.toml");

function makeGitRepository(prefix = "cpc-regression-") {
  const repo = mkdtempSync(join(tmpdir(), prefix));
  writeFileSync(join(repo, "tracked.txt"), "base\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "base"],
  ]) execFileSync("git", args, { cwd: repo });
  return repo;
}

function runCpc(repo, args, environment = {}) {
  return spawnSync(
    "cargo",
    ["run", "--manifest-path", projectManifest, "--quiet", "--", ...args],
    {
      cwd: repo,
      encoding: "utf8",
      env: { ...process.env, ...environment },
    },
  );
}

test("@claim:demo-sandbox @claim:web-storage the query-string demo uses isolated storage and clears it on exit", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => requests.push(new URL(request.url()).origin));
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("real:sentinel", "untouched"));
  await page.goto("/?demo=1");
  await expect(
    page.getByText("Demo — sample data, nothing is saved"),
  ).toBeVisible();
  await expect(page.getByText("agent-edit.json")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem("demo:change-checkpoints:state"),
      ),
    )
    .toBe("sample");
  expect((await page.evaluate(() => Object.keys(localStorage))).sort()).toEqual([
    "demo:change-checkpoints:state",
    "real:sentinel",
  ]);
  expect([...new Set(requests)]).toEqual(["http://127.0.0.1:4173"]);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const banner = page.getByRole("status", { name: "Demo status" });
  await expect(banner).toBeVisible();
  const bannerBox = await banner.boundingBox();
  expect(bannerBox.y).toBeGreaterThanOrEqual(0);
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeVisible();
  await page.getByRole("button", { name: "Reset demo" }).click();
  expect(await page.evaluate(() => localStorage.getItem("real:sentinel"))).toBe("untouched");
  await expect(
    page.getByRole("link", { name: "Leave demo and view install steps" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Leave demo and view install steps" })
    .click();
  await expect(page).toHaveURL(/\/#install$/);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(["real:sentinel"]);
});

test("@claim:safe-checkpoint-outputs checkpoint creation rejects symlinked, aliased, and stale outputs before checks run", () => {
  const symlinkRepo = makeGitRepository("cpc-output-symlink-");
  mkdirSync(join(symlinkRepo, ".change-checkpoints"));
  writeFileSync(join(symlinkRepo, "victim.txt"), "DO NOT OVERWRITE\n");
  symlinkSync("../victim.txt", join(symlinkRepo, ".change-checkpoints", "trap.json"));
  const symlinkResult = runCpc(symlinkRepo, [
    "checkpoint", "trap", "--check", "touch command-ran", "--rollback",
    "git restore victim.txt", "--json",
  ]);
  expect(symlinkResult.status).toBe(1);
  expect(JSON.parse(symlinkResult.stdout)).toMatchObject({
    ok: false,
    error: { code: "output_conflict" },
  });
  expect(readFileSync(join(symlinkRepo, "victim.txt"), "utf8")).toBe("DO NOT OVERWRITE\n");
  expect(existsSync(join(symlinkRepo, "command-ran"))).toBe(false);

  const aliasRepo = makeGitRepository("cpc-output-alias-");
  mkdirSync(join(aliasRepo, ".change-checkpoints"));
  writeFileSync(join(aliasRepo, "victim.txt"), "KEEP THIS\n");
  linkSync(join(aliasRepo, "victim.txt"), join(aliasRepo, ".change-checkpoints", "alias.md"));
  const aliasResult = runCpc(aliasRepo, [
    "checkpoint", "alias", "--check", "touch command-ran", "--rollback",
    "git restore victim.txt", "--json",
  ]);
  expect(aliasResult.status).toBe(1);
  expect(JSON.parse(aliasResult.stdout).error.code).toBe("output_conflict");
  expect(readFileSync(join(aliasRepo, "victim.txt"), "utf8")).toBe("KEEP THIS\n");
  expect(existsSync(join(aliasRepo, "command-ran"))).toBe(false);

  const staleRepo = makeGitRepository("cpc-stale-output-");
  writeFileSync(join(staleRepo, "tracked.txt"), "first change\n");
  const first = runCpc(staleRepo, [
    "checkpoint", "same-name", "--check", "true", "--rollback",
    "git restore tracked.txt", "--include-diff", "--json",
  ]);
  expect(first.status).toBe(0);
  const outputDirectory = join(staleRepo, ".change-checkpoints");
  const before = Object.fromEntries(
    ["json", "md", "patch"].map((extension) => [
      extension,
      readFileSync(join(outputDirectory, `same-name.${extension}`)),
    ]),
  );
  writeFileSync(join(staleRepo, "tracked.txt"), "second change\n");
  const replacement = runCpc(staleRepo, [
    "checkpoint", "same-name", "--check", "touch command-ran", "--rollback",
    "git restore tracked.txt", "--json",
  ]);
  expect(replacement.status).toBe(1);
  expect(JSON.parse(replacement.stdout).error.code).toBe("output_conflict");
  for (const extension of ["json", "md", "patch"])
    expect(readFileSync(join(outputDirectory, `same-name.${extension}`))).toEqual(before[extension]);
  expect(existsSync(join(staleRepo, "command-ran"))).toBe(false);
});

test("@claim:safe-checkpoint-inputs verify rejects aliased manifest, trusted-key, and saved-patch inputs", () => {
  const repo = makeGitRepository("cpc-input-alias-");
  writeFileSync(join(repo, "tracked.txt"), "changed\n");
  expect(runCpc(repo, [
    "checkpoint", "safe", "--check", "true", "--rollback",
    "git restore tracked.txt", "--include-diff", "--json",
  ]).status).toBe(0);
  const outputs = join(repo, ".change-checkpoints");
  const manifest = join(outputs, "safe.json");

  symlinkSync("safe.json", join(outputs, "manifest-link.json"));
  const linkedManifest = runCpc(repo, ["verify", join(outputs, "manifest-link.json"), "--json"]);
  expect(linkedManifest.status).toBe(1);
  expect(JSON.parse(linkedManifest.stdout).error.code).toBe("unsafe_path");

  linkSync(manifest, join(outputs, "manifest-hardlink.json"));
  const hardlinkedManifest = runCpc(repo, ["verify", join(outputs, "manifest-hardlink.json"), "--json"]);
  expect(hardlinkedManifest.status).toBe(1);
  expect(JSON.parse(hardlinkedManifest.stdout).error.code).toBe("unsafe_path");
  unlinkSync(join(outputs, "manifest-hardlink.json"));

  symlinkSync("signing.pub", join(outputs, "trusted-link.pub"));
  const linkedKey = runCpc(repo, [
    "verify", manifest, "--trusted-key", join(outputs, "trusted-link.pub"), "--json",
  ]);
  expect(linkedKey.status).toBe(2);
  expect(JSON.parse(linkedKey.stdout).findings[0]).toContain("trusted public key must be a regular file");

  unlinkSync(join(outputs, "safe.patch"));
  symlinkSync("../tracked.txt", join(outputs, "safe.patch"));
  const linkedPatch = runCpc(repo, ["verify", manifest, "--json"]);
  expect(linkedPatch.status).toBe(2);
  expect(JSON.parse(linkedPatch.stdout).findings).toContain(
    `saved patch must be a regular file: ${join(outputs, "safe.patch")}`,
  );
});

test("@claim:validated-environment @claim:json-errors checkpoint validates environment input before commands and emits JSON errors", () => {
  const repo = makeGitRepository("cpc-environment-input-");
  for (const [value, environment] of [
    ["BAD-NAME=value", {}],
    ["QA_MODE=recorded", { QA_MODE: "actual" }],
  ]) {
    const result = runCpc(repo, [
      "checkpoint", "invalid-env", "--check", "touch command-ran", "--env", value,
      "--rollback", "git restore tracked.txt", "--json",
    ], environment);
    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: false,
      error: { code: "invalid_environment" },
    });
    expect(existsSync(join(repo, "command-ran"))).toBe(false);
  }

  const valid = runCpc(repo, [
    "checkpoint", "valid-env", "--check", "true", "--env", "QA_MODE=actual",
    "--rollback", "git restore tracked.txt", "--json",
  ], { QA_MODE: "actual" });
  expect(valid.status).toBe(0);
  const verified = runCpc(repo, [
    "verify", JSON.parse(valid.stdout).manifest, "--json",
  ], { QA_MODE: "actual" });
  expect(verified.status).toBe(0);
  expect(JSON.parse(verified.stdout).valid).toBe(true);

  const outsideGit = mkdtempSync(join(tmpdir(), "cpc-json-error-"));
  const noRepository = runCpc(outsideGit, [
    "checkpoint", "outside", "--check", "true", "--rollback", "true", "--json",
  ]);
  expect(noRepository.status).toBe(1);
  expect(JSON.parse(noRepository.stdout)).toMatchObject({
    ok: false,
    error: { code: "git_required" },
  });
  expect(noRepository.stderr).toBe("");

  const badArguments = runCpc(repo, ["checkpoint", "missing-options", "--json"]);
  expect(badArguments.status).toBe(2);
  expect(JSON.parse(badArguments.stdout)).toMatchObject({
    ok: false,
    error: { code: "invalid_arguments" },
  });
  expect(badArguments.stderr).toBe("");
});

test("@claim:post-check-state checkpoint records Git state after successful checks", () => {
  const repo = makeGitRepository("cpc-post-check-state-");
  const created = runCpc(repo, [
    "checkpoint", "mutating-check", "--check", "printf 'mutated\\n' >> tracked.txt",
    "--rollback", "git restore tracked.txt", "--json",
  ]);
  expect(created.status).toBe(0);
  const manifest = JSON.parse(readFileSync(JSON.parse(created.stdout).manifest, "utf8"));
  expect(manifest.workspace.status).toContain("tracked.txt");
  expect(manifest.checks[0].exit_code).toBe(0);
  const verified = runCpc(repo, ["verify", JSON.parse(created.stdout).manifest, "--json"]);
  expect(verified.status).toBe(0);
  expect(JSON.parse(verified.stdout)).toMatchObject({ valid: true, findings: [] });
});

test("@claim:signed-manifest @claim:checkpoint-record @claim:markdown-summary @claim:cli-demo-isolated cpc demo writes the documented fields to its local repository", async () => {
  const output = execFileSync(
    "cargo",
    ["run", "--quiet", "--", "demo", "--json"],
    { encoding: "utf8" },
  );
  const result = JSON.parse(output);
  const manifest = JSON.parse(readFileSync(result.manifest, "utf8"));
  expect(result.manifest.startsWith(result.demo_directory)).toBe(true);
  expect(result.demo_directory.startsWith(tmpdir())).toBe(true);
  expect(existsSync(join(result.demo_directory, ".git"))).toBe(true);
  expect(manifest.format).toBe("change-checkpoints/v1");
  expect(manifest.repository).not.toHaveProperty("root");
  expect(manifest.repository.head).toMatch(/^[0-9a-f]{40}$/);
  expect(manifest.workspace.diff_sha256).toMatch(/^[0-9a-f]{64}$/);
  expect(manifest.rollback).toBe("git restore src/lib.rs");
  expect(manifest.signature.algorithm).toBe("ed25519");
  expect(manifest.signature.value.length).toBeGreaterThan(40);
  expect(manifest.checks.map((check) => check.exit_code)).toEqual([0, 0]);
  expect(existsSync(join(result.demo_directory, ".change-checkpoints", "signing.pub"))).toBe(true);
  const summary = readFileSync(result.manifest.replace(/\.json$/, ".md"), "utf8");
  expect(summary).toContain("# Change checkpoint: agent-edit");
  expect(summary).toContain("git diff --check");
  expect(summary).toContain(".change-checkpoints/agent-edit.json");
  expect(summary).not.toContain(result.demo_directory);
});

test("@claim:runs-in-git-repository cpc records and verifies spaces, Unicode, directories, and renames", async () => {
  const repo = mkdtempSync(join(tmpdir(), "cpc-caller-repo-"));
  mkdirSync(join(repo, "src"));
  writeFileSync(join(repo, "src", "a.txt"), "base\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "base"],
  ])
    execFileSync("git", args, { cwd: repo });
  execFileSync("git", ["mv", "src/a.txt", "src/renamed file.txt"], { cwd: repo });
  mkdirSync(join(repo, "new directory"));
  writeFileSync(join(repo, "new directory", "résumé.txt"), "new evidence\n");

  execFileSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "checkpoint",
      "caller-change",
      "--check",
      "git diff --check",
      "--rollback",
      "git restore .",
    ],
    { cwd: repo },
  );

  expect(existsSync(join(repo, ".change-checkpoints", "caller-change.json"))).toBe(
    true,
  );
  const manifest = JSON.parse(
    readFileSync(join(repo, ".change-checkpoints", "caller-change.json"), "utf8"),
  );
  expect(manifest.workspace.status).toContain("renamed file.txt");
  expect(manifest.workspace.status).toContain("src/a.txt");
  expect(manifest.workspace.untracked.map(({ path }) => path)).toEqual([
    "new directory/résumé.txt",
  ]);
  const verified = execFileSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "verify",
      ".change-checkpoints/caller-change.json",
      "--json",
    ],
    { cwd: repo, encoding: "utf8" },
  );
  expect(JSON.parse(verified).valid).toBe(true);
});

test("@claim:local-signing-key-path cpc creates its signing key at the documented local path", async () => {
  const repo = mkdtempSync(join(tmpdir(), "cpc-key-path-"));
  mkdirSync(join(repo, "src"));
  writeFileSync(join(repo, "src", "a.txt"), "base\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "base"],
  ])
    execFileSync("git", args, { cwd: repo });
  writeFileSync(join(repo, "src", "a.txt"), "changed\n");

  execFileSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "checkpoint",
      "key-path",
      "--check",
      "git diff --check",
      "--rollback",
      "git restore src/a.txt",
    ],
    { cwd: repo },
  );

  expect(existsSync(join(repo, ".change-checkpoints", "signing.key"))).toBe(true);
  if (process.platform !== "win32") {
    expect(statSync(join(repo, ".change-checkpoints", "signing.key")).mode & 0o777).toBe(0o600);
  }
});

test("@claim:local-key-ignore cpc preserves existing ignore rules and adds the private-key rule", async () => {
  const repo = mkdtempSync(join(tmpdir(), "cpc-key-ignore-"));
  mkdirSync(join(repo, "src"));
  mkdirSync(join(repo, ".change-checkpoints"));
  writeFileSync(join(repo, "src", "a.txt"), "base\n");
  writeFileSync(join(repo, ".change-checkpoints", ".gitignore"), "*.tmp\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "base"],
  ]) execFileSync("git", args, { cwd: repo });
  writeFileSync(join(repo, "src", "a.txt"), "changed\n");
  execFileSync(
    "cargo",
    [
      "run", "--manifest-path", join(process.cwd(), "Cargo.toml"), "--quiet", "--",
      "checkpoint", "ignored-key", "--check", "git diff --check", "--rollback", "git restore src/a.txt",
    ],
    { cwd: repo },
  );
  const ignore = readFileSync(join(repo, ".change-checkpoints", ".gitignore"), "utf8");
  expect(ignore).toBe("*.tmp\n/signing.key\n");
  expect(
    execFileSync("git", ["check-ignore", ".change-checkpoints/signing.key"], {
      cwd: repo,
      encoding: "utf8",
    }).trim(),
  ).toBe(".change-checkpoints/signing.key");
  expect(execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repo,
    encoding: "utf8",
  })).not.toContain("signing.key");
});

test("@claim:verify-manifest cpc verifies the sample state and reruns its checks", async () => {
  const output = execFileSync(
    "cargo",
    ["run", "--quiet", "--", "demo", "--json"],
    { encoding: "utf8" },
  );
  const result = JSON.parse(output);
  const preview = spawnSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "verify",
      result.manifest,
      "--rerun",
      "--json",
    ],
    { cwd: result.demo_directory, encoding: "utf8" },
  );
  expect(preview.status).toBe(3);
  expect(JSON.parse(preview.stdout)).toMatchObject({
    valid: true,
    approval_required: true,
    rerun: false,
  });
  expect(JSON.parse(preview.stdout).commands).toEqual([
    "git diff --check",
    "git status --porcelain",
  ]);
  const verified = execFileSync(
    "cargo",
    [
      "run", "--manifest-path", join(process.cwd(), "Cargo.toml"), "--quiet", "--",
      "verify", result.manifest, "--rerun", "--approve-rerun", "--json",
    ],
    { cwd: result.demo_directory, encoding: "utf8" },
  );
  expect(JSON.parse(verified)).toMatchObject({ valid: true, rerun: true });
});

test("@claim:trusted-signature a forged self-signed manifest cannot run its recorded command", async () => {
  const output = execFileSync(
    "cargo",
    ["run", "--quiet", "--", "demo", "--json"],
    { encoding: "utf8" },
  );
  const result = JSON.parse(output);
  const publicKeyPath = join(result.demo_directory, ".change-checkpoints", "signing.pub");
  unlinkSync(join(result.demo_directory, ".git", "change-checkpoints", "trusted-public.key"));
  const explicitTrust = execFileSync(
    "cargo",
    [
      "run", "--manifest-path", join(process.cwd(), "Cargo.toml"), "--quiet", "--",
      "verify", result.manifest, "--trusted-key", publicKeyPath, "--json",
    ],
    { cwd: result.demo_directory, encoding: "utf8" },
  );
  expect(JSON.parse(explicitTrust).valid).toBe(true);
  const forgedPath = join(result.demo_directory, ".change-checkpoints", "forged.json");
  const forged = JSON.parse(readFileSync(result.manifest, "utf8"));
  forged.name = "forged";
  forged.checks[0].command = "touch forged-command-ran";
  forged.checks[0].exit_code = 0;
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const publicDer = publicKey.export({ type: "spki", format: "der" });
  forged.signature.public_key = publicDer.subarray(-32).toString("base64");
  forged.signature.value = "";
  forged.signature.value = sign(
    null,
    Buffer.from(JSON.stringify(forged)),
    privateKey,
  ).toString("base64");
  writeFileSync(forgedPath, JSON.stringify(forged));

  const rejected = spawnSync(
    "cargo",
    [
      "run", "--manifest-path", join(process.cwd(), "Cargo.toml"), "--quiet", "--",
      "verify", forgedPath, "--rerun", "--approve-rerun", "--trusted-key", publicKeyPath, "--json",
    ],
    { cwd: result.demo_directory, encoding: "utf8" },
  );
  expect(rejected.status).toBe(2);
  expect(JSON.parse(rejected.stdout).findings).toEqual([
    "manifest public key does not match the trusted public key",
  ]);
  expect(existsSync(join(result.demo_directory, "forged-command-ran"))).toBe(false);
});

test("@claim:portable-paths portable checkpoint files omit the repository's absolute path", async () => {
  const sentinelRoot = mkdtempSync(join(tmpdir(), "cpc-private-sentinel-"));
  const repo = join(sentinelRoot, "private-team", "repository");
  mkdirSync(join(repo, "src"), { recursive: true });
  writeFileSync(join(repo, "src", "a.txt"), "base\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "base"],
  ]) execFileSync("git", args, { cwd: repo });
  writeFileSync(join(repo, "src", "a.txt"), "changed\n");
  execFileSync(
    "cargo",
    [
      "run", "--manifest-path", join(process.cwd(), "Cargo.toml"), "--quiet", "--",
      "checkpoint", "portable", "--check", "git diff --check", "--rollback", "git restore src/a.txt",
    ],
    { cwd: repo },
  );
  for (const file of ["portable.json", "portable.md"]) {
    const contents = readFileSync(join(repo, ".change-checkpoints", file), "utf8");
    expect(contents).not.toContain(sentinelRoot);
    expect(contents).not.toContain("private-team");
  }
});

test("@claim:no-command-output @claim:environment-hash checkpoint manifests omit command output and environment values", async () => {
  const repo = mkdtempSync(join(tmpdir(), "cpc-output-test-"));
  mkdirSync(join(repo, "src"));
  writeFileSync(join(repo, "src", "a.txt"), "base\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "base"],
  ])
    execFileSync("git", args, { cwd: repo });
  writeFileSync(join(repo, "src", "a.txt"), "changed\n");
  writeFileSync(join(repo, "output.txt"), "PRIVATE OUTPUT");
  execFileSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "checkpoint",
      "quiet",
      "--check",
      "cat output.txt",
      "--env",
      "PRIVATE_TOKEN=PRIVATE_VALUE",
      "--rollback",
      "git restore src/a.txt",
    ],
    { cwd: repo, env: { ...process.env, PRIVATE_TOKEN: "PRIVATE_VALUE" } },
  );
  const text = readFileSync(
    join(repo, ".change-checkpoints", "quiet.json"),
    "utf8",
  );
  expect(text).not.toContain("PRIVATE OUTPUT");
  expect(text).not.toContain("PRIVATE_VALUE");
  expect(text).not.toContain('"output"');
  const manifest = JSON.parse(text);
  expect(manifest.checks[0].exit_code).toBe(0);
  expect(manifest.environment[0]).toMatchObject({
    name: "PRIVATE_TOKEN",
    present: true,
  });
  expect(manifest.environment[0].value_sha256).toMatch(/^[0-9a-f]{64}$/);
});

test("@claim:restore-safe restore rejects changed state, hides the note, and never runs it", async () => {
  const output = execFileSync(
    "cargo",
    ["run", "--quiet", "--", "demo", "--json"],
    { encoding: "utf8" },
  );
  const result = JSON.parse(output);
  const changedFile = join(result.demo_directory, "unexpected.txt");
  writeFileSync(changedFile, "new untracked state\n");

  const rejected = spawnSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "restore",
      result.manifest,
      "--rerun",
      "--approve-rerun",
      "--json",
    ],
    { cwd: result.demo_directory, encoding: "utf8" },
  );
  expect(rejected.status).toBe(2);
  const rejection = JSON.parse(rejected.stdout);
  expect(rejection.valid).toBe(false);
  expect(rejection).not.toHaveProperty("rollback");
  expect(rejection.findings).toContain("workspace status differs");

  unlinkSync(changedFile);
  const restored = execFileSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "restore",
      result.manifest,
      "--rerun",
      "--approve-rerun",
      "--json",
    ],
    { cwd: result.demo_directory, encoding: "utf8" },
  );
  expect(JSON.parse(restored)).toMatchObject({
    valid: true,
    checks_rerun: true,
    rollback: "git restore src/lib.rs",
  });
  expect(
    readFileSync(join(result.demo_directory, "src", "lib.rs"), "utf8"),
  ).toContain("tested change");

  const tamperedPath = join(
    result.demo_directory,
    ".change-checkpoints",
    "tampered.json",
  );
  const tampered = JSON.parse(readFileSync(result.manifest, "utf8"));
  tampered.checks[0].command = "touch command-was-run";
  writeFileSync(tamperedPath, JSON.stringify(tampered));
  const untrusted = spawnSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "restore",
      tamperedPath,
      "--rerun",
      "--approve-rerun",
      "--json",
    ],
    { cwd: result.demo_directory, encoding: "utf8" },
  );
  expect(untrusted.status).toBe(2);
  expect(JSON.parse(untrusted.stdout).findings).toEqual([
    "signature is invalid",
  ]);
  expect(existsSync(join(result.demo_directory, "command-was-run"))).toBe(
    false,
  );
});

test("@claim:optional-patch a patch is absent by default and present only when requested", async () => {
  const repo = mkdtempSync(join(tmpdir(), "cpc-patch-test-"));
  mkdirSync(join(repo, "src"));
  writeFileSync(join(repo, "src", "a.txt"), "base\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "base"],
  ])
    execFileSync("git", args, { cwd: repo });
  writeFileSync(join(repo, "src", "a.txt"), "changed\n");
  const cargo = [
    "run",
    "--manifest-path",
    join(process.cwd(), "Cargo.toml"),
    "--quiet",
    "--",
    "checkpoint",
  ];
  execFileSync(
    "cargo",
    [
      ...cargo,
      "plain",
      "--check",
      "git diff --check",
      "--rollback",
      "git restore src/a.txt",
    ],
    { cwd: repo },
  );
  expect(
    JSON.parse(
      readFileSync(join(repo, ".change-checkpoints", "plain.json"), "utf8"),
    ).patch,
  ).toBeNull();
  expect(existsSync(join(repo, ".change-checkpoints", "plain.patch"))).toBe(
    false,
  );
  writeFileSync(join(repo, "new-agent-file.txt"), "new agent file\n");
  execFileSync(
    "cargo",
    [
      ...cargo,
      "with-patch",
      "--check",
      "git diff --check",
      "--rollback",
      "git restore src/a.txt",
      "--include-diff",
    ],
    { cwd: repo },
  );
  expect(
    JSON.parse(
      readFileSync(
        join(repo, ".change-checkpoints", "with-patch.json"),
        "utf8",
      ),
    ).patch.path,
  ).toBe(".change-checkpoints/with-patch.patch");
  expect(
    existsSync(join(repo, ".change-checkpoints", "with-patch.patch")),
  ).toBe(true);
  const patch = readFileSync(
    join(repo, ".change-checkpoints", "with-patch.patch"),
    "utf8",
  );
  expect(patch).toContain("diff --git a/new-agent-file.txt b/new-agent-file.txt");
  expect(patch).toContain("+new agent file");
  const manifest = JSON.parse(
    readFileSync(join(repo, ".change-checkpoints", "with-patch.json"), "utf8"),
  );
  expect(manifest.workspace.untracked).toEqual([
    expect.objectContaining({ path: "new-agent-file.txt" }),
  ]);
  const verified = runCpc(repo, [
    "verify", join(repo, ".change-checkpoints", "with-patch.json"), "--json",
  ]);
  expect(verified.status).toBe(0);
  expect(JSON.parse(verified.stdout).valid).toBe(true);
});

test("@claim:no-third-party-runtime every website route loads only same-origin resources", async ({
  page,
}) => {
  const origins = [];
  page.on("request", (request) => origins.push(new URL(request.url()).origin));
  for (const route of ["/", "/demo", "/privacy", "/terms", "/404.html"])
    await page.goto(route);
  expect([...new Set(origins)]).toEqual(["http://127.0.0.1:4173"]);
});

test("@claim:mit-license the repository ships the MIT License", async () => {
  const license = readFileSync(join(process.cwd(), "LICENSE"), "utf8");
  expect(license).toContain("MIT License");
  expect(license).toContain("Permission is hereby granted");
});

test("@claim:free-no-account the first screen states the free no-account terms without a purchase or sign-in path", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Free and open source; no account required", { exact: true })).toBeVisible();
  await expect(page.locator('a[href*="checkout"], a[href*="login"], a[href*="signup"]')).toHaveCount(0);
  await page.goto("/terms");
  await expect(page.getByText("Change Checkpoints is free, open-source software under the MIT License. It needs no account.")).toBeVisible();
});

test("@claim:web-demo-verify keyboard paths check the bundled browser record and reject a changed field", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/?demo=1$/);
  await page
    .getByRole("button", { name: "Check sample record" })
    .press("Enter");
  await expect(
    page.getByText("The displayed sample matches the bundled record."),
  ).toBeVisible();
  await page.locator('[data-field="hash"]').evaluate((element) => {
    element.textContent = "changed";
  });
  await page.getByRole("button", { name: "Check sample record" }).click();
  await expect(
    page.getByText("The displayed sample does not match the bundled record."),
  ).toBeVisible();
});

test("@claim:install-from-source the install section gives the public clone path and Cargo installs from an isolated source copy", async ({ page }) => {
  await page.goto("/#install");
  await expect(page.getByRole("heading", { name: "Clone and install cpc" })).toBeVisible();
  await expect(page.getByText("git clone https://github.com/B-Divyesh/sf-change-checkpoint-manifest.git")).toBeVisible();
  await expect(page.getByRole("link", { name: /View source on GitHub/ })).toHaveAttribute(
    "href",
    "https://github.com/B-Divyesh/sf-change-checkpoint-manifest",
  );
  const root = mkdtempSync(join(tmpdir(), "cpc-consumer-root-"));
  execFileSync("cargo", ["install", "--path", process.cwd(), "--root", root], {
    encoding: "utf8",
  });
  expect(existsSync(join(root, "bin", "cpc"))).toBe(true);
});

test("@claim:runtime-requirements the documented test workflow requires available Rust and Node toolchains", async () => {
  expect(execFileSync("cargo", ["--version"], { encoding: "utf8" })).toMatch(/^cargo /);
  expect(execFileSync("node", ["--version"], { encoding: "utf8" })).toMatch(/^v\d+/);
  const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
  expect(pkg.scripts.test).toContain("cargo");
  expect(pkg.scripts.test).toContain("playwright");
});

test("every route has valid landmarks, metadata, images, and no serious accessibility violations", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of ["/", "/demo", "/privacy", "/terms", "/404.html"]) {
    await page.goto(route);
    expect(await page.title()).not.toBe("");
    expect(await page.locator("html").getAttribute("lang")).toBe("en");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.locator("img:not([alt])").count()).toBe(0);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test("@claim:live-build-id every live route exposes the production build identifier", async ({ page }) => {
  const identifier = execFileSync("git", ["rev-parse", "--short=12", "HEAD"], {
    encoding: "utf8",
  }).trim();
  for (const route of ["/", "/demo", "/privacy", "/terms", "/404.html"]) {
    await page.goto(route);
    await expect(page.locator("footer")).toContainText(`Build ${identifier}`);
  }
});

test("SPA navigation restores route focus and browser history", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Demo", exact: true }).click();
  await expect(page).toHaveURL(/\/?demo=1$/);
  await expect(page.locator("h1")).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Record checks with each change",
  );
  await expect(page.locator("h1")).toBeFocused();
});

test("Terms route heading names the legal page", async ({ page }) => {
  await page.goto("/terms");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Terms for Change Checkpoints",
  );
});

test("leaving the demo moves keyboard focus to the install heading", async ({ page }) => {
  await page.goto("/?demo=1");
  await page.getByRole("link", { name: "Leave demo and view install steps" }).click();
  await expect(page).toHaveURL(/\/#install$/);
  await expect(page.getByRole("heading", { name: "Clone and install cpc" })).toBeFocused();
  await expect(page.getByText("Install steps loaded")).toHaveCount(1);
  await page.goBack();
  await expect(page).toHaveURL(/\/?demo=1$/);
  await expect(page.getByRole("heading", { name: "Inspect a sample checkpoint" })).toBeFocused();
  await page.goForward();
  await expect(page).toHaveURL(/\/#install$/);
  const heading = page.getByRole("heading", { name: "Clone and install cpc" });
  await expect(heading).toBeFocused();
  await expect(page.getByText("Install steps loaded")).toHaveCount(1);
  const box = await heading.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height);
});

test("desktop first screen keeps the action result and all three facts in view", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("/");
  for (const text of [
    "Record checks with each change",
    "Try it with sample data",
    "See a sample checkpoint next.",
    "Runs in your Git repository",
    "Stores exit statuses, not command output",
    "Free and open source; no account required",
  ]) {
    const box = await page.getByText(text, { exact: true }).boundingBox();
    expect(box.y + box.height, `${text} must fit in the desktop first screen`).toBeLessThanOrEqual(900);
  }
  await context.close();
});

test("reduced motion disables smooth scrolling and animated transforms", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  expect(
    await page.evaluate(() => ({
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      pressTransform: getComputedStyle(document.querySelector(".press"))
        .transform,
    })),
  ).toEqual({ scrollBehavior: "auto", pressTransform: "none" });
  await context.close();
});

test("the static site does not register a service worker or claim offline updates", async ({
  page,
}) => {
  await page.goto("/");
  expect(
    await page.evaluate(
      () =>
        navigator.serviceWorker
          ?.getRegistrations()
          .then((items) => items.length) ?? 0,
    ),
  ).toBe(0);
  await expect(page.getByText(/works offline/i)).toHaveCount(0);
});

test("content remains usable at 200% text size on a 390px viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/", "/demo", "/privacy", "/terms"]) {
    await page.goto(route);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  }
});

test("the designed 404 page loads cleanly and returns home by keyboard", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/404.html");
  await expect(page).toHaveTitle("Change Checkpoints — Page not found");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://change-checkpoint-manifest.sociobot.in/404",
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Change Checkpoints — Page not found",
  );
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Install" }),
  ).toHaveCount(1);
  await expect(page.locator("footer")).toContainText("v0.1.0");
  await expect(
    page.getByRole("heading", { name: "That checkpoint page is not here" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.getByRole("link", { name: "Go to Change Checkpoints" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  expect(errors).toEqual([]);
});

test("mobile demo has no horizontal overflow or serious accessibility violations", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto("/demo");
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  const banner = await page.getByRole("status", { name: "Demo status" }).boundingBox();
  expect(banner.height).toBeLessThanOrEqual(112);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await context.close();
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`${viewport.width}px layouts do not overflow and visible controls meet the touch target baseline`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport,
      isMobile: viewport.width === 390,
      hasTouch: viewport.width === 390,
    });
    const page = await context.newPage();
    for (const route of ["/", "/demo", "/privacy", "/terms"]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} overflowed at ${viewport.width}px`,
      ).toBe(true);
      const undersized = await page
        .locator("a:visible, button:visible, input:visible")
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const box = element.getBoundingClientRect();
              return box.width < 44 || box.height < 44;
            })
            .map((element) => ({
              text: element.textContent?.trim(),
              width: element.getBoundingClientRect().width,
              height: element.getBoundingClientRect().height,
            })),
        );
      expect(
        undersized,
        `${route} has undersized targets at ${viewport.width}px`,
      ).toEqual([]);
    }
    await context.close();
  });
}

test("@claim:git-required outside a Git repository exits with a useful error and writes no manifest", async () => {
  const directory = mkdtempSync(join(tmpdir(), "cpc-no-git-"));
  const result = spawnSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "checkpoint",
      "no-repo",
      "--check",
      "true",
      "--rollback",
      "true",
    ],
    { cwd: directory, encoding: "utf8" },
  );
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("not a git repository");
  expect(existsSync(join(directory, ".change-checkpoints"))).toBe(false);
});
