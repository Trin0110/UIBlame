#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs/promises";
import { appendProvenance, hashPrompt, hashSourceRange, PROVENANCE_FILE } from "./provenance.js";
import { currentCommit, resolveSafeFile } from "./git.js";

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
  const file = need(flags, "file").replaceAll("\\", "/");
  const lines = need(flags, "lines");
  const agent = need(flags, "agent");
  const [startText, endText = startText] = lines.split(":");
  const start = Number(startText);
  const end = Number(endText);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
    throw new Error("--lines must look like 42 or 42:58");
  }
  await resolveSafeFile(root, file);
  const contentHash = await hashSourceRange(root, file, start, end);
  const prompt = typeof flags.get("prompt") === "string" ? String(flags.get("prompt")) : undefined;
  const commit = typeof flags.get("commit") === "string" ? String(flags.get("commit")) : await currentCommit(root);
  const session = typeof flags.get("session") === "string" ? String(flags.get("session")) : undefined;
  await appendProvenance(root, {
    file,
    start,
    end,
    agent,
    session,
    prompt,
    promptHash: prompt ? hashPrompt(prompt) : undefined,
    contentHash,
    commit,
    recordedAt: new Date().toISOString()
  });
  console.log(`Recorded ${agent} provenance for ${file}:${start}-${end}${commit ? ` @ ${commit.slice(0, 10)}` : ""}`);
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));
  const root = path.resolve(typeof flags.get("root") === "string" ? String(flags.get("root")) : process.cwd());
  if (command === "init") return init(root);
  if (command === "record") return record(root, flags);
  console.log(`UIBlame v0.1\n\nCommands:\n  uiblame init\n  uiblame record --file src/App.tsx --lines 12:20 --agent codex [--session id] [--prompt text] [--commit hash]\n`);
}

main().catch((error) => {
  console.error(`UIBlame: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
