import type { MusicChoice, SoundVariant } from "./music.types";

export interface MusicChoicePresentation {
  readonly choice: MusicChoice;
  readonly position: readonly [number, number, number];
  readonly sizeScale: number;
}

/**
 * Converts a serializable round into stage objects without making the renderer decide what a
 * sound concept means. Small bells are high and large bells are low; large drums are loud and
 * small drums are soft. The same scale mapping is used for loaded models and primitive fallbacks.
 */
export function presentMusicChoices(
  choices: readonly MusicChoice[],
): readonly MusicChoicePresentation[] {
  const xPositions = choicePositions(choices.length);
  return choices.map((choice, index) => ({
    choice,
    position: [xPositions[index] ?? 0, -0.8, 0],
    sizeScale: sizeScale(choice.variant),
  }));
}

function choicePositions(count: number): readonly number[] {
  if (count <= 1) return [0];
  if (count === 2) return [-2, 2];
  return Array.from({ length: count }, (_, index) => (index - (count - 1) / 2) * 3);
}

function sizeScale(variant: SoundVariant): number {
  switch (variant) {
    case "high":
    case "soft":
      return 0.68;
    case "low":
    case "loud":
      return 1.22;
    case "normal":
      return 1;
  }
}
