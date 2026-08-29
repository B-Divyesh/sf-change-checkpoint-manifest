# Review 4 handoff — Change Checkpoints

## Outcome

Adversarial first-read review 4 is complete with verdict **FAIL**. No product
code was changed. The full report is `.factory/review-4.md`.

## Verification performed

- Opened the live site cold in fresh Chromium contexts at 390 × 844 and
  1440 × 900 before scrolling.
- Ran all 20 commands in `.factory/claims.json` independently from clean clone
  `/tmp/change-checkpoint-review-4.mvxTbm/repo`; every declared command passed.
- Ran the full `npm test` (25/25 browser tests plus Rust/Node checks) and
  `npm run build`; both passed and `dist/site` was produced.
- Exercised the live one-click demo, sample check/tamper result, Reset, sticky
  banner, isolated storage, exit, request log, Back/Forward behavior, metadata,
  route status, link crawl, mobile/desktop layout, reduced motion, and Axe.
- Ran the real CLI demo from a temporary working directory and inspected its
  JSON, Markdown, patch, key, and Git state.
- Reproduced failures for untracked directories, quoted filenames, an existing
  checkpoint ignore file, and a forged self-signed manifest with `--rerun`.

## Blocking work remaining

- Parse real Git porcelain paths safely so ordinary untracked directories and
  filenames do not abort checkpoint creation.
- Add a trust anchor for signatures and prevent untrusted recorded commands
  from running; create private keys with restrictive permissions.
- Ensure `signing.key` is ignored even when `.change-checkpoints/.gitignore`
  already exists.
- Remove undisclosed absolute local paths from portable checkpoint files.
- Complete the claims inventory and correct Back/Forward focus restoration.

Additional major/minor work is listed in the review: route-specific metadata
must exist in raw deep-link HTML, the first screen needs a price/account fact,
and “Clear boundary” should be removed or made specific.
