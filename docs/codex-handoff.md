# Codex handoff — stabilize v0.1 before adding v0.2

UIBlame v0.1 is already implemented. The next coding-agent task is **verification and correction**, not feature expansion.

## Read first

1. `AGENTS.md`
2. `README.md`
3. `docs/architecture.md`
4. `docs/provenance-spec.md`
5. `docs/threat-model.md`
6. `docs/release-checklist.md`

## Required task

Start from the current repository state and make the v0.1 baseline reproducibly pass from a clean checkout.

Run:

```bash
npm install
npm run check
npm run pack:check
npm run dev
```

Then manually verify the demo interaction:

```text
rendered element
→ injected source marker
→ local inspector endpoint
→ source file/line
→ Git blame/commit/diff
→ provenance result
```

The dogfooded hero in `apps/demo/src/main.tsx` should resolve through the record in `.uiblame/provenance.jsonl`.

## Completion criteria

- clean install succeeds;
- a lockfile is generated and committed;
- TypeScript/package build succeeds on supported Node versions;
- all automated tests pass;
- production demo output contains no UIBlame dev runtime or source markers;
- npm dry-run packaging contains the CLI, plugin bundle, declarations and package README;
- demo starts and inspection works in a browser;
- the dogfood range reports `Verified AI`;
- an unrecorded line reports `Unknown`;
- changing a recorded range without new matching evidence reports `Recorded AI`;
- errors and malformed local provenance do not crash the dev server unexpectedly;
- README commands are truthful.

## Product invariants

Do not add an AI classifier or probability score.

Do not infer “human-written” from missing records.

Do not upload source, prompts, Git history or agent sessions by default.

Do not start Codex/Claude automatic session adapters, visual time travel, additional frameworks, cloud services or signed attestations in this task. Those belong after v0.1 is stable.

## Reporting

When finished, report:

- exact commands run;
- exact tests passed;
- bugs found and changes made;
- anything that could not be validated;
- whether v0.1 is ready to tag.

Never claim a check passed if it was not executed.
