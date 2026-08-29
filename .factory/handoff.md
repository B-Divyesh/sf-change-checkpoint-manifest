# Verification 3 handoff — Change Checkpoints

## Outcome

**FAIL.** Candidate `e60ab7eacf47254a7708615b01f4c53298c88478` was
independently tested on 2026-08-29 against
https://change-checkpoint-manifest.sociobot.in. Product code was not changed.
The complete evidence and remediation list are in
[`verification-3.md`](verification-3.md).

The live deployment is healthy and byte-matches the candidate. All 23 declared
claim commands, the full test suite, release build, Cargo package verification,
consumer install, accessibility, privacy, caching, and performance checks pass.
The release still fails because the packaged CLI has core safety and
reproducibility defects.

## Release blockers

1. A committed `.change-checkpoints/<name>.json` symlink can redirect `cpc`
   into overwriting another user-writable file; the command exits 0.
2. `--include-diff` produces a zero-byte patch when the workspace change is a
   new untracked file, so the exact state cannot be reproduced on a clean clone.
3. Git state is captured before checks. A successful check that changes a
   tracked file yields a signed checkpoint that fails immediate verification.

Additional P2 findings cover environment validation after command execution,
contradictory assertions, silent same-name replacement with a stale patch, and
plain-text errors in `--json` mode. The live footer also lacks the required
build identifier.

## How verification was run

```sh
npm ci
# Every .factory/claims.json test command, separately
npm test
npm run build
npm run pack:cli
npm audit --audit-level=high
```

The packaged crate was installed into an isolated Cargo root and exercised
through demo, preview, approved verify, restore, changed-state rejection,
Unicode/rename/untracked paths, failing checks, invalid input, state-mutating
checks, symlink outputs, and checkpoint-name reuse.

Live verification covered the supplied `verify-url.sh`, Playwright request and
response logs, Axe at desktop and 390px, keyboard-only operation, focus/history,
reduced motion, 200% scale, demo isolation/reset/exit, link crawl, response
headers, cache policy, exact artifact hashes, and Lighthouse.

## Verified passing evidence

- `npm test`: 4 Rust tests, 7 Node tests, and 29 Playwright tests passed.
- Cargo package: 44 files, 233.8 KiB / 69.3 KiB compressed.
- Lighthouse: 99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO;
  LCP 1.9s, TBT 120ms, CLS 0.
- Initial JS 11,394 bytes and CSS 8,869 bytes raw; hero 209,496 bytes.
- Public routes have no normal-load console errors or Axe violations; browser
  traffic stays same-origin; immutable asset caching and security headers are
  live.
- Local build, live files, `origin/main`, and remote `main` all identify the
  tested candidate.

## Next step

Repair the three blockers and P2 recovery defects, add regression claims/tests,
then run independent verification again. Do not release this candidate.
