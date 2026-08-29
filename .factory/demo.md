# Demo

Website demo: `?demo=1` or `/demo` (for example,
`https://change-checkpoint-manifest.sociobot.in/?demo=1`).
It displays the bundled `agent-edit` sample manifest. It uses only the
`demo:change-checkpoints:state` localStorage key. **Reset demo** clears and
reseeds that key. **Leave demo and view install steps** clears it and moves
focus to the install heading. The sticky banner stays visible while scrolling.
The demo never reads a real-data key.

CLI demo:

```sh
cargo run -- demo
```

The command creates a temporary Git repository with a small Rust source edit,
runs `git diff --check` and `git status --porcelain`, then writes a signed
manifest and an opt-in patch. Its private key is mode `0600` on Unix, and its
public key is pinned below the temporary repository's `.git` directory. It
prints the temporary directory and manifest path. Delete that directory to
reset it.

To inspect the exact recorded commands without running them:

```sh
cpc verify .change-checkpoints/agent-edit.json --rerun
```

Run the same command with `--approve-rerun` only after reviewing that list.
