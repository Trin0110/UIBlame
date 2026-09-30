# Roadmap

## v0.1 — Local evidence baseline

The first release establishes the trust model and proves the end-to-end interaction:

- Vite dev-only JSX/TSX source instrumentation
- click-to-source browser inspector
- Git blame, commit metadata and diff
- local JSONL provenance records
- commit/content-hash evidence verification
- CLI to initialize, record and inspect provenance
- automated tests for instrumentation and provenance behavior
- local-first privacy and security documentation

## v0.2 — Agent adapters

- Codex session/provenance adapter
- Claude Code session/provenance adapter
- prompt redaction controls
- agent/session deep links where locally available
- adapter conformance fixtures

## v0.3 — History

- component/element history across commits
- visual time travel
- renamed/moved source tracking
- richer diff presentation

## Later

- signed or tamper-evident provenance
- Git notes backend
- VS Code/Cursor integration
- Vue, Svelte and Solid adapters
- repository-level contribution maps based only on recorded evidence
