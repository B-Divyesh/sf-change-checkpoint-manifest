# Change Checkpoints repair handoff

## Outcome

All release-blocking and additional findings in verifier report commit
`d0875056b2ca229eb14b7f41360e87c0471caaf7` are repaired.

- `cpc restore` now uses the same signature, Git state, untracked-artifact, and
  environment checks as `cpc verify`. It exits 2 and hides the rollback note on
  a mismatch. `--rerun` explicitly re-runs recorded checks. An invalid
  signature cannot cause a recorded command to run.
- The dead $19 checkout and unimplemented team-template offer were removed.
  This repository does not register products or change billing infrastructure.
- `.factory/claims.json` now inventories 13 visitor-reliance claims. Each ID
  occurs in exactly one tagged observable test.
- `npm test` now enforces `cargo fmt --check` and Clippy before unit, deployment,
  and browser tests.
- The 720 px demo recording is responsive at desktop widths. All visible links,
  buttons, and inputs have at least 44 × 44 px targets at 390 px and 1440 px.
- Vite now fingerprints the hero and demo art. Azure Static Web Apps assigns
  `/assets/*` a one-year immutable cache policy.
- `/demo`, `/privacy`, and `/terms` receive physical build entries and explicit
  rewrites. Removing the SPA navigation fallback lets unknown addresses use the
  designed HTTP 404 response.
- Vite was updated from 6.1.0 to 6.4.3 to clear the current high-severity
  development-server advisories.

## Verification evidence

Run on 2026-08-28 UTC from `/work/repo`:

- Clean install: `npm ci` — pass; 20 packages installed, 0 vulnerabilities.
- Security audit: `npm audit --audit-level=high` — pass; 0 vulnerabilities.
- Full gate: `npm test` — pass; 3 Rust unit tests, 3 deployment-config tests,
  and 19 Playwright tests.
- Claims contract: every command in `.factory/claims.json` was run separately;
  all 13 commands passed with exactly one matching Playwright test.
- Formatting/type/lint: `cargo fmt --check` and
  `cargo clippy --all-targets -- -D warnings` — pass inside `npm test`.
- Production build: `npm run build` — pass; release `cpc` and `dist/site` were
  produced. Initial JS is 10.36 KB (4.46 KB gzip), CSS is 7.94 KB (2.47 KB
  gzip), and the hero WebP is 209.50 KB.
- Package: `npm run pack:cli` — pass; 44 files, 222.6 KiB unpacked and 66.9 KiB
  compressed. No registry publish was attempted.
- Consumer: installed `target/package/change-checkpoints-0.1.0` to a fresh
  Cargo root. `cpc --help`, `cpc demo --json`, `cpc verify --rerun --json`, and
  `cpc restore --rerun --json` all passed.
- Restore regression: an added untracked file makes restore exit 2 with
  `valid:false`, state findings, and no rollback field. Matching state returns
  `valid:true`; the rollback command remains unexecuted. A signature-tampered
  command is never run.
- Browser: Chromium passed desktop 1440 × 900 and mobile 390 × 844 layouts,
  keyboard operation, route focus/history, 200% text resize, reduced motion,
  semantic metadata, and console checks. Axe WCAG 2 A/AA reported zero
  violations on `/`, `/demo`, `/privacy`, `/terms`, and `/404.html`.
- Privacy: all requests across every public route were same-origin. Demo mode
  used only `demo:change-checkpoints:state` and cleared it on exit. The regular
  site stored nothing.
- Offline/update: not applicable by product contract; the site makes no offline
  claim and registers no service worker. The explicit regression passed.
- Local Lighthouse mobile: Performance 98, Accessibility 100, Best Practices
  100, SEO 100, LCP 2.3 s, CLS 0, transfer 214 KiB. Desktop Performance and
  Accessibility were both 100, with 0.5 s LCP and 0 CLS.
- `git diff --check` — pass.

## Deployment and live evidence

Pending the production upload. Record the deployed commit, live response
policy, route status, immutable asset cache, browser smoke test, and artifact
identity here immediately after deployment.

## Known boundaries

- `restore` never executes its rollback note. Check reruns are opt-in because a
  shared manifest can contain shell commands.
- `--include-diff` remains opt-in because patches can contain source secrets.
- This is a CLI with a static documentation/demo site, not a PWA. No offline or
  update behavior is promised.
- The package is validated and ready to publish, but registry publishing is a
  factory-owned release step and was not attempted.
