export type DiagnosticCategory =
  "asset" | "audio" | "render" | "persistence" | "activity" | "performance";

export interface DiagnosticInput {
  readonly category: DiagnosticCategory;
  readonly code: string;
}

export interface DiagnosticRecord extends DiagnosticInput {
  readonly occurredAt: number;
}

export interface DiagnosticStore {
  record(input: DiagnosticInput): void;
  read(): readonly DiagnosticRecord[];
  clear(): void;
}

const STORAGE_KEY = "carlys-magic-playroom:diagnostics:v1";
const MAX_RECORDS = 50;

function isRecord(value: unknown): value is DiagnosticRecord {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.category === "string" &&
    typeof candidate.code === "string" &&
    typeof candidate.occurredAt === "number"
  );
}

function readRecords(): DiagnosticRecord[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isRecord).slice(-MAX_RECORDS) : [];
  } catch {
    return [];
  }
}

export const diagnostics: DiagnosticStore = {
  record(input) {
    try {
      const records = [...readRecords(), { ...input, occurredAt: Date.now() }].slice(-MAX_RECORDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // Diagnostics are best effort and must never make play unavailable.
    }
  },
  read: readRecords,
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage may be blocked; an already-empty in-memory view is still safe.
    }
  },
};
