# Review 2 handoff — Change Checkpoints

## Outcome

Adversarial first-read review 2 is complete at candidate
`531ee6612663eeaeaf5bfeb33d99aea55b7c3980`. Product code was not changed.
The verdict in `.factory/review-2.md` is **FAIL** with seven blocking and five
additional findings.

## Verification performed

- Opened the live site cold in fresh 390 × 844 and 1440 × 900 Chromium
  contexts and inspected both first viewports before scrolling.
- Exercised the one-click demo, Reset, verification action, demo exit, seeded
  non-demo storage, same-origin requests, scroll behavior, focus, Back, deep
  links, every public route, the designed 404, and every internal link.
- Ran Axe WCAG 2 A/AA on all public routes at both viewports; no violations
  were reported. `/opt/fleet/lib/verify-url.sh` also passed.
- Cloned the candidate to
  `/tmp/change-checkpoint-review-2-clean.8msJZQ/repo`, ran `npm ci`, and ran all
  15 commands from `.factory/claims.json` separately. Every command passed.
- Ran the CLI demo from an explicit temporary working directory; it created
  and reported an isolated sample repository and manifest path.
- Ran `npm test`, `npm run build`, and `git diff --check`; all passed. The full
  suite included 21 Playwright tests. `dist/site` was produced.
- Confirmed the local production HTML and hashed JS match the live deployment.

## Remaining work

See `.factory/review-2.md` for exact evidence and fixes. The highest-priority
items are the hard-coded successful web verification, incomplete real install
path, non-persistent demo disclosure, missing claims, absent opportunity brief,
and carried F-1-4/F-1-6 copy regressions. No deployment, infrastructure,
billing, or product source change was made.
