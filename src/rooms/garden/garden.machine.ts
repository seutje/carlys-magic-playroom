import { reduceActivityLifecycle } from "../../engine/activity/activityState";
import type {
  GardenAction,
  GardenActivityDefinition,
  GardenEvent,
  GardenLevel,
  GardenState,
} from "./garden.types";

export function createGardenState(definition: GardenActivityDefinition): GardenState {
  return {
    phase: "intro",
    definition,
    water: 0,
    light: 0,
    growth: 0,
    timeOfDay: "day",
    visitor: "none",
    actionIndex: 0,
    mismatchCount: 0,
    hintLevel: 0,
    feedback: "ready",
  };
}

export function reduceGarden(state: GardenState, event: GardenEvent): GardenState {
  if (event.type === "RESET") return createGardenState(event.definition);
  const lifecycle = reduceActivityLifecycle(state, event, {
    pausable: ["waiting"],
    recover: (current): GardenState => ({ ...current, phase: "waiting", feedback: "ready" }),
  });
  if (lifecycle) return lifecycle;

  switch (event.type) {
    case "INTRO_FINISHED":
      return state.phase === "intro" ? { ...state, phase: "waiting" } : state;
    case "ACT":
      return state.phase === "waiting" ? applyAction(state, event.action) : state;
    case "EFFECT_FINISHED":
      if (state.phase !== "evaluating") return state;
      return state.actionIndex >= state.definition.task.length
        ? { ...state, phase: "celebrating", feedback: "complete" }
        : { ...state, phase: "waiting", feedback: "ready" };
    case "HINT_TIMEOUT":
      return state.phase === "waiting"
        ? { ...state, hintLevel: Math.min(2, state.hintLevel + 1) as 1 | 2 }
        : state;
    case "CELEBRATION_FINISHED":
      return state.phase === "celebrating" ? { ...state, phase: "complete" } : state;
    default:
      return state;
  }
}

function applyAction(state: GardenState, action: GardenAction): GardenState {
  const expected = state.definition.task[state.actionIndex];
  const correct = action === expected;
  const resource = incrementResource(state, action);
  const growth = correct ? clampLevel(state.growth + 1) : state.growth;
  return {
    ...state,
    ...resource,
    phase: "evaluating",
    actionIndex: correct ? state.actionIndex + 1 : state.actionIndex,
    growth,
    timeOfDay: action === "sun" ? "day" : state.actionIndex % 2 === 0 ? "night" : "day",
    visitor: growth >= 2 ? "bee" : state.visitor,
    mismatchCount: state.mismatchCount + (correct ? 0 : 1),
    hintLevel: correct
      ? 0
      : state.mismatchCount + 1 >= 2
        ? 2
        : (Math.max(1, state.hintLevel) as 1 | 2),
    lastAction: action,
    feedback: correct ? "growing" : "extra",
  };
}

function incrementResource(
  state: GardenState,
  action: GardenAction,
): Pick<GardenState, "water" | "light"> {
  return action === "water"
    ? { water: clampLevel(state.water + 1), light: state.light }
    : { water: state.water, light: clampLevel(state.light + 1) };
}

function clampLevel(value: number): GardenLevel {
  return Math.min(3, Math.max(0, value)) as GardenLevel;
}
