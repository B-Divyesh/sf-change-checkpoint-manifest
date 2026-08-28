# Review 2 — Change Checkpoints

**URL:** `https://change-checkpoint-manifest.sociobot.in`  
**Candidate:** `531ee6612663eeaeaf5bfeb33d99aea55b7c3980`  
**Reviewed:** 2026-08-28 UTC  
**Verdict: FAIL**

Seven blocking findings and five additional findings remain. The listed claim
tests pass, but the demo contains a simulated success action, the real install
path is incomplete, the demo banner is not persistent, two earlier copy fixes
are incomplete, visitor claims remain outside the claims inventory, and the
opportunity brief needed to assess scope is absent.

## Cold first read

Fresh Chromium contexts opened the live root at 390 × 844 and 1440 × 900 with
empty browser storage and no scrolling.

- **What does this do?** It is a local CLI that records a Git change, its check
  results, and a rollback note as a signed checkpoint.
- **For whom?** Teams reviewing fast developer or agent changes.
- **What should I click first?** **Try it with sample data** to inspect a signed
  sample checkpoint.

The answers come from the exact first-screen text “A local git checkpoint
tool,” “Record checks with each change,” “For teams reviewing fast edits who
need the diff, checks, and rollback note together,” “Try it with sample data,”
and “See a signed sample checkpoint next.” The required three questions are
answerable in both viewports, so no first-read clarity blocker applies. On
desktop, however, the three fact lines start at 891 px and are not readable in
the 900 px first viewport; see F-2-6.

## Findings

### F-2-1 — BLOCKING — The web demo reports a verification it never performs

**Location:** live `/?demo=1` and `/demo`; `site/src/main.js`, `#show-verify`.

**Exact text:** “Verify sample state” followed by “Sample signature and
recorded state match.”

The click handler only assigns that success sentence to `textContent`. It does
not inspect the displayed signature, Git state, or bundled manifest. A
first-time visitor is shown a successful verification result that was not
computed. The `@claim:verify-manifest` test exercises the Rust CLI, not this
browser action.

**Concrete fix:** either remove the interactive control and label the result
“Example output,” or verify a complete bundled manifest in the browser and
show a failure after tampering. Add a separate `web-demo-verify` claim and a
test that changes the sample before asserting that verification fails.

### F-2-2 — BLOCKING — “Install” does not provide a usable path to the CLI

**Location:** landing `#install`, reached from both **Install cpc →** and
**Leave demo and view install steps**.

**Exact text:** `cargo install --path .`

That command only works after the visitor already has a repository clone. The
live site gives no repository URL, clone command, release download, or package
registry command. The named “start for real” journey therefore ends at a
command a cold visitor cannot run.

**Concrete fix:** link to the public source repository and show the complete
clone-and-install sequence, or publish the crate and show its real install
command. Add a crawl assertion for the source/release link and an isolated
consumer-install test for the exact displayed commands.

### F-2-3 — BLOCKING — The demo disclosure disappears while using the demo

**Location:** live mobile `/demo`; `.demo-banner` in `site/src/style.css`.

**Exact text:** “Demo — sample data, nothing is saved.”

The banner is `position: static`. At `scrollY: 1000` in a 390 × 844 viewport,
its bounds were `top: -895`, `bottom: -733`, so it was not visible while the
visitor used the lower demo. The demo-sandbox contract requires a persistent
banner; losing the disclosure makes the demo boundary unclear.

**Concrete fix:** keep a compact banner visible with sticky positioning, or
repeat an equivalent persistent status/control region. Add a browser test that
scrolls through the demo and asserts the disclosure, Reset, and exit controls
remain available without obscuring content.

### F-2-4 — BLOCKING — Visitor-reliance claims are missing from `claims.json`

**Locations and exact text:** README: “This writes
`.change-checkpoints/auth-timeout.json` and a readable Markdown summary.”;
README: “The demo makes an isolated temporary Git repository, records a
changed Rust file with two checks, and prints its manifest path.”; README:
“Requires Rust and Node.”; live demo: “The CLI makes this sample inside a
temporary Git repository.”

No claim entry promises or directly tests the Markdown summary. No claim entry
promises the temporary isolation of the CLI demo, and the current demo test
only confirms that the manifest path begins with the reported demo directory.
The runtime prerequisite is also outside the inventory. “Readable” is a
subjective, untestable adjective. F-2-1 separately covers the untested browser
verification result.

**Concrete fix:** remove “readable,” add individual claim entries and one
tagged observable test for the Markdown file/content, the temp-directory
boundary, and supported runtime prerequisites, or remove those promises. Add
a contract test that compares public reliance copy with the inventory rather
than checking only whether listed IDs have tags.

### F-2-5 — BLOCKING — The source-of-truth opportunity brief is absent

**Location:** `.factory/brief.json` is missing.

**Exact contract text:** “the researched opportunity” and “the source of truth
for scope.”

Without the brief, this review cannot verify the real job-to-be-done or decide
whether an implied import, export, sync, or AI-assisted step is missing. That
leaves a required review dimension untested.

**Concrete fix:** restore the researched `.factory/brief.json`, validate its
schema in CI, and repeat the end-to-end and missed-leverage review against it.

### F-1-4 — BLOCKING, carried forward — “Diff fingerprint” remains unexplained

**Location:** live demo sample field.

**Exact text:** “Diff fingerprint.”

Review 1 required this jargon to be replaced with “a hash of the changes.” The
landing process copy was repaired, but the first product screen after the demo
click still uses the original term. This is a half-fixed earlier finding and
therefore retains its original ID.

**Concrete fix:** rename the demo field to “Changes hash,” matching the repaired
landing explanation, and add it to the plain-words regression assertion.

### F-1-6 — BLOCKING, carried forward — The old demo-exit label remains in Privacy

**Location:** live `/privacy`, Website storage.

**Exact text:** “The sample demo uses one separate local storage key, which
Start for real clears.”

Review 1 required **Start for real** to become **Leave demo and view install
steps**. The banner was repaired, but Privacy still instructs visitors using a
control that no longer exists. This is a half-fixed earlier finding and an
inconsistent product term.

**Concrete fix:** rewrite it as “The sample demo uses one separate local
storage key. Leaving the demo clears that key.” Add a test that the Privacy
copy and the live control do not diverge.

### F-2-6 — MAJOR — Desktop does not keep the three facts in the first screen

**Location:** live root at 1440 × 900 before scrolling.

The headline begins at 438 px, the action ends at 869 px, and the first fact
begins at 891 px; the remaining facts are below the viewport. The required
first-screen facts are therefore absent on a normal desktop viewport even
though they fit at 390 × 844.

**Concrete fix:** reduce the hero's vertical offset/image height or align the
copy to the top so the headline, audience, action, result caption, and all
three facts fit at 1440 × 900. Add a viewport-bound assertion for each item.

### F-2-7 — MAJOR — Leaving the demo loses route-change focus

**Location:** live demo action **Leave demo and view install steps**;
`site/src/main.js`, `#leave-demo` handler.

After activation, the URL correctly becomes `/#install` and the install
section reaches the top, but `document.activeElement` is `body`. Other SPA
route and back-button transitions focus their new `h1`; this custom exit path
does not. A keyboard or screen-reader user gets no focused destination.

**Concrete fix:** after rendering, focus the destination heading (or the new
page `h1` and then provide a direct install link) and announce the destination.
Add a keyboard test for focus after demo exit.

### F-2-8 — MINOR — “Proof” duplicates the product's checkpoint terminology

**Location:** landing figure caption and How it works heading.

**Exact text:** “One proof sheet for the change and its checks.” and “Keep the
proof with the edit.”

The rest of the product calls the saved record a “checkpoint” or “manifest.”
“Proof” is a visual metaphor and creates a third name for the same object; the
heading is unclear when heard by itself.

**Concrete fix:** use “One checkpoint for the change and its checks.” and
“Keep the checkpoint with the change.” Keep the proof-sheet idea in the visual
treatment rather than the task copy.

### F-2-9 — MINOR — Git is capitalized inconsistently

**Location:** landing eyebrow and first README sentence.

**Exact text:** “A local git checkpoint tool” and “Record a git change…” Other
copy uses “Git repository,” “Git state,” and “Git identifiers.”

**Concrete fix:** use the proper name “Git” everywhere and add it to the
terminology table.

### F-2-10 — MINOR — A README control reference reads as an ungrammatical command

**Location:** README, Try the bundled sample.

**Exact text:** “Leave demo and view install steps clears that sample key.”

The control label is used as an unmarked noun phrase, so “steps clears” reads
as a subject-verb error.

**Concrete fix:** write “Selecting **Leave demo and view install steps** clears
that sample key.”

## Copy audit

Counts treat a path, flag, version, or URL as one word. The tables include
visible labels and headings as well as sentences. Command blocks and manifest
key/value examples are code/data rather than sentences and are excluded. No
sentence exceeds 22 words, and no banned marketing word appears.

### Landing page

| Text | Words | Flag |
| --- | ---: | --- |
| Skip to content | 3 | — |
| Change Checkpoints | 2 | — |
| Demo | 1 | — |
| Install | 1 | — |
| Privacy | 1 | — |
| A local git checkpoint tool | 5 | F-2-9 |
| Record checks with each change | 5 | — |
| For teams reviewing fast edits who need the diff, checks, and rollback note together. | 14 | — |
| Try it with sample data | 5 | Pass: result-naming action |
| See a signed sample checkpoint next. | 6 | — |
| Runs in your Git repository | 5 | — |
| Stores exit status, not output | 5 | — |
| Signs each checkpoint so you can verify it later | 9 | — |
| One proof sheet for the change and its checks. | 9 | F-2-8 |
| The command | 2 | — |
| Make a checkpoint in one command | 6 | — |
| Choose the checks that matter. | 5 | — |
| Add a rollback note. | 4 | — |
| The command saves only exit statuses. | 6 | — |
| How it works | 3 | — |
| Keep the proof with the edit | 6 | F-2-8 |
| Name the checkpoint. | 3 | — |
| cpc records the current commit and a hash of the changes. | 11 | — |
| Run the checks. | 3 | — |
| cpc saves each command and its exit status, not its output. | 11 | — |
| Verify later. | 2 | — |
| cpc checks the signature, current Git state, saved environment checks, and the checks you selected. | 15 | — |
| Clear boundary | 2 | — |
| Store change context without running a rollback | 7 | — |
| A checkpoint is a file in your repository. | 8 | — |
| Restore checks the current state before showing its rollback note. | 10 | — |
| Do not put secrets in an optional patch file. | 9 | — |
| Signed context for a change. | 5 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |

### README

| Text | Words | Flag |
| --- | ---: | --- |
| Change Checkpoints | 2 | — |
| Record a git change, its checks, and a rollback note in one signed manifest. | 14 | F-2-9 |
| It is for teams reviewing rapid agent or developer edits. | 10 | — |
| The CLI records Git state and each selected command's exit status. | 11 | — |
| It does not save command output or raw environment values. | 10 | — |
| An optional patch is written only when you ask for it. | 11 | — |
| Live docs: https://change-checkpoint-manifest.sociobot.in | 3 | — |
| Install | 1 | — |
| From a clone, install the CLI locally. | 7 | F-2-2 |
| Record a checkpoint | 3 | — |
| Run this inside a Git repository. | 6 | — |
| This writes `.change-checkpoints/auth-timeout.json` and a readable Markdown summary. | 8 | F-2-4 |
| The JSON is signed with an Ed25519 key stored locally at `.change-checkpoints/signing.key`. | 12 | Technical detail; defined by context |
| The command adds a local `.change-checkpoints/.gitignore` entry for that key. | 10 | — |
| Add `--include-diff` when you need a patch next to the manifest. | 11 | — |
| Review that patch before sharing it. | 6 | — |
| A diff may contain secrets. | 5 | — |
| Verify the current checkout later. | 5 | — |
| `restore` checks the signature, current Git state, and environment before it shows the rollback note. | 15 | — |
| Add `--rerun` to check recorded command exits too. | 8 | — |
| It never executes the rollback note. | 6 | — |
| Try the bundled sample | 4 | — |
| The demo makes an isolated temporary Git repository, records a changed Rust file with two checks, and prints its manifest path. | 21 | F-2-4 |
| The web version opens at `/?demo=1` (or `/demo`) and stores only `demo:change-checkpoints:state` in the browser. | 15 | — |
| Leave demo and view install steps clears that sample key. | 10 | F-2-10 |
| Develop, test, and package | 4 | — |
| Requires Rust and Node. | 4 | F-2-4 |
| To preview the site, use `npm run dev`. | 8 | — |
| The site has `/demo`, `/privacy`, and `/terms` routes. | 8 | — |
| It contains no analytics or third-party runtime assets. | 8 | — |
| The regular site stores nothing in the browser. | 8 | — |
| The demo uses one separate key and clears it when you leave. | 12 | — |
| The factory deploys `dist/site` as a static site. | 8 | — |
| This repository does not manage DNS, billing, or other infrastructure. | 10 | — |
| License | 1 | — |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |

All visible action labels on the audited landing page use a named result. The
catalog description is 68 characters, starts with “Record,” and contains no
banned marketing word.

## Demo and sandbox evidence

- One click on **Try it with sample data** opened `/?demo=1`. The first mobile
  screen showed the demo disclosure and the top of a populated
  `agent-edit.json` record, including its signed status and Git commit. The
  checks and rollback note followed in the same record below the fold.
- Reset restored `demo:change-checkpoints:state` to `sample` and reported
  “Sample reset.” Leaving removed that key and reached `/#install`.
- A seeded `real:sentinel=untouched` key survived demo entry, Reset, and exit.
  All observed requests remained on the product origin.
- The banner is present initially but fails the persistence check in F-2-3.
- From an explicit temporary working directory,
  `cargo run --manifest-path <clean-clone>/Cargo.toml --quiet -- demo --json`
  created `/tmp/change-checkpoints-demo-6336/.change-checkpoints/agent-edit.json`
  and printed both the demo directory and manifest path.
- No offline claim is made, so an offline-reload test is not applicable.

## Claims results

A fresh clone at `/tmp/change-checkpoint-review-2-clean.8msJZQ/repo` received
`npm ci`. Every command in `.factory/claims.json` was then run separately and
exactly as declared. All returned exit 0.

| Claim ID | Command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS |
| `web-storage` | `npm test -- --grep @claim:web-storage` | PASS |
| `checkpoint-record` | `npm test -- --grep @claim:checkpoint-record` | PASS |
| `runs-in-git-repository` | `npm test -- --grep @claim:runs-in-git-repository` | PASS |
| `local-signing-key-path` | `npm test -- --grep @claim:local-signing-key-path` | PASS |
| `signed-manifest` | `npm test -- --grep @claim:signed-manifest` | PASS |
| `no-command-output` | `npm test -- --grep @claim:no-command-output` | PASS |
| `environment-hash` | `npm test -- --grep @claim:environment-hash` | PASS |
| `local-key-ignore` | `npm test -- --grep @claim:local-key-ignore` | PASS |
| `verify-manifest` | `npm test -- --grep @claim:verify-manifest` | PASS |
| `restore-safe` | `npm test -- --grep @claim:restore-safe` | PASS |
| `optional-patch` | `npm test -- --grep @claim:optional-patch` | PASS |
| `no-third-party-runtime` | `npm test -- --grep @claim:no-third-party-runtime` | PASS |
| `git-required` | `npm test -- --grep @claim:git-required` | PASS |
| `mit-license` | `npm test -- --grep @claim:mit-license` | PASS |

The passing listed tests do not clear the unlisted claims in F-2-4 or the
misleading browser result in F-2-1.

## Earlier-finding regression audit

Every earlier `.factory/review-*.md`, `.factory/polish-*.md`, and the full
handoff history were read. Source and live behavior were both checked.

| Earlier item | Result in this round |
| --- | --- |
| F-1-1, direct 404 skeleton/metadata | FIXED: live unknown path returns 404 with the expected title, canonical, OG/Twitter data, icons, header/footer, Install, and version. |
| F-1-2, missing repository/key-path claims | FIXED: both claim entries exist and both clean-clone commands pass. |
| F-1-3, Ed25519 in first-screen facts | FIXED: first screen now says the checkpoint can be verified later. |
| F-1-4, unexplained fingerprint/assertion terms | HALF-FIXED: landing copy changed, but “Diff fingerprint” remains on the demo; carried above. |
| F-1-5, ambiguous boundary heading | FIXED: “Store change context without running a rollback.” |
| F-1-6, unnamed demo exit | HALF-FIXED: the control was renamed, but Privacy still names “Start for real”; carried above. |
| Restore safety | FIXED: the tagged clean-clone test rejects changed state, hides the note, and does not run a tampered command. |
| Dead paid checkout / unimplemented Pro copy | FIXED: no paid offer or checkout link is present. |
| Rust formatting and lint | FIXED: both pass in `npm test`. |
| Demo overflow and touch targets | FIXED: zero horizontal overflow and no visible target below 44 px at 390 or 1440 px. |
| Immutable asset caching and strict CSP | FIXED: the live hashed JS returns one-year immutable caching and self-only CSP. |
| Unknown-route status | FIXED: `/does-not-exist` returns the designed page with HTTP 404. |

## Structure, accessibility, and route checks

- `/`, `/demo`, `/?demo=1`, `/privacy`, and `/terms` return 200; an unknown
  path returns the designed 404. All expected internal destinations and social
  image/icon assets resolve. The 404 document's own skip-link URL naturally
  retains the document's 404 status and is not a dead navigation target.
- Each tested page has one `h1`, one `main`, `lang=en`, route-specific title,
  description, canonical, OG/Twitter metadata, favicon, Apple icon, consistent
  header/footer, and ordered headings. The OG image is 1200 × 630.
- Normal route transitions, deep links, and browser Back restore the expected
  page and focus its `h1`. The demo-exit exception is F-2-7.
- Desktop and mobile checks found no overflow, undersized visible controls,
  unexpected normal-page console errors, or WCAG 2 A/AA Axe violations.
  `/opt/fleet/lib/verify-url.sh` passed with one `h1`, `lang=en`, a main
  landmark, complete image alt text, labelled buttons, and no console errors.
- The visual identity is recognizably product-specific: warm proof paper,
  halftone texture, square ink rules, stamped red/green accents, mono headings,
  original workbench art, and reduced-motion rules. It is not a generic SaaS
  card/gradient template.
- Local production `index.html` and the hashed JS byte-match the live files.
  The initial JS is 9.70 kB (3.74 kB gzip), below the static budget.

## Missed leverage

No decorative AI feature or embedded provider key exists, and the documented
local checkpoint workflow does not itself call for AI. JSON and Markdown are
already output formats, so no obvious import/export or sync feature is missing
from the public description. This conclusion is provisional: F-2-5 prevents
verification against the researched opportunity and must be resolved before a
zero-finding verdict.

## What would make this perfect

Replace the fake browser verification with either real verification or clearly
labelled example output; make the real install path runnable from a cold visit;
keep the demo disclosure visible; restore the brief; inventory and test every
remaining reliance claim; finish the two carried copy repairs; fit all first-
screen facts on desktop; restore focus after demo exit; and normalize the
remaining terminology and README grammar. Then rerun this entire review from a
fresh clone and fresh browser contexts. Until every item is cleared, the
required zero-finding standard is not met.
