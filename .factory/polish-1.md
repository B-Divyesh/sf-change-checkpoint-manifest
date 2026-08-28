# Polish 1 — zero-finding repair

**Base review:** `d16a49ea40fc516d6fff8a62ba9a5bfa211358e6`  
**Repair:** `9dc8b34a7e72adbc6c27cc8fbd7f0addb43640d5`  
**Live URL:** https://change-checkpoint-manifest.sociobot.in

Every finding in `.factory/review-1.md` is repaired below. There are no earlier
`.factory/review-*.md` or `.factory/polish-*.md` records to carry forward.
The controller supplied no additional finding.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Rebuilt the static direct-404 contract: `Change Checkpoints — Page not found`, canonical `/404`, OG/Twitter metadata, Apple touch icon, Install navigation link, and footer build version. Added direct-404 metadata/skeleton assertions. | `the designed 404 page loads cleanly and returns home by keyboard`; live `/does-not-exist` returned HTTP 404 and live `/404.html` metadata passed in [.factory/evidence/polish-1/live-check.json](evidence/polish-1/live-check.json). |
| F-1-2 | Added `runs-in-git-repository` and `local-signing-key-path` to `claims.json`. Each has one tagged observable browser/CLI test using a caller-created fresh Git repository. | `@claim:runs-in-git-repository`; `@claim:local-signing-key-path`; both ran from fresh clone `/tmp/change-checkpoints-final-clean-XV0IPw`. |
| F-1-3 | Replaced the first-screen algorithm jargon with “Signs each checkpoint so you can verify it later.” The technical README retains Ed25519 where it is useful. | `keyboard paths expose the demo action and visible result`; live root screenshot [.factory/evidence/polish-1/root/screenshot-mobile.png](evidence/polish-1/root/screenshot-mobile.png). |
| F-1-4 | Rewrote “diff fingerprint” as “a hash of the changes” and “environment assertions” as “saved environment checks.” Updated the claim wording too. | `@claim:verify-manifest`; plain-words audit [.factory/copy-audit.md](copy-audit.md); live root check in [.factory/evidence/polish-1/live-check.json](evidence/polish-1/live-check.json). |
| F-1-5 | Replaced the ambiguous boundary heading with “Store change context without running a rollback.” | [.factory/copy-audit.md](copy-audit.md); live root screenshot [.factory/evidence/polish-1/root/screenshot-desktop.png](evidence/polish-1/root/screenshot-desktop.png). |
| F-1-6 | Renamed the demo exit action to “Leave demo and view install steps”; it clears only demo storage and routes to `/#install`. | `@claim:demo-sandbox`; `@claim:web-storage`; live `?demo=1` check records reset, isolated key, clear-on-exit, and destination in [.factory/evidence/polish-1/live-check.json](evidence/polish-1/live-check.json). |
| Work-order demo path | The landing’s one-click action and Demo navigation now open `/?demo=1`; `/demo` remains a real deep link. The persistent banner has Reset and the named exit action. | `the query-string demo uses isolated storage and clears it on exit`; live mobile screenshot [.factory/evidence/polish-1/demo-query-mobile.png](evidence/polish-1/demo-query-mobile.png). |

## Final production check

- `verify-url.sh` passed cold for `/` and `/?demo=1`; screenshots and reports
  are under `.factory/evidence/polish-1/root/` and
  `.factory/evidence/polish-1/demo/`.
- Live Playwright/Axe checked `/`, `/demo`, `/privacy`, `/terms`, `/404.html`,
  and an unknown path. Every named page has one h1 and main landmark, no
  WCAG 2 A/AA violations, no undersized visible control, and no unexpected
  console errors. The browser’s expected network message for the intentionally
  HTTP-404 unknown address is recorded separately in `live-check.json`.
- The production demo used only `demo:change-checkpoints:state`, reset to the
  sample value, then cleared that key on exit. Runtime requests were same-origin
  only; no service worker is registered.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.8 s, CLS 0, transfer 212 KiB. Full report:
  [.factory/evidence/polish-1/lighthouse-mobile.json](evidence/polish-1/lighthouse-mobile.json).
