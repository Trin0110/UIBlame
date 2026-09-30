export type SourceLocation = {
  file: string;
  line: number;
  column: number;
};

export type GitOrigin = {
  available: boolean;
  commit?: string;
  author?: string;
  authorEmail?: string;
  authoredAt?: string;
  summary?: string;
  workingTreeModified?: boolean;
  diff?: string;
  error?: string;
};

export type ProvenanceRecord = {
  schemaVersion: 1;
  file: string;
  start: number;
  end: number;
  agent: string;
  session?: string;
  prompt?: string;
  promptHash?: string;
  contentHash?: string;
  commit?: string;
  recordedAt: string;
};

export type ProvenanceResult = {
  status: "verified-ai" | "recorded-ai" | "unknown";
  record?: ProvenanceRecord;
  reason: string;
};

export type InspectResult = {
  source: SourceLocation;
  git: GitOrigin;
  provenance: ProvenanceResult;
};
