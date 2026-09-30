# Threat model

UIBlame v0.1 is a local development tool. Its trust boundary is the developer machine and the repository being inspected.

## Assets

Potentially sensitive data includes:
- source code and local filesystem paths;
- Git authorship/history;
- raw prompts and prompt hashes;
- coding-agent session identifiers.

## Design protections

- The core has no cloud backend.
- The inspector calls a same-origin endpoint served by the local Vite dev server.
- Files are resolved under the configured project root before inspection.
- Git is invoked with `execFile` and argument arrays rather than shell interpolation.
- Browser-displayed source/Git/provenance strings are HTML-escaped.
- The Vite plugin uses `apply: "serve"`, so production builds are not instrumented.

## Trust limitations

`.uiblame/provenance.jsonl` is not a cryptographic attestation. A person with repository write access can modify it. Therefore v0.1 can verify that current code matches a local record, but cannot prove that the record itself is authentic.

A `Verified AI` label means **verified against the configured local record**, not globally proven authorship.

## Raw prompts

Raw prompts can contain secrets. Prefer prompt hashes when the text is not needed. Never automatically collect or upload prompt/session data.

## Development-server exposure

Developers should not expose a Vite dev server containing UIBlame to untrusted networks. The local inspector endpoint is intended for a trusted development environment.
