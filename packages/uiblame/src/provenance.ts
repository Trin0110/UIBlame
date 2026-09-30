import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { resolveSafeFile } from "./git.js";
import type { GitOrigin, ProvenanceRecord, ProvenanceResult, SourceLocation } from "./types.js";

export const PROVENANCE_FILE = path.join(".uiblame", "provenance.jsonl");
export const PROVENANCE_SCHEMA_VERSION = 1 as const;

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isProvenanceRecord(value: unknown): value is ProvenanceRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;

  return record.schemaVersion === PROVENANCE_SCHEMA_VERSION
    && typeof record.file === "string"
    && record.file.length > 0
    && Number.isInteger(record.start)
    && Number(record.start) >= 1
    && Number.isInteger(record.end)
    && Number(record.end) >= Number(record.start)
    && typeof record.agent === "string"
    && record.agent.length > 0
    && typeof record.recordedAt === "string"
    && isOptionalString(record.session)
    && isOptionalString(record.prompt)
    && isOptionalString(record.promptHash)
    && isOptionalString(record.contentHash)
    && isOptionalString(record.commit);
}

export async function readProvenance(root: string): Promise<ProvenanceRecord[]> {
  let raw: string;
  try {
    raw = await fs.readFile(path.join(root, PROVENANCE_FILE), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const parsed: unknown = JSON.parse(line);
        return isProvenanceRecord(parsed) ? [parsed] : [];
      } catch {
        return [];
      }
    });
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function hashPrompt(prompt: string) {
  return sha256(prompt);
}

export async function hashSourceRange(root: string, file: string, start: number, end: number) {
  const absoluteFile = await resolveSafeFile(root, file);
  const raw = await fs.readFile(absoluteFile, "utf8");
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
    .filter((record) =>
      record.file.replaceAll("\\", "/") === source.file
      && source.line >= record.start
      && source.line <= record.end
    )
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
        // A moved, deleted, unsafe, or otherwise unreadable range cannot be verified by content.
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
  if (!isProvenanceRecord(record)) {
    throw new Error("Refusing to write an invalid UIBlame provenance record.");
  }

  const dir = path.join(root, ".uiblame");
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(path.join(root, PROVENANCE_FILE), `${JSON.stringify(record)}\n`, "utf8");
}
