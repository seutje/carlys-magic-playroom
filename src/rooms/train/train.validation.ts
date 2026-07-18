import { BASIC_COLORS } from "../../content/colors";
import type {
  TrainActivityDefinition,
  TrainObjectCategory,
  TrainObjectDefinition,
} from "./train.types";

const CATEGORIES: readonly TrainObjectCategory[] = ["duck", "ball", "apple"];

export function isMatchingObject(
  definition: TrainActivityDefinition,
  object: TrainObjectDefinition,
): boolean {
  return object.category === definition.target.category && object.color === definition.target.color;
}

export function validateTrainDefinition(value: unknown): value is TrainActivityDefinition {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.schemaVersion !== 1 ||
    typeof candidate.id !== "string" ||
    typeof candidate.seed !== "string" ||
    ![1, 2, 3].includes(candidate.difficulty as number) ||
    !candidate.target ||
    typeof candidate.target !== "object" ||
    !Array.isArray(candidate.objects)
  ) {
    return false;
  }

  const target = candidate.target as Record<string, unknown>;
  if (
    !CATEGORIES.includes(target.category as TrainObjectCategory) ||
    !BASIC_COLORS.includes(target.color as (typeof BASIC_COLORS)[number]) ||
    ![1, 2, 3].includes(target.count as number)
  ) {
    return false;
  }

  const ids = new Set<string>();
  let matching = 0;
  for (const rawObject of candidate.objects) {
    if (!rawObject || typeof rawObject !== "object") return false;
    const object = rawObject as Record<string, unknown>;
    if (
      typeof object.id !== "string" ||
      ids.has(object.id) ||
      !CATEGORIES.includes(object.category as TrainObjectCategory) ||
      !BASIC_COLORS.includes(object.color as (typeof BASIC_COLORS)[number]) ||
      !Number.isSafeInteger(object.startSlot)
    ) {
      return false;
    }
    ids.add(object.id);
    if (object.category === target.category && object.color === target.color) matching += 1;
  }

  return matching >= (target.count as number);
}
