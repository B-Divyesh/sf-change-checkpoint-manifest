# Polish 4 handoff — Change Checkpoints

## Outcome

All cumulative findings in `review-1.md` through `review-4.md` are fixed. The
core repair is commit `0bea839`; the final evidence/docs commit follows it on
`main`. Production was deployed as Azure Static Web Apps deployment
`b08e81db-9179-4ccd-853b-7311cf30fff3` at
https://change-checkpoint-manifest.sociobot.in.

The CLI now handles normal complex Git paths, anchors signatures outside the
manifest, blocks untrusted command reruns, protects and ignores the private
key, and omits absolute repository paths from portable files. The site now has
raw route metadata, deterministic route focus, a compact mobile demo boundary,
complete first-screen facts, and sentence-level claim accountability.

## Verification evidence

- Clean clone: `/tmp/change-checkpoints-polish-4-clean.vsaZFI/repo` from
  `0bea839` with `npm ci`.
- Every one of the 23 commands in `.factory/claims.json` passed independently.
- Clean-clone `npm test` passed 4 Rust unit tests, 7 Node contract/configuration
  tests, and 29 Playwright tests.
- Clean-clone `npm run build` produced the release binary and `dist/site`.
- Clean-clone `npm run pack:cli` verified a 233.8 KiB crate package (69.3 KiB
  compressed). It was not published.
- Built site: JavaScript 11.39 KiB raw / 4.33 KiB gzip; CSS 8.87 KiB raw /
  2.65 KiB gzip; hero image 209.50 KiB.
- `/opt/fleet/lib/verify-url.sh` passed cold on `/`, `/?demo=1`, `/demo`,
  `/privacy`, and `/terms` with no console errors.
- Fresh production Playwright/Axe checks found zero WCAG A/AA violations on
  root, Demo, Privacy, Terms, and 404. Each has one h1, one main, no overflow,
  and no visible control smaller than 44px.
- The production demo accepted its bundled record, rejected a changed field,
  kept its 94.33px banner visible, preserved `real:sentinel`, removed only its
  demo key, and restored visible focus through exit → Back → Forward.
- Raw production responses for `/demo`, `/privacy`, and `/terms` contain their
  route-specific title, description, canonical, Open Graph, and Twitter data.
  `/missing-polish-four` returns the designed page with HTTP 404.
- All crawled internal links and the public GitHub source returned 200. Runtime
  browser requests stayed on the product origin. CSP, `nosniff`, referrer
  policy, and immutable asset cache headers are present.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.8s, LCP 1.8s, TBT 0ms, CLS 0; transfer 213 KiB.

Evidence:

- [Finding map](polish-4.md)
- [Clean-clone checks](evidence/polish-4/clean-clone-checks.md)
- [Live interaction and route check](evidence/polish-4/live-check.json)
- [Lighthouse report](evidence/polish-4/lighthouse-live.json)
- [Live root mobile](evidence/polish-4/live-root/screenshot-mobile.png)
- [Live demo flow mobile](evidence/polish-4/live-demo-flow-mobile.png)

## Run and verify

```sh
npm ci
npm test
npm run build
npm run pack:cli
cargo run -- demo
```

Deployable site files are in `dist/site`. The CLI package is ready for the
factory publishing workflow; no registry publication was attempted here.

## Known gaps and next steps

None. No review finding, deferred minor item, TODO, or stub remains.
