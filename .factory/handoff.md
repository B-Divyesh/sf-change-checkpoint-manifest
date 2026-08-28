# Polish 2 handoff — Change Checkpoints

## Outcome

Release repair commit `64d2ddbdac3a7349a3d4efa58cd8b082b5ef8b75` is pushed to
`main` and deployed to https://change-checkpoint-manifest.sociobot.in.
Every finding in `review-1.md` and `review-2.md`, including carried and minor
items, is resolved and mapped in `.factory/polish-2.md`.

The repair adds a real browser-side bundled-record check with a tamper failure,
a complete clone-and-install route, a sticky demo boundary, full claim
inventory coverage, restored opportunity brief, focus-safe demo exit, and the
remaining plain-language/terminology fixes. The warm proof-sheet visual system
and static CLI-plus-site artifact class are preserved.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run pack:cli
```

`npm run build` produces `dist/site`. Preview the site with `npm run dev`.
Install the CLI from a clone with the three commands shown in the landing
Install section and README. Run `cargo run -- demo` for the isolated CLI
sample, or open `/?demo=1` for the isolated browser sample.

## Exact evidence

- Clean clone: `/tmp/change-checkpoint-polish-2-clean.cFOlAs/repo`; `npm ci`
  completed, then each of the 20 commands listed in `.factory/claims.json`
  was run exactly as written and passed.
- Full local suite: `npm test` passed (Rust format, Clippy, 3 unit tests,
  deployment/brief/claim contract tests, and 25 Playwright tests). `npm run
  build` passed and emitted `dist/site`; `npm run pack:cli` verified the
  67.0 KiB compressed Cargo package.
- Local cold page checks: `verify-url.sh` passed for `/` and `/?demo=1`; see
  `.factory/evidence/polish-2/local-root/` and `local-demo/`.
- Production: Static deployment `8a8f5e35-ffe1-48a1-ad76-1037cb69e6bf`
  succeeded. `verify-url.sh` passed cold for `/`, `/?demo=1`, `/privacy`, and
  `/terms`; reports and screenshots are in `.factory/evidence/polish-2/live-*`.
  `/missing-review-two` returned HTTP 404.
- Production browser/Axe re-check: WCAG 2 A/AA zero violations on root, demo,
  Privacy, Terms, and 404. It verified same-origin runtime requests, the
  valid and tampered browser sample result, persistent banner, reset/exit
  controls, exit focus, and all desktop first-screen facts.
- Production Lighthouse report: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.0 s, LCP 2.0 s, CLS 0, TBT 20 ms. The Chrome
  tab crashed while capturing its final screenshot after audits completed;
  the JSON report and independent browser checks are retained at
  `.factory/evidence/polish-2/lighthouse-live.json`.

## Known gaps and next steps

None. This product intentionally does not make an offline claim, use analytics,
or require AI, accounts, paid features, or third-party runtime assets.
