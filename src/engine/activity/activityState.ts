export type ActivityPhase =
  | "loading"
  | "intro"
  | "instruction"
  | "waiting"
  | "evaluating"
  | "hint"
  | "celebrating"
  | "complete"
  | "paused"
  | "exiting"
  | "error";

export type ActivityLifecycleEvent =
  | { readonly type: "PAUSE" }
  | { readonly type: "RESUME" }
  | { readonly type: "EXIT" }
  | { readonly type: "FAIL" }
  | { readonly type: "RECOVER" };

export interface ActivityLifecycleState {
  readonly phase: ActivityPhase;
  readonly pausedFrom?: ActivityPhase | undefined;
}

interface LifecycleOptions<State extends ActivityLifecycleState> {
  readonly pausable: readonly ActivityPhase[];
  recover(state: State): State;
}

/** Returns undefined when an extensible room-specific reducer should handle the event. */
export function reduceActivityLifecycle<State extends ActivityLifecycleState>(
  state: State,
  event: { readonly type: string },
  options: LifecycleOptions<State>,
): State | undefined {
  switch (event.type) {
    case "EXIT":
      return state.phase === "exiting" ? state : { ...state, phase: "exiting" };
    case "FAIL":
      return { ...state, phase: "error" };
    case "PAUSE":
      return options.pausable.includes(state.phase)
        ? { ...state, phase: "paused", pausedFrom: state.phase }
        : state;
    case "RESUME": {
      if (state.phase !== "paused" || !state.pausedFrom) return state;
      const { pausedFrom, ...rest } = state;
      return { ...rest, phase: pausedFrom } as State;
    }
    case "RECOVER":
      return options.recover(state);
    default:
      return undefined;
  }
}
