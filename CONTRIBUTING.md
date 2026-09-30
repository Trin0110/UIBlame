# Contributing to UIBlame

UIBlame is an evidence-first developer tool. Changes that affect provenance semantics should preserve one rule: **absence of evidence is never evidence of human authorship**.

## Development

```bash
npm install
npm run build
npm run dev
```

The demo lives in `apps/demo`. The Vite plugin and local inspection engine live in `packages/uiblame`.

## Pull requests

Keep PRs focused. For provenance changes, include a fixture that demonstrates the exact evidence path. For UI changes, preserve the Shadow DOM isolation and avoid adding global styles to the inspected app.

## Security and privacy

Never add automatic collection or upload of source, prompts, repository history, or agent sessions without an explicit opt-in design and a documented threat model.
