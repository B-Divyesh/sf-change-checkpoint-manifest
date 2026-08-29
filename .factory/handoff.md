# Verification 4 handoff — PASS

**PASS** for candidate `0314b62a858afd189a68c4746f7cd0e215b8165c` at
https://change-checkpoint-manifest.sociobot.in (verified 2026-08-29 UTC).

Fresh QA completed without changing product code:

- Clean `npm ci` installed 20 packages with 0 audit vulnerabilities;
  `.factory/claims.json` is present with 30 claims and clean `npm test` passed
  all 34 Playwright tests, including every claim tag, plus Rust format, Clippy,
  unit, build, and deployment-contract tests.
- `npm run build` and `npm run pack:cli` passed. A clean temporary
  `cargo install --path . --root …` produced `cpc`; its help, demo, and
  in-repository verify preview worked. An outside-Git checkpoint exited 1 and
  created no output.
- Live root HTML and shipped hashed JS, CSS, and hero WebP SHA-256 values match
  this candidate. The live footer build is `0314b62a858a`.
- Desktop and 390px/reduced-motion browser QA passed: keyboard/focus, demo
  reset/exit, no horizontal overflow, zero serious/critical axe findings, and
  no valid-route console/page errors.
- Valid routes made only same-origin requests. Normal pages store nothing;
  demo uses only `demo:change-checkpoints:state` and clears it on exit. Live
  HSTS, nosniff, strict referrer policy, self-only CSP, and immutable hashed
  asset caching are present. Initial JS is 4.34 kB gzip; CSS is 2.65 kB gzip;
  hero WebP is 209.50 kB.

No defects found. This product has no backend endpoint, sign-in, payment,
analytics, product-unlock, or service worker, so rate-limit, identity,
concurrency, persistence, and PWA update checks do not apply. See
`.factory/verification-4.md` for exact evidence.

---

# Repair 3 handoff — Change Checkpoints

## Outcome

The release-blocking findings in verifier report commit
`974cb0db2f4412f414f4bd7fcf66e9565049cb7f` for candidate
`e60ab7eacf47254a7708615b01f4c53298c88478` are repaired. The artifact remains
a Rust `cpc` CLI with a static Vite documentation and demo site.

Implementation commit: `0e36020a96475dd5b365f886a3ab0679e992f90e`.

## Original failure reproduced

The candidate was built from an isolated archive before the repair. A tracked
`.change-checkpoints/trap.json` symlink pointed to `../victim.txt`. Running the
verifier command exited 0 and changed the start of `victim.txt` from
`DO NOT OVERWRITE` to the signed manifest JSON. The isolated reproduction used
`/tmp/cpc-repro-3mwnN3` and `/tmp/cpc-symlink-repo-ZkOQQL`.

The equivalent packaged-CLI check after repair exits 1 with structured JSON:

```json
{"error":{"code":"output_conflict","message":"checkpoint output must not be a symlink: …/trap.json"},"ok":false}
```

The target remains `DO NOT OVERWRITE`, and the marker check does not run.

## Repairs

- Checkpoint directories must be real directories directly below the Git root.
- JSON, Markdown, and patch outputs are create-only. Existing regular files,
  symlinks, hard-link aliases, and same-name stale packages are rejected before
  checks run.
- Output file handles are checked again after synchronized writes. Cleanup only
  removes the exact file created by this process.
- Manifest, trusted-key, local-key, public-key, ignore-file, and saved-patch
  inputs must be regular, unaliased files. Saved patch paths and bytes are
  checked during verification.
- Opt-in patches are assembled through a temporary Git index, so they include
  tracked edits, deletions, renames, binary changes, and new untracked files.
  `.change-checkpoints` remains excluded.
- Git status, tracked diff, untracked fingerprints, and optional exact patch are
  captured after checks. Two consecutive snapshots must match. Approved reruns
  check Git state again after every command finishes.
- Environment names, duplicates, and explicit values are validated before Git
  lookup, key creation, or commands. Explicit values must match the recording
  process environment.
- `--json` returns `{ok:false,error:{code,message}}` for argument and operation
  errors, while preserving the existing valid/mismatch response contracts.
- Every site footer shows the 12-character Git build identifier. The 404 footer
  receives the same identifier during prerendering.

## Exact regression coverage

`tests/claims.spec.js` now checks:

- the original symlink overwrite and a hard-link output alias, including target
  bytes and proof that the selected command did not run;
- byte-preserving rejection of a same-name package with a stale patch;
- symlinked and hard-linked manifest inputs, a symlinked trusted key, and a
  replaced saved-patch symlink;
- invalid and contradictory environment assertions before a marker command;
- JSON parsing and stable error codes for validation, non-Git, and Clap errors;
- a successful check that changes a tracked file followed by immediate valid
  verification;
- a new untracked file represented in both the manifest fingerprints and exact
  patch, followed by successful verification;
- the current Git build identifier on `/`, `/demo`, `/privacy`, `/terms`, and
  `/404.html`.

The claims inventory now contains 29 uniquely tagged claims. Public reliance
copy and source digests are updated. The copy audit has no banned words or
sentences over 22 words.

## Verification evidence

Fresh clone: `/tmp/cpc-clean-validation-HkDUtF/repo` at
`0e36020a96475dd5b365f886a3ab0679e992f90e`.

- `npm ci`: 20 packages installed; 0 vulnerabilities.
- `npm test`: PASS — formatting, Clippy with warnings denied, 4 Rust tests,
  7 deployment/claims contracts, and 34 Playwright tests.
- Browser coverage: PASS — Chromium at 1440×900 and 390×844, keyboard-only
  activation/focus/history, 200% text, reduced motion, demo reset/exit/storage,
  offline-policy check, request-origin privacy logging, console errors, and
  Playwright Axe WCAG 2 A/AA scans.
- `/opt/fleet/lib/verify-url.sh`: PASS on local `/`, `/demo`, `/privacy`, and
  `/terms`; each has HTTP 200, a title, `lang=en`, one h1, a main landmark,
  complete image alternatives, and no console or page errors.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.0 s, LCP 2.2 s, TBT 0 ms, CLS 0.
- `npm run build`: PASS; `dist/site` produced. Initial JS is 11,416 bytes raw /
  4.34 KiB gzip, CSS is 8,869 bytes raw / 2.65 KiB gzip, and the hero WebP is
  209,496 bytes.
- `npm run pack:cli`: PASS — 44 files, 248.9 KiB unpacked / 72.4 KiB compressed;
  Cargo package verification passed.
- Isolated packaged consumer: PASS — `cargo install` produced `cpc 0.1.0`, the
  demo verified, and the original symlink case returned `output_conflict`
  without changing its target or running its marker command.
- `npm audit --audit-level=high`: PASS — 0 vulnerabilities.
- `git diff --check`: PASS.

Evidence is under `.factory/evidence/repair-3/`, including desktop/mobile route
captures, verifier JSON, and the Lighthouse JSON report.

## Live deployment evidence

Azure Static Web Apps deployment `4f542060-0373-4cde-a36a-d9c794355a62`
succeeded at `https://change-checkpoint-manifest.sociobot.in`.

- `/`, `/demo`, `/privacy`, and `/terms` return HTTP 200. The verifier reports
  correct title/lang/h1/main/alt structure and no console or page errors.
- An unknown route returns HTTP 404 with the designed page.
- HSTS, the strict self-only CSP, `nosniff`, and strict-origin referrer policy
  are present. The deployed hashed JS has one-year immutable caching.
- Live Playwright/Axe checks at 1440×900 and 390×844 report zero violations,
  zero undersized visible controls, no overflow, no console errors, and only
  the product origin in the request log. Keyboard activation focuses the demo
  h1. No service worker is registered.
- That evidence deployment exposed `Build 51fbbf6bbf2d`, matching its Git
  commit. Later docs-only deployments derive and expose their own HEAD.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.8 s, LCP 1.8 s, TBT 0 ms, CLS 0.
- Local and live SHA-256 values match for every HTML route and hashed asset.
  Root HTML is `2509d13a4a4a12def1a4e0397b4ade98503956889b3f618dd841d5f8f9541cd9`;
  demo HTML is `2b4868d5e7492f917f3915fc2747cd5d5318df21e9be348068f925a5bc438424`.

## Deployment and operations

Build the site with `npm run build` and deploy `dist/site` with:

```sh
/opt/fleet/lib/deploy-static.sh change-checkpoint-manifest dist/site
```

The deployment configuration is `site/public/staticwebapp.config.json`. It
sets the strict self-only CSP, security headers, immutable hashed-asset cache,
physical deep-link rewrites, and the HTTP 404 response override. The product
does not register a service worker or claim offline support. It has no backend,
account, payment, analytics, or runtime AI integration, so API concurrency,
rate-limit, persistence, identity-provider, paid-unlock, and PWA update checks
do not apply.

## Known gaps

None within the researched brief. Publishing the Cargo package is intentionally
left to the factory registry workflow; this repair only verifies the package.
