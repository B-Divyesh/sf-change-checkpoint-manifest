# First-read QA review 7 — Change Checkpoints

**URL:** https://change-checkpoint-manifest.sociobot.in  
**Candidate reviewed:** `72de4b0300f17f7e95b47e344eb05c6b83ea4b9e`  
**Reviewed:** 2026-08-29 UTC  
**Verdict:** **PASS**

No blocking, major, minor, or untested-claim finding remains. This was a
fresh full review, not a diff-only review.

## Cold first read

Fresh Chromium contexts with empty storage opened the live root without
scrolling at 390 × 844 and 1440 × 900.

- **What it does:** It records selected checks alongside a Git change in a
  local checkpoint, including a rollback note.
- **Who it is for:** Teams reviewing fast edits.
- **What to click first:** **Try it with sample data** to see a populated
  checkpoint.

The exact first-screen copy was “A local Git checkpoint tool,” “Record checks
with each change,” “For teams reviewing fast edits who need the diff, checks,
and rollback note together.”, “Try it with sample data,” and “See a sample
checkpoint next.” The required action result and all three facts were visible
in both contexts; on desktop the lowest fact ended at 658 px of a 900 px
viewport. No first-read blocker applies.

## Copy audit

Counts treat a URL, path, product name, and command flag as one word. Command
blocks and sample manifest fields are executable input or displayed data, not
prose. No item exceeds 22 words. No banned marketing adjective, vague slogan,
inconsistent product term, unclear standalone heading, or non-result-naming
button was found. Technical terms in README occur in direct CLI instructions
and state the operational detail they describe.

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
| A printed technical checkpoint with verification stamps on a dark workbench. | 11 | Pass: useful image alternative |
| One checkpoint for the change and its checks. | 8 | Pass |
| Install from source | 3 | Pass |
| Clone and install cpc | 4 | Pass |
| Clone the public source, then install the command with Cargo. | 10 | Pass |
| View source on GitHub | 4 | Pass: names destination |
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
| Build `c4d1c09c8a98` | 2 | Pass |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Change Checkpoints | 2 | Pass |
| Record a Git change, its checks, and a rollback note in one trusted checkpoint. | 14 | Pass |
| It is for teams reviewing rapid agent or developer edits. | 10 | Pass |
| The CLI records Git state and each selected command's exit status. | 11 | Pass |
| It does not save command output or raw environment values. | 10 | Pass |
| An optional patch is written only when you ask for it. | 11 | Pass |
| Git state is captured after the selected checks finish. | 9 | Pass |
| Live docs: https://change-checkpoint-manifest.sociobot.in | 3 | Pass |
| Install | 1 | Pass |
| Clone the public source, then install the CLI locally: | 9 | Pass |
| Record a checkpoint | 3 | Pass |
| Run this inside a Git repository. | 6 | Pass |
| An explicit `NAME=value` environment assertion must match the current value. | 10 | Pass: defined by its value form |
| Invalid or mismatched assertions are rejected before any check runs. | 10 | Pass |
| This writes `.change-checkpoints/auth-timeout.json` and a Markdown summary beside it. | 9 | Pass |
| These portable files do not contain the repository's absolute path. | 10 | Pass |
| Checkpoint names are create-only and never replace existing checkpoint files. | 10 | Pass |
| The JSON uses an Ed25519 signing key at `.change-checkpoints/signing.key`. | 9 | Pass: technical instruction |
| The key has owner-only permissions on Unix. | 7 | Pass |
| The command adds `/signing.key` to `.change-checkpoints/.gitignore` without removing existing rules. | 10 | Pass |
| The matching public key is pinned outside the manifest under `.git`. | 10 | Pass |
| A copy at `.change-checkpoints/signing.pub` can be shared through a channel you trust. | 12 | Pass |
| Verification rejects a manifest signed by any other key. | 9 | Pass |
| Add `--include-diff` when you need a patch next to the manifest. | 10 | Pass |
| The patch includes tracked changes and new untracked files. | 9 | Pass |
| Review it before sharing it. | 5 | Pass |
| A diff may contain secrets. | 5 | Pass |
| First inspect the current checkout and the exact recorded commands: | 9 | Pass |
| That command does not run the checks. | 7 | Pass |
| Approve those exact commands separately: | 5 | Pass |
| Use `--trusted-key /trusted/path/signing.pub` when the local pin is unavailable. | 8 | Pass |
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
| The site contains no analytics or third-party runtime assets. | 9 | Pass |
| The regular site stores nothing in the browser. | 8 | Pass |
| The demo uses one separate key and clears it when you leave. | 12 | Pass |
| Deploy the generated `dist/site` directory to static hosting. | 9 | Pass |
| License | 1 | Pass |
| MIT. See [LICENSE](LICENSE). | 3 | Pass |

## Demo and sandbox

One click on **Try it with sample data** opened `/?demo=1`. Its first screen
already showed the `agent-edit.json` checkpoint with a commit, changes hash,
two realistic checks, and a rollback note. The persistent banner read “Demo —
sample data, nothing is saved.”

- **Check sample record** reported “The displayed sample matches the bundled
  record.” After changing the displayed hash, it reported the documented
  mismatch.
- **Reset demo** restored the sample and reported “Sample reset.”
- At 390 px after scrolling to the bottom, the banner remained at `y=0`; Reset
  was 44 px high and the leave action was 48 px high.
- A pre-seeded `real:sentinel` key survived entry, reset, and exit. Leaving
  removed only `demo:change-checkpoints:state`, navigated to `/#install`,
  focused “Clone and install cpc”, and announced “Install steps loaded.”
- Fresh root and demo request logs used only
  `https://change-checkpoint-manifest.sociobot.in`. No offline claim is made.
- `cargo run --quiet -- demo --json` creates the bundled CLI sample in a
  temporary Git repository; its claim scenario passed from the clean clone.

## Claims and build evidence

I created fresh `--no-local` clone `/tmp/change-checkpoint-review-7`, ran
`npm ci`, then ran every exact command in `.factory/claims.json` independently.
All 29 selectors passed. The combined `npm test -- --grep @claim` run passed
all 23 tagged scenarios (some scenarios intentionally cover more than one
claim).

The 29 passing claim IDs were: `demo-sandbox`, `web-storage`,
`checkpoint-record`, `runs-in-git-repository`, `local-signing-key-path`,
`signed-manifest`, `no-command-output`, `environment-hash`, `local-key-ignore`,
`verify-manifest`, `trusted-signature`, `restore-safe`, `optional-patch`,
`no-third-party-runtime`, `git-required`, `mit-license`, `web-demo-verify`,
`install-from-source`, `markdown-summary`, `cli-demo-isolated`,
`runtime-requirements`, `portable-paths`, `free-no-account`, `live-build-id`,
`safe-checkpoint-outputs`, `safe-checkpoint-inputs`, `validated-environment`,
`json-errors`, and `post-check-state`.

The clean clone also passed `npm test` (formatting, Clippy, four Rust tests,
seven contract/config tests, and 37 Playwright tests), `npm run build`, and
`npm run pack:cli`. Build output includes `dist/site`; its initial JavaScript
is 11.33 kB raw / 4.20 kB gzip. The sentence-level public-claim contract and
a fresh live-copy check found no unlisted claim.

## Earlier-finding confirmation

Every earlier `review-*`, `polish-*`, verification record, and handoff was
read. Current source and live behavior confirm each earlier finding is fixed.

| Earlier ID | Current confirmation |
| --- | --- |
| F-1-1 | Unknown live routes return the designed shared-skeleton HTTP 404 with route metadata, icons, legal links, and build ID. |
| F-1-2 | Repository-location and local-key-path claims have entries and passing fresh-repository selectors. |
| F-1-3 | First-screen facts use practical wording, not an algorithm name. |
| F-1-4 | Public copy and demo use “changes hash” and “saved environment checks.” |
| F-1-5 | The rollback-boundary h2 names the result. |
| F-1-6 | The demo-exit action names its destination; Privacy uses the same term. |
| F-2-1 | The sample-record comparison detects changed displayed data. |
| F-2-2 | Site and README supply clone, directory, and Cargo install steps plus a live source link. |
| F-2-3 | The disclosure and both demo controls remain visible on mobile scroll. |
| F-2-4 | Public reliance copy maps to the inventory and every listed selector passed. |
| F-2-5 | `.factory/brief.json` is present, complete, and contract-tested. |
| F-2-6 | Action result and all three facts fit in the 1440 × 900 first screen. |
| F-2-7 | Demo exit plus Back/Forward restore the install target, focus, and announcement. |
| F-2-8 | Task copy consistently calls the saved record a checkpoint. |
| F-2-9 | Public product copy capitalizes Git consistently. |
| F-2-10 | README grammatically identifies the demo-exit control. |
| F-4-1 | NUL-delimited status parsing and complex-path/rename coverage pass. |
| F-4-2 | Pinned-key trust checks precede reruns, with explicit approval and forged-key rejection. |
| F-4-3 | Existing ignore rules are retained and `/signing.key` is added and verified. |
| F-4-4 | Portable JSON and Markdown omit absolute repository paths. |
| F-4-5 | Browser Back/Forward restores the hash target, focused install h2, and announcement. |
| F-4-6 | Raw deep-link HTML has per-route metadata before JavaScript runs. |
| F-4-7 | First-screen facts state free use and no-account requirement. |
| F-4-8 | The decorative “Clear boundary” label is absent. |
| F-6-1 | `/terms` h1 is “Terms for Change Checkpoints.” |

## Structure, accessibility, and scope

Live `/`, `/demo`, `/privacy`, `/terms`, `/404.html`, `robots.txt`,
`sitemap.xml`, favicon, touch icon, and OG art returned 200. A deliberate
unknown route returned 404. Crawled internal destinations and the public GitHub
source link returned 200. Valid routes had route-specific title, description,
canonical, Open Graph/Twitter data, favicon, one h1, one main landmark,
`lang="en"`, and consistent header/footer. Fresh Axe WCAG 2 A/AA checks at
390 px found zero violations on root, demo, Privacy, Terms, and 404. Normal
pages had no console errors.

The warm-paper, dense-ink, stamped-rule, square-corner proof-sheet system and
original workbench art match `.factory/design.md` and are distinct from a
generic SaaS template. The brief explicitly excludes AI-assisted review and
cloud sync; JSON, Markdown, and optional patch output already cover the
implied export need. No missing AI/import/export/sync feature, decorative AI,
or embedded provider key was found.

## What would make this perfect

No product change is identified. Keep the current one-click isolated demo,
sentence-to-claim inventory, cold-route checks, and clean-clone claim runs on
future changes.
