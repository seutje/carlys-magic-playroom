import type { RoomId } from "../types/domain";

export type AppView =
  | { readonly kind: "startup" }
  | { readonly kind: "playroom" }
  | { readonly kind: "transitioning"; readonly roomId: RoomId }
  | { readonly kind: "room"; readonly roomId: RoomId };

export type NavigationEvent =
  | { readonly type: "PLAY" }
  | { readonly type: "SELECT_ROOM"; readonly roomId: RoomId }
  | { readonly type: "TRANSITION_FINISHED"; readonly roomId: RoomId }
  | { readonly type: "HOME" };

export const initialAppView: AppView = { kind: "startup" };

/** Pure guarded navigation; duplicate and stale child input is intentionally ignored. */
export function reduceNavigation(state: AppView, event: NavigationEvent): AppView {
  switch (event.type) {
    case "PLAY":
      return state.kind === "startup" ? { kind: "playroom" } : state;
    case "SELECT_ROOM":
      return state.kind === "playroom" ? { kind: "transitioning", roomId: event.roomId } : state;
    case "TRANSITION_FINISHED":
      return state.kind === "transitioning" && state.roomId === event.roomId
        ? { kind: "room", roomId: event.roomId }
        : state;
    case "HOME":
      return state.kind === "startup" ? state : { kind: "playroom" };
    default:
      return assertNever(event);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected navigation event: ${String(value)}`);
}
