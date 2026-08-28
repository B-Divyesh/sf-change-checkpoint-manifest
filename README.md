# Change Checkpoints

Record a git change, its checks, and a rollback note in one signed manifest.
It is for teams reviewing rapid agent or developer edits.

The CLI records Git state and each selected command's exit status. It does not
save command output or raw environment values. An optional patch is written
only when you ask for it.

Live docs: https://change-checkpoint-manifest.sociobot.in

## Install

From a clone, install the CLI locally:

```sh
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

This writes `.change-checkpoints/auth-timeout.json` and a readable Markdown
summary. The JSON is signed with an Ed25519 key stored locally at
`.change-checkpoints/signing.key`.

The command adds a local `.change-checkpoints/.gitignore` entry for that key.

Add `--include-diff` when you need a patch next to the manifest. Review that
patch before sharing it. A diff may contain secrets.

Verify the current checkout later:

```sh
cpc verify .change-checkpoints/auth-timeout.json --rerun
cpc restore .change-checkpoints/auth-timeout.json --rerun
```

`restore` checks the signature, current Git state, and environment before it
shows the rollback note. Add `--rerun` to check recorded command exits too.
It never executes the rollback note.

## Try the bundled sample

```sh
cargo run -- demo
```

The demo makes an isolated temporary Git repository, records a changed Rust
file with two checks, and prints its manifest path. The web version lives at
`/demo` and stores only `demo:change-checkpoints:state` in the browser.

## Develop, test, and package

Requires Rust and Node.

```sh
npm install
npm test
npm run build       # release binary + static site in dist/site
npm run pack:cli    # validates the publishable Cargo package; does not publish
```

To preview the site, use `npm run dev`. The site has `/demo`, `/privacy`, and
`/terms` routes. It contains no analytics or third-party runtime assets. The
regular site stores nothing in the browser. The demo uses one separate key and
clears it when you leave.

The factory deploys `dist/site` as a static site. This repository does not
manage DNS, billing, or other infrastructure.

## License

MIT. See [LICENSE](LICENSE).
