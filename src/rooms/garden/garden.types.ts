import type { ActivityPhase } from "../../engine/activity/activityState";

export type GardenLevel = 0 | 1 | 2 | 3;
export type GrowthStage = "seed" | "sprout" | "bud" | "flower";
export type TimeOfDay = "day" | "night";
export type GardenVisitor = "none" | "bee" | "ladybug";
export type GardenAction = "water" | "sun";

export interface GardenActivityDefinition {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly seed: string;
  readonly task: readonly GardenAction[];
}

export interface GardenState {
  readonly phase: ActivityPhase;
  readonly definition: GardenActivityDefinition;
  readonly water: GardenLevel;
  readonly light: GardenLevel;
  readonly growth: GardenLevel;
  readonly timeOfDay: TimeOfDay;
  readonly visitor: GardenVisitor;
  readonly actionIndex: number;
  readonly mismatchCount: number;
  readonly hintLevel: 0 | 1 | 2;
  readonly lastAction?: GardenAction | undefined;
  readonly feedback: "ready" | "growing" | "extra" | "complete";
  readonly pausedFrom?: ActivityPhase | undefined;
}

export type GardenEvent =
  | { readonly type: "INTRO_FINISHED" }
  | { readonly type: "ACT"; readonly action: GardenAction }
  | { readonly type: "EFFECT_FINISHED" }
  | { readonly type: "CELEBRATION_FINISHED" }
  | { readonly type: "HINT_TIMEOUT" }
  | { readonly type: "RESET"; readonly definition: GardenActivityDefinition }
  | { readonly type: "PAUSE" }
  | { readonly type: "RESUME" }
  | { readonly type: "EXIT" }
  | { readonly type: "FAIL" }
  | { readonly type: "RECOVER" };

export const GROWTH_STAGES: Readonly<Record<GardenLevel, GrowthStage>> = {
  0: "seed",
  1: "sprout",
  2: "bud",
  3: "flower",
};
