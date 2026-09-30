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

### Stabilization

- Commit the npm lockfile and use `npm ci` in CI.
- Align demo browser markers with the repository-level provenance store.
- Respect Vite base paths for inspector requests.
- Reject absolute source paths and symlinked parent directories.
- Normalize CLI source paths, reject malformed ranges, and preserve JSONL record boundaries.
- Resolve click targets without requiring hover and ignore stale inspection responses.
- Include the MIT license in the npm package and assert required package contents.
- Add real Vite endpoint and Chromium browser regression checks.
