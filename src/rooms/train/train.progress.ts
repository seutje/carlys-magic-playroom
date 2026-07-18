import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import { diagnostics } from "../../engine/diagnostics/diagnostics";
import type { TrainActivityDefinition } from "./train.types";

export interface TrainSkillResult {
  readonly attempts: number;
  readonly successes: number;
}

export interface TrainProgress {
  readonly schemaVersion: 1;
  readonly completedActivities: number;
  readonly lastPlayedAt?: number | undefined;
  readonly recentCompletionIds: readonly string[];
  readonly skills: Readonly<Record<string, TrainSkillResult>>;
}

interface TrainDatabase extends DBSchema {
  progress: {
    key: "train";
    value: unknown;
  };
}

const DATABASE_NAME = "carlys-magic-playroom";
const DATABASE_VERSION = 1;
const MAX_RECENT_COMPLETIONS = 20;
let databasePromise: Promise<IDBPDatabase<TrainDatabase>> | undefined;

export const defaultTrainProgress: TrainProgress = {
  schemaVersion: 1,
  completedActivities: 0,
  recentCompletionIds: [],
  skills: {},
};

export async function loadTrainProgress(): Promise<TrainProgress> {
  try {
    const database = await getDatabase();
    return migrateTrainProgress(await database.get("progress", "train"));
  } catch {
    diagnostics.record({ category: "persistence", code: "train-progress-load-failed" });
    return defaultTrainProgress;
  }
}

export async function recordTrainCompletion(
  definition: TrainActivityDefinition,
  mismatchCount: number,
  completionId: string,
  now = Date.now(),
): Promise<TrainProgress> {
  try {
    const database = await getDatabase();
    const transaction = database.transaction("progress", "readwrite");
    const current = migrateTrainProgress(await transaction.store.get("train"));
    if (current.recentCompletionIds.includes(completionId)) {
      await transaction.done;
      return current;
    }

    const attempts = definition.target.count + mismatchCount;
    const skillIds = [
      `count-${definition.target.count}`,
      `color-${definition.target.color}`,
      `category-${definition.target.category}`,
    ];
    const skills = { ...current.skills };
    for (const skillId of skillIds) {
      const previous = skills[skillId] ?? { attempts: 0, successes: 0 };
      skills[skillId] = {
        attempts: previous.attempts + attempts,
        successes: previous.successes + 1,
      };
    }

    const next: TrainProgress = {
      schemaVersion: 1,
      completedActivities: current.completedActivities + 1,
      lastPlayedAt: now,
      recentCompletionIds: [...current.recentCompletionIds, completionId].slice(
        -MAX_RECENT_COMPLETIONS,
      ),
      skills,
    };
    await transaction.store.put(next, "train");
    await transaction.done;
    return next;
  } catch {
    diagnostics.record({ category: "persistence", code: "train-progress-save-failed" });
    return defaultTrainProgress;
  }
}

export function migrateTrainProgress(value: unknown): TrainProgress {
  if (!value || typeof value !== "object") return defaultTrainProgress;
  const candidate = value as Record<string, unknown>;

  if (candidate.schemaVersion === 0) {
    return {
      ...defaultTrainProgress,
      completedActivities: safeNonNegativeInteger(candidate.completedCount),
      lastPlayedAt: safeTimestamp(candidate.lastPlayedAt),
    };
  }

  if (candidate.schemaVersion !== 1) return defaultTrainProgress;
  const skills: Record<string, TrainSkillResult> = {};
  if (candidate.skills && typeof candidate.skills === "object") {
    for (const [skillId, rawResult] of Object.entries(candidate.skills)) {
      if (!rawResult || typeof rawResult !== "object") continue;
      const result = rawResult as Record<string, unknown>;
      skills[skillId] = {
        attempts: safeNonNegativeInteger(result.attempts),
        successes: safeNonNegativeInteger(result.successes),
      };
    }
  }

  return {
    schemaVersion: 1,
    completedActivities: safeNonNegativeInteger(candidate.completedActivities),
    lastPlayedAt: safeTimestamp(candidate.lastPlayedAt),
    recentCompletionIds: Array.isArray(candidate.recentCompletionIds)
      ? candidate.recentCompletionIds
          .filter((id): id is string => typeof id === "string")
          .slice(-MAX_RECENT_COMPLETIONS)
      : [],
    skills,
  };
}

export async function clearTrainProgressForTests(): Promise<void> {
  const database = await getDatabase();
  await database.clear("progress");
}

function getDatabase(): Promise<IDBPDatabase<TrainDatabase>> {
  databasePromise ??= openDB<TrainDatabase>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("progress")) {
        database.createObjectStore("progress");
      }
    },
  });
  return databasePromise;
}

function safeNonNegativeInteger(value: unknown): number {
  return Number.isSafeInteger(value) && (value as number) >= 0 ? (value as number) : 0;
}

function safeTimestamp(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}
