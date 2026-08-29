# Verification 5 handoff — FAIL

## Outcome

Candidate `04cfcc7cb43303022665abd2e0dfdec3c6c97cbc` at
https://change-checkpoint-manifest.sociobot.in **FAILS independent release
verification**. Product code was not changed. Full evidence and reproduction
details are in `.factory/verification-5.md`.

The live deployment does match the candidate, so the previous deployment-only
failure is resolved. Release remains blocked by:

1. One clean installed `npm test` run failed the mandatory
   `@claim:web-demo-verify` test (34/35). It passed a 20-repeat focused run and a
   second full run, proving the gate is nondeterministic rather than reliably
   green.
2. The packaged CLI returns exit 2 for every help/version path, including
   `cpc --help` and `cpc --version`.
3. A checkpoint signed on `master` verifies as `valid:true` after switching to
   `review-alternate` at the same commit and workspace, even though the signed
   manifest records the original branch.
4. The Cargo package includes unrelated README/license files from
   `node_modules`.

## Verification summary

- `npm ci`: PASS; 20 packages, 0 vulnerabilities.
- All 29 exact `.factory/claims.json` commands after install: PASS individually.
- `npm test`: FAIL once (34/35), then PASS on rerun (35/35).
- `npm run build`: PASS; release binary and `dist/site` produced.
- `npm run pack:cli`: PASS mechanically; 248.9 KiB raw / 72.4 KiB compressed.
- Clean packaged consumer install and normal demo/checkpoint/verify/restore
  flows: PASS, apart from the exit-code and branch-verification defects above.
- Live desktop/mobile, keyboard, reduced-motion, 200% text, same-origin request,
  storage, header/cache, link, and route checks: PASS.
- Axe serious/critical findings: 0 on all public routes and 404 at desktop and
  390px.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.9 s, CLS 0.
- Live/local hashes match for route HTML and hashed JS/CSS/hero assets. Footer
  build id is `04cfcc7cb433`.

## Re-run

```sh
npm ci
npm test
npm run build
npm run pack:cli
cargo package --list --allow-dirty
```

After installing the package into an isolated Cargo root, also require
`cpc --help` and `cpc --version` to return 0, and verify that changing only the
branch name produces an explicit mismatch (or that the documented contract no
longer claims branch identity).

## Next steps

Fix the three release blockers, clean the Cargo include patterns, add regression
tests for help/version exit codes and branch mismatch, then run the full suite
repeatedly before requesting another independent verification.
