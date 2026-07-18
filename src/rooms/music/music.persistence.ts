import { diagnostics } from "../../engine/diagnostics/diagnostics";
import { loadSaveData, updateSaveData } from "../../persistence/saveData";

export interface MusicProgress {
  readonly schemaVersion: 1;
  readonly completedRounds: number;
  readonly skillAttempts: number;
  readonly skillSuccesses: number;
  readonly concepts: readonly ("instrument" | "pitch" | "volume")[];
  readonly recentCompletionIds: readonly string[];
  readonly lastPlayedAt?: string;
}

export const defaultMusicProgress: MusicProgress = {
  schemaVersion: 1,
  completedRounds: 0,
  skillAttempts: 0,
  skillSuccesses: 0,
  concepts: [],
  recentCompletionIds: [],
};

export function migrateMusicProgress(value: unknown): MusicProgress {
  if (!value || typeof value !== "object") return defaultMusicProgress;
  const progress = value as Record<string, unknown>;
  if (progress.schemaVersion === 0) {
    return { ...defaultMusicProgress, completedRounds: safeInteger(progress.completed) };
  }
  if (progress.schemaVersion !== 1) return defaultMusicProgress;
  const lastPlayedAt =
    typeof progress.lastPlayedAt === "string" ? progress.lastPlayedAt : undefined;
  return {
    schemaVersion: 1,
    completedRounds: safeInteger(progress.completedRounds),
    skillAttempts: safeInteger(progress.skillAttempts),
    skillSuccesses: safeInteger(progress.skillSuccesses),
    concepts: Array.isArray(progress.concepts)
      ? [
          ...new Set(
            progress.concepts.filter(
              (item) => item === "instrument" || item === "pitch" || item === "volume",
            ),
          ),
        ]
      : [],
    recentCompletionIds: Array.isArray(progress.recentCompletionIds)
      ? progress.recentCompletionIds.filter((id): id is string => typeof id === "string").slice(-20)
      : [],
    ...(lastPlayedAt ? { lastPlayedAt } : {}),
  };
}

export async function loadMusicProgress(): Promise<MusicProgress> {
  try {
    return migrateMusicProgress((await loadSaveData()).roomProgress.music);
  } catch {
    diagnostics.record({ category: "persistence", code: "music-progress-load-failed" });
    return defaultMusicProgress;
  }
}

export async function recordMusicCompletion(
  concept: "instrument" | "pitch" | "volume",
  mismatchCount: number,
  completionId: string,
): Promise<MusicProgress> {
  try {
    const save = await updateSaveData((current) => {
      const progress = migrateMusicProgress(current.roomProgress.music);
      if (progress.recentCompletionIds.includes(completionId)) return current;
      const next: MusicProgress = {
        schemaVersion: 1,
        completedRounds: progress.completedRounds + 1,
        skillAttempts: progress.skillAttempts + mismatchCount + 1,
        skillSuccesses: progress.skillSuccesses + 1,
        concepts: [...new Set([...progress.concepts, concept])],
        recentCompletionIds: [...progress.recentCompletionIds, completionId].slice(-20),
        lastPlayedAt: new Date().toISOString(),
      };
      return { ...current, roomProgress: { ...current.roomProgress, music: next } };
    });
    return migrateMusicProgress(save.roomProgress.music);
  } catch {
    diagnostics.record({ category: "persistence", code: "music-progress-save-failed" });
    return defaultMusicProgress;
  }
}

function safeInteger(value: unknown): number {
  return Number.isSafeInteger(value) && (value as number) >= 0 ? (value as number) : 0;
}
