import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { GitOrigin, ProvenanceRecord, ProvenanceResult, SourceLocation } from "./types.js";

export const PROVENANCE_FILE = path.join(".uiblame", "provenance.jsonl");

export async function readProvenance(root: string): Promise<ProvenanceRecord[]> {
  try {
    const raw = await fs.readFile(path.join(root, PROVENANCE_FILE), "utf8");
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line) as ProvenanceRecord];
        } catch {
          return [];
        }
      });
  } catch {
    return [];
  }
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function hashPrompt(prompt: string) {
  return sha256(prompt);
}

export async function hashSourceRange(root: string, file: string, start: number, end: number) {
  const raw = await fs.readFile(path.resolve(root, file), "utf8");
  const lines = raw.replaceAll("\r\n", "\n").split("\n");
  if (start < 1 || end < start || end > lines.length) {
    throw new Error(`Source range ${start}:${end} is outside ${file}.`);
  }
  return sha256(lines.slice(start - 1, end).join("\n"));
}

export async function matchProvenance(
  root: string,
  source: SourceLocation,
  git: GitOrigin
): Promise<ProvenanceResult> {
  const records = await readProvenance(root);
  const candidates = records
    .filter((r) => r.file.replaceAll("\\", "/") === source.file && source.line >= r.start && source.line <= r.end)
    .sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt));

  for (const record of candidates) {
    if (record.commit && git.commit && record.commit === git.commit) {
      return {
        status: "verified-ai",
        record,
        reason: "The source range and Git commit match a recorded AI provenance entry."
      };
    }
    if (record.contentHash) {
      try {
        const currentHash = await hashSourceRange(root, record.file, record.start, record.end);
        if (currentHash === record.contentHash) {
          return {
            status: "verified-ai",
            record,
            reason: "The current source bytes match the SHA-256 hash captured in an AI provenance record."
          };
        }
      } catch {
        // A moved/deleted range simply cannot be verified by content at its old location.
      }
    }
  }

  if (candidates[0]) {
    return {
      status: "recorded-ai",
      record: candidates[0],
      reason: "An AI provenance record covers this line, but its commit/content evidence no longer matches exactly."
    };
  }

  return {
    status: "unknown",
    reason: "No provenance record covers this source line. Unknown does not mean human-written."
  };
}

export async function appendProvenance(root: string, record: ProvenanceRecord) {
  const dir = path.join(root, ".uiblame");
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(path.join(root, PROVENANCE_FILE), `${JSON.stringify(record)}\n`, "utf8");
}
