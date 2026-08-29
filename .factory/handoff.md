# Review 6 handoff — Change Checkpoints

## Outcome

Review-only work is complete. No product code was changed.

`.factory/review-6.md` records a **FAIL** with one minor finding:

- **F-6-1:** the `/terms` h1 says “Use checkpoints with care” instead of
  naming the Terms page. The proposed replacement is “Terms for Change
  Checkpoints”.

## Checks completed

- Read the brief, design thesis, demo contract, claims inventory, every prior
  review/polish/verification record, and the prior handoff.
- Opened the live site in fresh 390 px and desktop browser contexts before
  scrolling. The first screen clearly names the job, audience, and first
  action.
- Confirmed the one-click populated demo, sticky disclosure, sample reset,
  storage separation, demo exit, browser history focus, changed-field result,
  and same-origin request log.
- Ran every one of the 29 claim commands individually from clean clone
  `/tmp/change-checkpoints-review-6.Dma2n8/repo`; all passed.
- Ran `npm test` and `npm run build` in that clone; both passed and the build
  produced `dist/site`.
- Confirmed CLI demo output from a fresh temporary directory, live metadata,
  route status, crawled links, mobile Axe results, and current visual-design
  evidence.

## Next step

Change the Terms h1 as described in F-6-1, add its route-content check, then
repeat the complete review. No other gap was found.
