# Codex handoff — UIBlame v0.2.0 automatic Codex adapter

Issue: https://github.com/Trin0110/UIBlame/issues/7  
Branch: `codex/v0.2-codex-adapter`

## Mission

Implement the first UIBlame v0.2 agent adapter so a supported Codex workflow can record provenance automatically after one-time setup.

The intended UX is:

```text
Codex edits source
        ↓
UIBlame captures evidence automatically
        ↓
developer does not run uiblame record after every edit
        ↓
Vite app + UIBlame inspection mode
        ↓
hover rendered element
        ↓
Git author + source location + Codex provenance/session
```

Git author is already automatic from `git blame`. Your job is to automate the Codex provenance side without guessing.

## Phase 0 — read and inspect before coding

Read:

- `AGENTS.md`
- `README.md`
- `ROADMAP.md`
- `docs/architecture.md`
- `docs/provenance-spec.md`
- `docs/threat-model.md`
- `packages/uiblame/src/*`
- `packages/uiblame/test/*`
- `scripts/check-browser.mjs`

Then inspect the actual Codex environment/workflow and determine which stable machine-readable evidence is genuinely available.

Possible categories to investigate include local session metadata, hooks, structured output/logs, environment variables, or another documented Codex integration surface. These are examples to investigate, **not assumptions**.

Do not invent a Codex API, hidden file path, or undocumented contract.

Before implementation, write a short design note in the repository documenting:

1. evidence source chosen;
2. why it is trustworthy enough for the status claimed;
3. how sessions are identified;
4. how file/range edits are derived;
5. privacy behavior;
6. failure behavior;
7. limitations.

## Non-negotiable trust rules

UIBlame is evidence-based provenance, not detection.

Never infer Codex authorship from:
- code style;
- comments;
- formatting;
- syntax;
- commit messages;
- model likelihood;
- filenames;
- timing correlation alone.

Missing evidence stays `Unknown`.

A recorded claim that no longer matches strong current evidence stays `Recorded AI`.

Only use `Verified AI` when the existing strong-evidence semantics are satisfied.

Do not silently upload source, prompts, Git history, or session data.

## Adapter architecture

Add a small reusable adapter/conformance layer for agents.

It should be capable of producing provenance-compatible records containing, where genuinely available:

- `agent: "codex"`
- session identifier
- project-relative file
- inclusive line range(s)
- prompt hash
- raw prompt only with explicit opt-in
- source-range content hash
- commit when known
- timestamp
- explainable adapter/evidence metadata if needed

Keep backward compatibility with v0.1 JSONL records where possible.

Do not build a large plugin framework.

## Automatic capture requirement

After one-time setup, a supported Codex workflow must not require developers to manually run `uiblame record` after every edit.

Choose the most natural mechanism supported by the real Codex evidence surface you discovered.

If the current Codex environment cannot support truly automatic capture reliably, implement the strongest evidence-backed integration possible, keep claims conservative, and document the exact remaining manual step. Do not simulate automatic capture with heuristics.

The existing manual `uiblame record` command must continue to work.

## Privacy

Default:
- do not persist raw prompt text;
- storing a SHA-256 prompt hash is allowed;
- no network upload;
- no telemetry.

Raw prompt persistence, if supported, must require an explicit opt-in.

Tests must prove the default does not store raw prompts.

## Browser behavior

Preserve v0.1.1 hover-first behavior.

When evidence exists, hover should continue to show:
- Git author
- source location
- Codex provenance status/agent

Click should continue to open full details.

No Codex evidence → `AI Unknown`.

## Required tests

At minimum:

- adapter unit tests;
- adapter conformance fixture(s);
- missing evidence;
- malformed evidence;
- raw prompt privacy default;
- deterministic Codex evidence fixture ingestion;
- current-hash/commit verification;
- `Verified AI`;
- `Recorded AI`;
- `Unknown`;
- existing manual record CLI regression;
- production leakage regression;
- existing hover Chromium regression.

Add an end-to-end fixture proving:

```text
Codex evidence
→ adapter capture/ingestion
→ provenance record
→ source/Git evidence match
→ Verified AI
```

If the test uses fixture data rather than a real live Codex session, label it honestly as a fixture test.

If the environment permits a real Codex integration test, run it separately and report exactly what was exercised.

## Verification

Run the repository's existing checks plus all new adapter checks.

Expected baseline:

```bash
npm ci
npm run check
npm run pack:check
```

For browser behavior, run the Chromium regression workflow/test used by the repository.

Do not claim a test passed unless you executed it.

## Scope exclusions

Do not implement:
- Claude Code;
- visual history/time travel;
- VS Code/Cursor extension;
- cloud backend/accounts;
- signed attestations;
- AI probability scoring;
- Vue/Svelte/Solid.

## Delivery

Work only on:

```text
codex/v0.2-codex-adapter
```

When complete:

1. update README/architecture/provenance documentation;
2. provide exact commands/tests run;
3. state the exact Codex evidence source used;
4. state whether the workflow is truly automatic after setup;
5. document any unvalidated platform/workflow;
6. open a PR to `main`;
7. do **not** merge the PR;
8. do **not** tag/release;
9. do **not** publish npm.

The PR should reference issue #7.
