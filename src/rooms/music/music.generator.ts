import { createRandomSource } from "../../engine/random/randomSource";
import type {
  InstrumentId,
  MusicChoice,
  MusicConcept,
  MusicRoundDefinition,
  SoundVariant,
} from "./music.types";
import { INSTRUMENTS } from "./music.types";

export function generateMusicRound(seed: string, difficulty: 1 | 2 | 3): MusicRoundDefinition {
  const random = createRandomSource(seed);
  const concept: MusicConcept =
    difficulty === 1 ? "instrument" : difficulty === 2 ? "pitch" : "volume";
  const choices = createChoices(concept);
  const target = random.pick(choices);
  return {
    schemaVersion: 1,
    id: `music:${seed}:${difficulty}`,
    seed,
    difficulty,
    concept,
    targetChoiceId: target.id,
    choices,
  };
}

export function validateMusicRound(value: unknown): value is MusicRoundDefinition {
  if (!value || typeof value !== "object") return false;
  const round = value as Record<string, unknown>;
  if (
    round.schemaVersion !== 1 ||
    typeof round.id !== "string" ||
    typeof round.seed !== "string" ||
    ![1, 2, 3].includes(round.difficulty as number) ||
    !["instrument", "pitch", "volume"].includes(round.concept as string) ||
    typeof round.targetChoiceId !== "string" ||
    !Array.isArray(round.choices) ||
    round.choices.length < 2 ||
    !round.choices.every(validChoice)
  )
    return false;
  const ids = round.choices.map((choice) => choice.id);
  return (
    new Set(ids).size === ids.length && ids.filter((id) => id === round.targetChoiceId).length === 1
  );
}

function createChoices(concept: MusicConcept): MusicChoice[] {
  if (concept === "instrument") {
    return INSTRUMENTS.map((instrument) => choice(instrument, "normal"));
  }
  if (concept === "pitch") return [choice("bell", "high"), choice("bell", "low")];
  return [choice("drum", "loud"), choice("drum", "soft")];
}

function choice(instrument: InstrumentId, variant: SoundVariant): MusicChoice {
  const patterns = {
    drum: "boom",
    bell: "ring",
    xylophone: "sparkle",
    high: "up",
    low: "down",
    loud: "big",
    soft: "small",
  } as const;
  return {
    id: `${instrument}-${variant}`,
    instrument,
    variant,
    soundId: `${instrument}-${variant}`,
    visualPattern: variant === "normal" ? patterns[instrument] : patterns[variant],
  };
}

function validChoice(value: unknown): value is MusicChoice {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    INSTRUMENTS.includes(item.instrument as InstrumentId) &&
    ["normal", "high", "low", "loud", "soft"].includes(item.variant as string) &&
    item.soundId === `${String(item.instrument)}-${String(item.variant)}` &&
    ["boom", "ring", "sparkle", "up", "down", "big", "small"].includes(item.visualPattern as string)
  );
}
