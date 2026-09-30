# Contributing to UIBlame

UIBlame is an evidence-first developer tool. Changes that affect provenance semantics should preserve one rule: **absence of evidence is never evidence of human authorship**.

## Development

```bash
npm ci
npm run check
npm run pack:check
npm run dev
```

The demo lives in `apps/demo`. The Vite plugin and local inspection engine live in `packages/uiblame`.

## Pull requests

Keep PRs focused. For provenance changes, include a fixture that demonstrates the exact evidence path. For UI changes, preserve the Shadow DOM isolation and avoid adding global styles to the inspected app.

## Security and privacy

Never add automatic collection or upload of source, prompts, repository history, or agent sessions without an explicit opt-in design and a documented threat model.

## Browser regression check

After building, start `npm run dev` in one terminal. In another:

```bash
npx playwright install chromium
npm run test:browser
```

The browser check temporarily edits the demo source and provenance store, restores both in `finally`, and saves screenshots in ignored `artifacts/`. Run it in an idle checkout with no concurrent edits to those files. Set `UIBLAME_CHROMIUM` to use an installed Chromium executable, or `UIBLAME_DEMO_URL` if Vite selected another URL.
