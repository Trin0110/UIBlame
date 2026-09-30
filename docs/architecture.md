# Architecture

UIBlame v0.1 is split into four small layers.

```text
JSX/TSX source
   │
   │ Vite transform (dev only)
   ▼
data-uiblame-source="file|line|column"
   │
   │ browser overlay click
   ▼
/__uiblame/api/inspect
   │
   ├─ Git engine       → git blame / git show / status
   └─ Provenance store → range / commit / source-content hash
          │
          ▼
Verified AI / Recorded AI / Unknown
```

## Instrumentation

The plugin runs with `enforce: "pre"` and instruments native JSX elements before the React plugin compiles JSX. It adds a development-only `data-uiblame-source` marker containing a project-relative path and the JSX opening-element position.

The transform is not applied to production builds.

## Inspector runtime

The browser UI is injected by `transformIndexHtml`. It is rendered inside a Shadow DOM so its styles do not leak into the app and app styles do not accidentally restyle UIBlame.

When inspection mode is active, pointer movement finds the nearest instrumented DOM element. Clicking it requests evidence from the local Vite middleware.

## Git engine

The server uses `execFile`, not a shell command string. Source paths are resolved against the Vite root and rejected if they escape that root.

For a selected line UIBlame reads:

- `git blame --line-porcelain`
- working-tree modification status
- the blamed commit's file diff when available

## Provenance engine

The MVP uses `.uiblame/provenance.jsonl`. A record can include an agent name, session identifier, prompt/prompt hash, commit, and SHA-256 hash of the exact source range as it existed when recorded.

A result becomes **Verified AI** when the selected line is covered by a provenance record and at least one strong local match succeeds:

1. recorded commit == Git-blamed commit, or
2. current source bytes == recorded SHA-256 source-range hash.

Otherwise a covering record is **Recorded AI**. No covering record is **Unknown**.
