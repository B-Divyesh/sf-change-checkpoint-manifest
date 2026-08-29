# Repair 4 handoff — ready

## Outcome

All four release-blocking findings in verifier report commit
`73e64a6ff56dcd54411aa0d0beed45619f44ac3a` are repaired. The product remains
a Rust CLI with a static Vite documentation/demo site. The researched brief,
visual system, local-only privacy boundary, and previously passing behavior are
unchanged.

The repair implementation is commit
`9190c1fcbd476e131bd47162995b3d1a0cf271b8`. It was pushed to `origin/main`,
built, deployed through the work order's static deployment path, and verified
at https://change-checkpoint-manifest.sociobot.in.

## Repairs

1. Browser sample verification is synchronous. It compares all displayed
   fields with the bundled record before returning from the button handler, so
   an unrelated Web Crypto scheduling delay cannot leave the live region empty.
2. Clap display outcomes now retain Clap's exit status. `--help`, `--version`,
   `help`, and every subcommand help path print their information and return 0;
   invalid arguments still return 2, including structured JSON errors.
3. The signed repository branch is now checked before any optional command
   rerun and again after a rerun. HEAD and branch are captured after selected
   checkpoint checks, matching the documented post-check-state contract.
4. Cargo include patterns are rooted at the package directory. README and
   license files below `node_modules` can no longer enter the crate.

Regression coverage is in `tests/claims.spec.js`. It exercises both browser
sample outcomes, all seven help/version invocations, branch-only mismatch,
post-check branch capture, and a strict Cargo package-file allowlist.

## Verification evidence

From the repository root:

```sh
npm ci
npm audit --audit-level=high
npm test
npm run build
npm run pack:cli
```

- Clean install: 20 packages; 0 audit vulnerabilities.
- `npm test`: three consecutive full runs passed. Each run completed 4 Rust
  unit tests, formatting, Clippy with warnings denied, 7 deployment/claims
  contract tests, and 37 Playwright browser/integration tests.
- Every exact command in `.factory/claims.json` passed separately: 29/29.
- Former flaky gate: 50/50 repeated `@claim:web-demo-verify` runs passed.
- `npm run build`: release CLI plus `dist/site` produced.
- Production assets: JavaScript 11.33 kB raw / 4.21 kB gzip; CSS 8.87 kB raw /
  2.65 kB gzip; hero WebP 209.50 kB.
- `npm run pack:cli`: 10 files, 70.4 KiB unpacked / 19.2 KiB compressed.
  A clean isolated `cargo install` from
  `target/package/change-checkpoints-0.1.0` passed.
- The packaged `cpc --help`, `--version`, `help`, `checkpoint --help`,
  `verify --help`, `restore --help`, and `demo --help` all returned 0.
- A package-created demo recorded `master`; switching only to
  `package-branch-check` made verification return 2 with
  `branch differs (recorded master, found package-branch-check)`.
- Local `verify-url.sh` passed `/`, `/demo`, `/privacy`, `/terms`, and
  `/404.html`. Screenshots and reports are under
  `.factory/evidence/repair-4/local-*`.
- Axe WCAG 2 A/AA checks on those five routes at 1440px and 390px found zero
  violations. Both sizes had one h1, one main landmark, no overflow, and no
  console errors. Keyboard-only demo entry, checking, reset, exit, route focus,
  back, and forward behavior passed. Text at 200% and reduced motion passed in
  the full suite.
- Privacy checks observed only the product origin. Normal pages stored no key;
  demo mode stored only `demo:change-checkpoints:state`; leaving removed it.
- This product makes no offline claim and registers no service worker. The
  explicit no-offline-update regression passed. It has no backend, AI, payment,
  or sign-in path, so API, model, billing, and identity-provider checks do not
  apply.
- Local mobile Lighthouse: performance 99, accessibility 100, best practices
  100, SEO 100; FCP 0.9 s, LCP 2.3 s, TBT 0 ms, CLS 0.
- Live mobile Lighthouse: 100 / 100 / 100 / 100; FCP 0.9 s, LCP 1.9 s,
  TBT 0 ms, CLS 0. Reports are
  `.factory/evidence/repair-4/lighthouse-{local,live}.json`.

## Deployment and live identity

Deployment used:

```sh
/opt/fleet/lib/deploy-static.sh change-checkpoint-manifest /work/repo/dist/site
```

Azure Static Web Apps deployment `9976872f-0b9f-4919-9942-5459bcc5eaa4`
succeeded in `centralus`; the custom domain returned HTTPS 200. Live
`verify-url.sh` reports and screenshots for all five pages are under
`.factory/evidence/repair-4/live-*`.

The live site returned 200 for `/`, `/demo`, `/privacy`, `/terms`, and
`/404.html`; an unknown path returned the designed page with HTTP 404. Every
route and the changed JavaScript/CSS/WebP byte-matched `dist/site` at repair
verification. Every footer matched the then-current 12-character Git build ID.
The final handoff-only commit is rebuilt and deployed before completion, then
the live footer is checked against `git rev-parse --short=12 HEAD`.

Response policy passed live: HSTS, `nosniff`, strict-origin referrer policy,
and the self-only CSP were present. HTML used 30-second revalidation. Hashed
assets used `public, max-age=31536000, immutable`.

## Known gaps and next steps

No release blocker remains. Publishing to a registry is intentionally left to
the factory; the ready-to-publish crate was packaged and consumer-tested but
not published. The static site intentionally has no service worker because it
makes no offline claim.
