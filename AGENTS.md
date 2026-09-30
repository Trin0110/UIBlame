# AGENTS.md — UIBlame

This file defines repository-wide rules for coding agents.

## Product invariant

UIBlame is an **evidence-based provenance tool**, not an AI detector.

Never:
- infer AI authorship from code style, syntax, comments, formatting, model likelihood, or heuristics;
- label missing provenance as human-written;
- turn `Unknown` into a negative AI claim;
- upload source code, prompts, Git history, or agent sessions by default.

Always:
- distinguish a recorded claim from verified evidence;
- make the exact evidence path explainable to the user;
- preserve local-first operation for the core product;
- treat prompts and session material as potentially sensitive;
- fail to `Unknown` rather than overclaim.

## v0.1 status meanings

- `Verified AI`: a provenance record covers the source line and a strong local match succeeds (currently Git commit or SHA-256 source-range content).
- `Recorded AI`: a provenance record covers the line, but current evidence no longer matches exactly.
- `Unknown`: no matching provenance record exists. It does **not** mean human-written.

Do not change these semantics casually. Any change must include tests and documentation.

## Architecture constraints

- Vite instrumentation must be dev-only.
- Browser UI must remain isolated from the inspected app (Shadow DOM or equivalent).
- Local file paths received from the browser must be validated before filesystem or Git access.
- Use process execution APIs with argument arrays; do not construct shell command strings from user-controlled input.
- Production builds must not contain UIBlame source markers or the inspector runtime.
- Keep the core useful without an account, cloud service, or API key.

## Development

Expected validation before declaring a task complete:

```bash
npm install
npm run build
npm test
npm run dev
```

For UI/runtime changes, also verify manually that a demo element can be clicked and traced:
`DOM → source → Git → provenance`.

If the environment cannot run one of these steps, say exactly which step was not run and why. Never report a test as passing when it was not executed.

## Scope discipline

v0.1 is intentionally narrow: Vite + JSX/TSX, local Git, local JSONL provenance, and the inspector overlay.

Do not add cloud accounts, model-based classification, telemetry, databases, or large framework abstractions to v0.1.

Future work such as Codex/Claude adapters, signed attestations, visual time travel, and additional frameworks belongs after the v0.1 baseline is stable.
