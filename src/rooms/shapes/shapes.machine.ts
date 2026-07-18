import { matchesRule } from "./shapes.generator";
import type { ShapeFactoryEvent, ShapeFactoryState, ShapePuzzleDefinition } from "./shapes.types";

export function createShapeFactoryState(definition: ShapePuzzleDefinition): ShapeFactoryState {
  return {
    phase: "intro",
    definition,
    mismatchCount: 0,
    hintLevel: 0,
    conveyorPaused: false,
    feedback: "ready",
  };
}

export function reduceShapeFactory(
  state: ShapeFactoryState,
  event: ShapeFactoryEvent,
): ShapeFactoryState {
  if (event.type === "RESET") return createShapeFactoryState(event.definition);

  switch (event.type) {
    case "PAUSE":
      return canInteract(state)
        ? { ...state, phase: "paused", pausedFrom: state.phase as "waiting" | "hint" }
        : state;
    case "RESUME": {
      if (state.phase !== "paused" || !state.pausedFrom) return state;
      const { pausedFrom, ...rest } = state;
      return { ...rest, phase: pausedFrom };
    }
    case "RECOVER":
      return {
        phase: "waiting",
        definition: state.definition,
        mismatchCount: state.mismatchCount,
        hintLevel: state.hintLevel,
        conveyorPaused: false,
        feedback: "recovered",
      };
    case "INTRO_FINISHED":
      return state.phase === "intro" ? { ...state, phase: "waiting" } : state;
    case "DRAG_STARTED":
      return canInteract(state) ? { ...state, conveyorPaused: true } : state;
    case "DRAG_CANCELED":
      return canInteract(state)
        ? { ...state, conveyorPaused: false, feedback: "returning" }
        : state;
    case "ITEM_DROPPED":
      return dropItem(state, event.itemId, event.insideOpening);
    case "RETURN_FINISHED":
      return state.feedback === "returning" ? { ...state, feedback: "ready" } : state;
    case "PROCESSING_FINISHED":
      return state.phase === "processing" && state.processingItemId
        ? {
            ...state,
            phase: "output",
            outputItemId: state.processingItemId,
            feedback: "made",
          }
        : state;
    case "OUTPUT_FINISHED":
      return state.phase === "output" ? { ...state, phase: "celebrating" } : state;
    case "CELEBRATION_FINISHED":
      return state.phase === "celebrating" ? { ...state, phase: "complete" } : state;
    case "HINT_TIMEOUT":
      return canInteract(state)
        ? {
            ...state,
            phase: "hint",
            hintLevel: Math.min(2, state.hintLevel + 1) as 1 | 2,
          }
        : state;
    default:
      return state;
  }
}

function dropItem(
  state: ShapeFactoryState,
  itemId: string,
  insideOpening: boolean,
): ShapeFactoryState {
  if (!canInteract(state)) return state;
  const item = state.definition.items.find((candidate) => candidate.id === itemId);
  if (!insideOpening || !item || !matchesRule(item, state.definition.target)) {
    const mismatchCount = state.mismatchCount + 1;
    return {
      ...state,
      phase: "waiting",
      conveyorPaused: false,
      mismatchCount,
      hintLevel: mismatchCount >= 2 ? 2 : (Math.max(1, state.hintLevel) as 1 | 2),
      feedback: "returning",
    };
  }
  return {
    ...state,
    phase: "processing",
    conveyorPaused: true,
    processingItemId: item.id,
    hintLevel: 0,
    feedback: "processing",
  };
}

function canInteract(state: ShapeFactoryState): boolean {
  return state.phase === "waiting" || state.phase === "hint";
}
