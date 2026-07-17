import type { RoomId } from "../types/domain";

/** Canonical room ordering; room implementations are intentionally added in later phases. */
export const ROOM_IDS = [
  "train",
  "critter",
  "garden",
  "shapes",
  "music",
] as const satisfies readonly RoomId[];
