# Independent verification 2 — PASS

**Candidate:** `4e1b98e297b2f676c39b5617c054b935aebce480`  
**Live URL:** https://change-checkpoint-manifest.sociobot.in  
**Verified:** 2026-08-28 UTC  
**Scope:** fresh, independent release QA against the researched brief and the
factory acceptance contract. No product code was changed.

## Verdict

**PASS.** The candidate delivers the brief's smallest useful product: a local
CLI that records Git state, selected check exit statuses, a rollback note, and
an Ed25519-signed JSON/Markdown manifest; it verifies state before showing a
rollback note and never executes that note. The static documentation/demo site
is live and byte-matches this candidate.

## Required first checks

`npm ci` completed from this clean candidate (20 packages; 0 audit
vulnerabilities). Every command declared in `.factory/claims.json` was then
run separately, exactly as declared, through the shipped demo harness. All
passed:

| Claim IDs | Result |
| --- | --- |
| `demo-sandbox`, `web-storage` | PASS |
| `checkpoint-record`, `signed-manifest`, `local-key-ignore` | PASS |
| `no-command-output`, `environment-hash` | PASS |
| `verify-manifest` | PASS |
| `restore-safe` | PASS |
| `optional-patch` | PASS |
| `no-third-party-runtime` | PASS |
| `git-required` | PASS |
| `mit-license` | PASS |

Cold first read of the live page passed. It says **“Record checks with each
change”**, names **teams reviewing fast edits** as the audience, explains that
the diff, checks, and rollback note stay together, and presents the one-click
**“Try it with sample data”** action with the result **“See a signed sample
checkpoint next.”**

## Local and CLI verification

- `npm test`: PASS — `cargo fmt --check`, Clippy with warnings denied, 3 Rust
  unit tests, 3 deployment-config tests, and 19 Playwright tests.
- `npm run build`: PASS — release `cpc` plus `dist/site` produced.
- `npm run pack:cli`: PASS — Cargo packaged 44 files, 222.6 KiB unpacked /
  66.9 KiB compressed, then verified the package.
- `npm audit --audit-level=high`: PASS — 0 vulnerabilities.
- A clean consumer install from
  `target/package/change-checkpoints-0.1.0` passed `cpc --help`, `cpc demo
  --json`, `cpc verify --rerun --json`, and `cpc restore --rerun --json`.
  On matching sample state, verification and restore returned `valid:true`.
  After appending a file change, `restore --json` returned exit 2 and
  `{"findings":["working-tree diff differs"],"valid":false}`; it did not
  expose or execute the rollback note. Outside Git, checkpoint exited 1 with
  an actionable error and created no checkpoint directory. Unsafe names also
  exit 1.

## Live site verification

- `verify-url.sh` passed: HTTPS 200, title, `lang=en`, one `<h1>`, `<main>`,
  complete image alt text, labelled buttons, and no console/page errors.
- Fresh Playwright checks at 1440 px and 390 px found no overflow; all visible
  links/buttons were at least 44 px high; the skip link, visible focus path,
  route focus/history, 200% text size, and reduced-motion handling worked.
  The primary action was keyboard-operable. `/demo` showed its persistent
  sample-data banner; its verification action produced the expected live
  result; Reset worked; Start for real cleared the only demo key.
- Live Axe WCAG 2 A/AA scans on `/`, `/demo`, `/privacy`, `/terms`, and the
  designed HTTP 404 at desktop and 390 px reported **zero serious or critical
  findings**. Normal public routes had no console/page errors. (The browser
  naturally logs the document 404 when deliberately loading an unknown URL.)
- Demo storage was exactly `demo:change-checkpoints:state` and was empty after
  Start for real. Landing/demo requests were same-origin only. Source review
  found no runtime fetch/API, analytics, third-party font/script, sign-in,
  service worker, or paid-unlock endpoint; rate-limit and sign-in checks are
  therefore not applicable.
- HTTPS headers include HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a self-only CSP.
  Hashed JS, CSS, and WebP receive `Cache-Control: public, max-age=31536000,
  immutable`. Public routes return 200; an unknown route returns the designed
  page with HTTP 404. Crawled internal links all returned 200.
- The locally rebuilt `index.html`, JS, CSS, and hero WebP SHA-256 values
  exactly matched the live files. This resolves the previous deployment-only
  concern.

## Performance and boundaries

- Production output: JS 9.18 kB (3.62 kB gzip), CSS 7.94 kB (2.47 kB gzip),
  demo SVG 0.89 kB, and hero WebP 209.50 kB. These meet the static JS/CSS and
  image budgets.
- A fresh Lighthouse 13.4.1 invocation could not complete because the
  container's supplied Chrome-for-Testing process crashed; this is a verifier
  environment limitation, not a product console/page failure. Static budget,
  live browser, and axe checks above completed independently.
- This product is intentionally not a PWA and makes no offline claim.

## Defects by severity

No release-blocking, high, medium, or low product defects were found in this
candidate.
