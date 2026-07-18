import type { ActivityPhase } from "../../engine/activity/activityState";

export const INSTRUMENTS = ["drum", "bell", "xylophone"] as const;
export type InstrumentId = (typeof INSTRUMENTS)[number];
export type SoundVariant = "normal" | "high" | "low" | "loud" | "soft";
export type MusicConcept = "instrument" | "pitch" | "volume";
export type SoundId = `${InstrumentId}-${SoundVariant}`;

export interface MusicChoice {
  readonly id: string;
  readonly instrument: InstrumentId;
  readonly variant: SoundVariant;
  readonly soundId: SoundId;
  readonly visualPattern: "boom" | "ring" | "sparkle" | "up" | "down" | "big" | "small";
}

export interface MusicRoundDefinition {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly seed: string;
  readonly difficulty: 1 | 2 | 3;
  readonly concept: MusicConcept;
  readonly targetChoiceId: string;
  readonly choices: readonly MusicChoice[];
}

export interface MusicState {
  readonly phase: ActivityPhase;
  readonly definition: MusicRoundDefinition;
  readonly mismatchCount: number;
  readonly hintLevel: 0 | 1 | 2;
  readonly pulse: number;
  readonly feedback: "ready" | "playful" | "correct" | "recovered";
  readonly selectedChoiceId?: string;
}

export type MusicEvent =
  | { readonly type: "INTRO_FINISHED" }
  | { readonly type: "TARGET_PLAYED" }
  | { readonly type: "SELECT"; readonly choiceId: string }
  | { readonly type: "EVALUATION_FINISHED" }
  | { readonly type: "CELEBRATION_FINISHED" }
  | { readonly type: "HINT_TIMEOUT" }
  | { readonly type: "RECOVER" }
  | { readonly type: "RESET"; readonly definition: MusicRoundDefinition };
