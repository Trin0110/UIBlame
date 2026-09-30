# uiblame

Vite plugin and CLI for [UIBlame](https://github.com/Trin0110/UIBlame).

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

UIBlame is an evidence tool, **not** an AI-code classifier. Missing evidence is reported as `Unknown`, never as “human-written.”
