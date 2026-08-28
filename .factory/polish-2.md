# Polish 2 — zero-finding repair

**Base review:** `31abb8710c7a0b4c72038607fb5ddbea8a4d0339`  
**Repair:** `64d2ddbdac3a7349a3d4efa58cd8b082b5ef8b75`  
**Live URL:** https://change-checkpoint-manifest.sociobot.in

All findings from every `review-*` and `polish-*` record were re-read and are
resolved below. The relevant live checks were completed in fresh Chromium
contexts after deployment; local screenshots and reports are under
`.factory/evidence/polish-2/`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the direct 404’s shared metadata, header, footer, legal links, version, and real HTTP-404 override. | `the designed 404 page loads cleanly and returns home by keyboard`; live `https://change-checkpoint-manifest.sociobot.in/missing-review-two` → 404; live Axe/skeleton check passed. |
| F-1-2 | Retained and re-ran the repository-location and signing-key-path claims and fresh-repository tests. | `@claim:runs-in-git-repository`; `@claim:local-signing-key-path` from clean clone. |
| F-1-3 | Retained the first-screen benefit wording; the signing algorithm stays in technical documentation. | Root cold check and [live root screenshot](evidence/polish-2/live-root/screenshot-mobile.png). |
| F-1-4 | Renamed the remaining demo field from “Diff fingerprint” to “Changes hash”; also renamed the generated Markdown field. | `@claim:web-demo-verify`; [live demo screenshot](evidence/polish-2/live-demo/screenshot-mobile.png). |
| F-1-5 | Retained “Store change context without running a rollback.” | Root copy audit and [live root screenshot](evidence/polish-2/live-root/screenshot-desktop.png). |
| F-1-6 | Replaced stale Privacy wording with “Leaving the demo clears that key.” | Live Privacy cold check [report](evidence/polish-2/live-privacy/verify.json); `@claim:web-storage`. |
| F-2-1 | Replaced the simulated success with an async SHA-256 check of all displayed bundled-record fields. It reports a mismatch after any displayed-field tampering. | `@claim:web-demo-verify`; live browser check of success then changed `data-field=hash` failure. |
| F-2-2 | Added an executable clone → `cd` → `cargo install --path .` sequence and public GitHub source link to the landing and README. | `@claim:install-from-source` installs into an isolated Cargo root; live source URL → 200. |
| F-2-3 | Made the demo disclosure sticky, with Reset and exit controls remaining visible while scrolling. | `@claim:demo-sandbox` scroll/bounds assertion; [live demo mobile screenshot](evidence/polish-2/live-demo/screenshot-mobile.png). |
| F-2-4 | Added the browser-record, source-install, Markdown-summary, CLI-temp-isolation, and runtime claims. Added a reviewed public-copy-to-inventory manifest and contract test. Removed subjective “readable.” | `every public reliance-copy source is mapped to the claims inventory`; all 20 exact claim commands passed from `/tmp/change-checkpoint-polish-2-clean.cFOlAs/repo`. |
| F-2-5 | Restored `.factory/brief.json` with audience, job, scope, non-goals, and success signals; CI validates its required fields. The brief confirms no AI, sync, import, or paid workflow is implied. | `the researched opportunity brief has the required review fields`. |
| F-2-6 | Reduced the desktop hero’s vertical padding and top-aligned it so the action result and all facts remain in a 1440 × 900 first screen. | `desktop first screen keeps the action result and all three facts in view`; [live root screenshot](evidence/polish-2/live-root/screenshot-desktop.png). |
| F-2-7 | Demo exit now focuses the install heading and announces “Install steps loaded.” | `leaving the demo moves keyboard focus to the install heading`; live browser focus check. |
| F-2-8 | Replaced “proof” task copy with “checkpoint”; the proof-sheet treatment remains visual only. | `.factory/copy-audit.md`; [live root screenshot](evidence/polish-2/live-root/screenshot-desktop.png). |
| F-2-9 | Capitalized Git consistently in the landing, README, metadata, demo docs, and CLI help; recorded it in the terminology table. | `.factory/copy-audit.md`; `npm test`. |
| F-2-10 | Rewrote the README control reference as “Selecting **Leave demo and view install steps** clears that sample key.” | README review; `@claim:web-storage`. |

## Final live evidence

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned 200. The
  deliberate unknown route returned 404. Root, demo, Privacy, and Terms
  reports have zero console errors, one `<h1>`, a `<main>`, `lang=en`, and no
  missing image alt text: [root report](evidence/polish-2/live-root/verify.json),
  [demo report](evidence/polish-2/live-demo/verify.json).
- Fresh live Axe WCAG 2 A/AA checks of root, demo, Privacy, Terms, and 404 had
  zero violations. The live interaction check covered valid/tampered demo
  verification, sticky banner, exit focus, first-screen fact bounds, and
  same-origin-only requests.
- Lighthouse mobile run: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 2.0 s, CLS 0, TBT 20 ms. The report is
  [lighthouse-live.json](evidence/polish-2/lighthouse-live.json). Chrome
  reported a final screenshot-target crash after producing the audit results;
  independent Playwright/Axe and verify-url checks above completed cleanly.
