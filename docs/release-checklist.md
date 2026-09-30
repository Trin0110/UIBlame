# v0.1 release checklist

Do not publish or tag v0.1.0 until all required checks are actually run.

## Required

- [ ] `npm install` succeeds from a clean checkout.
- [ ] Lockfile is generated and committed.
- [ ] `npm run build` succeeds on Node 20 and 22.
- [ ] `npm test` passes.
- [ ] `npm run pack:check` includes the expected `dist` files and package README.
- [ ] Demo starts with `npm run dev`.
- [ ] Clicking the dogfooded demo hero resolves source file/line.
- [ ] Git metadata appears for the selected line.
- [ ] Dogfood record resolves as `Verified AI`.
- [ ] An unrecorded line resolves as `Unknown`, not human.
- [ ] Editing a recorded range without updating evidence downgrades it to `Recorded AI`.
- [ ] Production demo build does not contain `data-uiblame-source` or the inspector runtime.
- [ ] README commands match actual behavior.
- [ ] SECURITY.md and threat model remain accurate.

## Before npm publish

- [ ] Confirm the `uiblame` package name is available or choose the final package name.
- [ ] Confirm repository metadata and license.
- [ ] Create a clean release commit.
- [ ] Tag `v0.1.0` only after CI passes.
