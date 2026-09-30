# Changelog

## 0.1.0 — unreleased

- Initial Vite/JSX/TSX development plugin.
- Click-to-source browser overlay isolated with Shadow DOM.
- Local Git blame, commit metadata, diff, and working-tree status.
- Evidence-based AI provenance with commit and source-content hash matching.
- Versioned JSONL provenance schema.
- CLI commands: `init`, `record`, and headless `inspect`.
- Prompt text is hash-only by default unless `--store-prompt` is explicitly supplied.
- Project-root path validation and symbolic-source rejection.
- React + Vite dogfooding demo with a real local provenance record.
- Keyboard controls: Alt+Shift+B to toggle inspection, Escape to cancel/close.
- Automated end-to-end provenance tests and production-build leak check.
- CI coverage on Node 20 and 22 plus npm package dry-run validation.
