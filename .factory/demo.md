# Demo

Website demo: `/demo` or `https://change-checkpoint-manifest.sociobot.in/demo`.
It displays the bundled `agent-edit` sample manifest. It uses only the
`demo:change-checkpoints:state` localStorage key. **Reset demo** clears and
reseeds that key. The demo never reads a real-data key.

CLI demo:

```sh
cargo run -- demo
```

The command creates a temporary git repository with a small Rust source edit,
runs `git diff --check` and `git status --porcelain`, then writes a signed
manifest and an opt-in patch. It prints the temporary directory and manifest
path. Delete that directory to reset it.
