# uiblame

Vite plugin and CLI for [UIBlame](https://github.com/Trin0110/UIBlame): evidence-based visual provenance for AI-assisted software.

UIBlame traces a rendered JSX/TSX element to its source line, local Git history and explicitly recorded AI provenance.

```bash
npm install -D uiblame
```

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { uiBlame } from 'uiblame';

export default defineConfig({
  plugins: [uiBlame(), react()]
});
```

Record provenance:

```bash
npx uiblame init
npx uiblame record --file src/App.tsx --lines 12:20 --agent codex --prompt "Update the CTA"
```

Prompt text is hashed but not stored by default. Add `--store-prompt` only when retaining the raw text is intentional.

Inspect headlessly:

```bash
npx uiblame inspect --file src/App.tsx --line 12
```

UIBlame is an evidence tool, **not** an AI-code classifier. Missing evidence is reported as `Unknown`, never as “human-written.”
