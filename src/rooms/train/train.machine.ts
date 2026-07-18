import { reduceActivityLifecycle } from "../../engine/activity/activityState";
import { nextHintStep } from "../../engine/hints/hintPlan";
import { TRAIN_HINT_PLAN } from "./train.hints";
import type { TrainActivityEvent, TrainActivityState } from "./train.types";
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
  if (event.type === "RESET" && state.definition) {
    return { ...initialTrainState, phase: "intro", definition: state.definition };
  }
  const lifecycleState = reduceActivityLifecycle(state, event, {
    pausable: ["instruction", "waiting", "hint"],
    recover,
  });
  if (lifecycleState) return lifecycleState;

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
  return {
    ...state,
    phase: "hint",
    hintLevel: nextHintStep(TRAIN_HINT_PLAN, state.hintLevel).level,
  };
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
