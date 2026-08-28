# Independent verification — FAIL

**Candidate:** `b57dc55eb8df98ccf155b2a7b4c2373ca1df1a6f`  
**Live URL:** https://change-checkpoint-manifest.sociobot.in  
**Verified:** 2026-08-28 (UTC)  
**Scope:** independent release QA against the researched brief and factory acceptance contract. Product source was not changed.

## Verdict

**FAIL.** The product has a working core checkpoint flow, but release-blocking
trust, commercial-flow, claims-contract, and formatting defects remain.

## Required first checks

Installed the clean checkout with `npm ci`, then ran every command declared in
`.factory/claims.json` exactly as written:

| Claim | Command | Result |
| --- | --- | --- |
| Demo — sample data, nothing is saved | `npm test -- --grep @claim:demo-sandbox` | PASS |
| Ed25519 signs each manifest | `npm test -- --grep @claim:signed-manifest` | PASS |
| Stores no command output | `npm test -- --grep @claim:no-command-output` | PASS |
| Verification checks manifest/state/environment/checks | `npm test -- --grep @claim:verify-manifest` | PASS |

Each command also completed the Rust tests and deployment-config tests. The
claim tests exercised `/demo` and the bundled CLI demo; all four selected
Playwright tests passed.

Cold first read of the live first screen passed: it says it records checks with
each change, names teams reviewing fast edits as the audience, and presents
**Try it with sample data** with the plain result “See a signed sample
checkpoint next.” One keyboard activation opened `/demo` and showed the
persistent “Demo — sample data, nothing is saved” banner, Reset demo, Start for
real, and the sample manifest.

## What passed

- `npm test`: PASS — 3 Rust unit tests, 2 deployment-config tests, 8 Playwright
  tests.
- `npm run build`: PASS — release `cpc` plus `dist/site`.
- `npm run pack:cli`: PASS — `cargo package` verified the 55.6 KB compressed
  package.
- `cargo clippy --all-targets -- -D warnings`: PASS.
- Consumer-package check: installed the packaged crate into an isolated
  `cargo install --path target/package/change-checkpoints-0.1.0 --root ...`
  root. `cpc --help`, `cpc demo --json`, `cpc verify --rerun --json`, and
  `cpc restore --json` passed. Invalid checkpoint names and blank rollback
  notes exit 1 with actionable messages; a changed checkout makes `verify`
  exit 2 and report state differences.
- Live build identity: local production `index.html`, JS, CSS, WebP, SVG,
  `404.html`, `robots.txt`, and `sitemap.xml` SHA-256 values exactly matched
  the deployed files. The custom hostname is live (HTTP 200); the earlier
  deployment-only hostname concern is not present now.
- Live desktop and 390 px mobile checks: no console/page errors; correct
  titles, `lang=en`, one `<main>`, and one `<h1>` on `/`, `/demo`, `/privacy`,
  `/terms`, SPA unknown route, and `/404.html`; all live Axe WCAG 2 A/AA
  serious/critical counts were zero. The keyboard demo flow passed and the
  primary action had a visible 3 px focus ring. Reduced-motion mode had no
  running animations. The demo used only its `demo:change-checkpoints:state`
  key and same-origin assets.
- Privacy/outbound requests: normal landing/demo loads used only the product
  origin. The optional license check is explicit and contacts only
  `https://api.sociobot.in`; an invalid token returned the quiet “License no
  longer active.” status. No third-party fonts or runtime scripts were found.
- Response policy: live HTTPS supplies HSTS, `nosniff`, strict-origin referrer
  policy, and a restrictive CSP. The verification endpoint rate-limits: a
  40-request concurrent read-only burst returned 30 HTTP 200 and 10 HTTP 429
  with `Retry-After: 4`; an immediately-following window returned 429 with
  `Retry-After: 3` on its third request. No product sign-in is present.
- Size budget: built initial JS is 11,067 bytes / 4.29 KB gzip; CSS is 7,310
  bytes / 2.38 KB gzip; the 209,496-byte WebP hero is below the 300 KB image
  budget.

## Release-blocking defects

### P1 — `cpc restore` reports “verified” despite an incompatible workspace

The brief requires a signed manifest with a verified restore command, and the
README says restore “verifies the manifest.” In an isolated consumer demo,
after adding one untracked file, `cpc verify <manifest> --json` exited 2 with:

```json
{"findings":["workspace status differs","untracked artifact fingerprints differ"],"rerun":false,"valid":false}
```

The same changed checkout then ran `cpc restore <manifest> --json` with exit 0
and emitted:

```json
{"head":"1f9bfb3ffb5bc8cced2ea9eda35bf385a0b32d91","rollback":"git restore src/lib.rs","verified":true}
```

`restore` checks only the signature, not recorded Git state, environment
assertions, or selected checks. It must either perform the documented
verification before presenting a “verified” rollback note, or label the
operation precisely as signature-only.

### P1 — Paid checkout is a dead live link

The landing page advertises “Buy Pro for $19.” Fresh `HEAD`/redirect check of
`https://api.sociobot.in/api/v1/products/change-checkpoint-manifest/checkout`
returned **HTTP 404**. This violates the live link and paid-unlock acceptance
contract. Product registration/return configuration must be completed before
the page advertises purchase.

### P1 — Required claims inventory is incomplete

`.factory/claims.json` exists and its four declared tests pass, but it omits
visible reliance claims. Examples include “Runs locally,” the CLI/state
verification description, “Free records and verifies checkpoints,” and “Pro
costs $19 once and adds team manifest templates.” The last feature also has no
implementation in this candidate. The claims contract requires every visitor
reliance claim to have a tagged observable demo test or to be removed. This is
a release-blocking finding even though the listed claims pass.

### P1 — Available formatting quality gate fails

`cargo fmt --check` exits non-zero and reports formatting diffs throughout
`src/main.rs`. The Rust code must be formatted and the gate included in the
normal test workflow.

## Other defects

### P2 — Desktop `/demo` has horizontal overflow

At a 1440 px viewport, `/demo` has `scrollWidth: 1594` (154 px excess). The
offending element is the `.terminal-recording` image at `left: 874`,
`right: 1594`, `width: 720`. The 390 px layout does not overflow, but desktop
must not expose horizontal scrolling.

### P2 — Multiple mobile touch targets are below 44 px

At 390 px, header links measure 22 px high, the demo reset button 32 px high,
and inline navigation/footer links measure 15–22 px high. The acceptance
baseline requires 44 × 44 CSS px targets.

### P2 — Hashed static assets are not immutably cached

Live JS, CSS, and image responses all have
`Cache-Control: public, must-revalidate, max-age=30`. The deployment contract
requires long-lived immutable caching for hashed assets. Configure the live
host accordingly.

### P3 — Unknown routes return a visual SPA 404 with HTTP 200

`/not-a-real-route` renders the designed SPA missing-page screen but returns
HTTP 200 due navigation fallback. The static `/404.html` exists and returns
200 as an asset. Configure an actual HTTP 404 response for unknown addresses
if platform routing allows it.

## Notes

The worker-specific `verify-url.sh` was not present in this clean checkout;
the equivalent live checks (title, language, landmark, image/console, routes,
and Axe) were run directly. Lighthouse was not a candidate dependency, so no
new Lighthouse score was generated; the independent static size, live route,
console, accessibility, and response-policy checks above were completed.

## Required remediation before re-verification

1. Make `restore` verify the recorded checkout/environment/check state before
   calling a rollback note verified, and add a regression test for the changed
   workspace case.
2. Register/enable the Sociobot checkout or remove the paid offer and any
   unimplemented template claim.
3. Complete `.factory/claims.json` and tagged demo tests for every retained
   visitor claim.
4. Format Rust, fix desktop demo overflow and 44 px targets, and set immutable
   caching for hashed assets.
