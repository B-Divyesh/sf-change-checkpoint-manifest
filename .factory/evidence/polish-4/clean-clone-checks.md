# Clean-clone checks

Source: commit `0bea839` cloned with `git clone --no-local` to
`/tmp/change-checkpoints-polish-4-clean.vsaZFI/repo`.

- All 23 commands declared in `.factory/claims.json` passed independently.
- `npm test` passed: 4 Rust unit tests, 7 Node contract/configuration tests,
  and 29 Playwright browser/integration tests.
- `npm run build` passed and produced `dist/site` plus the release CLI.
- `npm run pack:cli` passed; the crate was 233.8 KiB raw and 69.3 KiB
  compressed.
- Built site assets: JavaScript 11.39 KiB raw / 4.33 KiB gzip; CSS 8.87 KiB
  raw / 2.65 KiB gzip; hero WebP 209.50 KiB.

The browser suite includes Axe WCAG A/AA checks, keyboard and history focus,
390px and 1440px layout, 200% text, reduced motion, same-origin request
logging, storage isolation, and the no-service-worker/offline-claim check.
