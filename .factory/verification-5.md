# Independent verification 5 — FAIL

**Candidate:** `04cfcc7cb43303022665abd2e0dfdec3c6c97cbc`  
**Live URL:** https://change-checkpoint-manifest.sociobot.in  
**Verified:** 2026-08-29 UTC  
**Scope:** fresh independent product QA against the researched brief and
factory acceptance contract. Product code was not modified.

## Verdict

**FAIL.** The deployed site matches the candidate and the normal checkpoint,
demo, restore-safety, privacy, accessibility, and performance flows work.
Release is blocked by a nondeterministic mandatory claim test, incorrect
success-path exit codes for every help/version command, and a verification
false positive after the repository branch changes. The Cargo package also
contains unrelated files copied from `node_modules`.

## Required opening checks

`.factory/claims.json` exists and lists 29 claims. In the untouched checkout,
the requested pre-install invocation of each exact command stopped before its
selected test because `vite` was not yet installed (`vite: not found`, exit
127). After the prescribed clean install (`npm ci`: 20 packages, 0 audit
vulnerabilities), all 29 commands were run separately and exactly as declared.
All passed, including the CLI and web demo selectors.

The passing selectors were: `demo-sandbox`, `web-storage`,
`checkpoint-record`, `runs-in-git-repository`, `local-signing-key-path`,
`signed-manifest`, `no-command-output`, `environment-hash`, `local-key-ignore`,
`verify-manifest`, `trusted-signature`, `restore-safe`, `optional-patch`,
`no-third-party-runtime`, `git-required`, `mit-license`, `web-demo-verify`,
`install-from-source`, `markdown-summary`, `cli-demo-isolated`,
`runtime-requirements`, `portable-paths`, `free-no-account`, `live-build-id`,
`safe-checkpoint-outputs`, `safe-checkpoint-inputs`, `validated-environment`,
`json-errors`, and `post-check-state`.

The independent full `npm test` gate did not remain green. Its first installed
run finished 34 of 35 Playwright tests and failed:

```text
tests/claims.spec.js:777:1
@claim:web-demo-verify keyboard paths check the bundled browser record and reject a changed field
Expected: "The displayed sample matches the bundled record."
Result: element not found after 5000 ms
```

The page snapshot showed an empty `#verify-result`. A focused 20-repeat run of
that claim passed 20/20, and a second full `npm test` passed 35/35. That makes
the failure intermittent, not resolved. The work order says any failing claim
test is release-blocking.

The cold first-read test passes. The live first screen says **“Record checks
with each change”**, identifies **teams reviewing fast edits**, and explains
that the diff, checks, and rollback note stay together. The visible primary
action is **“Try it with sample data”**, with **“See a sample checkpoint next.”**
One keyboard activation opens the populated demo and its persistent **“Demo —
sample data, nothing is saved”** banner.

## Release-blocking defects

### P1 — Mandatory claim gate is nondeterministic

The clean installed full suite failed `@claim:web-demo-verify` once, then
passed on rerun. The test exercises the promised one-click sample verification
flow, and the acceptance contract explicitly makes any claim failure blocking.
An intermittent result cannot protect a release claim.

### P1 — Help and version print correctly but return error status 2

The packaged binary was installed into an isolated Cargo root. Every
information-only invocation returned 2:

| Command | Exit |
| --- | ---: |
| `cpc --help` | 2 |
| `cpc --version` | 2 |
| `cpc help` | 2 |
| `cpc checkpoint --help` | 2 |
| `cpc verify --help` | 2 |
| `cpc restore --help` | 2 |
| `cpc demo --help` | 2 |

The content is useful, but successful help/version requests must return 0.
This breaks shell setup checks and CLI consumers that treat nonzero as failure.
`main` currently maps every `Cli::try_parse()` error—including Clap's
help/version display outcomes—to exit 2.

### P1 — Verification ignores the signed branch and returns a false positive

A checkpoint recorded `repository.branch` as `master`. With the recorded HEAD,
tracked diff, untracked file, patch, and environment unchanged, switching only
to a new branch produced:

```text
RECORDED_BRANCH master
CURRENT_BRANCH review-alternate
BRANCH_VERIFY_RC 0
{"findings":[],"rerun":false,"valid":true}
```

The manifest signs and displays the branch, and the product says it verifies
current Git state. Verification checks HEAD and workspace state but never
compares the current branch. This can present a rollback note as valid in a
different branch context.

## Other defect

### P2 — The publishable Cargo package includes `node_modules` documentation

`npm run pack:cli` passes, but `cargo package --list --allow-dirty` lists 44
files, including more than 30 unrelated dependency files such as
`node_modules/playwright/README.md`, `node_modules/vite/README.md`, and package
licenses. The `include` entries `README.md` and `LICENSE` match recursively.
The crate is only 72.4 KiB compressed and installs, but it is not a clean
publishable CLI artifact.

## Passing local and CLI evidence

- `npm ci`: PASS; 20 locked packages, 0 vulnerabilities.
- `npm audit --audit-level=high`: PASS; 0 vulnerabilities.
- Exact claim selectors after install: PASS, 29/29.
- `npm test`: FAIL once at the claim above (34/35), then PASS on rerun (35/35).
- `cargo fmt --check`, Clippy with warnings denied, 4 Rust unit tests, and 7
  deployment/claims-contract tests: PASS in both full runs.
- `npm run build`: PASS; release binary and `dist/site` produced.
- `npm run pack:cli`: PASS; 44 files, 248.9 KiB unpacked / 72.4 KiB compressed.
- Clean consumer `cargo install` from
  `target/package/change-checkpoints-0.1.0`: PASS.
- Packaged `cpc demo --json`: PASS; created
  `/tmp/change-checkpoints-demo-16830`, a real temporary Git repository, with
  the sample manifest and a mode-`0600` signing key.
- Demo verification preview returned exit 3 with the two exact commands and
  `approval_required:true`; approved rerun returned exit 0 and `valid:true`.
  Restore returned exit 0 and displayed, but did not run, the rollback note.
- A manual repository case with tracked edits and an untracked Unicode/spaced
  path recorded successfully. The opt-in patch included the new file. Immediate
  verification returned 0. A later tracked edit made both verify and restore
  return 2, and restore did not reveal the rollback note.
- Unsafe checkpoint names and operation outside Git returned structured JSON,
  exit 1, and wrote no outside-repository output.

## Live site, privacy, and deployment evidence

- `HEAD`, local `origin/main`, and remote `refs/heads/main` all resolve to the
  candidate. Every footer says `Build 04cfcc7cb433`.
- Local/live SHA-256 values match exactly for root, demo, privacy, terms, and
  404 HTML plus the hashed JS, CSS, and hero WebP. This fresh evidence resolves
  the previously reported deployment-only concern.

  | Artifact | Local and live SHA-256 |
  | --- | --- |
  | `/` | `412fc8cb19c40ec26add4c2dbd6762fc74794c5afa1b92de623113d7372aa7e1` |
  | `/demo` | `52425d8c0152250e2892dace579ba4ace872a2b9053558419e10ca07a66600fb` |
  | `/privacy` | `5186921852cf528e46e007011d5c6f26b0b3ac556675f874801daf8fd9dfa2b2` |
  | `/terms` | `1c9b370db795e70457f5f0e2e92697555bad96e752a12221c896ea2b944ade08` |
  | `404.html` | `0acc71da777e2d432728d333f6feab0c08ee14a9af356328f83f247f0fd32186` |
  | JavaScript | `566757947020dc44b06865dab250c5379237c1ac36ba1dc83467f8b1ab120a5e` |
  | CSS | `c6ed015c2c98aeb37a90d9ee7366c0001c75509db9e0851a22b9fbd22fc7cbf0` |
  | Hero WebP | `afeae18cf563c549a959c92a5bf34abacb4ba6edccfdbc04e78b807c84358f5a` |
- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns
  the designed page with HTTP 404. All internal and external links checked
  returned 200; fragment destinations exist.
- The supplied `verify-url.sh` passed for all four public routes: correct title,
  `lang=en`, one h1, a main landmark, image alternatives, labelled buttons,
  and no valid-route console/page errors.
- Fresh Chromium checks at 1440px and 390px found no horizontal overflow and no
  visible target below 44×44 px. Text enlarged to 200% at 390px without
  overflow or lost body content.
- Keyboard-only navigation reaches every control. Focus uses a visible 3px red
  outline. Enter operates the primary demo action, sample check, reset, and
  demo exit; route changes focus the destination heading. Reduced-motion mode
  had no running infinite animation.
- Axe 4.11 WCAG 2 A/AA scans on every public route and the 404 at both desktop
  and mobile found zero serious or critical violations. The expected browser
  resource error appears only when deliberately requesting the HTTP 404.
- Normal browsing stores no key. Demo mode stores exactly
  `demo:change-checkpoints:state`, reset reseeds it, and leaving removes it.
  Requests across all public routes used only the product origin. Source review
  found no analytics, runtime third-party scripts/fonts, API calls, sign-in,
  billing, or AI requests.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy, and a
  self-only CSP. Hashed JS/CSS/WebP use one-year immutable caching; HTML uses
  30-second revalidation.
- Production sizes: JS 11.42 kB raw / 4.34 kB gzip; CSS 8.87 kB raw / 2.65 kB
  gzip; hero WebP 209.50 kB. All stated budgets pass.
- Fresh mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 1.0 s, LCP 1.9 s, TBT 50 ms, CLS 0.

This is a static site plus local CLI. It has no service worker, backend,
product-unlock endpoint, or sign-in, so offline-update, API rate-limit,
concurrency, persistence, and Entra checks are not applicable.

## Required remediation

1. Make the demo verification claim test deterministic and demonstrate stable
   full-suite runs.
2. Preserve Clap's successful exit code for help and version display.
3. Compare the current branch with the signed branch, or remove the branch from
   the verified-state representation and narrow the product claim explicitly.
4. Anchor Cargo include patterns so the crate contains only project files.
