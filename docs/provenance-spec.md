# UIBlame Provenance Record v0.1

The MVP store is newline-delimited JSON at `.uiblame/provenance.jsonl`.

Example:

```json
{"file":"src/CheckoutButton.tsx","start":42,"end":58,"agent":"codex","session":"0199-example","prompt":"Make the checkout CTA easier to notice on mobile","promptHash":"<sha256>","contentHash":"<sha256>","commit":"<git-sha>","recordedAt":"2026-09-30T12:00:00.000Z"}
```

## Fields

- `file`: project-relative source path, normalized with `/` separators.
- `start`, `end`: inclusive 1-based line range.
- `agent`: producer identifier such as `codex` or `claude-code`.
- `session`: optional local agent/session identifier.
- `prompt`: optional raw request. Treat as sensitive.
- `promptHash`: optional SHA-256 hash of the raw request.
- `contentHash`: SHA-256 hash of the normalized selected source bytes.
- `commit`: Git commit known when the record was created, if available.
- `recordedAt`: ISO-8601 timestamp.

## Trust model

v0.1 proves only that the current code matches a local provenance record. It does **not** prove that the record itself is authentic or untampered. A future signed format can bind records to an agent identity, repository state, and cryptographic signature.
