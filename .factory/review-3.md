# Review 3 — Change Checkpoints

**URL:** `https://change-checkpoint-manifest.sociobot.in`  
**Candidate:** `e24239da8938707d9566a6af5bd4561280800e4c`  
**Reviewed:** 2026-08-28 UTC  
**Verdict: PASS**

No blocking, major, minor, or untested-claim finding remains. This is a fresh
first-read review, not a diff-only review.

## Cold first read

Fresh Chromium contexts with empty storage opened the live root without
scrolling at 390 × 844 and 1440 × 900.

- **What it does:** It records the checks, Git state, and rollback note for a
  change in a signed checkpoint.
- **Who it is for:** Teams reviewing fast edits.
- **What to click first:** **Try it with sample data** to see a sample
  checkpoint.

The exact first-screen copy was “Record checks with each change,” “For teams
reviewing fast edits who need the diff, checks, and rollback note together.”,
“Try it with sample data”, and “See a sample checkpoint next.” All three facts
remain visible before the fold in both contexts. No first-read blocker applies.

## Copy audit

Counts treat URLs, paths, flags, and product names as one word. Command blocks
and manifest key/value data are excluded because they are executable input or
sample data, not visitor copy. The remaining labels are included so headings
and actions are checked too. Every item is at or below 22 words. No banned
marketing word, unexplained first-screen jargon, inconsistent product term,
unclear heading, or non-result-naming action was found.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| Change Checkpoints | 2 | Pass |
| Demo | 1 | Pass |
| Install | 1 | Pass |
| Privacy | 1 | Pass |
| A local Git checkpoint tool | 5 | Pass |
| Record checks with each change | 5 | Pass |
| For teams reviewing fast edits who need the diff, checks, and rollback note together. | 14 | Pass |
| Try it with sample data | 5 | Pass: result-naming action |
| See a sample checkpoint next. | 5 | Pass |
| Runs in your Git repository | 5 | Pass |
| Stores exit status, not output | 5 | Pass |
| Signs each checkpoint so you can verify it later | 9 | Pass |
| One checkpoint for the change and its checks. | 9 | Pass |
| Install from source | 3 | Pass |
| Clone and install cpc | 4 | Pass |
| Clone the public source, then install the command with Cargo. | 10 | Pass |
| View source on GitHub | 4 | Pass: result-naming link |
| How it works | 3 | Pass |
| Keep the checkpoint with the change | 6 | Pass |
| Name the checkpoint. | 3 | Pass |
| cpc records the current commit and a hash of the changes. | 11 | Pass |
| Run the checks. | 3 | Pass |
| cpc saves each command and its exit status, not its output. | 11 | Pass |
| Verify later. | 2 | Pass |
| cpc checks the signature, current Git state, saved environment checks, and the checks you selected. | 15 | Pass |
| Clear boundary | 2 | Pass |
| Store change context without running a rollback | 7 | Pass |
| A checkpoint is a file in your repository. | 8 | Pass |
| Restore checks the current state before showing its rollback note. | 10 | Pass |
| Do not put secrets in an optional patch file. | 9 | Pass |
| Signed context for a change. | 5 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Change Checkpoints | 2 | Pass |
| Record a Git change, its checks, and a rollback note in one signed checkpoint. | 14 | Pass |
| It is for teams reviewing rapid agent or developer edits. | 10 | Pass |
| The CLI records Git state and each selected command's exit status. | 11 | Pass |
| It does not save command output or raw environment values. | 10 | Pass |
| An optional patch is written only when you ask for it. | 11 | Pass |
| Live docs | 2 | Pass |
| Install | 1 | Pass |
| Clone the public source, then install the CLI locally: | 9 | Pass |
| Record a checkpoint | 3 | Pass |
| Run this inside a Git repository. | 6 | Pass |
| This writes `.change-checkpoints/auth-timeout.json` and a Markdown summary beside it. | 9 | Pass |
| The JSON is signed with an Ed25519 key stored locally at `.change-checkpoints/signing.key`. | 12 | Pass: technical detail for CLI users |
| The command adds a local `.change-checkpoints/.gitignore` entry for that key. | 10 | Pass |
| Add `--include-diff` when you need a patch next to the manifest. | 10 | Pass |
| Review that patch before sharing it. | 6 | Pass |
| A diff may contain secrets. | 5 | Pass |
| Verify the current checkout later: | 5 | Pass |
| `restore` checks the signature, current Git state, and environment before it shows the rollback note. | 14 | Pass |
| Add `--rerun` to check recorded command exits too. | 8 | Pass |
| It never executes the rollback note. | 6 | Pass |
| Try the bundled sample | 4 | Pass |
| The demo makes an isolated temporary Git repository, records a changed Rust file with two checks, and prints its manifest path. | 21 | Pass |
| The web version opens at `/?demo=1` (or `/demo`) and stores only `demo:change-checkpoints:state` in the browser. | 15 | Pass |
| Selecting **Leave demo and view install steps** clears that sample key. | 11 | Pass |
| Develop, test, and package | 4 | Pass |
| Building and testing require Rust and Node. | 7 | Pass |
| To preview the site, use `npm run dev`. | 8 | Pass |
| The site has `/demo`, `/privacy`, and `/terms` routes. | 8 | Pass |
| It contains no analytics or third-party runtime assets. | 8 | Pass |
| The regular site stores nothing in the browser. | 8 | Pass |
| The demo uses one separate key and clears it when you leave. | 11 | Pass |
| The factory deploys `dist/site` as a static site. | 8 | Pass |
| This repository does not manage DNS, billing, or other infrastructure. | 10 | Pass |
| License | 1 | Pass |
| MIT. See LICENSE. | 3 | Pass |

Every claim-like landing, demo, Privacy, Terms, and README statement was
cross-checked with `.factory/claims.json` and `.factory/public-claims.json`.
The 20 claims cover the retained statements; no unlisted claim was found.

## Demo and sandbox

One click on **Try it with sample data** opened `/?demo=1`. At 390 px, the
first screen already showed the persistent “Demo — sample data, nothing is
saved” boundary and populated `agent-edit.json` sample record. The record has
realistic Git/check/rollback fields, not placeholder text.

- **Check sample record** produced “The displayed sample matches the bundled
  record.” Changing the displayed changes hash then produced the documented
  mismatch result.
- **Reset demo** restored the sample key and reported “Sample reset.”
- **Leave demo and view install steps** removed only
  `demo:change-checkpoints:state`, navigated to `/#install`, focused “Clone
  and install cpc”, and announced the destination.
- A pre-seeded `real:sentinel=untouched` value survived demo entry, reset, and
  exit. The observed browser request log contained only
  `https://change-checkpoint-manifest.sociobot.in`.
- `cargo run --quiet -- demo --json` from a temporary directory created the
  bundled sample below `/tmp/change-checkpoints-demo-9019`, a Git repository.

The product makes no offline claim, so an offline-reload assertion is not
applicable.

## Claims and build evidence

A fresh `--no-local` clone at
`/tmp/change-checkpoint-review-3.lhLcur/repo` used the documented `npm
install` setup (this checkout has no lockfile). Every test command in
`.factory/claims.json` was executed independently. All 20 command invocations
passed; the complete tagged run passed 14 tests carrying those 20 unique claim
IDs. `npm test -- --grep @claim` passed, as did the full `npm test` and
`npm run build`.

| Claim IDs | Result |
| --- | --- |
| `demo-sandbox`, `web-storage` | Pass |
| `checkpoint-record`, `runs-in-git-repository`, `local-signing-key-path` | Pass |
| `signed-manifest`, `local-key-ignore`, `markdown-summary`, `cli-demo-isolated` | Pass |
| `no-command-output`, `environment-hash`, `optional-patch` | Pass |
| `verify-manifest`, `restore-safe`, `web-demo-verify` | Pass |
| `no-third-party-runtime`, `git-required`, `mit-license` | Pass |
| `install-from-source`, `runtime-requirements` | Pass |

## Earlier findings and product scope

All previous `review-*`, `polish-*`, verification, and handoff records were
read. Live behavior and current source confirm that F-1-1 through F-1-6 and
F-2-1 through F-2-10 are fixed: the direct 404 shares the skeleton and HTTP
404 status; terminology and the Privacy exit text are consistent; the browser
record check detects tampering; source installation is complete; the banner is
sticky; all claims are inventoried; the brief is present; first-screen facts
fit; and demo exit preserves focus.

The researched brief explicitly excludes AI-assisted review and cloud sync.
The CLI already emits JSON and Markdown output. No expected AI feature,
import/export capability, or sync feature is missing, and no provider key or
decorative AI feature exists.

## Structure and accessibility

Live `/`, `/demo`, `/?demo=1`, `/privacy`, and `/terms` returned 200; an
unknown path returned the designed page with HTTP 404. Every tested page had a
route-specific title, description, canonical URL, Open Graph/Twitter data,
favicon, Apple touch icon, one `h1`, and one `main`. The titles follow the
required product/action pattern. Internal destinations and the public GitHub
source link resolved successfully; the 404 page's self skip-link appropriately
retains its document's 404 status.

Fresh live Axe WCAG 2 A/AA scans returned zero violations on root, demo,
Privacy, Terms, and 404. There were no normal-page console errors, no mobile or
desktop overflow, and reduced-motion, keyboard navigation, back navigation,
and route focus behaved as specified. The warm paper, halftone, stamped-rule,
and monospace proof-sheet system is distinct from a generic SaaS template and
matches `.factory/design.md`.

## What would make this perfect

Keep this exact standard on future changes: retain the one-click isolated demo,
the per-claim clean-clone tests, the plain copy audit, and the shared route
skeleton. No additional product change is identified in this review.
