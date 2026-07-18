import type { TrainActivityEvent, TrainActivityState, TrainPhase } from "./train.types";
import { isMatchingObject } from "./train.validation";

export const initialTrainState: TrainActivityState = {
  phase: "loading",
  loadedObjectIds: [],
  mismatchCount: 0,
  hintLevel: 0,
  completedOnce: false,
};

export function reduceTrainActivity(
  state: TrainActivityState,
  event: TrainActivityEvent,
): TrainActivityState {
  if (event.type === "EXIT")
    return state.phase === "exiting" ? state : { ...state, phase: "exiting" };
  if (event.type === "FAIL") return { ...state, phase: "error" };
  if (event.type === "RESET" && state.definition) {
    return { ...initialTrainState, phase: "intro", definition: state.definition };
  }
  if (event.type === "PAUSE") return pause(state);
  if (event.type === "RESUME") return resume(state);
  if (event.type === "RECOVER") return recover(state);

  switch (state.phase) {
    case "loading":
      return event.type === "LOADED"
        ? { ...initialTrainState, phase: "intro", definition: event.definition }
        : state;
    case "intro":
      return event.type === "INTRO_FINISHED" ? { ...state, phase: "instruction" } : state;
    case "instruction":
      return event.type === "INSTRUCTION_FINISHED" ? { ...state, phase: "waiting" } : state;
    case "waiting":
    case "hint":
      if (event.type === "HINT_TIMEOUT") return nextHint(state);
      if (event.type === "OBJECT_DROPPED") return evaluateDrop(state, event.objectId);
      return state;
    case "evaluating":
      if (event.type !== "EVALUATION_FINISHED") return state;
      if (state.loadedObjectIds.length === state.definition?.target.count) {
        return state.completedOnce
          ? state
          : { ...state, phase: "celebrating", completedOnce: true };
      }
      return { ...state, phase: "waiting" };
    case "celebrating":
      return event.type === "CELEBRATION_FINISHED" ? { ...state, phase: "complete" } : state;
    case "complete":
    case "paused":
    case "exiting":
    case "error":
      return state;
    default:
      return assertNever(state.phase);
  }
}

function evaluateDrop(state: TrainActivityState, objectId: string): TrainActivityState {
  const definition = state.definition;
  if (!definition) return { ...state, phase: "error" };
  if (state.loadedObjectIds.includes(objectId)) {
    return {
      ...state,
      phase: "evaluating",
      lastDrop: { objectId, result: "duplicate" },
    };
  }
  const object = definition.objects.find((candidate) => candidate.id === objectId);
  if (!object) return { ...state, phase: "error" };
  if (!isMatchingObject(definition, object)) {
    return {
      ...state,
      phase: "evaluating",
      mismatchCount: state.mismatchCount + 1,
      lastDrop: { objectId, result: "rejected" },
    };
  }
  if (state.loadedObjectIds.length >= definition.target.count) return state;
  return {
    ...state,
    phase: "evaluating",
    loadedObjectIds: [...state.loadedObjectIds, objectId],
    hintLevel: 0,
    lastDrop: { objectId, result: "accepted" },
  };
}

function nextHint(state: TrainActivityState): TrainActivityState {
  const hintLevel = Math.min(3, state.hintLevel + 1) as 1 | 2 | 3;
  return { ...state, phase: "hint", hintLevel };
}

function pause(state: TrainActivityState): TrainActivityState {
  if (!(["instruction", "waiting", "hint"] as readonly TrainPhase[]).includes(state.phase)) {
    return state;
  }
  return {
    ...state,
    phase: "paused",
    pausedFrom: state.phase as "instruction" | "waiting" | "hint",
  };
}

function resume(state: TrainActivityState): TrainActivityState {
  if (state.phase !== "paused" || !state.pausedFrom) return state;
  const { pausedFrom, ...rest } = state;
  return { ...rest, phase: pausedFrom };
}

function recover(state: TrainActivityState): TrainActivityState {
  if (state.phase === "error" && state.definition) {
    return { ...state, phase: "instruction", lastDrop: undefined };
  }
  if (state.phase === "evaluating") return { ...state, phase: "waiting", lastDrop: undefined };
  return state;
}

function assertNever(value: never): never {
  throw new Error(`Unexpected train phase: ${String(value)}`);
}
