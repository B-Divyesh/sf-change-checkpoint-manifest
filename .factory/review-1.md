# Review 1 — Change Checkpoints

**URL:** `https://change-checkpoint-manifest.sociobot.in`  
**Candidate:** `1e967c63075e93cd004e4f46f4085df5493d486b`  
**Verdict: FAIL**

This fresh first-read QA review confirms the core flow works. The remaining findings mean the required zero-finding bar is not met.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 900 were opened without scrolling. The first screen answers the required questions: it records checks with each Git change in a signed checkpoint; it is for teams reviewing fast edits; select **Try it with sample data** to see a signed sample checkpoint. Exact copy: “Record checks with each change”; “For teams reviewing fast edits who need the diff, checks, and rollback note together.”; “Try it with sample data”; and “See a signed sample checkpoint next.” No first-screen blocking finding applies.

## Findings

### F-1-1 — P2 — Direct 404 is outside the required page skeleton

**Location:** `site/public/404.html`, live unknown-route response.

The direct 404 has `<title>Page not found — Change Checkpoints</title>`, no canonical link, no Open Graph/Twitter metadata, no Apple touch icon, a header without the landing-page Install link, and a footer without the build version. Application routes provide these elements, so a visitor arriving through a mistyped address sees a partly different contract.

**Fix:** use the same metadata/header/footer values as other routes. Use `Change Checkpoints — Page not found`, a canonical `/404`, OG/Twitter metadata, `apple-touch-icon`, the Install link, and `v0.1.0`. Add a direct-404 metadata/skeleton test.

### F-1-2 — P2 — Two visitor-reliance statements are absent from the claims inventory

**Location:** landing fact and README.

The landing says “Runs in your Git repository,” but no claim identifies that statement or tests a normal checkpoint in a caller-created Git repository. The README says “The JSON is signed with an Ed25519 key stored locally at `.change-checkpoints/signing.key`.” Existing tests establish a signature and the ignore-file entry, but no claim/test establishes that key location.

**Fix:** add `runs-in-git-repository` and `local-signing-key-path`, each with one `@claim:` test that asserts the result in a fresh repository. Alternatively, remove the specific location promise.

### F-1-3 — P3 — Cryptographic jargon appears in the first-screen facts

**Location:** landing fact, “Signs manifests with Ed25519”.

“Ed25519” does not explain a visitor benefit and is unexplained on the first phone screen.

**Fix:** replace with “Signs each checkpoint so you can verify it later.” Keep the algorithm in technical documentation.

### F-1-4 — P3 — The process copy uses unexplained terms

**Location:** landing How it works: “cpc records the current commit and diff fingerprint.” and “cpc checks the signature, Git state, environment assertions, and selected checks.”

“Diff fingerprint” and “environment assertions” have no plain-language meaning for a first-time visitor.

**Fix:** use “cpc records the current commit and a hash of the changes.” and “cpc checks the signature, current Git state, saved environment checks, and the checks you selected.”

### F-1-5 — P3 — A heading has no clear standalone meaning

**Location:** landing boundary section, “It keeps context. It does not run a rollback.”

In heading navigation, “It keeps context” does not name the object or result.

**Fix:** use “Store change context without running a rollback.”

### F-1-6 — P3 — Demo-exit action does not name its result

**Location:** persistent demo banner, “Start for real”.

The control clears demo storage and routes to the Install section, but its label says neither outcome.

**Fix:** label it “Leave demo and view install steps.” Add a browser assertion for the named destination.

## Copy audit

Word counts treat paths, command flags, and versions as one word. Visible labels/headings are included. No item exceeds 22 words and no banned marketing adjective appears. Flags reference the findings above.

### Landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Change Checkpoints | 2 | — |
| Demo | 1 | — |
| Install | 1 | — |
| Privacy | 1 | — |
| A local git checkpoint tool | 5 | — |
| Record checks with each change | 5 | — |
| For teams reviewing fast edits who need the diff, checks, and rollback note together. | 14 | — |
| Try it with sample data | 5 | — |
| See a signed sample checkpoint next. | 6 | — |
| Runs in your Git repository | 5 | F-1-2 |
| Stores exit status, not output | 5 | — |
| Signs manifests with Ed25519 | 4 | F-1-3 |
| One proof sheet for the change and its checks. | 9 | — |
| The command | 2 | — |
| Make a checkpoint in one command | 6 | — |
| Choose the checks that matter. | 5 | — |
| Add a rollback note. | 4 | — |
| The command saves only exit statuses. | 6 | — |
| Keep the proof with the edit | 6 | — |
| Name the checkpoint. | 3 | — |
| cpc records the current commit and diff fingerprint. | 8 | F-1-4 |
| Run the checks. | 3 | — |
| cpc saves each command and its exit status, not its output. | 12 | — |
| Verify later. | 2 | — |
| cpc checks the signature, Git state, environment assertions, and selected checks. | 11 | F-1-4 |
| Clear boundary | 2 | — |
| It keeps context. | 3 | F-1-5 |
| It does not run a rollback. | 6 | F-1-5 |
| A checkpoint is a file in your repository. | 8 | — |
| Restore checks the current state before showing its rollback note. | 10 | — |
| Do not put secrets in an optional patch file. | 10 | — |
| Signed context for a change. | 5 | — |
| Built by Param Factory | 4 | — |

### README

| Sentence or label | Words | Flag |
| --- | ---: | --- |
| Change Checkpoints | 2 | — |
| Record a git change, its checks, and a rollback note in one signed manifest. | 14 | — |
| It is for teams reviewing rapid agent or developer edits. | 10 | — |
| The CLI records Git state and each selected command’s exit status. | 11 | — |
| It does not save command output or raw environment values. | 10 | — |
| An optional patch is written only when you ask for it. | 11 | — |
| Live docs | 2 | — |
| Install | 1 | — |
| From a clone, install the CLI locally. | 7 | — |
| Record a checkpoint | 3 | — |
| Run this inside a Git repository. | 7 | — |
| This writes a JSON manifest and a readable Markdown summary. | 10 | — |
| The JSON is signed with an Ed25519 key stored locally at `.change-checkpoints/signing.key`. | 11 | F-1-2 |
| The command adds a local `.change-checkpoints/.gitignore` entry for that key. | 11 | — |
| Add `--include-diff` when you need a patch next to the manifest. | 9 | — |
| Review that patch before sharing it. | 6 | — |
| A diff may contain secrets. | 5 | — |
| Verify the current checkout later. | 5 | — |
| restore checks the signature, current Git state, and environment before it shows the rollback note. | 13 | — |
| Add `--rerun` to check recorded command exits too. | 7 | — |
| It never executes the rollback note. | 6 | — |
| Try the bundled sample | 4 | — |
| The demo makes an isolated temporary Git repository, records a changed Rust file with two checks, and prints its manifest path. | 21 | — |
| The web version lives at `/demo` and stores only `demo:change-checkpoints:state` in the browser. | 12 | — |
| Develop, test, and package | 4 | — |
| Requires Rust and Node. | 4 | — |
| To preview the site, use `npm run dev`. | 8 | — |
| The site has `/demo`, `/privacy`, and `/terms` routes. | 7 | — |
| It contains no analytics or third-party runtime assets. | 8 | — |
| The regular site stores nothing in the browser. | 8 | — |
| The demo uses one separate key and clears it when you leave. | 11 | — |
| The factory deploys `dist/site` as a static site. | 8 | — |
| This repository does not manage DNS, billing, or other infrastructure. | 10 | — |
| License | 1 | — |
| MIT. See LICENSE. | 3 | — |

## Demo, privacy, claims, and CLI checks

- The landing action opens `/demo` and immediately shows `agent-edit.json`, two recorded checks, a rollback note, and a terminal recording. The banner says “Demo — sample data, nothing is saved.” Reset reseeds the demo key; exit clears it.
- Fresh-browser testing records only same-origin requests and exactly `demo:change-checkpoints:state` during demo mode. The product makes no offline claim.
- `cargo run --quiet -- demo --json` created a manifest under `/tmp/change-checkpoints-demo-12056`, confirming the CLI demo uses a temporary repository.
- In clean clone `/tmp/change-checkpoint-review.LXqQ6q`, all 13 exact commands named by `.factory/claims.json` were exercised. `npm test -- --grep @claim` passed all nine tagged tests covering all 13 IDs.

## Structure and history checks

The live root, demo, privacy, and terms routes returned 200; an unknown route returned the designed 404 with HTTP 404. The root has a descriptive title, one h1, description, canonical, OG/Twitter metadata, favicon, and product art. The visual system is a distinct proof-sheet/halftone design, not a generic SaaS template. Internal routes and public assets checked live returned 200. The 404 exceptions are F-1-1.

All prior `.factory/verification*.md` and `.factory/handoff.md` records were read. Earlier restore-safety, commercial-copy removal, claims expansion, formatting, responsive demo, target-size, caching, strict-CSP, route, and deployment findings were checked against current source/live behavior and did not recur. No earlier `review-*.md` or `polish-*.md` exists. The brief does not call for an AI workflow, and the local CLI already writes JSON and Markdown manifests; no missing AI, import/export, or sync feature is evident.

## What would make this perfect

Resolve F-1-1 through F-1-6, add focused regression tests, then repeat the complete cold-read and clean-clone claims review. The one-click demo and local CLI flow would then meet the zero-finding acceptance bar.
