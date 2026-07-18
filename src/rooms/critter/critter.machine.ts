import { reduceActivityLifecycle } from "../../engine/activity/activityState";
import { CRITTER_PARTS } from "./critter.content";
import type { CritterAssemblyEvent, CritterAssemblyState, CritterSocketId } from "./critter.types";
import { isPartCompatible } from "./critter.validation";

const SOCKET_ORDER: readonly CritterSocketId[] = ["eyes", "mouth", "legs"];

export const initialCritterState: CritterAssemblyState = {
  phase: "intro",
  bodyId: "round",
  color: "lavender",
  pattern: "plain",
  parts: {},
  activeSocket: "eyes",
  hintLevel: 0,
  feedback: "ready",
};

export function reduceCritterAssembly(
  state: CritterAssemblyState,
  event: CritterAssemblyEvent,
): CritterAssemblyState {
  if (event.type === "RESET") return initialCritterState;
  if (
    state.phase === "celebrating" &&
    (event.type === "SELECT_BODY" ||
      event.type === "SELECT_COLOR" ||
      event.type === "SELECT_PATTERN" ||
      event.type === "SELECT_PART")
  ) {
    return state;
  }
  const lifecycle = reduceActivityLifecycle(state, event, {
    pausable: ["instruction", "waiting", "complete"],
    recover: (current): CritterAssemblyState => ({
      ...current,
      phase: "waiting",
      feedback: "ready",
    }),
  });
  if (lifecycle) return lifecycle;

  switch (event.type) {
    case "INTRO_FINISHED":
      return state.phase === "intro" ? { ...state, phase: "waiting" } : state;
    case "SELECT_BODY":
      return selectBody(state, event.bodyId);
    case "SELECT_COLOR":
      return { ...state, color: event.color };
    case "SELECT_PATTERN":
      return { ...state, pattern: event.pattern };
    case "SELECT_PART":
      return selectPart(state, event.partId);
    case "HINT_TIMEOUT":
      return state.phase === "waiting"
        ? { ...state, hintLevel: Math.min(2, state.hintLevel + 1) as 1 | 2 }
        : state;
    case "CELEBRATION_FINISHED":
      return state.phase === "celebrating" ? { ...state, phase: "complete" } : state;
    case "REACT":
      return state.phase === "complete" ? { ...state, reaction: event.reaction } : state;
    case "REACTION_FINISHED":
      return { ...state, reaction: undefined };
    default:
      return state;
  }
}

function selectBody(
  state: CritterAssemblyState,
  bodyId: CritterAssemblyState["bodyId"],
): CritterAssemblyState {
  const parts = Object.fromEntries(
    Object.entries(state.parts).filter(([, partId]) => {
      const part = CRITTER_PARTS.find((candidate) => candidate.id === partId);
      return part && isPartCompatible(bodyId, part);
    }),
  ) as CritterAssemblyState["parts"];
  const activeSocket = SOCKET_ORDER.find((socket) => !parts[socket]) ?? state.activeSocket;
  return {
    ...state,
    bodyId,
    parts,
    activeSocket,
    hintLevel: 0,
    phase: "waiting",
    feedback: "ready",
  };
}

function selectPart(
  state: CritterAssemblyState,
  partId: (typeof CRITTER_PARTS)[number]["id"],
): CritterAssemblyState {
  if (state.phase !== "waiting" && state.phase !== "complete") return state;
  const part = CRITTER_PARTS.find((candidate) => candidate.id === partId);
  if (!part || !isPartCompatible(state.bodyId, part)) return { ...state, feedback: "incompatible" };
  const replaced = Boolean(state.parts[part.socketId]);
  const parts = { ...state.parts, [part.socketId]: part.id };
  const nextSocket = SOCKET_ORDER.find((socket) => !parts[socket]);
  return {
    ...state,
    parts,
    activeSocket: nextSocket ?? part.socketId,
    hintLevel: 0,
    phase: nextSocket ? "waiting" : "celebrating",
    feedback: nextSocket ? (replaced ? "replaced" : "attached") : "celebrating",
  };
}
