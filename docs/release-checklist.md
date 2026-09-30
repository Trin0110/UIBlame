# v0.1 release checklist

Do not publish or tag v0.1.0 until all required checks are actually run.

The checked items below were verified by GitHub Actions run 46 on 2026-09-30 unless stated otherwise.

## Required

- [x] `npm install` succeeds from a clean checkout.
- [ ] Lockfile is generated and committed.
- [x] `npm run build` succeeds on Node 20 and 22.
- [x] `npm test` passes (5/5 automated tests).
- [x] `npm run pack:check` includes the expected `dist` files and package README.
- [ ] Demo starts with `npm run dev` and is manually exercised in a browser.
- [ ] Clicking the dogfooded demo hero resolves source file/line through the browser overlay.
- [ ] Git metadata is manually confirmed in the browser inspector.
- [x] Dogfood record resolves as `Verified AI` through the headless inspection path.
- [x] An unrecorded line resolves as `Unknown`, not human.
- [x] Editing a recorded range without updating evidence downgrades it to `Recorded AI`.
- [x] Production demo build does not contain `data-uiblame-source` or the inspector runtime.
- [ ] README's browser workflow is manually confirmed.
- [x] SECURITY.md and threat model document the current v0.1 trust limitations.

## Before npm publish

- [ ] Confirm the `uiblame` package name is available or choose the final package name.
- [x] Confirm repository metadata and MIT license.
- [ ] Create a clean release commit after the remaining checks.
- [ ] Tag `v0.1.0` only after all required checks pass.

## Current handoff

Automated CI is green. The remaining stabilization work is intentionally small: commit a reproducible lockfile and manually exercise the real browser/dev-server workflow before tagging. See `docs/codex-handoff.md`.
