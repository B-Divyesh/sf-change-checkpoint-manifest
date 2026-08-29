# Independent verification 4 — PASS

**Candidate:** `0314b62a858afd189a68c4746f7cd0e215b8165c`  
**Live URL:** https://change-checkpoint-manifest.sociobot.in  
**Verified:** 2026-08-29 UTC  
**Scope:** fresh independent QA against the researched brief, original work
order, and factory acceptance contract. Product code was not modified.

## Verdict

**PASS.** Change Checkpoints delivers the brief's smallest useful product: a
local CLI for keeping Git state, selected validation exit statuses, and a
rollback note together in a signed JSON/Markdown checkpoint. The demo is
one-click and isolated, the package installs into a clean consumer, and the
live static deployment matches the candidate exactly.

## Required first checks

`.factory/claims.json` exists and declares 30 visitor-reliance claims. From
the clean candidate, `npm ci` installed the lockfile dependencies (20 packages,
0 vulnerabilities), then the full `npm test` command completed successfully:

- Rust format check, Clippy with warnings denied, and 4 Rust unit tests: PASS.
- Site build and 7 static deployment/claims-contract tests: PASS.
- 34 Playwright tests: PASS, including every declared `@claim:<id>` selector.

The contract test verifies every listed claim has exactly one executable tag.
The passed tags cover: `demo-sandbox`, `web-storage`, `checkpoint-record`,
`runs-in-git-repository`, `local-signing-key-path`, `signed-manifest`,
`no-command-output`, `environment-hash`, `local-key-ignore`,
`verify-manifest`, `trusted-signature`, `restore-safe`, `optional-patch`,
`no-third-party-runtime`, `git-required`, `mit-license`, `web-demo-verify`,
`install-from-source`, `markdown-summary`, `cli-demo-isolated`,
`runtime-requirements`, `portable-paths`, `free-no-account`, `live-build-id`,
`safe-checkpoint-outputs`, `safe-checkpoint-inputs`,
`validated-environment`, `json-errors`, and `post-check-state`.

Cold first read of the live home page passed. It says **“Record checks with
each change”**, says it is **“For teams reviewing fast edits”**, and explains
that the diff, checks, and rollback note stay together. The first screen has
the one-click **“Try it with sample data”** action and says **“See a sample
checkpoint next.”**

## Product and package QA

- `npm run build`: PASS — release binary and `dist/site` produced.
- `npm run pack:cli`: PASS — Cargo package verification passed; 44 files,
  248.9 KiB unpacked / 72.4 KiB compressed.
- Clean consumer: `cargo install --path . --root <temporary root>` built the
  public `cpc` binary. `cpc --help` names checkpoint, verify, restore and demo.
  `cpc demo` created a Git repository under `/tmp`, created the sample
  manifest, and `cpc verify .change-checkpoints/agent-edit.json --rerun` from
  that repository reported matching trust/state and previewed both commands
  without execution. Its signing key mode was `0600`.
- Invalid recovery: `cpc checkpoint outside-git --check true --rollback ...`
  outside a Git repository exited 1 with an actionable Git error and created
  no `.change-checkpoints` directory. Missing mandatory arguments exit 2 with
  Clap help. The shipped claim tests further cover aliases, hard links,
  tampering, unsafe names, environment mismatches, JSON errors, patch
  inclusion, and post-check state.

## Live, privacy, accessibility, and deployment QA

- `https://change-checkpoint-manifest.sociobot.in/`, `/?demo=1`, `/demo`,
  `/privacy`, and `/terms` all returned 200. Each has a route title,
  `lang="en"`, one h1, and one main landmark. The designed unknown-route page
  returned 404. Valid public routes had no console or page errors.
- Chromium checks ran at 1440px and at 390px with touch/mobile and
  `prefers-reduced-motion: reduce`. Mobile `scrollWidth` equalled 390px;
  keyboard Tab reached the skip link, navigation, Reset demo, Leave demo,
  sample verification, and legal links. The focused demo exit link matched
  `:focus-visible` with a 3px cream outline. Enter cleared the one demo key,
  navigated to `/#install`, and focused the install heading.
- Direct axe-core 4.11 WCAG 2 A/AA scans under Playwright reported **zero
  serious or critical** violations on every public route and 404. Meaningful
  images have specific alternatives; no image is missing alt text.
- Fresh landing and demo request logs contained only the product origin. The
  normal site stored no browser keys; demo stored exactly
  `demo:change-checkpoints:state`. Reset reseeded it, Leave removed it, and
  editing a displayed sample field changed **“The displayed sample matches”**
  to **“does not match”**.
- Response headers: HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and CSP
  `default-src 'self' ... connect-src 'self' ... frame-ancestors 'none'` are
  live. Hash-named JS/CSS/WebP return `Cache-Control: public,
  max-age=31536000, immutable`; HTML uses a 30-second revalidation policy.
- Live/local SHA-256 values match for root HTML, `index-B8m_KAvS.js`,
  `style-B7qw40J4.css`, and `checkpoint-press-B0lmgM-Z.webp`. The live footer
  says `Build 0314b62a858a`, matching this candidate.

## Size and applicability checks

The production build reports 11.42 kB JS (4.34 kB gzip), 8.87 kB CSS (2.65 kB
gzip), and a 209.50 kB hero WebP. These meet the static bundle and image
budgets. This is not a PWA and makes no offline claim. It contains no backend,
product unlock call, sign-in, payment, or runtime AI request, so rate-limit,
concurrency, persistence, Entra tenant, paid-unlock, and service-worker update
checks are not applicable.

## Defects by severity

None. The browser reports an expected failed resource when deliberately
loading the HTTP 404 document; it is not present on valid routes.

