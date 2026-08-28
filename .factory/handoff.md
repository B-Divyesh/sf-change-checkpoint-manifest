# Review 3 handoff — Change Checkpoints

## Outcome

Independent first-read review 3 passed with zero findings. No product code was
changed. The review record is in `.factory/review-3.md`.

## Verified

- Fresh live browser contexts at 390 × 844 and 1440 × 900 confirmed the
  first-read message, one-click populated demo, demo isolation, reset, exit,
  focus return, request boundary, and browser-record tamper detection.
- All 20 claim commands in `.factory/claims.json` passed from fresh clone
  `/tmp/change-checkpoint-review-3.lhLcur/repo`; the complete tagged claim run
  passed 14 tests carrying all claim IDs.
- `npm test` and `npm run build` passed from that clone. The repository ships
  no lockfile, so use the documented `npm install` before those commands.
- Live metadata, links, route statuses, 404, and Axe WCAG 2 A/AA scans passed.

## Run

```sh
npm install
npm test
npm run build
cargo run -- demo
```

Use `/?demo=1` for the browser sample. `npm run build` writes `dist/site`.

## Known gaps

None found in this review.
