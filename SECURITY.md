# Security

UIBlame v0.1 is designed to run locally inside a Vite development server. It reads source files, Git metadata and optional provenance records from the current project root.

## Important limitations

- `.uiblame/provenance.jsonl` is a local evidence record, not a signed attestation.
- Anyone who can edit the repository can edit that file.
- A `Verified AI` result means the current code matches the configured local record; it does not cryptographically prove that the record itself is authentic.
- Raw prompts can contain secrets. The CLI hashes prompt text by default and stores raw text only when `--store-prompt` is explicitly used.
- Source paths are constrained to the project root. Symbolic source paths are rejected in v0.1.
- Git commands use argument arrays rather than shell command strings.
- The local inspection endpoint is intended for trusted development environments only.
- The plugin is registered only for Vite's development server; CI checks that the production demo contains no UIBlame runtime/source markers.

Do not expose a UIBlame-enabled Vite dev server to untrusted networks.

For the full trust-boundary discussion, see [docs/threat-model.md](docs/threat-model.md).

Signed or tamper-evident provenance is planned for a later version.
