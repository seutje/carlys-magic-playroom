import { loadSaveData, updateSaveData } from "../../persistence/saveData";
import { diagnostics } from "../../engine/diagnostics/diagnostics";
import type { GardenActivityDefinition } from "./garden.types";

export interface GardenProgress {
  readonly schemaVersion: 1;
  readonly completedActivities: number;
  readonly concepts: readonly ("water" | "sun")[];
  readonly skillAttempts: number;
  readonly skillSuccesses: number;
  readonly recentCompletionIds: readonly string[];
}

export const defaultGardenProgress: GardenProgress = {
  schemaVersion: 1,
  completedActivities: 0,
  concepts: [],
  skillAttempts: 0,
  skillSuccesses: 0,
  recentCompletionIds: [],
};

export async function loadGardenProgress(): Promise<GardenProgress> {
  try {
    const save = await loadSaveData();
    return migrateGardenProgress(save.roomProgress.garden);
  } catch {
    diagnostics.record({ category: "persistence", code: "garden-progress-load-failed" });
    return defaultGardenProgress;
  }
}

export async function recordGardenCompletion(
  definition: GardenActivityDefinition,
  mismatchCount: number,
  completionId: string,
): Promise<GardenProgress> {
  try {
    const save = await updateSaveData((current) => {
      const progress = migrateGardenProgress(current.roomProgress.garden);
      if (progress.recentCompletionIds.includes(completionId)) return current;
      const concepts = [...new Set([...progress.concepts, ...definition.task])];
      const next: GardenProgress = {
        schemaVersion: 1,
        completedActivities: progress.completedActivities + 1,
        concepts,
        skillAttempts: progress.skillAttempts + definition.task.length + mismatchCount,
        skillSuccesses: progress.skillSuccesses + definition.task.length,
        recentCompletionIds: [...progress.recentCompletionIds, completionId].slice(-20),
      };
      return { ...current, roomProgress: { ...current.roomProgress, garden: next } };
    });
    return migrateGardenProgress(save.roomProgress.garden);
  } catch {
    diagnostics.record({ category: "persistence", code: "garden-progress-save-failed" });
    return defaultGardenProgress;
  }
}

export function migrateGardenProgress(value: unknown): GardenProgress {
  if (!value || typeof value !== "object") return defaultGardenProgress;
  const progress = value as Record<string, unknown>;
  if (progress.schemaVersion === 0) {
    return { ...defaultGardenProgress, completedActivities: safeInteger(progress.completed) };
  }
  if (progress.schemaVersion !== 1) return defaultGardenProgress;
  return {
    schemaVersion: 1,
    completedActivities: safeInteger(progress.completedActivities),
    concepts: Array.isArray(progress.concepts)
      ? [...new Set(progress.concepts.filter((item) => item === "water" || item === "sun"))]
      : [],
    skillAttempts: safeInteger(progress.skillAttempts),
    skillSuccesses: safeInteger(progress.skillSuccesses),
    recentCompletionIds: Array.isArray(progress.recentCompletionIds)
      ? progress.recentCompletionIds.filter((id): id is string => typeof id === "string").slice(-20)
      : [],
  };
}

function safeInteger(value: unknown): number {
  return Number.isSafeInteger(value) && (value as number) >= 0 ? (value as number) : 0;
}
