# v0.1 release checklist

Stabilization completed on 2026-09-30. See the [verification report](stabilization-report.md)
for exact commands, test names, browser evidence and validation limits.

## Required

- [x] `npm install` succeeds; clean lockfile installs pass with `npm ci`.
- [x] Lockfile generated and committed.
- [x] `npm run build` succeeds on Node 20.19.0 and 22.12.0.
- [x] `npm test` passes (10/10 tests, no skips) on both versions.
- [x] `npm run pack:check` asserts CLI, plugin, declarations, README and LICENSE.
- [x] Packed tarball installs outside the monorepo; plugin and CLI work.
- [x] Demo starts with `npm run dev` and is exercised in real Chromium through Playwright.
- [x] Clicking the demo hero resolves repository source file/line in the overlay.
- [x] Git commit, author and diff confirmed in the browser; overlay screenshot visually reviewed.
- [x] Dogfood range resolves as `Verified AI` through headless and browser paths.
- [x] An unrecorded line resolves as `Unknown`, never human-written.
- [x] Editing the recorded hero without new evidence downgrades it to `Recorded AI`.
- [x] Malformed provenance and rejected requests do not crash the server.
- [x] Production demo contains no UIBlame markers or inspector runtime.
- [x] README browser workflow, keyboard controls and close behavior confirmed.
- [x] SECURITY.md and threat model document v0.1 trust limitations.
- [x] Stabilization changes and lockfile committed; clean checkout verified.

## Release-owner actions

- [ ] Confirm npm package name availability/ownership before publishing.
- [ ] Tag `v0.1.0` when ready to release the verified source baseline.
- [ ] Publish only with release-owner authorization.

v0.1 is ready to tag. No tag, remote push or npm publication was performed here.
No v0.2 work was started. Git evidence in this uploaded workspace uses the locally
initialized snapshot history; dogfood verification uses its unchanged range hash.
