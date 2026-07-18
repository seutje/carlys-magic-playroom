import type { MusicEvent, MusicRoundDefinition, MusicState } from "./music.types";

export function createMusicState(definition: MusicRoundDefinition): MusicState {
  return {
    phase: "intro",
    definition,
    mismatchCount: 0,
    hintLevel: 0,
    pulse: 0,
    feedback: "ready",
  };
}

export function reduceMusic(state: MusicState, event: MusicEvent): MusicState {
  if (event.type === "RESET") return createMusicState(event.definition);
  switch (event.type) {
    case "INTRO_FINISHED":
      return state.phase === "intro" ? { ...state, phase: "waiting" } : state;
    case "TARGET_PLAYED":
      return state.phase === "waiting" || state.phase === "hint"
        ? { ...state, pulse: state.pulse + 1 }
        : state;
    case "SELECT":
      if (state.phase !== "waiting" && state.phase !== "hint") return state;
      return { ...state, phase: "evaluating", selectedChoiceId: event.choiceId };
    case "EVALUATION_FINISHED":
      return evaluate(state);
    case "HINT_TIMEOUT":
      return state.phase === "waiting" || state.phase === "hint"
        ? { ...state, phase: "hint", hintLevel: Math.min(2, state.hintLevel + 1) as 1 | 2 }
        : state;
    case "CELEBRATION_FINISHED":
      return state.phase === "celebrating" ? { ...state, phase: "complete" } : state;
    case "RECOVER":
      return { ...withoutSelection(state), phase: "waiting", feedback: "recovered" };
    default:
      return state;
  }
}

function evaluate(state: MusicState): MusicState {
  if (state.phase !== "evaluating" || !state.selectedChoiceId) return state;
  if (state.selectedChoiceId === state.definition.targetChoiceId) {
    return { ...state, phase: "celebrating", hintLevel: 0, feedback: "correct" };
  }
  const mismatchCount = state.mismatchCount + 1;
  return {
    ...withoutSelection(state),
    phase: mismatchCount >= 2 ? "hint" : "waiting",
    mismatchCount,
    hintLevel: mismatchCount >= 2 ? 2 : 1,
    feedback: "playful",
  };
}

function withoutSelection(state: MusicState): Omit<MusicState, "selectedChoiceId"> {
  return {
    phase: state.phase,
    definition: state.definition,
    mismatchCount: state.mismatchCount,
    hintLevel: state.hintLevel,
    pulse: state.pulse,
    feedback: state.feedback,
  };
}
