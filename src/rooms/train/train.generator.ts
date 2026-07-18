import { BASIC_COLORS } from "../../content/colors";
import { createRandomSource, type RandomSource } from "../../engine/random/randomSource";
import type {
  TrainActivityDefinition,
  TrainObjectCategory,
  TrainObjectDefinition,
  TrainTarget,
} from "./train.types";
import { validateTrainDefinition } from "./train.validation";

const CATEGORIES = ["duck", "ball", "apple"] as const satisfies readonly TrainObjectCategory[];
const MAX_GENERATION_ATTEMPTS = 5;

export interface TrainGenerationOptions {
  readonly seed: string;
  readonly difficulty: 1 | 2 | 3;
  readonly target?: TrainTarget;
}

export function generateTrainActivity(options: TrainGenerationOptions): TrainActivityDefinition {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const random = createRandomSource(`${options.seed}:attempt:${attempt}`);
    const definition = generateCandidate(options, random, attempt);
    if (validateTrainDefinition(definition)) return definition;
  }
  throw new Error("Unable to generate a valid train activity within the retry limit");
}

function generateCandidate(
  options: TrainGenerationOptions,
  random: RandomSource,
  attempt: number,
): TrainActivityDefinition {
  const target = options.target ?? generateTarget(options.difficulty, random);
  const choiceCount = options.difficulty === 1 ? 3 : options.difficulty === 2 ? 4 : 5;
  const objects: TrainObjectDefinition[] = [];

  for (let index = 0; index < target.count; index += 1) {
    objects.push({
      id: `toy-${attempt}-match-${index}`,
      category: target.category,
      color: target.color,
      startSlot: index,
    });
  }

  while (objects.length < choiceCount) {
    const distractor = generateDistractor(target, random, objects.length);
    objects.push({ ...distractor, id: `toy-${attempt}-distractor-${objects.length}` });
  }

  const shuffled = random.shuffle(objects).map((object, startSlot) => ({ ...object, startSlot }));

  return {
    schemaVersion: 1,
    id: `train:${options.seed}:${attempt}`,
    seed: options.seed,
    difficulty: options.difficulty,
    target,
    instruction: {
      id: "train.load-request",
      textKey: "train.instruction.load",
      audioKey: `instruction.train.${target.count}.${target.color}.${target.category}`,
      parameters: target,
    },
    objects: shuffled,
  };
}

function generateTarget(difficulty: 1 | 2 | 3, random: RandomSource): TrainTarget {
  const maxCount = difficulty === 1 ? 1 : difficulty === 2 ? 2 : 3;
  return {
    category: random.pick(CATEGORIES),
    color: random.pick(BASIC_COLORS),
    count: random.integer(1, maxCount) as 1 | 2 | 3,
  };
}

function generateDistractor(
  target: TrainTarget,
  random: RandomSource,
  startSlot: number,
): Omit<TrainObjectDefinition, "id"> {
  if (random.next() < 0.5) {
    return {
      category: target.category,
      color: pickDifferent(BASIC_COLORS, target.color, random),
      startSlot,
    };
  }
  return {
    category: pickDifferent(CATEGORIES, target.category, random),
    color: target.color,
    startSlot,
  };
}

function pickDifferent<T>(items: readonly T[], excluded: T, random: RandomSource): T {
  return random.pick(items.filter((item) => item !== excluded));
}
