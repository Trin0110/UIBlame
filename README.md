<p align="center">
  <img src="assets/uiblame-banner.svg" alt="UIBlame — Click any pixel. See who—or what—made it." width="100%" />
</p>

# UIBlame

**Visual provenance for AI-written software.** UIBlame lets you click a rendered UI element and trace it back to its source line, Git history, and recorded AI provenance.

> **Click any pixel. See who—or what—made it.**

UIBlame is intentionally **not an AI-code classifier**. It never claims something was written by AI because it “looks AI-generated.” A `Verified AI` result requires explicit provenance evidence: either the recorded Git commit matches the line currently blamed by Git, or the current source range matches the SHA-256 content hash captured when the provenance record was created. If the evidence is missing, UIBlame says `Unknown`.

## What works in this MVP

- Vite dev plugin for React/JSX/TSX projects.
- Automatic source instrumentation during development only.
- Hover + click inspector rendered in an isolated Shadow DOM.
- `DOM element → source file + line + column`.
- Local `git blame`, commit metadata and diff lookup.
- Provenance statuses: **Verified AI**, **Recorded AI**, and **Unknown**.
- Local JSONL provenance store with prompt hashing.
- No account, cloud backend or source upload.

## Quick start

```bash
npm install
npm run build
npm run dev
```

Then open the Vite demo URL and click **◎ UIBlame** in the bottom-right corner.

To use the package in another Vite project:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { uiBlame } from 'uiblame';

export default defineConfig({
  plugins: [uiBlame(), react()]
});
```

UIBlame only runs during `vite serve`; it does not instrument production builds.

## Recording AI provenance

Initialize the store:

```bash
npx uiblame init
```

Record a source range after an AI-assisted change:

```bash
npx uiblame record \
  --file src/CheckoutButton.tsx \
  --lines 42:58 \
  --agent codex \
  --session 0199-demo-session \
  --prompt "Make the checkout CTA easier to notice on mobile"
```

The CLI captures a SHA-256 hash of the exact source range, records the current Git commit when available, and stores a SHA-256 hash of the prompt alongside the optional prompt text. This lets a pre-commit AI edit still be verified by its unchanged source bytes later.

### Status semantics

| Status | Meaning |
| --- | --- |
| **Verified AI** | A provenance record covers the range and either its Git commit matches blame **or** its recorded source-content hash still matches. |
| **Recorded AI** | A provenance record covers the line, but the current Git blame commit does not match exactly. |
| **Unknown** | No matching provenance evidence exists. This does **not** mean human-written. |

## How it works

```text
Rendered UI
   ↓ click
DOM element
   ↓ data-uiblame-source injected by the Vite transform
file : line : column
   ↓ local dev-server API
git blame + git show
   ↓
provenance range + commit/content-hash match
   ↓
Verified AI / Recorded AI / Unknown
```

The plugin uses Vite's transform hook to add source markers to native JSX elements while the dev server is running. The inspector asks a local middleware endpoint for Git and provenance information. Nothing in the MVP requires an external service.

## Why provenance instead of detection?

Statistical “AI code detectors” cannot reliably prove who produced a line of code. UIBlame treats provenance as an evidence problem: record an agent/session when a change is created, bind it to a source range and commit, then verify that record later.

## Privacy

Prompts may contain secrets or private context. Do not record raw prompts unless you intend to keep them. UIBlame also stores a prompt hash, so future adapters can work with redacted records. `.uiblame/private/` is ignored by default for private session material.

## Roadmap

- Agent adapters for Codex and Claude Code session metadata.
- Git notes backend, signed provenance and tamper evidence.
- Component-level history instead of single-line blame.
- Visual time travel for an element across commits.
- Vue/Svelte/Solid source adapters.
- VS Code/Cursor deep links.
- Repository-level AI contribution map based only on recorded evidence.

## Repository layout

```text
packages/uiblame/   Vite plugin, inspector runtime, Git/provenance engine, CLI
apps/demo/          React + Vite demo
assets/             README artwork
```

## Non-goals

UIBlame does not infer whether unrecorded code is human-written, score “AI probability,” or upload a repository for remote analysis.

## License

MIT
