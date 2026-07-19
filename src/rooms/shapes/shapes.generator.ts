import { createRandomSource } from "../../engine/random/randomSource";
import {
  SHAPE_COLORS,
  SHAPE_KINDS,
  SHAPE_SLOT_IDS,
  SHAPE_SIZES,
  type ShapeFactoryDefinition,
  type ShapeFactoryStep,
  type ShapeItem,
  type ShapePuzzleDefinition,
  type ShapeRule,
} from "./shapes.types";

const MAX_GENERATION_ATTEMPTS = 8;

export const INTRO_FACTORY_TARGETS = [
  { kind: "square", size: "small", color: "red" },
  { kind: "circle", size: "big", color: "blue" },
  { kind: "triangle", size: "small", color: "yellow" },
  { kind: "diamond", size: "big", color: "green" },
] as const satisfies readonly ShapeRule[];

export function generateShapeFactory(
  seed: string,
  targets: readonly ShapeRule[] = INTRO_FACTORY_TARGETS,
): ShapeFactoryDefinition {
  if (targets.length !== SHAPE_SLOT_IDS.length) {
    throw new Error(`A shape factory activity requires ${SHAPE_SLOT_IDS.length} targets`);
  }
  const definition: ShapeFactoryDefinition = {
    schemaVersion: 1,
    id: `shape-factory:${seed}`,
    seed,
    steps: targets.map((target, index) => {
      const slot = SHAPE_SLOT_IDS[index];
      if (!slot) throw new Error(`Missing machine slot ${index}`);
      return {
        id: `factory-step-${index + 1}`,
        slot,
        puzzle: generateShapePuzzle(`${seed}:step-${index + 1}`, target),
      };
    }),
  };
  if (!validateShapeFactory(definition)) {
    throw new Error(`Unable to generate a valid shape factory activity for seed ${seed}`);
  }
  return definition;
}

export function generateShapePuzzle(
  seed: string,
  requestedTarget?: ShapeRule,
): ShapePuzzleDefinition {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const random = createRandomSource(`${seed}:${attempt}`);
    const target: ShapeRule = requestedTarget ?? {
      kind: random.pick(SHAPE_KINDS),
      size: random.pick(SHAPE_SIZES),
      color: random.pick(SHAPE_COLORS),
    };
    const alternatives = combinations().filter((rule) => !matchesRule(rule, target));
    const distractors = random.shuffle(alternatives).slice(0, 3);
    const rules = random.shuffle([target, ...distractors]);
    const definition: ShapePuzzleDefinition = {
      schemaVersion: 1,
      id: `shapes:${seed}`,
      seed,
      target,
      items: rules.map((rule, index) => ({ id: `shape-${index}`, ...rule })),
    };
    if (validateShapePuzzle(definition)) return definition;
  }
  throw new Error(`Unable to generate a valid shape puzzle for seed ${seed}`);
}

export function matchesRule(item: ShapeRule, target: ShapeRule): boolean {
  return item.kind === target.kind && item.size === target.size && item.color === target.color;
}

export function validateShapePuzzle(value: unknown): value is ShapePuzzleDefinition {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.schemaVersion !== 1 ||
    typeof candidate.id !== "string" ||
    typeof candidate.seed !== "string" ||
    !validRule(candidate.target) ||
    !Array.isArray(candidate.items) ||
    candidate.items.length < 2 ||
    candidate.items.length > 6
  ) {
    return false;
  }
  const items = candidate.items as unknown[];
  if (!items.every(validItem)) return false;
  const typedItems = items;
  if (new Set(typedItems.map((item) => item.id)).size !== typedItems.length) return false;
  return typedItems.filter((item) => matchesRule(item, candidate.target as ShapeRule)).length === 1;
}

export function validateShapeFactory(value: unknown): value is ShapeFactoryDefinition {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.schemaVersion !== 1 ||
    typeof candidate.id !== "string" ||
    typeof candidate.seed !== "string" ||
    !Array.isArray(candidate.steps) ||
    candidate.steps.length !== SHAPE_SLOT_IDS.length
  ) {
    return false;
  }
  const steps = candidate.steps as unknown[];
  if (
    !steps.every((value): value is ShapeFactoryStep =>
      Boolean(
        value &&
        typeof value === "object" &&
        typeof (value as Record<string, unknown>).id === "string" &&
        SHAPE_SLOT_IDS.includes(
          (value as Record<string, unknown>).slot as (typeof SHAPE_SLOT_IDS)[number],
        ) &&
        validateShapePuzzle((value as Record<string, unknown>).puzzle),
      ),
    )
  ) {
    return false;
  }
  if (new Set(steps.map((step) => step.id)).size !== steps.length) return false;
  if (new Set(steps.map((step) => step.slot)).size !== steps.length) return false;
  const targets = steps.map((step) => `${step.puzzle.target.color}:${step.puzzle.target.kind}`);
  return new Set(targets).size === targets.length;
}

function validItem(value: unknown): value is ShapeItem {
  return Boolean(
    value &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>).id === "string" &&
    validRule(value),
  );
}

function validRule(value: unknown): value is ShapeRule {
  if (!value || typeof value !== "object") return false;
  const rule = value as Record<string, unknown>;
  return (
    SHAPE_KINDS.includes(rule.kind as ShapeRule["kind"]) &&
    SHAPE_SIZES.includes(rule.size as ShapeRule["size"]) &&
    SHAPE_COLORS.includes(rule.color as ShapeRule["color"])
  );
}

function combinations(): ShapeRule[] {
  return SHAPE_KINDS.flatMap((kind) =>
    SHAPE_SIZES.flatMap((size) => SHAPE_COLORS.map((color) => ({ kind, size, color }))),
  );
}
