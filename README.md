# Change Checkpoints

Record a Git change, its checks, and a rollback note in one trusted checkpoint.
It is for teams reviewing rapid agent or developer edits.

The CLI records Git state and each selected command's exit status. It does not
save command output or raw environment values. An optional patch is written
only when you ask for it. Git state is captured after the selected checks finish.

Live docs: https://change-checkpoint-manifest.sociobot.in

## Install

Clone the public source, then install the CLI locally:

```sh
git clone https://github.com/B-Divyesh/sf-change-checkpoint-manifest.git
cd sf-change-checkpoint-manifest
cargo install --path .
cpc --help
```

## Record a checkpoint

Run this inside a Git repository.

```sh
cpc checkpoint auth-timeout \
  --check "npm test" \
  --check "git diff --check" \
  --env NODE_ENV=production \
  --rollback "git restore src/auth.rs"
```

An explicit `NAME=value` environment assertion must match the current value.
Invalid or mismatched assertions are rejected before any check runs.

This writes `.change-checkpoints/auth-timeout.json` and a Markdown summary
beside it. These portable files do not contain the repository's absolute path.
Checkpoint names are create-only and never replace existing checkpoint files.

The JSON uses an Ed25519 signing key at
`.change-checkpoints/signing.key`. The key has owner-only permissions on Unix.
The command adds `/signing.key` to `.change-checkpoints/.gitignore` without
removing existing rules.

The matching public key is pinned outside the manifest under `.git`. A copy at
`.change-checkpoints/signing.pub` can be shared through a channel you trust.
Verification rejects a manifest signed by any other key.

Add `--include-diff` when you need a patch next to the manifest. The patch
includes tracked changes and new untracked files. Review it before sharing it.
A diff may contain secrets.

First inspect the current checkout and the exact recorded commands:

```sh
cpc verify .change-checkpoints/auth-timeout.json --rerun
```

That command does not run the checks. Approve those exact commands separately:

```sh
cpc verify .change-checkpoints/auth-timeout.json --rerun --approve-rerun
cpc restore .change-checkpoints/auth-timeout.json --rerun --approve-rerun
```

Use `--trusted-key /trusted/path/signing.pub` when the local pin is unavailable.
`restore` checks trust and current state before it shows the rollback note. It
never executes the rollback note.

Manifest, trusted-key, and saved-patch inputs must be regular, unaliased files.
With `--json`, argument and operation errors are returned as JSON objects.

## Try the bundled sample

```sh
cargo run -- demo
```

The demo makes an isolated temporary Git repository, records a changed Rust
file with two checks, and prints its manifest path. The web version opens at
`/?demo=1` (or `/demo`) and stores only `demo:change-checkpoints:state` in the
browser.
Selecting **Leave demo and view install steps** clears that sample key.

## Develop, test, and package

Building and testing require Rust and Node.

```sh
npm install
npm test
npm run build       # release binary + static site in dist/site
npm run pack:cli    # validates the publishable Cargo package; does not publish
```

The site contains no analytics or third-party runtime assets. The regular site
stores nothing in the browser. The demo uses one separate key and clears it
when you leave.

Deploy the generated `dist/site` directory to static hosting.

## License

MIT. See [LICENSE](LICENSE).
