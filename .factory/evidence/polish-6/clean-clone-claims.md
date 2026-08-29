# Clean-clone claim evidence — polish 6

The repair artifact was cloned with `git clone --no-local` from commit
`d8d3ea70e00ebc67cb434fa280163a71d116200d` into
`/tmp/change-checkpoints-polish-6.DX68p0/repo`. After `npm ci`, every exact
command declared in `.factory/claims.json` passed independently:

- `@claim:demo-sandbox`
- `@claim:web-storage`
- `@claim:checkpoint-record`
- `@claim:runs-in-git-repository`
- `@claim:local-signing-key-path`
- `@claim:signed-manifest`
- `@claim:no-command-output`
- `@claim:environment-hash`
- `@claim:local-key-ignore`
- `@claim:verify-manifest`
- `@claim:trusted-signature`
- `@claim:restore-safe`
- `@claim:optional-patch`
- `@claim:no-third-party-runtime`
- `@claim:git-required`
- `@claim:mit-license`
- `@claim:web-demo-verify`
- `@claim:install-from-source`
- `@claim:markdown-summary`
- `@claim:cli-demo-isolated`
- `@claim:runtime-requirements`
- `@claim:portable-paths`
- `@claim:free-no-account`
- `@claim:live-build-id`
- `@claim:safe-checkpoint-outputs`
- `@claim:safe-checkpoint-inputs`
- `@claim:validated-environment`
- `@claim:json-errors`
- `@claim:post-check-state`

The loop ended with `ALL_CLAIMS_PASS`. The full current-tree `npm test` also
passed: Rust formatting and Clippy, 4 Rust tests, 7 Node deployment/claim
contract tests, and 35 Playwright tests.
