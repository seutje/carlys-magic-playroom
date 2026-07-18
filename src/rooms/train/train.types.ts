import type { BasicColor } from "../../content/colors";
import type { ActivityLifecycleEvent, ActivityPhase } from "../../engine/activity/activityState";
import type { InstructionDefinition } from "../../engine/instructions/instruction";

export type TrainObjectCategory = "duck" | "ball" | "apple";

export interface TrainObjectDefinition {
  readonly id: string;
  readonly category: TrainObjectCategory;
  readonly color: BasicColor;
  readonly startSlot: number;
}

export interface TrainTarget {
  readonly category: TrainObjectCategory;
  readonly color: BasicColor;
  readonly count: 1 | 2 | 3;
}

export type TrainInstruction = InstructionDefinition<
  "train.load-request",
  "train.instruction.load",
  string,
  {
    readonly count: 1 | 2 | 3;
    readonly color: BasicColor;
    readonly category: TrainObjectCategory;
  }
>;

export interface TrainActivityDefinition {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly seed: string;
  readonly difficulty: 1 | 2 | 3;
  readonly target: TrainTarget;
  readonly instruction: TrainInstruction;
  readonly objects: readonly TrainObjectDefinition[];
}

export type TrainPhase = ActivityPhase;

export type DropResult = "accepted" | "rejected" | "duplicate";

export interface TrainActivityState {
  readonly phase: TrainPhase;
  readonly definition?: TrainActivityDefinition;
  readonly loadedObjectIds: readonly string[];
  readonly mismatchCount: number;
  readonly hintLevel: 0 | 1 | 2 | 3;
  readonly lastDrop?: { readonly objectId: string; readonly result: DropResult } | undefined;
  readonly pausedFrom?: ActivityPhase | undefined;
  readonly completedOnce: boolean;
}

export type TrainActivityEvent =
  | { readonly type: "LOADED"; readonly definition: TrainActivityDefinition }
  | { readonly type: "INTRO_FINISHED" }
  | { readonly type: "INSTRUCTION_FINISHED" }
  | { readonly type: "OBJECT_DROPPED"; readonly objectId: string }
  | { readonly type: "EVALUATION_FINISHED" }
  | { readonly type: "HINT_TIMEOUT" }
  | { readonly type: "CELEBRATION_FINISHED" }
  | { readonly type: "RESET" }
  | ActivityLifecycleEvent;
