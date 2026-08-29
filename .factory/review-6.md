# First-read QA review 6 — Change Checkpoints

**URL:** https://change-checkpoint-manifest.sociobot.in  
**Candidate reviewed:** `24b80aacdec2f70e4875a9d86ae996b4a0664f30`  
**Reviewed:** 2026-08-29 UTC  
**Verdict:** **FAIL**

One minor finding remains. The product is clear and tryable, but the required
zero-finding standard is not met.

## Cold first read

I opened fresh Chromium contexts without scrolling at 390 × 844 and 1440 ×
900.

- **What it does:** It records a Git change, its selected check results, and a
  rollback note in a local checkpoint.
- **Who it is for:** Teams reviewing fast edits.
- **What to select first:** **Try it with sample data** to inspect a populated
  sample checkpoint.

The exact first-screen copy that answered these questions was “Record checks
with each change”; “For teams reviewing fast edits who need the diff, checks,
and rollback note together.”; “Try it with sample data”; and “See a sample
checkpoint next.” All three fact lines were visible before scrolling in both
viewports. Check that the root screen therefore passes the first-read clarity
requirement.

## Finding

### F-6-1 — MINOR — The Terms-page heading does not name the page

**Location and exact text:** `/terms` `<h1>`, “Use checkpoints with care”.

Check that the heading is heard without its surrounding page chrome. It gives
an unspecified instruction rather than naming the Terms page or a concrete
section. A visitor navigating headings cannot tell that this is the legal-use
page until later text or the browser title supplies that context.

**Concrete fix:** replace the heading with **“Terms for Change Checkpoints”**.
Add a route-content check that confirms the Terms h1 uses that text.

## Copy audit

Counts treat a URL, path, command flag, or product name as one word. Command
blocks and sample field values are executable input or sample data, so they are
not prose sentences. All landing and README entries are at or below 22 words.
No landing or README entry needs a wording change. Technical terms in README
are confined to CLI instructions and are paired with their operational use.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| Change Checkpoints | 2 | Pass |
| Demo | 1 | Pass |
| Install | 1 | Pass |
| Privacy | 1 | Pass |
| A local Git checkpoint tool | 5 | Pass |
| Record checks with each change | 5 | Pass |
| For teams reviewing fast edits who need the diff, checks, and rollback note together. | 14 | Pass |
| Try it with sample data | 5 | Pass: names the result |
| See a sample checkpoint next. | 5 | Pass |
| Runs in your Git repository | 5 | Pass |
| Stores exit statuses, not command output | 6 | Pass |
| Free and open source; no account required | 7 | Pass |
| A printed technical checkpoint with verification stamps on a dark workbench. | 11 | Pass: image alternative |
| One checkpoint for the change and its checks. | 8 | Pass |
| Install from source | 3 | Pass |
| Clone and install cpc | 4 | Pass |
| Clone the public source, then install the command with Cargo. | 10 | Pass |
| View source on GitHub | 4 | Pass: names the destination |
| (opens GitHub) | 2 | Pass |
| How it works | 3 | Pass |
| Keep the checkpoint with the change | 6 | Pass |
| Name the checkpoint. | 3 | Pass |
| cpc records the current commit and a hash of the changes. | 11 | Pass |
| Run the checks. | 3 | Pass |
| cpc saves each command and its exit status, not its output. | 11 | Pass |
| Verify against your key. | 4 | Pass |
| cpc checks the pinned signature, current Git state, saved environment checks, and the checks you selected. | 16 | Pass |
| Store change context without running a rollback | 7 | Pass |
| A checkpoint is a file in your repository. | 8 | Pass |
| Restore checks the current state before showing its rollback note. | 10 | Pass |
| Do not put secrets in an optional patch file. | 9 | Pass |
| Record checks with each Git change. | 6 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| v0.1.0 | 1 | Pass |
| Build `<12-character Git identifier>` | 3 | Pass |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Change Checkpoints | 2 | Pass |
| Record a Git change, its checks, and a rollback note in one trusted checkpoint. | 14 | Pass |
| It is for teams reviewing rapid agent or developer edits. | 10 | Pass |
| The CLI records Git state and each selected command's exit status. | 11 | Pass |
| It does not save command output or raw environment values. | 10 | Pass |
| An optional patch is written only when you ask for it. | 11 | Pass |
| Git state is captured after the selected checks finish. | 8 | Pass |
| Live docs: https://change-checkpoint-manifest.sociobot.in | 3 | Pass |
| Install | 1 | Pass |
| Clone the public source, then install the CLI locally: | 9 | Pass |
| Record a checkpoint | 3 | Pass |
| Run this inside a Git repository. | 6 | Pass |
| An explicit `NAME=value` environment assertion must match the current value. | 9 | Pass |
| Invalid or mismatched assertions are rejected before any check runs. | 9 | Pass |
| This writes `.change-checkpoints/auth-timeout.json` and a Markdown summary beside it. | 9 | Pass |
| These portable files do not contain the repository's absolute path. | 10 | Pass |
| Checkpoint names are create-only and never replace existing checkpoint files. | 9 | Pass |
| The JSON uses an Ed25519 signing key at `.change-checkpoints/signing.key`. | 10 | Pass: technical instruction |
| The key has owner-only permissions on Unix. | 7 | Pass |
| The command adds `/signing.key` to `.change-checkpoints/.gitignore` without removing existing rules. | 10 | Pass |
| The matching public key is pinned outside the manifest under `.git`. | 10 | Pass |
| A copy at `.change-checkpoints/signing.pub` can be shared through a channel you trust. | 11 | Pass |
| Verification rejects a manifest signed by any other key. | 9 | Pass |
| Add `--include-diff` when you need a patch next to the manifest. | 10 | Pass |
| The patch includes tracked changes and new untracked files. | 9 | Pass |
| Review it before sharing it. | 5 | Pass |
| A diff may contain secrets. | 5 | Pass |
| First inspect the current checkout and the exact recorded commands: | 9 | Pass |
| That command does not run the checks. | 7 | Pass |
| Approve those exact commands separately: | 5 | Pass |
| Use `--trusted-key /trusted/path/signing.pub` when the local pin is unavailable. | 8 | Pass: technical instruction |
| `restore` checks trust and current state before it shows the rollback note. | 12 | Pass |
| It never executes the rollback note. | 6 | Pass |
| Manifest, trusted-key, and saved-patch inputs must be regular, unaliased files. | 9 | Pass |
| With `--json`, argument and operation errors are returned as JSON objects. | 10 | Pass |
| Try the bundled sample | 4 | Pass |
| The demo makes an isolated temporary Git repository, records a changed Rust file with two checks, and prints its manifest path. | 21 | Pass |
| The web version opens at `/?demo=1` (or `/demo`) and stores only `demo:change-checkpoints:state` in the browser. | 15 | Pass |
| Selecting **Leave demo and view install steps** clears that sample key. | 11 | Pass |
| Develop, test, and package | 4 | Pass |
| Building and testing require Rust and Node. | 7 | Pass |
| The site contains no analytics or third-party runtime assets. | 8 | Pass |
| The regular site stores nothing in the browser. | 8 | Pass |
| The demo uses one separate key and clears it when you leave. | 12 | Pass |
| Deploy the generated `dist/site` directory to static hosting. | 9 | Pass |
| License | 1 | Pass |
| MIT. See [LICENSE](LICENSE). | 3 | Pass |

## Demo and storage boundary

Check that one activation of **Try it with sample data** opens `/?demo=1` and
immediately shows the `agent-edit.json` sample, a commit, changes hash, two
check results, and a rollback note. This passed at 390 px.

Check that the persistent banner reads “Demo — sample data, nothing is saved”.
After scrolling, its mobile box remained visible at `y=95`. **Reset demo**
restored the sample and reported “Sample reset.” **Check sample record**
reported a match, then reported a mismatch after a displayed field was changed.

Check that demo storage is separate. With `real:sentinel=preserved` seeded
before navigation, the demo added only `demo:change-checkpoints:state`. Leaving
the demo removed only the demo key, navigated to `/#install`, and focused
“Clone and install cpc”. The browser Back then Forward path again focused and
showed the install heading, with “Install steps loaded” in the live region.

Check that browser requests remain on the product origin. Fresh root and demo
request logs contained only `https://change-checkpoint-manifest.sociobot.in`.
Source review also found no runtime request API, analytics call, third-party
font, or third-party script. The product makes no offline claim.

For the CLI sample, `cargo run --manifest-path <clean-clone>/Cargo.toml --quiet
-- demo --json` was run from a fresh temporary directory. It created its sample
under `/tmp/change-checkpoints-demo-4273` and printed the manifest path.

## Claims and local checks

A fresh `--no-local` clone at
`/tmp/change-checkpoints-review-6.Dma2n8/repo` received `npm ci` successfully.
Each exact command named by `.factory/claims.json` was run separately. The 29
selectors below passed; the log ends with `ALL_CLAIMS_PASS`.

| Claim ID | Result |
| --- | --- |
| demo-sandbox | Pass |
| web-storage | Pass |
| checkpoint-record | Pass |
| runs-in-git-repository | Pass |
| local-signing-key-path | Pass |
| signed-manifest | Pass |
| no-command-output | Pass |
| environment-hash | Pass |
| local-key-ignore | Pass |
| verify-manifest | Pass |
| trusted-signature | Pass |
| restore-safe | Pass |
| optional-patch | Pass |
| no-third-party-runtime | Pass |
| git-required | Pass |
| mit-license | Pass |
| web-demo-verify | Pass |
| install-from-source | Pass |
| markdown-summary | Pass |
| cli-demo-isolated | Pass |
| runtime-requirements | Pass |
| portable-paths | Pass |
| free-no-account | Pass |
| live-build-id | Pass |
| safe-checkpoint-outputs | Pass |
| safe-checkpoint-inputs | Pass |
| validated-environment | Pass |
| json-errors | Pass |
| post-check-state | Pass |

`npm test` also completed from that clone: Rust formatting, Clippy, four Rust
unit checks, seven deployment/claims-contract checks, and 34 Playwright checks
all passed. `npm run build` passed and produced `dist/site`; its initial
JavaScript is 11.42 kB raw / 4.34 kB gzip.

The reviewed source-digest contract confirms that mapped public reliance copy
matches `.factory/public-claims.json`. I also read the live page again and
checked that its reliance statements have matching claim entries. No unlisted
claim finding applies.

## Earlier-finding confirmation

I read every earlier `review-*`, `polish-*`, verification record, and handoff.
The following checks confirm each earlier finding is fixed in both current
source and live behavior.

| Earlier ID | Current confirmation |
| --- | --- |
| F-1-1 | Check that an unknown URL returns the designed HTTP 404 with shared navigation, legal links, route metadata, icons, and build identifier: confirmed. |
| F-1-2 | Check that repository-location and signing-key-path claims have entries and passing selectors: confirmed. |
| F-1-3 | Check that the first-screen facts use practical wording rather than an algorithm name: confirmed. |
| F-1-4 | Check that current public copy says “changes hash” and “saved environment checks”: confirmed. |
| F-1-5 | Check that the rollback-boundary heading names its result: confirmed. |
| F-1-6 | Check that the demo-exit label names its destination and privacy copy uses the same term: confirmed. |
| F-2-1 | Check that the sample-record control computes a displayed-field comparison and detects a changed field: confirmed. |
| F-2-2 | Check that the site supplies clone, directory-change, and Cargo-install steps plus a working public-source link: confirmed. |
| F-2-3 | Check that the demo disclosure and both controls remain visible during mobile scrolling: confirmed. |
| F-2-4 | Check that public reliance copy is mapped to the claim inventory and every listed selector passes: confirmed. |
| F-2-5 | Check that `.factory/brief.json` is present and validates required scope fields: confirmed. |
| F-2-6 | Check that the action result and three facts fit the 1440 × 900 first screen: confirmed; the lowest fact ended at 658 px. |
| F-2-7 | Check that demo exit and browser history place focus at the install heading: confirmed. |
| F-2-8 | Check that task copy consistently uses “checkpoint”: confirmed. |
| F-2-9 | Check that public product copy capitalizes Git consistently: confirmed. |
| F-2-10 | Check that the README uses “Selecting” before the demo-exit label: confirmed. |
| F-4-1 | Check that recorded repositories with directories, spaces, Unicode, and renames are covered by the current path-handling selector: confirmed. |
| F-4-2 | Check that the pinned-key check and separate approval step are covered by the current selector: confirmed. |
| F-4-3 | Check that an existing ignore file retains its rules and adds the key rule: confirmed. |
| F-4-4 | Check that portable JSON and Markdown omit an absolute repository path: confirmed. |
| F-4-5 | Check that Back then Forward restores the install target, focus, and announcement: confirmed. |
| F-4-6 | Check that raw `/demo`, `/privacy`, and `/terms` HTML has route-specific metadata before JavaScript runs: confirmed. |
| F-4-7 | Check that the first screen names free use and no account requirement: confirmed. |
| F-4-8 | Check that the former decorative boundary label is absent: confirmed. |
| Verification P1/P2/P3 records | Check that restore state checks, claim coverage, formatting, layout, touch targets, cache policy, route status, patch contents, post-check state, error output, and footer identifier are covered by the current source and passing suite: confirmed. |

## Site structure, accessibility, and visual identity

Check that `/`, `/demo`, `/privacy`, `/terms`, `/404.html`, `robots.txt`, and
`sitemap.xml` return 200, while an unknown route returns 404: confirmed. Check
that all crawled internal destinations and the public source link return 200:
confirmed.

Check that the valid routes have `lang="en"`, one h1, one main landmark,
route-specific title, description, canonical URL, Open Graph/Twitter data,
favicon, Apple touch icon, consistent header/footer, and no normal-page
console errors: confirmed. The direct live Terms route is the one remaining
heading-copy issue in F-6-1.

Check that mobile demo Axe WCAG 2 A/AA results contain no violations: confirmed.
The 390 px page had no horizontal overflow, and visible controls retained their
required size. Reduced-motion behavior and keyboard route transitions are
covered by the checked browser suite.

Check that the visual system is specific to this product: confirmed. The warm
paper, ink rules, halftone details, square controls, monospace headings, and
original checkpoint-workbench artwork match `.factory/design.md`; the page is
not a generic card-and-gradient layout. The artwork provenance and generation
record are present in `.factory/art/checkpoint-press.png.json`.

## Scope check

The brief explicitly excludes AI-assisted review and cloud synchronization.
The product already writes portable JSON and Markdown summaries and can add a
patch when requested. Check that no additional AI, import/export, or sync
feature is implied by the documented job: confirmed. No provider key is
embedded.

## What would make this perfect

Replace the Terms h1 with “Terms for Change Checkpoints”, add the focused route
check, and rerun this full review. Nothing else remains from this review.
