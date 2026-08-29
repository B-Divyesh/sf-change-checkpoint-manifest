# Independent verification 6 — PASS

**Candidate:** `c4d1c09c8a981495137ea3d180448a829f6581b7`
**Live URL:** https://change-checkpoint-manifest.sociobot.in
**Verified:** 2026-08-29 UTC
**Scope:** clean-checkout QA against the researched brief, work order, and factory acceptance contract. Product code was not changed.

## Verdict

**PASS.** Change Checkpoints fulfils its local CLI job: it records a signed Git-state/check/rollback package, verifies the signed context before optional reruns, and never executes rollback notes. The live static documentation and one-click sample match the requested candidate byte-for-byte. No release-blocking defects were found.

## Required opening checks

`.factory/claims.json` exists and lists 29 claims. After `npm ci` in this clean checkout (20 locked packages; 0 audit findings), every exact `test` command from that file was executed individually. All passed: `demo-sandbox`, `web-storage`, `checkpoint-record`, `runs-in-git-repository`, `local-signing-key-path`, `signed-manifest`, `no-command-output`, `environment-hash`, `local-key-ignore`, `verify-manifest`, `trusted-signature`, `restore-safe`, `optional-patch`, `no-third-party-runtime`, `git-required`, `mit-license`, `web-demo-verify`, `install-from-source`, `markdown-summary`, `cli-demo-isolated`, `runtime-requirements`, `portable-paths`, `free-no-account`, `live-build-id`, `safe-checkpoint-outputs`, `safe-checkpoint-inputs`, `validated-environment`, `json-errors`, and `post-check-state`.

The cold live first-read test passes. The first screen says **“Record checks with each change”**, says it is for **“teams reviewing fast edits”**, explains that the diff, checks, and rollback note stay together, and provides the visible one-click **“Try it with sample data”** action with the plain outcome “See a sample checkpoint next.” Keyboard activation opened the populated demo and its persistent **“Demo — sample data, nothing is saved”** banner.

## Local quality gates

```sh
npm ci
npm test
npm run build
npm run pack:cli
```

- `npm test`: PASS. `cargo fmt --check`, Clippy with `-D warnings`, 4 Rust unit tests, 7 deployment/claims-contract tests, and all 37 Playwright tests passed.
- `npm run build`: PASS. It produced the release CLI and `dist/site`.
- `npm run pack:cli`: PASS. The crate contains 10 intended files, 70.4 KiB unpacked / 19.2 KiB compressed; no `node_modules` material was packaged.
- Production assets meet budgets: JS 11.33 kB raw / 4.21 kB gzip, CSS 8.87 kB raw / 2.65 kB gzip, and hero WebP 209.50 kB. The initial JS is well below both the 150 kB and 200 kB limits.

## CLI end-to-end evidence

A consumer install of `target/package/change-checkpoints-0.1.0` into a new, isolated Cargo root passed. Packaged `cpc --help` and `cpc --version` both returned 0. `cpc demo --json` created `/tmp/change-checkpoints-demo-14622`, a real temporary Git repository containing `agent-edit.json`, its Markdown summary, and a Unix mode-0600 signing key.

From that demo repository, `cpc verify … --rerun --json` returned the exact two commands and exit 3 (approval required); with `--approve-rerun` it returned exit 0 and `valid:true`. `cpc restore … --json` returned the rollback note with exit 0 while the source file remained present. In a fresh non-Git directory, `cpc checkpoint … --json` returned exit 1 and structured `{"ok":false,"error":{"code":"git_required",…}}`, with no manifest.

The separately executed claim coverage also exercised Unicode/spaced and renamed paths, invalid environment assertions, output/input aliases, optional untracked-file patches, tampered signatures, state/branch mismatch, post-check state capture, and JSON error recovery.

## Live, browser, privacy, and deployment checks

- The live footer exposes `Build c4d1c09c8a98`, matching the requested candidate. Root, demo, privacy, terms, 404 HTML, JS, CSS, and hero WebP byte-match the fresh local production build.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. A missing path returns the designed page with HTTP 404. `verify-url.sh` passed all five public pages: title, `lang=en`, one h1, main landmark, image alternatives, labelled controls, and no console/page errors.
- Fresh Chromium checks at 1440px and 390px found no horizontal overflow or interactive target below 44px. At 200% text zoom on 390px, page width stayed within the viewport and demo content remained available. Keyboard focus begins at the skip link with a visible 3px red outline; demo entry, record check, reset, and exit work by keyboard. Reduced-motion mode had no running animation.
- Axe WCAG 2 A/AA scans on root, demo, privacy, terms, and 404 at both widths reported zero serious or critical violations.
- Request logs across those routes contained only `https://change-checkpoint-manifest.sociobot.in`. Normal pages stored no browser key. Demo stored exactly `demo:change-checkpoints:state`; reset reseeded it and leaving removed it. No analytics, third-party runtime assets, account, billing, AI, or sign-in flow is present.
- Live response headers include HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a self-only CSP with `frame-ancestors 'none'`. HTML uses 30-second revalidation; hashed JS/CSS use `public, max-age=31536000, immutable`.

This is a static website plus local CLI: it has no service worker/offline claim, server endpoint, persistence service, unlock API, or sign-in path. Therefore PWA update/offline reload, endpoint rate-limit/429, concurrency, and Entra-tenant checks are not applicable.

## Defects

None found (P0/P1/P2/P3: none).
