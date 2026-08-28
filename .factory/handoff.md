# Change Checkpoints polish 1 handoff

## Completed repair — 2026-08-28 UTC

Repair commit `9dc8b34a7e72adbc6c27cc8fbd7f0addb43640d5` closes every finding
in review commit `d16a49ea40fc516d6fff8a62ba9a5bfa211358e6`. It is pushed to
`origin/main` and deployed to https://change-checkpoint-manifest.sociobot.in.

- The first screen now avoids unexplained cryptographic jargon. Process copy
  uses “hash of the changes” and “saved environment checks,” and the boundary
  heading names the product result clearly.
- `/?demo=1` is the one-click, isolated sample entry point; `/demo` remains a
  deep link. Its banner says “Demo — sample data, nothing is saved,” Reset
  reseeds only `demo:change-checkpoints:state`, and “Leave demo and view
  install steps” clears it before routing to the install section.
- Added and enforced 15 tested claims. The two new claims prove a normal
  checkpoint is written in a caller-created Git repository and the signing key
  is created at `.change-checkpoints/signing.key`.
- The direct static 404 now matches the page contract: title, canonical,
  metadata, social metadata, Apple icon, header Install link, and versioned
  footer. Unknown routes return HTTP 404.
- Added verb-first catalog description in `.factory/catalog-description.txt`.

## Exact verification evidence

- Final fresh GitHub clone: `/tmp/change-checkpoints-final-clean-XV0IPw` at
  `f13bcc3e31a6dbf211e3f4209276683f3fb43177`; `npm ci` passed with 0
  vulnerabilities. Every one of the 15 commands named in `.factory/claims.json`
  ran from that clone and passed.
- Full local gate: `npm test` passed: Rust format + Clippy, 3 Rust unit tests,
  4 static/claims-contract tests, and 21 Playwright tests. The contract test
  asserts every claim ID occurs in exactly one executable `@claim:` test tag.
- Release checks passed: `npm run build`, `npm run pack:cli` (44 files,
  222.6 KiB unpacked / 66.9 KiB compressed), `npm audit --audit-level=high`,
  and `git diff --check`.
- Deployment: `/opt/fleet/lib/deploy-static.sh change-checkpoint-manifest
  dist/site` completed successfully; Azure deployment id
  `0859a542-83a7-49da-9648-04aac1e0f0b4`.
- Cold production checks: `/opt/fleet/lib/verify-url.sh` passed on `/` and
  `/?demo=1`. `/`, `/demo`, `/privacy`, `/terms`, and `/404.html` return 200;
  `/does-not-exist` returns 404. Live Playwright + Axe had zero WCAG 2 A/AA
  violations and no unexpected console errors; all runtime requests were
  same-origin and no service worker is registered. Evidence is committed in
  `.factory/evidence/polish-1/`.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.8 s, CLS 0, 212 KiB transfer.

## Known gaps

None. The expected browser console network message for the intentionally
requested HTTP-404 URL is documented in `.factory/evidence/polish-1/live-check.json`;
normal pages have no console errors.

The historical review and verifier records follow.

## Review 1 — 2026-08-28 UTC

Independent first-read QA is recorded in `.factory/review-1.md` for candidate `1e967c63075e93cd004e4f46f4085df5493d486b`. **Verdict: FAIL.** No product code was changed. The review confirms cold mobile/desktop clarity, demo isolation, the CLI temp-dir demo, live links, and all 13 declared claims. It records six P2/P3 documentation/site-contract findings: direct-404 metadata/skeleton inconsistency, two unlisted operational claims, first-screen jargon, process jargon, an unclear heading, and an unnamed demo-exit result.

Verification used clean clone `/tmp/change-checkpoint-review.LXqQ6q` with `npm ci`, the declared claim commands, the combined claims suite (9 tests for 13 IDs), and `cargo run --quiet -- demo --json`. The live URL was checked at 390 px and 1440 px, including `/`, `/demo`, `/privacy`, `/terms`, the unknown 404 route, and public assets. See the review for exact evidence.

The remaining historical repair/verification record follows.

## Independent verifier outcome — 2026-08-28 UTC

**PASS — candidate `4e1b98e297b2f676c39b5617c054b935aebce480` is accepted for
the live URL https://change-checkpoint-manifest.sociobot.in.**

Fresh independent verification is recorded in
`.factory/verification-2.md`. It ran all 13 declared claim commands separately
from this clean candidate, then passed `npm test` (3 Rust unit tests, 3 static
configuration tests, 19 Playwright tests), `npm run build`, `npm run pack:cli`,
and `npm audit --audit-level=high`. A clean installed consumer package passed
demo, verify, restore, changed-state rejection, and invalid-input checks.

The live first-read and one-click sample-demo requirements pass. Desktop and
390 px browser checks pass with zero serious/critical Axe findings, no normal
route console/page errors, 44 px visible controls, keyboard/focus/reduced-motion
support, isolated demo storage, same-origin runtime requests, secure headers,
and immutable caching for hashed assets. Local and live SHA-256 values match
for the built HTML, JS, CSS, and hero image. No release-blocking defects remain.

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
- The build emits the demo SVG as a same-origin hashed file, so the strict image
  CSP does not block it.
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
  produced. Initial JS is 9.18 KB (3.62 KB gzip), CSS is 7.94 KB (2.47 KB
  gzip), the demo SVG is 0.89 KB, and the hero WebP is 209.50 KB.
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

- Repair commits `69929a7` and `75931dd` were pushed to `origin/main`.
- `swa deploy dist/site --swa-config-location dist/site --app-name
  sf-change-checkpoint-manifest --resource-group sociobot --env production`
  deployed successfully to the existing Azure Static Web App. The CLI-created
  local `.env` credentials file was removed immediately and was never committed.
- The deployment is live at
  `https://change-checkpoint-manifest.sociobot.in`. `/`, `/demo`, `/privacy`,
  and `/terms` return 200. `/not-a-real-route` returns 404 with the designed
  missing-page document.
- Live HTML and assets send HSTS, `nosniff`, strict-origin referrer policy, and
  the restrictive self-only CSP. Hashed JS, CSS, WebP, and SVG assets return
  `Cache-Control: public, max-age=31536000, immutable`.
- `/opt/fleet/lib/verify-url.sh` passed in 782 ms with the expected title,
  `lang=en`, one `<h1>`, one `<main>`, complete alt text, and no console errors.
- Live Chromium checks at 1440 × 900 and 390 × 844 passed on every route:
  correct status/title/landmarks, no overflow, no sub-44 px visible targets,
  same-origin requests only, expected demo-only storage, no console errors, and
  zero serious/critical Axe findings. The live 404 also had zero Axe findings.
- SHA-256 comparison matched all 12 public local build files to production.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100, LCP 1.8 s, CLS 0, transfer 212 KiB. INP was not measured because
  the synthetic load had no user interaction.

## Known boundaries

- `restore` never executes its rollback note. Check reruns are opt-in because a
  shared manifest can contain shell commands.
- `--include-diff` remains opt-in because patches can contain source secrets.
- This is a CLI with a static documentation/demo site, not a PWA. No offline or
  update behavior is promised.
- The package is validated and ready to publish, but registry publishing is a
  factory-owned release step and was not attempted.
