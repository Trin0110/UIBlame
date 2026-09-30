# Security

UIBlame's MVP is designed to run locally inside a Vite development server. It reads source files and Git metadata from the current project root.

## Important limitations

- `.uiblame/provenance.jsonl` is a local evidence record, not a signed attestation.
- Anyone who can edit the repository can edit that file.
- Raw prompts can contain secrets. Recording prompt text is optional and should be treated as sensitive project data.
- The local inspection endpoint is intended for development only and is not registered in production builds.

Signed/tamper-evident provenance is planned for a later version.
