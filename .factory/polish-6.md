# Polish 6 — zero-finding repair

## Outcome

Candidate `0314b62a858afd189a68c4746f7cd0e215b8165c` was repaired and
deployed as `d8d3ea70e00ebc67cb434fa280163a71d116200d`. This round closes the
only active review finding, F-6-1. The complete earlier-review regression set
was rerun rather than assumed fixed.

Fresh live evidence is in
`.factory/evidence/polish-6/live-check.json`; browser screenshots are in
`.factory/evidence/polish-6/live-{root,demo,privacy,terms,404}/`. The deployed
URL is `https://change-checkpoint-manifest.sociobot.in`.

## Finding-to-fix map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the real HTTP 404 and shared navigation, legal links, metadata, icons, and build footer. | `the designed 404 page loads cleanly and returns home by keyboard`; [404 mobile screenshot](evidence/polish-6/live-404/screenshot-mobile.png); live `/polish-6-missing` is HTTP 404. |
| F-1-2 | Retained the repository-location and local-key-path inventory entries and observable fresh-repository tests. | `@claim:runs-in-git-repository`, `@claim:local-signing-key-path`; [root mobile](evidence/polish-6/live-root/screenshot-mobile.png); live `/` is 200. |
| F-1-3 | Kept cryptographic jargon out of the first screen; the practical free/no-account fact remains visible. | `@claim:free-no-account`; [root desktop](evidence/polish-6/live-root/screenshot-desktop.png); live `/` first screen was checked at 1440×900. |
| F-1-4 | Kept “changes hash” and “saved environment checks” in public task copy and the demo. | `@claim:web-demo-verify`, `@claim:verify-manifest`; [demo mobile](evidence/polish-6/live-demo/screenshot-mobile.png); live `/?demo=1` detects a changed field. |
| F-1-5 | Retained the standalone rollback-boundary heading. | Full Playwright landing outline check; [root desktop](evidence/polish-6/live-root/screenshot-desktop.png); live `/` passed Axe with zero violations. |
| F-1-6 | Retained the named demo-exit action and its matching Privacy explanation. | `@claim:demo-sandbox`, `@claim:web-storage`; [demo mobile](evidence/polish-6/live-demo/screenshot-mobile.png); live exit clears only demo storage and focuses install. |
| F-2-1 | Retained the real SHA-256 comparison of displayed bundled-record fields, including the mismatch outcome after tampering. | `@claim:web-demo-verify`; [demo desktop](evidence/polish-6/live-demo/screenshot-desktop.png); live `/?demo=1` reports both match and mismatch results. |
| F-2-2 | Retained the clone → directory → Cargo-install path and public GitHub link. | `@claim:install-from-source`; [root desktop](evidence/polish-6/live-root/screenshot-desktop.png); live `/#install` contains all three commands. |
| F-2-3 | Retained the sticky, compact sample-data disclosure with reset and exit controls. | `@claim:demo-sandbox`; [demo mobile](evidence/polish-6/live-demo/screenshot-mobile.png); live banner remained at y=0 after scrolling. |
| F-2-4 | Retained the complete claims inventory, one-tag-per-claim contract, reviewed-copy digest contract, and all claim tests. | `every listed visitor claim has one executable claim tag`, `every public reliance-copy source is mapped to the claims inventory`; [clean-clone results](evidence/polish-6/clean-clone-claims.md); live routes load only same-origin assets. |
| F-2-5 | Retained the sourced brief and its CI schema validation. | `the researched opportunity brief has the required review fields`; [root desktop](evidence/polish-6/live-root/screenshot-desktop.png); live scope matches the brief. |
| F-2-6 | Retained the compact desktop hero so the action result and all three facts fit before 900px. | `desktop first screen keeps the action result and all three facts in view`; [root desktop](evidence/polish-6/live-root/screenshot-desktop.png); live lowest fact ends at 658px. |
| F-2-7 | Retained unified route focus, manual history restoration, and route announcement for demo exit and Back/Forward. | `leaving the demo moves keyboard focus to the install heading`; [demo mobile](evidence/polish-6/live-demo/screenshot-mobile.png); live exit/back/forward focus results are in `live-check.json`. |
| F-2-8 | Retained “checkpoint” as the one task term, leaving the print-proof idea visual only. | Public-copy digest contract; [root desktop](evidence/polish-6/live-root/screenshot-desktop.png); live `/` uses checkpoint task copy. |
| F-2-9 | Retained consistent capitalization of Git in public copy and CLI documentation. | Public-copy digest contract; [root mobile](evidence/polish-6/live-root/screenshot-mobile.png); live eyebrow says “A local Git checkpoint tool”. |
| F-2-10 | Retained the grammatical README reference to selecting the demo-exit control. | `@claim:web-storage`; [demo mobile](evidence/polish-6/live-demo/screenshot-mobile.png); live control text matches the documented action. |
| F-4-1 | Retained NUL-delimited Git-status parsing and safe untracked-file handling. | Rust `parses_nul_delimited_paths_and_renames_without_git_quoting`; `@claim:runs-in-git-repository`; [root mobile](evidence/polish-6/live-root/screenshot-mobile.png); live docs remain available at `/`. |
| F-4-2 | Retained pinned-key trust validation and the separate rerun-approval boundary. | `@claim:trusted-signature`, `@claim:verify-manifest`; [root desktop](evidence/polish-6/live-root/screenshot-desktop.png); live How-it-works copy names verification against the key. |
| F-4-3 | Retained idempotent ignore-file preservation, exact key rule, and owner-only Unix key mode. | `@claim:local-key-ignore`, `@claim:local-signing-key-path`; [privacy mobile](evidence/polish-6/live-privacy/screenshot-mobile.png); live `/privacy` is 200. |
| F-4-4 | Retained portable manifest and Markdown output with no absolute repository path. | `@claim:portable-paths`; [privacy desktop](evidence/polish-6/live-privacy/screenshot-desktop.png); live Privacy copy states the boundary. |
| F-4-5 | Retained route-change focus and announcements for install deep links and browser history. | `SPA navigation restores route focus and browser history`, `leaving the demo moves keyboard focus to the install heading`; [demo mobile](evidence/polish-6/live-demo/screenshot-mobile.png); live forward navigation refocuses `sample-title`. |
| F-4-6 | Retained per-route prerendered titles, descriptions, canonicals, and social metadata before JavaScript runs. | `physical deep-link HTML has route-specific metadata before JavaScript runs`; [terms desktop](evidence/polish-6/live-terms/screenshot-desktop.png); live `/terms` title is `Terms — Change Checkpoints`. |
| F-4-7 | Retained the first-screen free/no-account fact and no paid or account path. | `@claim:free-no-account`; [root mobile](evidence/polish-6/live-root/screenshot-mobile.png); live first screen includes the fact. |
| F-4-8 | Kept the decorative “Clear boundary” label deleted. | Public-copy digest contract and copy audit; [root desktop](evidence/polish-6/live-root/screenshot-desktop.png); live `/` begins the section with its descriptive heading. |
| F-6-1 | Replaced the vague Terms h1, “Use checkpoints with care,” with “Terms for Change Checkpoints.” Added an exact route regression test. | `Terms route heading names the legal page`; [Terms mobile screenshot](evidence/polish-6/live-terms/screenshot-mobile.png); cold live `/terms` reports that exact h1, title, one main landmark, and zero Axe violations. |

## Verification

- Clean clone: all 29 exact claim commands passed independently; then `npm
  test`, `npm run build`, and `npm run pack:cli` passed in that same clone.
  This covered formatting, Clippy, 4 Rust tests, 7 Node tests, and 35
  Playwright tests; produced `dist/site`; and packaged 44 files (248.9 KiB
  raw, 72.4 KiB compressed). See
  `.factory/evidence/polish-6/clean-clone-claims.md`.
- Live: `/`, `/demo`, `/privacy`, `/terms`, and `/404.html` load cleanly;
  unknown routes return 404. Fresh live Axe WCAG A/AA scans found zero
  violations. The live audit saw no third-party runtime request, no overflow,
  and no console error on 200 pages.
- Lighthouse mobile on the deployed root: performance 100, accessibility 100,
  FCP 0.8 s, LCP 1.8 s, CLS 0, and TBT 0 ms; raw report:
  `.factory/evidence/polish-6/lighthouse-live.json`.
