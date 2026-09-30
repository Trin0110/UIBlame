# UIBlame Provenance Record v0.1

The v0.1 store is newline-delimited JSON at `.uiblame/provenance.jsonl`.

Example:

```json
{"schemaVersion":1,"file":"src/CheckoutButton.tsx","start":42,"end":58,"agent":"codex","session":"0199-example","promptHash":"<sha256>","contentHash":"<sha256>","commit":"<git-sha>","recordedAt":"2026-09-30T12:00:00.000Z"}
```

## Fields

- `schemaVersion`: integer schema identifier. v0.1 writes `1`.
- `file`: project-relative source path, normalized with `/` separators.
- `start`, `end`: inclusive 1-based line range.
- `agent`: producer identifier such as `codex`, `claude-code`, or `chatgpt`.
- `session`: optional local agent/session identifier.
- `prompt`: optional raw request. Treat as sensitive. The v0.1 CLI does **not** store raw text unless `--store-prompt` is supplied.
- `promptHash`: optional SHA-256 hash of the raw request.
- `contentHash`: SHA-256 hash of the normalized selected source bytes.
- `commit`: Git commit known when the record was created, if available.
- `recordedAt`: ISO-8601 timestamp.

## Matching

A source line is `Verified AI` when a covering record exists and at least one strong local match succeeds:

1. `record.commit` matches the commit returned by Git blame for the selected line; or
2. the current bytes in `record.file:record.start-record.end` hash to `record.contentHash`.

A covering record whose strong evidence no longer matches is `Recorded AI`.

No covering record is `Unknown`. Unknown does not mean human-written.

## Trust model

v0.1 proves only that current local evidence matches a local provenance record. It does **not** prove that the record itself is authentic, immutable, or produced by the claimed agent. Someone with repository write access can edit the JSONL store.

A later signed format can bind a record to an agent identity, repository state, and cryptographic signature.
