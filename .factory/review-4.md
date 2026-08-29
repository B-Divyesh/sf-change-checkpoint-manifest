# Review 4 — Change Checkpoints

**URL:** `https://change-checkpoint-manifest.sociobot.in`

**Candidate:** `d8a1524869f5883bb4497fd60ac93ae530a59495`

**Reviewed:** 2026-08-29 UTC

**Verdict: FAIL**

Six blocking findings, one major finding, and two minor findings remain. The
declared claim commands pass, but additional adversarial cases disprove two
listed claims and expose an untrusted-command execution path. The required
zero-finding bar is not met.

## Cold first read

Fresh Chromium contexts with empty storage opened the live root without
scrolling at 390 × 844 and 1440 × 900.

- **What it does:** It records a Git change and its check results in a signed
  checkpoint with a rollback note.
- **Who it is for:** Teams reviewing fast edits.
- **What to click first:** **Try it with sample data** to see a sample
  checkpoint.

Those answers come from “Record checks with each change,” “For teams reviewing
fast edits who need the diff, checks, and rollback note together,” “Try it with
sample data,” and “See a sample checkpoint next.” All three existing fact lines
were visible before scrolling in both viewports. The required three questions
are answerable, so no first-read clarity blocker applies. The missing price or
account fact is recorded separately as F-4-7.

## Findings

### F-4-1 — BLOCKING — Common untracked paths prevent the core command from creating a checkpoint

**Location and quote:** landing, “Runs in your Git repository”; README, “Run
this inside a Git repository.”; `src/main.rs`, `untracked_artifacts`.

In a fresh Git repository containing `?? new-dir/`, `cpc checkpoint` exited 1
with `cpc: Is a directory (os error 21)`. In a second fresh repository
containing `?? "file with space.txt"`, it exited 1 with `cpc: No such file or
directory (os error 2)`. No checkpoint was created. The parser treats
human-formatted porcelain lines as literal file paths, including directory
suffixes and Git's quoting.

An untracked directory or filename with a space is ordinary working-tree state.
The main job therefore fails outside the narrow fixture used by
`@claim:runs-in-git-repository`.

**Concrete fix:** read NUL-delimited status with `git status --porcelain=v1 -z
--untracked-files=all`, parse renamed and untracked entries without Git quoting,
and hash regular files safely. Add claim tests containing an untracked
directory, spaces, non-ASCII characters, and renames; assert that recording and
later verification both succeed.

### F-4-2 — BLOCKING — A forged self-signed manifest is accepted and its command is executed

**Location and quote:** landing, “Signs each checkpoint so you can verify it
later”; README, `cpc verify .change-checkpoints/auth-timeout.json --rerun`;
`src/main.rs`, `signature_valid` and `verification_findings`.

The verifier trusts the public key embedded inside the same manifest it is
checking. An adversarial check replaced the sample command with `touch
/tmp/review4-forged-command`, generated a different Ed25519 key pair, replaced
the embedded public key, and signed the changed document. Running
`cpc verify .change-checkpoints/forged.json --rerun --json` returned exit 0 and
`{"findings":[],"rerun":true,"valid":true}`. The marker file was created.

The signature proves only that the document matches whichever key the document
supplies. It does not establish that the repository owner signed it. Combining
that with `--rerun` lets an untrusted manifest execute an arbitrary shell
command while reporting the record as valid. The generated private key also had
mode `0644` in the verification environment.

**Concrete fix:** define and enforce a trust anchor outside the manifest. For
example, require a pinned repository public key or an explicit trusted-key file,
reject key changes, create private keys with mode `0600`, and never rerun
commands from an untrusted manifest. Show the exact commands and require an
explicit approval boundary. Add a claim test that re-signs a changed manifest
with another key and confirms rejection without executing a marker command.

### F-4-3 — BLOCKING — The “ignored by Git automatically” claim is false when an ignore file already exists

**Location and quote:** README, “The command adds a local
`.change-checkpoints/.gitignore` entry for that key.”; claim
`local-key-ignore`, “The local signing key is ignored by Git automatically.”;
`src/main.rs`, `load_or_make_key`.

In a fresh repository with an existing `.change-checkpoints/.gitignore`
containing `*.tmp`, checkpoint creation succeeded but left that file unchanged.
`git status --short --untracked-files=all` then listed
`?? .change-checkpoints/signing.key`, and `git check-ignore` exited 1. The
implementation writes `signing.key` only when the whole ignore file is absent.
The declared claim test passes because its fixture has no pre-existing ignore
file; the public claim is nevertheless false in a supported repository.

This can expose the private signing key in the same Git workflow the tool is
meant to support.

**Concrete fix:** idempotently add an exact `/signing.key` rule to an existing
file without replacing its contents. Before completing a checkpoint, verify
with `git check-ignore` that the key is ignored and fail with an actionable
message if it is not. Extend `@claim:local-key-ignore` with a pre-existing,
unrelated ignore rule.

### F-4-4 — BLOCKING — Checkpoints disclose absolute local paths that the privacy page does not name

**Location and quote:** Privacy → What it stores, “Manifests store commands,
exit statuses, Git identifiers, changes hashes, environment-value hashes, and
your rollback note.”

The real CLI demo wrote `repository.root` as
`/tmp/change-checkpoints-demo-9567` in the JSON manifest and wrote the absolute
JSON manifest path into the Markdown summary. In a normal checkout these values
can expose a username, organization, and private directory names. Neither value
is disclosed by the stated storage list, and the repository root is not used by
verification.

The product is designed for review context to travel with a change, so these
files are likely to be committed or shared. An incomplete storage disclosure
fails the privacy-by-default and honesty requirements.

**Concrete fix:** remove the absolute repository root from the portable
manifest and render repository-relative paths in Markdown. Add a claim and test
that creates a repository beneath a sentinel private path and asserts that the
sentinel appears in neither JSON nor Markdown. If any absolute path is retained,
name it explicitly on Privacy before users create a checkpoint.

### F-2-4 — BLOCKING, regressed — Public reliance statements are still outside the claims inventory

**Location and exact README text:**

- “To preview the site, use `npm run dev`.”
- “The site has `/demo`, `/privacy`, and `/terms` routes.”
- “The factory deploys `dist/site` as a static site.”
- “This repository does not manage DNS, billing, or other infrastructure.”

None has a corresponding entry in `.factory/claims.json`. The
`public-claims.json` contract test only verifies that a hand-written list of
claim IDs refers to existing IDs; it does not map or compare each reliance
sentence, so new unlisted claims can pass that test. This repeats the broader
claims-inventory defect from review 2 and therefore keeps its original ID.

**Concrete fix:** add one observable tagged claim for each retained statement
or remove the statement. Make the contract sentence-based: each public claim
must carry or map to exactly one claim ID, and the test must fail when an
unmapped reliance sentence is added.

### F-4-5 — BLOCKING — The browser can report an install URL while focus is on an off-screen hero

**Location:** demo exit → browser Back → browser Forward; `site/src/main.js`,
the `popstate` listener.

After **Leave demo and view install steps**, direct focus correctly reaches
“Clone and install cpc.” Back correctly restores the demo and focuses its h1.
Forward restores `/#install` and scrolls the install section to the viewport,
but the active element is the off-screen “Record checks with each change” h1.
The listener always focuses the h1 and does not handle the restored hash target.

The address, visible section, and screen-reader focus disagree on a required
back/forward route. This is broken route-state restoration.

**Concrete fix:** centralize route focus. On `/#install`, focus
`#sample-title`; on page routes, focus the h1; then announce the visible
destination. Add a regression test for leave → Back → Forward that asserts URL,
scroll target, focus target, and live announcement.

### F-4-6 — MAJOR — Deep-link HTML serves the home title and canonical before JavaScript runs

**Location:** raw live responses for `/demo`, `/privacy`, and `/terms`;
`site/scripts/prerender.mjs`.

`curl` returned the home metadata on all three routes:

```text
/demo     Change Checkpoints — Record checks with each change   canonical /
/privacy  Change Checkpoints — Record checks with each change   canonical /
/terms    Change Checkpoints — Record checks with each change   canonical /
```

JavaScript later corrects the DOM, but link-preview crawlers and no-script
clients receive the wrong title, description, canonical, and social metadata.
The “prerender” script only copies the same shell into each route directory.

**Concrete fix:** generate route-specific HTML metadata for every physical
route, including the correct title, description, canonical, OG, and Twitter
values. Add build and live-response tests that inspect the returned HTML before
JavaScript executes.

### F-4-7 — MINOR — The first-screen facts omit price and account requirements

**Location:** first-screen facts, “Runs in your Git repository,” “Stores exit
status, not output,” and “Signs each checkpoint so you can verify it later.”

The mandatory first-screen fact set must make privacy/offline behavior and
price clear. The current lines describe local behavior and signing, but they do
not say that the tool is free, open source, and requires no account or hosted
service. A first-time visitor has to infer cost from a later Terms page.

**Concrete fix:** replace the unsafe signing line after F-4-2 is resolved with
“Free and open source; no account required.” Inventory and test the retained
claim.

### F-4-8 — MINOR — “Clear boundary” is a decorative label

**Location and quote:** landing section label, “Clear boundary.”

The phrase does not identify the boundary and could appear unchanged on an
unrelated product. The following heading already carries the useful meaning.

**Concrete fix:** delete the label or replace it with “What checkpoints do not
do.”

## Copy audit

Counts split visible words on whitespace. Repeated Privacy/header/footer labels
have the same count and are listed once. Executable command blocks and manifest
key/value data are excluded; the meaningful image alt text is included. No item
exceeds 22 words, and no banned marketing adjective appears.

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
| Runs in your Git repository | 5 | F-4-1 |
| Stores exit status, not output | 5 | Pass |
| Signs each checkpoint so you can verify it later | 9 | F-4-2 |
| A printed technical proof sheet with verification stamps on a dark workbench. | 12 | Pass: descriptive alt text |
| One checkpoint for the change and its checks. | 8 | Pass |
| Install from source | 3 | Pass |
| Clone and install cpc | 4 | Pass |
| Clone the public source, then install the command with Cargo. | 10 | Pass |
| View source on GitHub | 4 | Pass: result-naming link |
| (opens GitHub) | 2 | Pass |
| How it works | 3 | Pass |
| Keep the checkpoint with the change | 6 | Pass |
| Name the checkpoint. | 3 | Pass |
| cpc records the current commit and a hash of the changes. | 11 | Pass |
| Run the checks. | 3 | Pass |
| cpc saves each command and its exit status, not its output. | 11 | Pass |
| Verify later. | 2 | F-4-2 |
| cpc checks the signature, current Git state, saved environment checks, and the checks you selected. | 15 | F-4-2 |
| Clear boundary | 2 | F-4-8 |
| Store change context without running a rollback | 7 | Pass |
| A checkpoint is a file in your repository. | 8 | Pass |
| Restore checks the current state before showing its rollback note. | 10 | Pass |
| Do not put secrets in an optional patch file. | 9 | Pass |
| Signed context for a change. | 5 | F-4-2 |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| v0.1.0 | 1 | Pass |

The three-item first-screen fact block also has the omission in F-4-7.

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Change Checkpoints | 2 | Pass |
| Record a Git change, its checks, and a rollback note in one signed checkpoint. | 14 | F-4-2 |
| It is for teams reviewing rapid agent or developer edits. | 10 | Pass |
| The CLI records Git state and each selected command's exit status. | 11 | Pass |
| It does not save command output or raw environment values. | 10 | Pass |
| An optional patch is written only when you ask for it. | 11 | Pass |
| Live docs | 2 | Pass |
| Install | 1 | Pass |
| Clone the public source, then install the CLI locally: | 9 | Pass |
| Record a checkpoint | 3 | Pass |
| Run this inside a Git repository. | 6 | F-4-1 |
| This writes `.change-checkpoints/auth-timeout.json` and a Markdown summary beside it. | 9 | Pass |
| The JSON is signed with an Ed25519 key stored locally at `.change-checkpoints/signing.key`. | 12 | F-4-2, F-4-3 |
| The command adds a local `.change-checkpoints/.gitignore` entry for that key. | 10 | F-4-3 |
| Add `--include-diff` when you need a patch next to the manifest. | 11 | Pass |
| Review that patch before sharing it. | 6 | Pass |
| A diff may contain secrets. | 5 | Pass: safety warning |
| Verify the current checkout later: | 5 | F-4-2 |
| `restore` checks the signature, current Git state, and environment before it shows the rollback note. | 15 | Pass |
| Add `--rerun` to check recorded command exits too. | 8 | F-4-2 |
| It never executes the rollback note. | 6 | Pass |
| Try the bundled sample | 4 | Pass |
| The demo makes an isolated temporary Git repository, records a changed Rust file with two checks, and prints its manifest path. | 21 | Pass |
| The web version opens at `/?demo=1` (or `/demo`) and stores only `demo:change-checkpoints:state` in the browser. | 15 | Pass |
| Selecting **Leave demo and view install steps** clears that sample key. | 11 | Pass |
| Develop, test, and package | 4 | Pass |
| Building and testing require Rust and Node. | 7 | Pass |
| To preview the site, use `npm run dev`. | 8 | F-2-4 |
| The site has `/demo`, `/privacy`, and `/terms` routes. | 8 | F-2-4 |
| It contains no analytics or third-party runtime assets. | 8 | Pass |
| The regular site stores nothing in the browser. | 8 | Pass |
| The demo uses one separate key and clears it when you leave. | 12 | Pass |
| The factory deploys `dist/site` as a static site. | 8 | F-2-4 |
| This repository does not manage DNS, billing, or other infrastructure. | 10 | F-2-4 |
| License | 1 | Pass |
| MIT. See LICENSE. | 3 | Pass |

## Demo and sandbox

One click on **Try it with sample data** opened `/?demo=1`. At 390 px, the
first screen showed the persistent “Demo — sample data, nothing is saved”
banner and the populated `agent-edit.json` sample with a real-looking commit
and changes hash. The rest of the same record contained two checks and a
rollback note.

- **Check sample record** first reported that the display matched the bundled
  record. After changing the displayed hash through the browser harness, it
  reported a mismatch.
- **Reset demo** restored `demo:change-checkpoints:state=sample` and reported
  “Sample reset.”
- The banner, Reset, and exit controls remained visible at the bottom of the
  page; its mobile bounds were `top: 0`, `height: 164.3`.
- A seeded `real:sentinel=untouched` key survived demo entry, reset, and exit.
  Exit removed only the demo key and focused “Clone and install cpc.”
- Every observed browser request used
  `https://change-checkpoint-manifest.sociobot.in`; there was no analytics,
  CDN, API, or service-worker request.
- From an explicit temporary working directory, `cargo run --manifest-path
  <clean-clone>/Cargo.toml --quiet -- demo --json` created
  `/tmp/change-checkpoints-demo-9567`, a Git repository containing the JSON,
  Markdown, patch, ignore file, and signing key.

The browser demo itself meets the one-click sandbox requirement. The CLI
findings above concern real checkpoint safety and correctness. The product
makes no offline claim, so offline reload is not an applicable claim test.

## Claims and build evidence

A clean `--no-local` clone at
`/tmp/change-checkpoint-review-4.mvxTbm/repo` received `npm ci`. Every command
listed in `.factory/claims.json` was run independently and exactly as written.

| Claim ID | Command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS |
| `web-storage` | `npm test -- --grep @claim:web-storage` | PASS |
| `checkpoint-record` | `npm test -- --grep @claim:checkpoint-record` | PASS |
| `runs-in-git-repository` | `npm test -- --grep @claim:runs-in-git-repository` | PASS, but F-4-1 disproves the unqualified claim |
| `local-signing-key-path` | `npm test -- --grep @claim:local-signing-key-path` | PASS |
| `signed-manifest` | `npm test -- --grep @claim:signed-manifest` | PASS, but F-4-2 exposes the missing trust boundary |
| `no-command-output` | `npm test -- --grep @claim:no-command-output` | PASS |
| `environment-hash` | `npm test -- --grep @claim:environment-hash` | PASS |
| `local-key-ignore` | `npm test -- --grep @claim:local-key-ignore` | PASS, but F-4-3 disproves the unqualified claim |
| `verify-manifest` | `npm test -- --grep @claim:verify-manifest` | PASS, but F-4-2 exposes the missing trust boundary |
| `restore-safe` | `npm test -- --grep @claim:restore-safe` | PASS |
| `optional-patch` | `npm test -- --grep @claim:optional-patch` | PASS |
| `no-third-party-runtime` | `npm test -- --grep @claim:no-third-party-runtime` | PASS |
| `git-required` | `npm test -- --grep @claim:git-required` | PASS |
| `mit-license` | `npm test -- --grep @claim:mit-license` | PASS |
| `web-demo-verify` | `npm test -- --grep @claim:web-demo-verify` | PASS |
| `install-from-source` | `npm test -- --grep @claim:install-from-source` | PASS |
| `markdown-summary` | `npm test -- --grep @claim:markdown-summary` | PASS |
| `cli-demo-isolated` | `npm test -- --grep @claim:cli-demo-isolated` | PASS |
| `runtime-requirements` | `npm test -- --grep @claim:runtime-requirements` | PASS |

The unfiltered `npm test` passed 25/25 Playwright tests plus all Rust and Node
tests. `npm run build` passed and produced `dist/site`; initial JavaScript was
10.84 kB raw and 4.13 kB gzip. Passing narrow fixtures do not resolve F-4-1,
F-4-2, F-4-3, or the unlisted claims in F-2-4.

## Earlier-finding verification

Every earlier `review-*`, `polish-*`, and handoff file was read. Each earlier
finding was checked against both the live site and current source.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 — direct 404 lacked the shared skeleton and metadata | Fixed: an unknown live URL returns HTTP 404 with the shared header/footer, route metadata, icons, Install link, and version; `site/public/404.html` contains the same elements. |
| F-1-2 — repository and signing-key claims were missing | Fixed for those two statements: both entries and tags exist and their declared tests pass. F-4-1 and F-4-3 identify wider cases those tests miss. |
| F-1-3 — Ed25519 jargon appeared in first-screen facts | Fixed: the algorithm name remains only in technical documentation. F-4-2 concerns trust, not jargon. |
| F-1-4 — “diff fingerprint” and “environment assertions” were unexplained | Fixed: live copy says “changes hash,” “a hash of the changes,” and “saved environment checks”; source matches. |
| F-1-5 — the boundary heading was ambiguous | Fixed: the h2 is “Store change context without running a rollback.” F-4-8 concerns the separate decorative eyebrow. |
| F-1-6 — demo exit did not name its result | Fixed: live and source say “Leave demo and view install steps,” and direct activation reaches and focuses that result. |
| F-2-1 — browser demo simulated verification | Fixed: live and source compute a SHA-256 digest and reject a changed displayed field. |
| F-2-2 — install path was incomplete | Fixed: the live page and README provide clone, `cd`, install commands, and a working public source link; isolated Cargo installation passed. |
| F-2-3 — demo disclosure was not persistent | Fixed: `.demo-banner` is sticky and remained at the top after scrolling. |
| F-2-4 — public claims were missing | Regressed/incomplete: the previously named claims were added, but the current inventory still omits the README statements listed in F-2-4 above. |
| F-2-5 — opportunity brief was absent | Fixed: `.factory/brief.json` is present, complete, and covered by a contract test. |
| F-2-6 — desktop first screen hid the fact lines | Fixed: all three facts ended above 658 px in the 900 px viewport. |
| F-2-7 — demo exit lost route-change focus | Fixed for direct exit: focus reaches “Clone and install cpc” and the live region announces it. F-4-5 covers a new Back/Forward failure. |
| F-2-8 — “proof” duplicated checkpoint terminology | Fixed in task copy: landing and demo use “checkpoint” and “changes hash.” |
| F-2-9 — Git capitalization was inconsistent | Fixed in landing, README, metadata, demo documentation, and CLI help. |
| F-2-10 — README control reference was ungrammatical | Fixed: it now begins “Selecting **Leave demo and view install steps** …”. |

The earlier handoff's “Known gaps: None” is no longer accurate because of the
findings in this review. The earlier polish files introduce no separate open
finding beyond the IDs audited above.

## Structure, accessibility, and visual identity

Live `/`, `/demo`, `/?demo=1`, `/privacy`, and `/terms` returned 200; an unknown
path returned the designed page with HTTP 404. After JavaScript runs, each route
has one h1, one main, ordered headings, a route-specific title and description,
canonical/OG/Twitter metadata, favicon, Apple touch icon, and the shared
header/footer. The OG image is 1200 × 630. F-4-6 covers the incorrect raw
deep-link metadata.

All crawled internal links, fragments, assets, and the public GitHub link
resolved. `/opt/fleet/lib/verify-url.sh` passed with no console errors. Fresh
Axe WCAG 2 A/AA scans at desktop and 390 px found zero violations on root,
demo, Privacy, Terms, and 404. No tested page overflowed, no visible control was
below 44 px, reduced motion disabled smooth scrolling and the illustration
transform, and the test suite confirmed content remains usable at 200% text
size. F-4-5 is the remaining route-focus defect.

The warm paper, halftone field, red stamp, square rule, and monospace proof-sheet
layout match `.factory/design.md` and are visually distinct from a generic SaaS
template. Original-art provenance is recorded in the design file.

## Missed leverage

The brief explicitly makes AI-assisted review and cloud synchronization
non-goals. The CLI already exports portable JSON and Markdown files and can
optionally write a patch. No additional AI, import/export, sync, or paid feature
is implied. No runtime provider key or decorative AI feature was found.

## What would make this perfect

Resolve all findings above: support real Git path edge cases, establish a
trusted signing model before rerunning commands, protect and reliably ignore
the private key, remove absolute-path leakage, inventory every public claim,
generate correct deep-link metadata, restore hash-target focus through browser
history, and remove the two first-screen copy gaps. Then rerun every claim from
a clean clone plus the new adversarial fixtures. At that point there should be
no remaining action in this section.
