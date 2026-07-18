import { createRandomSource } from "../../engine/random/randomSource";
import type { GardenAction, GardenActivityDefinition } from "./garden.types";

export function generateGardenActivity(seed: string, steps: 1 | 2): GardenActivityDefinition {
  const random = createRandomSource(seed);
  const first = random.pick(["water", "sun"] as const);
  const task: readonly GardenAction[] =
    steps === 1 ? [first] : [first, first === "water" ? "sun" : "water"];
  return { schemaVersion: 1, id: `garden:${seed}:${steps}`, seed, task };
}

export function validateGardenDefinition(value: unknown): value is GardenActivityDefinition {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.schemaVersion === 1 &&
    typeof candidate.id === "string" &&
    typeof candidate.seed === "string" &&
    Array.isArray(candidate.task) &&
    (candidate.task.length === 1 || candidate.task.length === 2) &&
    candidate.task.every((action) => action === "water" || action === "sun")
  );
}
