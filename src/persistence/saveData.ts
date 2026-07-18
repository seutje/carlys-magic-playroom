import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import type { RoomId } from "../types/domain";

export interface PersistedSettings {
  readonly muted: boolean;
  readonly masterVolume: number;
  readonly musicVolume: number;
  readonly speechVolume: number;
  readonly reducedMotion: boolean;
  readonly reducedEffects: boolean;
  readonly highContrast: boolean;
  readonly hintDelayMs: 3000 | 5000 | 8000;
  readonly enabledRooms: readonly RoomId[];
  readonly enabledLearningCategories: readonly LearningCategory[];
}

export type LearningCategory = "counting" | "creativity" | "nature" | "shapes" | "music";

export interface SaveData {
  readonly schemaVersion: 1;
  readonly settings: PersistedSettings;
  readonly roomProgress: Readonly<Partial<Record<RoomId, unknown>>>;
  readonly completedTutorials: readonly string[];
  readonly savedCreatures: readonly unknown[];
  readonly diagnosticCodes: readonly string[];
}

interface PlayroomDatabase extends DBSchema {
  save: { key: "root"; value: unknown };
  progress: { key: "train"; value: unknown };
}

const DATABASE_NAME = "carlys-magic-playroom";
const DATABASE_VERSION = 2;
const MAX_TUTORIALS = 100;
const MAX_CREATURES = 20;
const MAX_DIAGNOSTIC_CODES = 20;
let databasePromise: Promise<IDBPDatabase<PlayroomDatabase>> | undefined;

export const defaultSaveData: SaveData = {
  schemaVersion: 1,
  settings: {
    muted: false,
    masterVolume: 1,
    musicVolume: 0.8,
    speechVolume: 1,
    reducedMotion: false,
    reducedEffects: false,
    highContrast: false,
    hintDelayMs: 5000,
    enabledRooms: ["train", "critter", "garden", "shapes", "music"],
    enabledLearningCategories: ["counting", "creativity", "nature", "shapes", "music"],
  },
  roomProgress: {},
  completedTutorials: [],
  savedCreatures: [],
  diagnosticCodes: [],
};

export function migrateSaveData(value: unknown, legacyTrainProgress?: unknown): SaveData {
  if (!value || typeof value !== "object") {
    return legacyTrainProgress === undefined
      ? defaultSaveData
      : { ...defaultSaveData, roomProgress: { train: legacyTrainProgress } };
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion !== 1) return defaultSaveData;

  return {
    schemaVersion: 1,
    settings: recoverSettings(candidate.settings),
    roomProgress: recoverRoomProgress(candidate.roomProgress),
    completedTutorials: stringList(candidate.completedTutorials, MAX_TUTORIALS),
    savedCreatures: Array.isArray(candidate.savedCreatures)
      ? candidate.savedCreatures.slice(-MAX_CREATURES)
      : [],
    diagnosticCodes: stringList(candidate.diagnosticCodes, MAX_DIAGNOSTIC_CODES),
  };
}

export async function loadSaveData(): Promise<SaveData> {
  const database = await getDatabase();
  const transaction = database.transaction(["save", "progress"]);
  const [root, legacyTrain] = await Promise.all([
    transaction.objectStore("save").get("root"),
    transaction.objectStore("progress").get("train"),
  ]);
  await transaction.done;
  const save = migrateSaveData(root, legacyTrain);
  if (root === undefined && legacyTrain !== undefined) await database.put("save", save, "root");
  return save;
}

export async function updateSaveData(update: (current: SaveData) => SaveData): Promise<SaveData> {
  const database = await getDatabase();
  const transaction = database.transaction(["save", "progress"], "readwrite");
  const saveStore = transaction.objectStore("save");
  const [root, legacyTrain] = await Promise.all([
    saveStore.get("root"),
    transaction.objectStore("progress").get("train"),
  ]);
  const current = migrateSaveData(root, legacyTrain);
  const next = migrateSaveData(update(current));
  await saveStore.put(next, "root");
  await transaction.done;
  return next;
}

export async function resetSaveData(): Promise<void> {
  const database = await getDatabase();
  const transaction = database.transaction(["save", "progress"], "readwrite");
  await Promise.all([
    transaction.objectStore("save").clear(),
    transaction.objectStore("progress").clear(),
  ]);
  await transaction.done;
}

function getDatabase(): Promise<IDBPDatabase<PlayroomDatabase>> {
  databasePromise ??= openDB<PlayroomDatabase>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("progress")) database.createObjectStore("progress");
      if (!database.objectStoreNames.contains("save")) database.createObjectStore("save");
    },
  });
  return databasePromise;
}

function recoverSettings(value: unknown): PersistedSettings {
  if (!value || typeof value !== "object") return defaultSaveData.settings;
  const settings = value as Record<string, unknown>;
  return {
    muted: typeof settings.muted === "boolean" ? settings.muted : false,
    masterVolume:
      typeof settings.masterVolume === "number" && Number.isFinite(settings.masterVolume)
        ? Math.min(1, Math.max(0, settings.masterVolume))
        : 1,
    musicVolume: boundedVolume(settings.musicVolume, 0.8),
    speechVolume: boundedVolume(settings.speechVolume, 1),
    reducedMotion: typeof settings.reducedMotion === "boolean" && settings.reducedMotion,
    reducedEffects: typeof settings.reducedEffects === "boolean" && settings.reducedEffects,
    highContrast: typeof settings.highContrast === "boolean" && settings.highContrast,
    hintDelayMs: [3000, 5000, 8000].includes(settings.hintDelayMs as number)
      ? (settings.hintDelayMs as 3000 | 5000 | 8000)
      : 5000,
    enabledRooms: recoverStringUnion(settings.enabledRooms, [
      "train",
      "critter",
      "garden",
      "shapes",
      "music",
    ] as const),
    enabledLearningCategories: recoverStringUnion(settings.enabledLearningCategories, [
      "counting",
      "creativity",
      "nature",
      "shapes",
      "music",
    ] as const),
  };
}

function boundedVolume(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : fallback;
}

function recoverStringUnion<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return [...allowed];
  const recovered = [...new Set(value.filter((item): item is T => allowed.includes(item as T)))];
  return recovered.length > 0 ? recovered : [...allowed];
}

function recoverRoomProgress(value: unknown): SaveData["roomProgress"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const candidate = value as Record<string, unknown>;
  const valid: Partial<Record<RoomId, unknown>> = {};
  for (const roomId of ["train", "critter", "garden", "shapes", "music"] as const) {
    if (candidate[roomId] !== undefined) valid[roomId] = candidate[roomId];
  }
  return valid;
}

function stringList(value: unknown, limit: number): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(-limit)
    : [];
}
