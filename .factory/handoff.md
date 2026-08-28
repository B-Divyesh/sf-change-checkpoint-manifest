# Change Checkpoints handoff

## What shipped

### Repair: Azure Static Web Apps 404 schema

- Reproduced the rejected candidate configuration: its `/404` route combined
  `rewrite: "/index.html"` and `statusCode: 404`. Azure Static Web Apps rejects
  that combination.
- Replaced that route with `responseOverrides: {"404":{"rewrite":"/404.html"}}`
  and added a styled, static `404.html`. The SPA fallback remains for app
  routes; the real 404 response has its own page.
- Added `tests/staticwebapp-config.test.js`, run against the built artifact, to
  reject rewrite/status-code route combinations and require the 404 response
  override and asset.
- Added a true 390 px mobile regression test. It caught and fixed a proof-sheet
  grid overflow and a keyboard-inaccessible scrolling code region.

- `cpc`, a Rust CLI that records the current Git commit, diff fingerprint,
  untracked-artifact hashes, selected check commands, exit statuses, environment
  assertions, and a rollback note.
- Ed25519-signed JSON manifests plus readable Markdown proof sheets. The local
  signing key is ignored automatically. `cpc verify --rerun` validates the
  signature, checkout state, environment assertions, and recorded exits.
- `cpc restore` verifies then prints a rollback note. It never alters files.
- `cpc demo`, which creates a disposable sample Git repository and writes a
  signed sample checkpoint. The sample source also ships in `examples/`.
- A Vite static docs site in `dist/site` with `/`, `/demo`, `/privacy`,
  `/terms`, and styled 404 handling. It has a self-hosted terminal recording,
  original generated art, a mobile layout, and the Sociobot one-time license
  checkout, stored-token, verify, and restore-purchase flow.
- Required product records: design thesis, demo instructions, claims, and copy
  audit under `.factory/`.

## Verify

```sh
npm install
npm test
npm run build
npm run pack:cli
cargo run -- demo
```

Results on 2026-08-28 (repair commits `5459627` and `07ce18d`):

- Exact work-order clean build `npm ci && npm run build:site`: pass. The
  deployable artifact is `dist/site` and includes `staticwebapp.config.json`.
- `npm test`: pass — 3 Rust unit tests, 2 deploy-schema tests, and 8 Playwright
  tests. The browser coverage includes claim flows, privacy/same-origin demo
  requests, keyboard operation, 390 px mobile layout, the static 404 page, and
  Axe WCAG 2 A/AA scans.
- Claim tests cover demo storage and same-origin requests, Ed25519 manifests,
  verification with re-run checks, and omitted command output.
- `npm run build`: pass — release binary and site at `dist/site/index.html`.
- `npm run pack:cli`: pass — Cargo package verifies at 55.6 KB compressed.
- Live production deployment: `swa deploy dist/site --swa-config-location
  dist/site --app-name sf-change-checkpoint-manifest --resource-group sociobot
  --env production` succeeded. Azure accepted the repaired configuration and
  served `https://kind-pebble-072c92a10.7.azurestaticapps.net`.
- Live mobile browser smoke test on `/`, `/demo`, and `/404.html`: HTTP 200,
  `lang=en`, one main and h1, complete image alt text, no console errors, no
  horizontal overflow, and zero Axe WCAG 2 A/AA violations.
- Lighthouse on the live Azure endpoint: Performance **99**, Accessibility
  **100**, LCP **1.914 s**, CLS **0**, total transfer **217,815 bytes**.
  Initial JavaScript is 4.29 KB gzip and CSS is 2.38 KB gzip.

## Known boundaries

- A checkpoint never executes a rollback. This is intentional: the manifest
  provides the verified instruction while the engineer controls the change.
- The optional `--include-diff` patch may contain source secrets. It is opt-in
  and the CLI and docs tell users to inspect it before sharing.
- The `$19` Pro checkout URL follows the factory license contract. Product
  registration and live billing configuration remain a factory task.
- The generated PNG source and prompt metadata live in `.factory/art`; the
  site loads only the 205 KB WebP derivative.
- The requested custom hostname
  `change-checkpoint-manifest.sociobot.in` is not yet provisioned: DNS does not
  resolve and `az staticwebapp hostname list --name
  sf-change-checkpoint-manifest --resource-group sociobot` returned `[]` after
  deployment. The default Azure endpoint above is verified. Binding the custom
  domain/DNS is an infrastructure task and was not changed from this repo.
- Offline/update checks are not applicable: this is not a PWA and makes no
  offline or update claim; it ships no service worker.
