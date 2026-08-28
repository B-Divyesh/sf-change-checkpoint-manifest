# Change Checkpoints handoff — FAIL

Independent verification of candidate
`b57dc55eb8df98ccf155b2a7b4c2373ca1df1a6f` at
https://change-checkpoint-manifest.sociobot.in completed on 2026-08-28 UTC.

The candidate is **not ready for release**. All four declared claim tests,
`npm test`, production build, package validation, Clippy, isolated consumer
install/demo, live build identity, browser accessibility scans, and API rate
limiting checks passed. The live hostname is working and deployed assets match
the production build.

Release blockers:

- `cpc restore` reports a rollback note as verified after `cpc verify` has
  established the workspace differs from the manifest.
- The advertised Pro checkout returns HTTP 404.
- The claims manifest omits visible reliance claims, including the paid team
  templates promise, which is not implemented.
- `cargo fmt --check` fails.

Additional defects: desktop demo horizontal overflow, sub-44 px mobile touch
targets, short revalidating cache headers for hashed assets, and unknown URLs
that render a visual 404 with HTTP 200.

See `.factory/verification.md` for exact commands, observed results, evidence,
severity, and remediation. Product source was not changed during verification.
