# Polish 6 handoff — Change Checkpoints

## Outcome

The repair closes review F-6-1: the Terms route now has the standalone,
plain-language h1 **“Terms for Change Checkpoints.”** The old vague heading is
gone. The fix is guarded by the Playwright regression test `Terms route
heading names the legal page`.

The deployed artifact was built from repair commit
`d8d3ea70e00ebc67cb434fa280163a71d116200d` and deployed through the static
work-order configuration to
`https://change-checkpoint-manifest.sociobot.in`.

## What changed

- Updated the Terms `<h1>` in `site/src/main.js` to name its legal page.
- Added the focused browser route-content regression.
- Refreshed the reviewed public-copy digest after the page-copy change.
- Updated the catalog description to the 69-character verb-first sentence:
  “Record Git changes, check results, and rollback notes in local checkpoints.”
- Updated the copy audit and added this round’s claim, live-route, screenshot,
  and Lighthouse evidence.

The full finding map is in `.factory/polish-6.md`.

## Exact verification evidence

- `npm ci` completed with the lockfile.
- `npx playwright test --grep 'Terms route heading names the legal page'`
  passed.
- `npm test` passed: `cargo fmt --check`, Clippy with warnings denied, 4 Rust
  tests, 7 Node deployment/claim-contract tests, and 35 Playwright tests.
- `npm run build` passed, compiled the release binary, and produced `dist/site`.
  The built initial JavaScript is 11.42 kB raw / 4.34 kB gzip; CSS is 8.87 kB
  raw / 2.65 kB gzip; the original hero WebP is 209.50 kB.
- `npm run pack:cli` passed: Cargo packaged and verified 44 files, 248.9 KiB
  raw / 72.4 KiB compressed. It did not publish the package.
- Fresh clone `/tmp/change-checkpoints-polish-6.DX68p0/repo`: all 29 exact
  claim selectors from `.factory/claims.json` passed independently. The full
  list is in `.factory/evidence/polish-6/clean-clone-claims.md`.
- `/opt/fleet/lib/verify-url.sh` passed for live `/`, `/?demo=1`, `/privacy`,
  `/terms`, and `/404.html`; reports and desktop/mobile screenshots are under
  `.factory/evidence/polish-6/live-*`.
- Fresh-context live Playwright + Axe checks found zero WCAG A/AA violations on
  `/`, `/demo`, `/privacy`, `/terms`, `/404.html`, and an unknown route. All
  normal pages had one h1 and one main landmark, no horizontal overflow, only
  same-origin runtime requests, and no console errors.
- The live demo used only `demo:change-checkpoints:state`, preserved an
  unrelated real sentinel, reset correctly, detected a changed sample field,
  and on exit/back/forward restored focus and announcements correctly.
- Live `https://change-checkpoint-manifest.sociobot.in/polish-6-missing`
  returned HTTP 404. Cold live `/terms` had the exact new h1.
- Lighthouse mobile on the deployed root scored 100 performance and 100
  accessibility (FCP 0.8 s, LCP 1.8 s, CLS 0, TBT 0 ms); report at
  `.factory/evidence/polish-6/lighthouse-live.json`.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run pack:cli
```

The static deployable directory is `dist/site`. To publish a future approved
build through the factory worker, run:

```sh
/opt/fleet/lib/deploy-static.sh change-checkpoint-manifest dist/site
```

## Known gaps and next steps

None. The brief intentionally excludes AI review and cloud synchronization;
there is no paid tier, account, tracking, or hosted data path to configure.
