import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";
import type { GitOrigin, SourceLocation } from "./types.js";

const execFileAsync = promisify(execFile);
const ZERO_COMMIT = /^0+$/;

async function git(root: string, args: string[]) {
  const { stdout } = await execFileAsync("git", ["-C", root, ...args], {
    maxBuffer: 2 * 1024 * 1024,
    windowsHide: true
  });
  return stdout.toString();
}

export async function resolveSafeFile(root: string, relativeFile: string) {
  const absoluteRoot = path.resolve(root);
  const absoluteFile = path.resolve(absoluteRoot, relativeFile);
  const prefix = absoluteRoot.endsWith(path.sep) ? absoluteRoot : absoluteRoot + path.sep;
  if (absoluteFile !== absoluteRoot && !absoluteFile.startsWith(prefix)) {
    throw new Error("Source path escapes the project root.");
  }
  const stat = await fs.stat(absoluteFile);
  if (!stat.isFile()) throw new Error("Source path is not a file.");
  return absoluteFile;
}

function parsePorcelain(output: string) {
  const lines = output.split(/\r?\n/);
  const header = lines[0]?.trim().split(/\s+/) ?? [];
  const fields = new Map<string, string>();
  for (const line of lines.slice(1)) {
    if (!line || line.startsWith("\t")) continue;
    const i = line.indexOf(" ");
    if (i > 0) fields.set(line.slice(0, i), line.slice(i + 1));
  }
  return {
    commit: header[0],
    author: fields.get("author"),
    authorEmail: fields.get("author-mail")?.replace(/^<|>$/g, ""),
    authoredAt: fields.get("author-time")
      ? new Date(Number(fields.get("author-time")) * 1000).toISOString()
      : undefined,
    summary: fields.get("summary")
  };
}

export async function inspectGit(root: string, source: SourceLocation): Promise<GitOrigin> {
  await resolveSafeFile(root, source.file);
  try {
    await git(root, ["rev-parse", "--is-inside-work-tree"]);
  } catch {
    return { available: false, error: "This project is not inside a Git work tree yet." };
  }

  try {
    const porcelain = await git(root, [
      "blame",
      "--line-porcelain",
      "-L",
      `${source.line},${source.line}`,
      "--",
      source.file
    ]);
    const parsed = parsePorcelain(porcelain);
    const modified = (await git(root, ["status", "--porcelain", "--", source.file])).trim().length > 0;
    const commit = parsed.commit && !ZERO_COMMIT.test(parsed.commit) ? parsed.commit : undefined;

    let diff: string | undefined;
    if (commit) {
      try {
        diff = await git(root, ["show", "--format=", "--no-ext-diff", "--unified=3", commit, "--", source.file]);
        if (diff.length > 14000) diff = `${diff.slice(0, 14000)}\n… diff truncated by UIBlame`;
      } catch {
        diff = undefined;
      }
    }

    return {
      available: true,
      commit,
      author: parsed.author,
      authorEmail: parsed.authorEmail,
      authoredAt: parsed.authoredAt,
      summary: parsed.summary,
      workingTreeModified: modified,
      diff
    };
  } catch (error) {
    return {
      available: true,
      error: error instanceof Error ? error.message : "Unable to inspect Git history."
    };
  }
}

export async function currentCommit(root: string) {
  try {
    return (await git(root, ["rev-parse", "HEAD"])).trim() || undefined;
  } catch {
    return undefined;
  }
}
