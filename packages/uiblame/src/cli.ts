#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs/promises";
import { appendProvenance, hashPrompt, hashSourceRange, matchProvenance, PROVENANCE_FILE } from "./provenance.js";
import { currentCommit, inspectGit, resolveSafeFile } from "./git.js";

function parseArgs(argv: string[]) {
  const [command, ...rest] = argv;
  const flags = new Map<string, string | boolean>();
  for (let i = 0; i < rest.length; i++) {
    const item = rest[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = rest[i + 1];
    if (next && !next.startsWith("--")) {
      flags.set(key, next);
      i++;
    } else {
      flags.set(key, true);
    }
  }
  return { command, flags };
}

function need(flags: Map<string, string | boolean>, name: string) {
  const value = flags.get(name);
  if (!value || value === true) throw new Error(`Missing --${name}`);
  return value;
}

function parsePositiveInt(value: string, flag: string) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`--${flag} must be a positive integer`);
  }
  return parsed;
}

async function init(root: string) {
  const dir = path.join(root, ".uiblame");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(root, PROVENANCE_FILE);
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, "", "utf8");
  }
  console.log(`Created ${path.relative(root, file)}`);
  console.log("Add uiBlame() to vite.config.ts, then run your normal Vite dev command.");
}

async function record(root: string, flags: Map<string, string | boolean>) {
  const file = path.posix.normalize(need(flags, "file").replaceAll("\\", "/"));
  const lines = need(flags, "lines");
  const agent = need(flags, "agent");
  if (!/^\d+(?::\d+)?$/.test(lines)) throw new Error("--lines must look like 42 or 42:58");
  const [startText, endText = startText] = lines.split(":");
  const start = Number(startText);
  const end = Number(endText);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end < start) {
    throw new Error("--lines must look like 42 or 42:58");
  }

  await resolveSafeFile(root, file);
  const contentHash = await hashSourceRange(root, file, start, end);
  const promptInput = typeof flags.get("prompt") === "string" ? String(flags.get("prompt")) : undefined;
  const storePrompt = flags.get("store-prompt") === true;
  const commit = typeof flags.get("commit") === "string" ? String(flags.get("commit")) : await currentCommit(root);
  const session = typeof flags.get("session") === "string" ? String(flags.get("session")) : undefined;

  await appendProvenance(root, {
    schemaVersion: 1,
    file,
    start,
    end,
    agent,
    session,
    prompt: storePrompt ? promptInput : undefined,
    promptHash: promptInput ? hashPrompt(promptInput) : undefined,
    contentHash,
    commit,
    recordedAt: new Date().toISOString()
  });

  console.log(`Recorded ${agent} provenance for ${file}:${start}-${end}${commit ? ` @ ${commit.slice(0, 10)}` : ""}`);
  if (promptInput && !storePrompt) {
    console.log("Prompt text was not stored; only its SHA-256 hash was recorded. Use --store-prompt to keep raw text.");
  }
}

async function inspect(root: string, flags: Map<string, string | boolean>) {
  const file = path.posix.normalize(need(flags, "file").replaceAll("\\", "/"));
  const line = parsePositiveInt(need(flags, "line"), "line");
  const column = typeof flags.get("column") === "string"
    ? parsePositiveInt(String(flags.get("column")), "column")
    : 1;

  await resolveSafeFile(root, file);
  const source = { file, line, column };
  const git = await inspectGit(root, source);
  const provenance = await matchProvenance(root, source, git);
  process.stdout.write(`${JSON.stringify({ source, git, provenance }, null, 2)}\n`);
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));
  const root = path.resolve(typeof flags.get("root") === "string" ? String(flags.get("root")) : process.cwd());

  if (command === "init") return init(root);
  if (command === "record") return record(root, flags);
  if (command === "inspect") return inspect(root, flags);

  console.log(`UIBlame v0.1

Commands:
  uiblame init
  uiblame record --file src/App.tsx --lines 12:20 --agent codex [--session id] [--prompt text] [--store-prompt] [--commit hash]
  uiblame inspect --file src/App.tsx --line 12 [--column 1]

Privacy:
  --prompt is hashed by default. Add --store-prompt only when raw prompt text is safe to keep.
`);
}

main().catch((error) => {
  console.error(`UIBlame: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
