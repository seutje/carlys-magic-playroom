import type { ActivityPhase } from "../../engine/activity/activityState";

export const SHAPE_KINDS = ["circle", "square", "triangle"] as const;
export const SHAPE_SIZES = ["small", "big"] as const;
export const SHAPE_COLORS = ["blue", "red", "yellow"] as const;

export type ShapeKind = (typeof SHAPE_KINDS)[number];
export type ShapeSize = (typeof SHAPE_SIZES)[number];
export type ShapeColor = (typeof SHAPE_COLORS)[number];

export interface ShapeItem {
  readonly id: string;
  readonly kind: ShapeKind;
  readonly size: ShapeSize;
  readonly color: ShapeColor;
}

export interface ShapeRule {
  readonly kind: ShapeKind;
  readonly size: ShapeSize;
  readonly color: ShapeColor;
}

export interface ShapePuzzleDefinition {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly seed: string;
  readonly target: ShapeRule;
  readonly items: readonly ShapeItem[];
}

export interface ShapeFactoryState {
  readonly phase: ActivityPhase | "processing" | "output";
  readonly definition: ShapePuzzleDefinition;
  readonly mismatchCount: number;
  readonly hintLevel: 0 | 1 | 2;
  readonly conveyorPaused: boolean;
  readonly processingItemId?: string;
  readonly outputItemId?: string;
  readonly pausedFrom?: "waiting" | "hint";
  readonly feedback: "ready" | "returning" | "processing" | "made" | "recovered";
}

export type ShapeFactoryEvent =
  | { readonly type: "INTRO_FINISHED" }
  | { readonly type: "DRAG_STARTED" }
  | { readonly type: "DRAG_CANCELED" }
  | { readonly type: "ITEM_DROPPED"; readonly itemId: string; readonly insideOpening: boolean }
  | { readonly type: "RETURN_FINISHED" }
  | { readonly type: "PROCESSING_FINISHED" }
  | { readonly type: "OUTPUT_FINISHED" }
  | { readonly type: "CELEBRATION_FINISHED" }
  | { readonly type: "HINT_TIMEOUT" }
  | { readonly type: "PAUSE" }
  | { readonly type: "RESUME" }
  | { readonly type: "RECOVER" }
  | { readonly type: "RESET"; readonly definition: ShapePuzzleDefinition };
