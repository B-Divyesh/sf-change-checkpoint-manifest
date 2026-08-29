# Polish 4 — zero-finding repair

**Base review:** `559c98e4c2bd39675107a3a6a5981c5464c1b8d8`  
**Core repair:** `0bea839`  
**Live URL:** https://change-checkpoint-manifest.sociobot.in

Every finding in `review-1.md` through `review-4.md` and every earlier polish
record was rechecked. The controller supplied no additional finding.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the designed 404 on the shared header/footer contract with canonical, social metadata, icons, legal links, Install, and version. Unknown production paths still return HTTP 404. | Test: `the designed 404 page loads cleanly and returns home by keyboard`. Screenshot: [live 404 mobile](evidence/polish-4/live-404-mobile.png). Live: `/missing-polish-four` is 404 with zero Axe violations in [live-check.json](evidence/polish-4/live-check.json). |
| F-1-2 | Retained the repository-location and key-path claims; expanded them to complex paths and key mode `0600`. | Tests: `@claim:runs-in-git-repository`, `@claim:local-signing-key-path`. Screenshot: [live root mobile](evidence/polish-4/live-root/screenshot-mobile.png). Live: root is 200 in `live-check.json`. |
| F-1-3 | Kept algorithm jargon out of the first screen. The third fact now states price and account requirements. | Test: `@claim:free-no-account`. Screenshot: [live root mobile](evidence/polish-4/live-root/screenshot-mobile.png). Live fact bottom is 658px on desktop. |
| F-1-4 | Kept “changes hash” and “saved environment checks” throughout the product. | Tests: `@claim:web-demo-verify`, `@claim:verify-manifest`. Screenshot: [live demo mobile](evidence/polish-4/live-demo/screenshot-mobile.png). Live sample check passes and detects tampering. |
| F-1-5 | Kept the standalone heading “Store change context without running a rollback.” | Test: landing copy and heading assertions in the full browser suite. Screenshot: [live root desktop](evidence/polish-4/live-root/screenshot-desktop.png). Live root passed Axe and outline checks. |
| F-1-6 | Kept “Leave demo and view install steps”; it clears only demo state, focuses the install heading, and announces the result. | Tests: `@claim:demo-sandbox`, `@claim:web-storage`, `leaving the demo moves keyboard focus to the install heading`. Screenshot: [live demo flow](evidence/polish-4/live-demo-flow-mobile.png). Live exit data is in `live-check.json`. |
| F-2-1 | Retained the browser's real SHA-256 sample comparison and its tamper failure. | Test: `@claim:web-demo-verify`. Screenshot: [live demo mobile](evidence/polish-4/live-demo/screenshot-mobile.png). Live success and tamper messages are recorded in `live-check.json`. |
| F-2-2 | Retained the complete clone, `cd`, Cargo install sequence, and public source link. | Test: `@claim:install-from-source`. Screenshot: [live root desktop](evidence/polish-4/live-root/screenshot-desktop.png). Live crawl returned 200 for the GitHub repository. |
| F-2-3 | Kept the disclosure sticky and reduced its 390px height to 94.33px with both actions at least 44px. | Tests: `@claim:demo-sandbox`, `mobile demo has no horizontal overflow or serious accessibility violations`. Screenshot: [live demo flow](evidence/polish-4/live-demo-flow-mobile.png). Live banner top remained 0 after scrolling. |
| F-2-4 | Replaced file-level claim lists with exact sentence-to-claim mappings plus reviewed-source SHA-256 digests. Removed the four untested README statements from review 4. | Test: `every public reliance-copy source is mapped to the claims inventory`. Screenshot: [live root mobile](evidence/polish-4/live-root/screenshot-mobile.png). All 23 declared commands passed independently from the clean clone. |
| F-2-5 | Retained and validated the researched opportunity brief and its explicit non-goals. | Test: `the researched opportunity brief has the required review fields`. Screenshot: [live root desktop](evidence/polish-4/live-root/screenshot-desktop.png). Live product scope matches the brief. |
| F-2-6 | Kept the entire desktop first-screen contract above 658px in a 900px viewport. | Test: `desktop first screen keeps the action result and all three facts in view`. Screenshot: [live root desktop](evidence/polish-4/live-root/screenshot-desktop.png). Exact live bounds are in `live-check.json`. |
| F-2-7 | Centralized focus and announcements for all route destinations, including demo exit. | Tests: `SPA navigation restores route focus and browser history`, `leaving the demo moves keyboard focus to the install heading`. Screenshot: [live demo flow](evidence/polish-4/live-demo-flow-mobile.png). Live focus is `sample-title`. |
| F-2-8 | Kept “checkpoint” as the task term; “proof sheet” remains only the documented visual direction. | Test: `.factory/copy-audit.md` and the public-copy digest contract. Screenshot: [live root mobile](evidence/polish-4/live-root/screenshot-mobile.png). Live task copy uses “checkpoint.” |
| F-2-9 | Kept “Git” capitalization consistent in public prose and CLI help. | Test: public-copy digest contract and full test suite. Screenshot: [live root mobile](evidence/polish-4/live-root/screenshot-mobile.png). Live eyebrow says “A local Git checkpoint tool.” |
| F-2-10 | Kept the grammatical README control reference beginning with “Selecting.” | Test: `@claim:web-storage` and public-copy sentence mapping. Screenshot: [live demo mobile](evidence/polish-4/live-demo/screenshot-mobile.png). The live control label matches README. |
| F-4-1 | Replaced line-based status parsing with `git status --porcelain=v1 -z --untracked-files=all`; normalized rename records and hashed each untracked regular file safely. | Tests: Rust `parses_nul_delimited_paths_and_renames_without_git_quoting`; `@claim:runs-in-git-repository` records and verifies a rename plus directory, spaced, and Unicode paths. Screenshot: [live root mobile](evidence/polish-4/live-root/screenshot-mobile.png). Live claim copy remains visible. |
| F-4-2 | Added a public-key pin below `.git`, optional explicit trusted-key input, key-change rejection, trust-first verification, and a separate `--approve-rerun` boundary. Reruns happen only after trust, state, and environment pass. | Tests: `@claim:trusted-signature` self-signs a forged command and proves rejection without a marker; `@claim:verify-manifest` proves preview then approval. Screenshot: [live root desktop](evidence/polish-4/live-root/screenshot-desktop.png). Live How it works copy names the pinned signature. |
| F-4-3 | Idempotently appends exact `/signing.key` to an existing ignore file, preserves other rules, verifies with `git check-ignore`, and sets Unix mode `0600`. | Tests: `@claim:local-key-ignore`, `@claim:local-signing-key-path`. Screenshot: [live Privacy mobile](evidence/polish-4/live-privacy/screenshot-mobile.png). Live Privacy names the ignored restricted key. |
| F-4-4 | Removed `repository.root` from JSON and made every Markdown manifest reference repository-relative. Privacy now names every retained file category. | Test: `@claim:portable-paths` checks JSON and Markdown under a sentinel private path. Screenshot: [live Privacy desktop](evidence/polish-4/live-privacy/screenshot-desktop.png). Live Privacy states that absolute repository paths are not stored. |
| F-4-5 | Added one route-focus function with manual history scroll restoration. `/#install` always scrolls and focuses `#sample-title`; page routes focus their h1. | Test: `leaving the demo moves keyboard focus to the install heading` covers exit → Back → Forward, URL, visible target, focus, and announcement. Screenshot: [live demo flow](evidence/polish-4/live-demo-flow-mobile.png). Live Forward restored visible `sample-title`. |
| F-4-6 | The prerender step now writes distinct title, description, canonical, Open Graph, and Twitter metadata into each physical route HTML file. | Test: `physical deep-link HTML has route-specific metadata before JavaScript runs`. Screenshot: [live Privacy mobile](evidence/polish-4/live-privacy/screenshot-mobile.png). Raw live `/demo`, `/privacy`, and `/terms` responses have their own metadata in `live-check.json`. |
| F-4-7 | Replaced the unsafe signing fact with “Free and open source; no account required.” | Test: `@claim:free-no-account`. Screenshot: [live root mobile](evidence/polish-4/live-root/screenshot-mobile.png). Live first-screen bound is 658px on desktop and visible on mobile. |
| F-4-8 | Deleted “Clear boundary”; the section begins with its descriptive h2. | Test: `.factory/copy-audit.md` and public-copy digest contract. Screenshot: [live root desktop](evidence/polish-4/live-root/screenshot-desktop.png). The phrase is absent from production. |

## Final verification

- Clean clone: `/tmp/change-checkpoints-polish-4-clean.vsaZFI/repo` at
  `0bea839`; all 23 exact claim commands passed independently.
- Full clean-clone `npm test`: 4 Rust tests, 7 Node tests, and 29 Playwright
  tests passed. `npm run build` and `npm run pack:cli` passed.
- Production `verify-url.sh` passed on `/`, `/?demo=1`, `/demo`, `/privacy`,
  and `/terms`; reports and screenshots are under `evidence/polish-4/`.
- Fresh live Playwright/Axe checked root, Demo, Privacy, Terms, and a real 404:
  zero WCAG A/AA violations, no unexpected console errors, no overflow, and no
  undersized controls.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.8s, LCP 1.8s, TBT 0ms, CLS 0, transfer 213 KiB. See
  [lighthouse-live.json](evidence/polish-4/lighthouse-live.json).
- Runtime requests in the complete demo flow were same-origin only. There is
  no service worker and no offline claim.

No finding of any severity remains unresolved.
