import type {
  CritterBodyDefinition,
  CritterColor,
  CritterPartDefinition,
  CritterPattern,
  CritterReaction,
} from "./critter.types";

export const CRITTER_BODIES: readonly CritterBodyDefinition[] = [
  { id: "round", sockets: ["eyes", "mouth", "legs"] },
  { id: "tall", sockets: ["eyes", "mouth", "legs"] },
];

export const CRITTER_PARTS: readonly CritterPartDefinition[] = [
  { id: "eyes-round", socketId: "eyes", compatibleBodies: ["round", "tall"], symbol: "● ●" },
  { id: "eyes-star", socketId: "eyes", compatibleBodies: ["round", "tall"], symbol: "★ ★" },
  { id: "mouth-smile", socketId: "mouth", compatibleBodies: ["round", "tall"], symbol: "⌣" },
  { id: "mouth-o", socketId: "mouth", compatibleBodies: ["round", "tall"], symbol: "○" },
  { id: "legs-bouncy", socketId: "legs", compatibleBodies: ["round", "tall"], symbol: "∪ ∪" },
  { id: "legs-stompy", socketId: "legs", compatibleBodies: ["round"], symbol: "▮ ▮" },
  { id: "legs-tall", socketId: "legs", compatibleBodies: ["tall"], symbol: "│ │" },
];

export const CRITTER_COLORS: readonly CritterColor[] = ["lavender", "mint", "peach"];
export const CRITTER_PATTERNS: readonly CritterPattern[] = ["plain", "spots", "stripes"];
export const CRITTER_REACTIONS: readonly CritterReaction[] = ["wave", "bounce", "sparkle"];
