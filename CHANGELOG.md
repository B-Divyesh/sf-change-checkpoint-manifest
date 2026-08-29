# Changelog

## Unreleased

- Pinned a trusted public key outside each manifest and blocked check reruns
  until trust, repository state, and explicit command approval all pass.
- Added safe NUL-delimited Git path parsing for directories, spaces, Unicode,
  and renames.
- Protected and reliably ignored private keys, and removed absolute local paths
  from portable JSON and Markdown files.
- Added raw route metadata, browser-history focus restoration, and the compact
  mobile demo banner.
- Made `restore` validate the current repository and environment before showing
  a rollback note, with opt-in check reruns.
- Removed the unavailable paid offer and documented every retained product
  claim with an executable regression.
- Fixed proof-sheet overflow, touch targets, immutable asset caching, and real
  HTTP 404 routing.
- Added formatting and Clippy to the default test gate.

## 0.1.0 — 2026-08-28

- First release of the `cpc` checkpoint recorder and verifier.
- Added signed JSON and readable Markdown manifests.
- Added the local CLI demo and static documentation site.
