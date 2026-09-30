# v0.1 stabilization verification

Verified on 2026-09-30 in Codex Cloud. Implementation commit: `e990b4d`.
The uploaded snapshot was initialized as a local Git repository, as instructed in
`CODEX_UPLOAD.md`. No v0.2 work was started.

## Outcome

The v0.1 source baseline is ready to tag. All required stabilization checks passed.
No tag, npm publication, or remote push was performed. Registry name availability
and publishing authorization remain release-owner tasks.

The original upload contained no Git history. Browser Git metadata therefore
refers to the local snapshot commit (`a9845af`), not the original upstream commit.
The unchanged dogfood record verifies through its SHA-256 range hash.

## Bugs corrected

- The browser used the demo's Vite root while the provenance store used the
  repository root. Clicking the hero initially reported `Unknown` even though
  the headless check passed. The demo now configures a shared source/provenance
  root; source markers and the CLI use the same paths.
- Inspector requests ignored Vite base paths. Both runtime and middleware now
  use the configured base; a real Vite integration test covers `/demo/`.
- Source validation rejected symlink leaves but followed symlinked parent
  directories. All path components below the configured root are now checked;
  absolute browser/CLI source paths are rejected.
- `--lines 1:2:3` was silently accepted, `./` source paths did not match browser
  markers, and appending to JSONL without a final newline merged records.
  These cases now have validation/normalization and regression coverage.
- A click depended on the last mousemove target. Click-only interaction now
  resolves the actual clicked element. Slow prior requests cannot overwrite
  a newer selection or a closed panel.
- The package lacked a bundled license. The package now includes MIT LICENSE,
  and `pack:check` asserts the required files rather than only printing them.
- Added and committed `package-lock.json`, changed CI to `npm ci`, ignored build
  artifacts, and corrected the demo's Node requirement for Vite 7.

Evidence semantics remain unchanged: a covering local record plus matching
commit OR range hash is Verified AI; an unmatched covering claim is Recorded AI;
no matching record is Unknown, never a claim of human authorship.

## Commands executed

Initial snapshot setup in `/workspace/UIBlame`:

```bash
git init
git config user.name 'Codex Cloud'
git config user.email 'codex@example.local'
git add .
git commit -m 'chore: initialize uploaded UIBlame snapshot'
npm install
npm run check
npm run pack:check
npm run dev
```

`npm run check` executes `npm run build`, `npm test`, `npm run test:dogfood`,
and `npm run test:production`. The initial five tests passed, but the first real
browser inspection exposed the root mismatch above. Final checks passed after
correction with ten tests.

Node 20.19.0 / npm 10.9.2 in `/workspace/UIBlame`:

```bash
PATH=/tmp/uiblame-node20/node_modules/.bin:$PATH npm ci --no-audit --no-fund
PATH=/tmp/uiblame-node20/node_modules/.bin:$PATH npm run check
PATH=/tmp/uiblame-node20/node_modules/.bin:$PATH npm run pack:check
```

A clean clone of the committed changes was then created and tested with
Node 22.12.0 / npm 10.9.2:

```bash
git clone --no-hardlinks /workspace/UIBlame /tmp/uiblame-verify22
PATH=/tmp/uiblame-node22/node_modules/.bin:$PATH npm ci --no-audit --no-fund --prefix /tmp/uiblame-verify22
cd /tmp/uiblame-verify22
PATH=/tmp/uiblame-node22/node_modules/.bin:$PATH npm run check
PATH=/tmp/uiblame-node22/node_modules/.bin:$PATH npm run pack:check
PATH=/tmp/uiblame-node22/node_modules/.bin:$PATH npm run dev
```

While that dev server ran, a separate terminal executed:

```bash
PATH=/tmp/uiblame-node22/node_modules/.bin:$PATH UIBLAME_CHROMIUM=/usr/bin/chromium npm run test:browser
git status --short
```

The browser check also passed on the workspace's Node 24.19.0 / npm 11.9.0.
Browser: Chromium 151.0.7922.173, driven with Playwright. The actual rendered
Verified AI overlay screenshot was visually reviewed. This was browser automation
plus visual inspection, not a claim of an independent human manual test.

An actual npm tarball was installed outside the monorepo:

```bash
mkdir -p /tmp/uiblame-pack /tmp/uiblame-consumer
PATH=/tmp/uiblame-node22/node_modules/.bin:$PATH npm pack -w uiblame --pack-destination /tmp/uiblame-pack
PATH=/tmp/uiblame-node22/node_modules/.bin:$PATH npm install --prefix /tmp/uiblame-consumer --no-audit --no-fund /tmp/uiblame-pack/uiblame-0.1.0.tgz
cd /tmp/uiblame-consumer
PATH=/tmp/uiblame-node22/node_modules/.bin:$PATH node --input-type=module -e 'import {uiBlame} from "uiblame"; if (uiBlame().apply !== "serve") throw new Error("Bad export"); console.log("Installed package import passed")'
PATH=/tmp/uiblame-node22/node_modules/.bin:$PATH ./node_modules/.bin/uiblame inspect --root /tmp/uiblame-verify22 --file apps/demo/src/main.tsx --line 17 > /tmp/uiblame-packed-inspect.json
node -e 'const r=require("/tmp/uiblame-packed-inspect.json"); if(r.provenance.status!=="verified-ai") throw new Error("Packed CLI failed"); console.log("Installed CLI passed: " + r.provenance.status)'
```

The installed plugin imported successfully and the installed CLI reported
`verified-ai`. Tarball contents: CLI, plugin, shared runtime chunk, declarations,
package metadata, package README, and LICENSE.

## Exact automated tests passed

On both Node 20.19.0 and 22.12.0, all 10 tests passed with no skips:

1. CLI records and verifies provenance without storing raw prompt by default.
2. CLI rejects source paths outside the project root.
3. CLI normalizes paths, preserves JSONL boundaries and validates line ranges.
4. Package exports uiBlame.
5. Vite transform injects a source marker into native JSX elements.
6. Plugin is dev-server only.
7. Disabled plugin injects neither markers, runtime nor middleware.
8. Instrumentation preserves custom components and skips files outside the root.
9. Real Vite demo resolves repository provenance with a nested base.
10. Middleware rejects unsafe paths and malformed markers, survives malformed provenance.

Additional checks passed:

- Dogfood line 17 resolves to `chatgpt`, `verified-ai`.
- Production scan of all three emitted text assets finds no source markers,
  runtime marker, inspector endpoint, host, or toggle label.
- Package dry-run assertions and installed-tarball smoke checks.
- Chromium: hero marker `apps/demo/src/main.tsx|19|9`, matching endpoint evidence,
  Git commit/author/diff, Verified AI via SHA-256, Unknown on navigation text,
  Recorded AI after editing the recorded hero, and recovery after malformed JSONL.
- Chromium: Alt+Shift+B, Escape, close, click without mousemove, and stale-response
  handling; no browser page errors. Temporary fixture edits were restored and
  the clean checkout remained clean.

## Validation limits

Validation was on Linux with Chromium; Windows, macOS, Firefox and Safari were
not exercised. Original upstream Git history was absent from the upload and was
not reconstructed. npm registry ownership/name availability and publication
were not validated. These do not block tagging this verified source baseline.
