# Change Checkpoints handoff

## What shipped

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

Results on 2026-08-28:

- `npm test`: pass — 3 Rust unit tests and 6 Playwright tests.
- Claim tests cover demo storage and same-origin requests, Ed25519 manifests,
  verification with re-run checks, and omitted command output.
- `npm run build`: pass — release binary and site at `dist/site/index.html`.
- `npm run pack:cli`: pass — Cargo package verifies at 55.6 KB compressed.
- Playwright Axe scan: no WCAG 2 A / AA violations on `/` and `/demo`.
- Lighthouse mobile, local preview: Performance **99**, Accessibility **100**,
  LCP **2.25 s**, CLS **0**. Initial JavaScript is 4.29 KB gzip, CSS is
  2.35 KB gzip, and the hero WebP is 205 KB.

## Known boundaries

- A checkpoint never executes a rollback. This is intentional: the manifest
  provides the verified instruction while the engineer controls the change.
- The optional `--include-diff` patch may contain source secrets. It is opt-in
  and the CLI and docs tell users to inspect it before sharing.
- The `$19` Pro checkout URL follows the factory license contract. Product
  registration and live billing configuration remain a factory task.
- The generated PNG source and prompt metadata live in `.factory/art`; the
  site loads only the 205 KB WebP derivative.
