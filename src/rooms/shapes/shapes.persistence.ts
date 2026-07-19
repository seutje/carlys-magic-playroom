import { diagnostics } from "../../engine/diagnostics/diagnostics";
import { loadSaveData, updateSaveData } from "../../persistence/saveData";
import type { ShapeFactoryDefinition } from "./shapes.types";

export interface ShapeProgress {
  readonly schemaVersion: 1;
  readonly completedActivities: number;
  readonly skillAttempts: number;
  readonly skillSuccesses: number;
  readonly recentCompletionIds: readonly string[];
  readonly lastPlayedAt?: string;
}

export const defaultShapeProgress: ShapeProgress = {
  schemaVersion: 1,
  completedActivities: 0,
  skillAttempts: 0,
  skillSuccesses: 0,
  recentCompletionIds: [],
};

export function migrateShapeProgress(value: unknown): ShapeProgress {
  if (!value || typeof value !== "object") return defaultShapeProgress;
  const progress = value as Record<string, unknown>;
  if (progress.schemaVersion === 0) {
    return { ...defaultShapeProgress, completedActivities: safeInteger(progress.completed) };
  }
  if (progress.schemaVersion !== 1) return defaultShapeProgress;
  const lastPlayedAt =
    typeof progress.lastPlayedAt === "string" ? progress.lastPlayedAt : undefined;
  return {
    schemaVersion: 1,
    completedActivities: safeInteger(progress.completedActivities),
    skillAttempts: safeInteger(progress.skillAttempts),
    skillSuccesses: safeInteger(progress.skillSuccesses),
    recentCompletionIds: Array.isArray(progress.recentCompletionIds)
      ? progress.recentCompletionIds.filter((id): id is string => typeof id === "string").slice(-20)
      : [],
    ...(lastPlayedAt ? { lastPlayedAt } : {}),
  };
}

export async function loadShapeProgress(): Promise<ShapeProgress> {
  try {
    return migrateShapeProgress((await loadSaveData()).roomProgress.shapes);
  } catch {
    diagnostics.record({ category: "persistence", code: "shape-progress-load-failed" });
    return defaultShapeProgress;
  }
}

export async function recordShapeCompletion(
  _definition: ShapeFactoryDefinition,
  mismatchCount: number,
  completionId: string,
): Promise<ShapeProgress> {
  try {
    const save = await updateSaveData((current) => {
      const progress = migrateShapeProgress(current.roomProgress.shapes);
      if (progress.recentCompletionIds.includes(completionId)) return current;
      const next: ShapeProgress = {
        schemaVersion: 1,
        completedActivities: progress.completedActivities + 1,
        skillAttempts: progress.skillAttempts + mismatchCount + 1,
        skillSuccesses: progress.skillSuccesses + 1,
        recentCompletionIds: [...progress.recentCompletionIds, completionId].slice(-20),
        lastPlayedAt: new Date().toISOString(),
      };
      return { ...current, roomProgress: { ...current.roomProgress, shapes: next } };
    });
    return migrateShapeProgress(save.roomProgress.shapes);
  } catch {
    diagnostics.record({ category: "persistence", code: "shape-progress-save-failed" });
    return defaultShapeProgress;
  }
}

function safeInteger(value: unknown): number {
  return Number.isSafeInteger(value) && (value as number) >= 0 ? (value as number) : 0;
}
