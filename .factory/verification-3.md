# Independent verification 3 — FAIL

**Candidate:** `e60ab7eacf47254a7708615b01f4c53298c88478`

**Live URL:** https://change-checkpoint-manifest.sociobot.in

**Verified:** 2026-08-29 UTC

**Scope:** fresh independent product QA against the original work order and
researched brief. Product code was not changed.

## Verdict

**FAIL.** The declared claims, standard gates, packaged happy path, live site,
deployment identity, accessibility, privacy, and performance checks pass.
However, the CLI can overwrite another file through a repository-controlled
checkpoint symlink, cannot put an untracked new file into its advertised exact
patch, and can return success for a checkpoint that fails verification
immediately. Those defects break the safety and reproducibility at the center
of the researched job-to-be-done.

## Required first checks

The checkout initially had no tracked or untracked changes and resolved to the
candidate SHA. `npm ci` installed the locked dependency set (20 packages, zero
audit vulnerabilities). `.factory/claims.json` exists and lists 23 claims.
Every declared command was then run separately and exactly as written against
the shipped demo entry points:

| Claim | Exact selected test | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS |
| `web-storage` | `npm test -- --grep @claim:web-storage` | PASS |
| `checkpoint-record` | `npm test -- --grep @claim:checkpoint-record` | PASS |
| `runs-in-git-repository` | `npm test -- --grep @claim:runs-in-git-repository` | PASS |
| `local-signing-key-path` | `npm test -- --grep @claim:local-signing-key-path` | PASS |
| `signed-manifest` | `npm test -- --grep @claim:signed-manifest` | PASS |
| `no-command-output` | `npm test -- --grep @claim:no-command-output` | PASS |
| `environment-hash` | `npm test -- --grep @claim:environment-hash` | PASS |
| `local-key-ignore` | `npm test -- --grep @claim:local-key-ignore` | PASS |
| `verify-manifest` | `npm test -- --grep @claim:verify-manifest` | PASS |
| `trusted-signature` | `npm test -- --grep @claim:trusted-signature` | PASS |
| `restore-safe` | `npm test -- --grep @claim:restore-safe` | PASS |
| `optional-patch` | `npm test -- --grep @claim:optional-patch` | PASS |
| `no-third-party-runtime` | `npm test -- --grep @claim:no-third-party-runtime` | PASS |
| `git-required` | `npm test -- --grep @claim:git-required` | PASS |
| `mit-license` | `npm test -- --grep @claim:mit-license` | PASS |
| `web-demo-verify` | `npm test -- --grep @claim:web-demo-verify` | PASS |
| `install-from-source` | `npm test -- --grep @claim:install-from-source` | PASS |
| `markdown-summary` | `npm test -- --grep @claim:markdown-summary` | PASS |
| `cli-demo-isolated` | `npm test -- --grep @claim:cli-demo-isolated` | PASS |
| `runtime-requirements` | `npm test -- --grep @claim:runtime-requirements` | PASS |
| `portable-paths` | `npm test -- --grep @claim:portable-paths` | PASS |
| `free-no-account` | `npm test -- --grep @claim:free-no-account` | PASS |

Each selected run also completed formatting, Clippy, Rust tests, deployment
contracts, and a fresh site build before its selected Playwright test. The
source-install claim compiled and installed `cpc` under an isolated Cargo root.

The cold first-read test passes. The first screen says **“Record checks with
each change”**, names **teams reviewing fast edits**, and explains that the
diff, checks, and rollback note stay together. The above-fold primary action
is **“Try it with sample data”**, followed by **“See a sample checkpoint
next.”** One keyboard activation opens the sample checkpoint and its persistent
**“Demo — sample data, nothing is saved”** boundary.

## Release-blocking defects

### P1 — A repository-controlled symlink can redirect a manifest write

In a temporary Git repository, a committed checkpoint path was made a symlink
to another tracked file:

```sh
ln -s ../victim.txt .change-checkpoints/trap.json
git add victim.txt .change-checkpoints/trap.json
git commit -m "add repository-controlled checkpoint symlink"
cpc checkpoint trap --check true --rollback "git restore victim.txt" --json
```

`cpc` exited **0**. `victim.txt`, which began as `DO NOT OVERWRITE`, was
replaced by the signed manifest JSON. The write path uses ordinary
`fs::write`, follows the repository-controlled symlink, and does not require
the target to remain inside `.change-checkpoints`. A symlink can therefore
redirect the write to another user-writable path. This is a destructive local
file-write flaw in a tool intended to run inside worktrees that may contain
unreviewed agent edits.

### P1 — `--include-diff` omits new untracked files

In a clean committed repository, the only change was a new untracked file:

```sh
printf 'new agent file\n' > new-agent-file.txt
cpc checkpoint with-new-file --check true \
  --rollback 'git clean -f -- new-agent-file.txt' --include-diff --json
```

The manifest correctly listed `new-agent-file.txt` and its SHA-256 under
`workspace.untracked`, but `with-new-file.patch` was **0 bytes**. The patch is
built from `git diff --binary HEAD`, which excludes untracked files. The CLI
help calls this the **“exact working-tree patch”**, and the original brief
requires the exact diff and reproducibility on a clean clone. A common agent
change that adds a file cannot be reconstructed from this checkpoint package.

### P1 — A successful mutating check creates an immediately invalid checkpoint

In a clean repository:

```sh
cpc checkpoint mutating-check \
  --check 'printf "mutated\n" >> tracked.txt' \
  --rollback 'git restore tracked.txt' --json
cpc verify .change-checkpoints/mutating-check.json --json
```

Checkpoint creation exited **0** and recorded the check as exit 0. Immediate
verification exited **2** with:

```json
{"findings":["working-tree diff differs","workspace status differs"],"rerun":false,"valid":false}
```

The implementation captures Git status and diff before running checks and
never checks whether those commands changed the workspace. A formatter,
snapshot update, code generator, or other successful command can therefore
produce a signed checkpoint that is already unusable when `cpc` reports
success.

## Other defects

### P2 — Environment input is not validated consistently before checks run

- With `--env BAD-NAME=value` and `--check 'touch invalid-env-command-ran'`, the
  CLI exited 1 for the invalid environment name, wrote no manifest, but still
  created the marker. Environment syntax is parsed only after all checks run.
- With current `QA_MODE=actual`, `--env QA_MODE=recorded`, and a passing check
  of the actual value, checkpoint creation exited 0. Immediate verification in
  the same environment exited 2 with `environment assertion differs: QA_MODE`.

Invalid or contradictory input should be rejected before any selected command
runs, and a successful checkpoint should not contain an assertion known to
disagree with its recording environment.

### P2 — Reusing a checkpoint name silently leaves a stale patch

Recording `reused` once with `--include-diff`, changing the tracked file again,
and recording `reused` without `--include-diff` silently overwrote the JSON and
Markdown. The old patch remained byte-for-byte unchanged while the new
manifest reported `"patch": null`. This creates a misleading artifact beside
the new checkpoint and performs destructive replacement without warning or an
explicit overwrite option.

### P2 — `--json` errors are not JSON

Outside Git and for invalid name/environment input, commands invoked with
`--json` emit plain text such as `cpc: fatal: not a git repository` and
`cpc: invalid environment name: BAD-NAME`. This prevents scripts from treating
the advertised machine-readable mode as a stable output contract on recovery
paths.

### P3 — The live footer omits the build identifier

The standard site contract requires a version/build identifier. The footer
contains `v0.1.0` but not the candidate SHA or another deployment build ID.
Exact byte comparison proves this deployment independently, but a visitor
cannot identify it from the product UI.

## Local gates and packaged CLI evidence

- `npm test`: PASS — `cargo fmt --check`, Clippy with warnings denied, 4 Rust
  unit tests, 7 Node contract/configuration tests, and 29 Playwright tests.
- `npm run build`: PASS — release binary plus `dist/site` produced.
- `npm run pack:cli`: PASS — 44 files, 233.8 KiB unpacked / 69.3 KiB
  compressed; Cargo package verification passed.
- `npm audit --audit-level=high`: PASS — zero vulnerabilities.
- A separate `cargo install --path
  target/package/change-checkpoints-0.1.0 --root <temp>` succeeded. The
  installed binary reported `cpc 0.1.0`.
- The installed `cpc demo --json` created a Git repository under `/tmp`.
  `verify --rerun --json` exited 3 with the exact two-command preview;
  approved rerun returned `valid:true`; matching restore returned `valid:true`.
  After a tracked change, restore exited 2, returned the mismatch, hid the
  rollback note, and did not execute it.
- A caller-created repository with spaces, Unicode, a rename, an untracked
  file, one passing check, and one exit-7 check produced the expected exit 2
  and recorded `[0,7]`. Raw environment values were absent. Outside Git the
  CLI exited 1 and created no checkpoint directory. An unsafe name exited 1
  before its marker command ran.

## Live site, accessibility, privacy, and performance

- `/opt/fleet/lib/verify-url.sh` passed `/`, `/?demo=1`, `/demo`, `/privacy`,
  and `/terms`: HTTP 200, title, `lang=en`, one h1, main landmark, image alt,
  and no console/page errors.
- Independent Playwright/Axe WCAG 2 A/AA scans at 1440×900 and 390×844 found
  zero violations on `/`, `/demo`, `/privacy`, and `/terms`. Every page has one
  h1/main/nav/footer, ordered headings, no horizontal overflow, no missing alt,
  and no visible control below 44×44 CSS pixels.
- Reduced-motion contexts had zero running animations. At 200% browser scale,
  the 390px page retained all text and had no CSS overflow.
- Keyboard-only traversal exposed a visible 3px red focus ring on the skip
  link, navigation, and primary sample action. Enter opened the demo. Space
  reset it. Route changes and Back/Forward focused the Demo h1 or Install h2.
- The sample check accepted the bundled record and rejected a changed field.
  Its sticky banner remained visible after scrolling. Demo storage was exactly
  `demo:change-checkpoints:state`; leaving removed that key while preserving a
  `real:sentinel` key.
- Browser request logs across all routes and the complete demo flow contained
  only `https://change-checkpoint-manifest.sociobot.in`. There are no runtime
  API calls, analytics, external scripts/fonts, sign-in, or paid-unlock calls.
- Browser response headers include HSTS, `nosniff`, strict-origin referrer
  policy, and a self-only CSP with `frame-ancestors 'none'`. Hashed assets have
  `Cache-Control: public, max-age=31536000, immutable`. HTTP redirects to
  HTTPS. Unknown routes return the designed page with HTTP 404.
- All real internal links and the public GitHub source returned 200. Raw
  `/demo`, `/privacy`, and `/terms` responses contain route-specific title,
  description, canonical, Open Graph, and Twitter metadata.
- Lighthouse mobile: Performance **99**, Accessibility **100**, Best Practices
  **100**, SEO **100**; FCP 1.0s, LCP 1.9s, TBT 120ms, CLS 0, 213 KiB transfer.
- Production bundle: JS 11,394 bytes raw / 4,361 gzip; CSS 8,869 / 2,667;
  hero WebP 209,496 bytes. All are within the supplied budgets.

This is intentionally a static site and CLI. It registers no service worker,
makes no offline claim, has no product server endpoint, and has no sign-in.
PWA offline/update, API rate-limit, backend concurrency/persistence/health,
and Entra authority checks are therefore not applicable.

## Deployment identity

Fresh local production output byte-matches the live deployment for `/`,
`/demo`, `/privacy`, `/terms`, `/404.html`, `robots.txt`, `sitemap.xml`, both
icons, and every hashed JS/CSS/WebP/SVG asset. Representative matches:

| Artifact | SHA-256 (local = live) |
| --- | --- |
| `/` | `62ee9ff814a27735005b598d8ee48e70dccd946f3da9185d0ce9f4feb9c5f72f` |
| `/demo` | `a0209c56515477716a90810bed4a56b021b72fd8526631472f48becfceac42d4` |
| JS | `0c41e4a1c7fa7a83b862000b032e89b320ba26b241f2475f09f1af05ea67cf4e` |
| CSS | `c6ed015c2c98aeb37a90d9ee7366c0001c75509db9e0851a22b9fbd22fc7cbf0` |
| Hero WebP | `afeae18cf563c549a959c92a5bf34abacb4ba6edccfdbc04e78b807c84358f5a` |

Local `HEAD`, `origin/main`, and the remote `refs/heads/main` all resolved to
`e60ab7eacf47254a7708615b01f4c53298c88478`. The previously reported
deployment-only concern is not present; this FAIL comes from fresh CLI product
evidence.

## Required remediation

1. Refuse symlink/non-regular output paths and use no-follow, create-new, or
   explicit safe-replace writes for checkpoint artifacts.
2. Include untracked file additions in the opt-in patch/package, or stop
   describing it as exact/reproducible and revise the brief honestly.
3. Detect workspace mutation during checks and fail safely or record the final
   validated state.
4. Validate all environment inputs before commands run and reject explicit
   assertions that disagree with the recording environment.
5. Require explicit checkpoint replacement, clean or version stale artifacts,
   and return structured JSON errors in `--json` mode.
