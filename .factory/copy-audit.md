# Copy audit — polish 4

Catalog description (83 characters): **Record Git changes, check results, and
rollback notes in trusted local checkpoints.** It begins with a verb and stays
below the 120-character limit.

Every visitor-facing source was reviewed after the trust and privacy rewrite.
No sentence exceeds 22 words. A case-insensitive scan of the landing page,
README, and catalog description found none of the banned marketing words.
Commands and sample manifest values are executable input or data, so they are
not counted as prose.

## Landing page

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
| Try it with sample data | 5 | Pass |
| See a sample checkpoint next. | 5 | Pass |
| Runs in your Git repository | 5 | Pass |
| Stores exit statuses, not command output | 6 | Pass |
| Free and open source; no account required | 7 | Pass |
| A printed technical checkpoint with verification stamps on a dark workbench. | 11 | Pass |
| One checkpoint for the change and its checks. | 8 | Pass |
| Install from source | 3 | Pass |
| Clone and install cpc | 4 | Pass |
| Clone the public source, then install the command with Cargo. | 10 | Pass |
| View source on GitHub | 4 | Pass |
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

The first screen states the job, audience, next result, local behavior, stored
data boundary, price, and account requirement. The former untrusted-signature
promise and the decorative “Clear boundary” label are absent.

## Other public copy

Demo, Privacy, Terms, 404, and README prose were checked with the same rules.
Their longest sentence is the 21-word CLI-demo description in README. The
sentence-level claim map in `.factory/public-claims.json` pins reviewed source
digests, so a public-copy change fails the contract test until it is reviewed.

## Terminology

| Concept | One term used |
| --- | --- |
| Version-control system | Git |
| Saved record | checkpoint |
| JSON record | manifest |
| Change digest | changes hash |
| Human instructions | rollback note |
| Validation shell program | check |
| Extra change file | patch |
| Browser sample | demo |
| Signature authority | trusted key |

Technical documentation names **Ed25519** only when describing the signing
algorithm. First-screen copy states the practical facts instead.
