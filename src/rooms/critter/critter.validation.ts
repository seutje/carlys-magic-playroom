import {
  CRITTER_BODIES,
  CRITTER_COLORS,
  CRITTER_PARTS,
  CRITTER_PATTERNS,
  CRITTER_REACTIONS,
} from "./critter.content";
import {
  CRITTER_SOCKET_IDS,
  type CritterPartDefinition,
  type SavedCreature,
} from "./critter.types";

export function findCritterPart(partId: string): CritterPartDefinition | undefined {
  return CRITTER_PARTS.find((part) => part.id === partId);
}

export function isPartCompatible(
  bodyId: SavedCreature["bodyId"],
  part: CritterPartDefinition,
): boolean {
  return part.compatibleBodies.includes(bodyId);
}

export function validateSavedCreature(value: unknown): value is SavedCreature {
  if (!value || typeof value !== "object") return false;
  const creature = value as Record<string, unknown>;
  if (
    creature.schemaVersion !== 1 ||
    typeof creature.id !== "string" ||
    !CRITTER_BODIES.some((body) => body.id === creature.bodyId) ||
    !CRITTER_COLORS.includes(creature.color as SavedCreature["color"]) ||
    !CRITTER_PATTERNS.includes(creature.pattern as SavedCreature["pattern"]) ||
    !CRITTER_REACTIONS.includes(creature.reaction as SavedCreature["reaction"]) ||
    typeof creature.savedAt !== "number" ||
    !creature.parts ||
    typeof creature.parts !== "object"
  ) {
    return false;
  }
  const parts = creature.parts as Record<string, unknown>;
  return CRITTER_SOCKET_IDS.every((socketId) => {
    const part = findCritterPart(String(parts[socketId]));
    return (
      part?.socketId === socketId &&
      isPartCompatible(creature.bodyId as SavedCreature["bodyId"], part)
    );
  });
}

export function migrateSavedCreature(value: unknown): SavedCreature | undefined {
  if (validateSavedCreature(value)) return value;
  if (!value || typeof value !== "object") return undefined;
  const legacy = value as Record<string, unknown>;
  if (legacy.schemaVersion !== 0) return undefined;
  const migrated = {
    schemaVersion: 1,
    id: typeof legacy.id === "string" ? legacy.id : "legacy-creature",
    bodyId: legacy.body === "tall" ? "tall" : "round",
    color: CRITTER_COLORS.includes(legacy.color as SavedCreature["color"])
      ? legacy.color
      : "lavender",
    pattern: "plain",
    parts: { eyes: legacy.eyes, mouth: legacy.mouth, legs: legacy.legs },
    reaction: "wave",
    savedAt: typeof legacy.savedAt === "number" ? legacy.savedAt : 0,
  };
  return validateSavedCreature(migrated) ? migrated : undefined;
}
