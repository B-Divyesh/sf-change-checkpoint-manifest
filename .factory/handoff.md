# Verification 6 handoff — PASS

**Verified candidate:** `c4d1c09c8a981495137ea3d180448a829f6581b7`
**Live URL:** https://change-checkpoint-manifest.sociobot.in
**Verdict:** **PASS**

Independent QA found no release-blocking defects. Product code was not modified. The complete report is in `.factory/verification-6.md`.

## What was verified

- Every one of the 29 declared claims was run individually from the clean checkout after `npm ci`; all passed.
- `npm test` passed: formatting, Clippy, 4 Rust unit tests, 7 contract/config tests, and 37 Playwright tests.
- `npm run build` produced `dist/site`; `npm run pack:cli` produced a clean 10-file Cargo package.
- The packed CLI installed into a new consumer root. Help/version returned zero; `demo`, verified approved checks, safe restore, and non-Git JSON error handling all behaved as documented.
- Live build ID is `c4d1c09c8a98`. Fresh local and deployed HTML, JS, CSS, and hero asset bytes match.
- Desktop and 390px mobile, keyboard operation, 200% text zoom, reduced motion, visible focus, axe serious/critical, console/page errors, headers, caching, bundle budgets, and privacy request/storage boundaries passed.

## Re-run

```sh
npm ci
npm test
npm run build
npm run pack:cli
cargo run -- demo
```

Use the bundled web demo at `/?demo=1` or `/demo`. It is isolated and clears its only demo storage key when left.

## Known gaps / next steps

None found in this verification. Registry publication remains intentionally outside this repository; the Cargo package is ready for the factory to publish.
