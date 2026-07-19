import { createRandomSource } from "../../engine/random/randomSource";
import type { GardenAction, GardenActivityDefinition } from "./garden.types";

export function generateGardenActivity(seed: string): GardenActivityDefinition {
  const random = createRandomSource(seed);
  const first = random.pick(["water", "sun"] as const);
  const other: GardenAction = first === "water" ? "sun" : "water";
  const task: readonly GardenAction[] = [first, other, first];
  return { schemaVersion: 1, id: `garden:${seed}:3`, seed, task };
}

export function validateGardenDefinition(value: unknown): value is GardenActivityDefinition {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.schemaVersion === 1 &&
    typeof candidate.id === "string" &&
    typeof candidate.seed === "string" &&
    Array.isArray(candidate.task) &&
    candidate.task.length === 3 &&
    candidate.task.every((action) => action === "water" || action === "sun")
  );
}
