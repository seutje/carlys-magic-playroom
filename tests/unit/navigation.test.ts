import { initialAppView, reduceNavigation } from "../../src/state/navigation";

describe("navigation", () => {
  it("moves through startup, a guarded transition, a room, and home", () => {
    const playroom = reduceNavigation(initialAppView, { type: "PLAY" });
    const transition = reduceNavigation(playroom, { type: "SELECT_ROOM", roomId: "train" });

    expect(reduceNavigation(transition, { type: "SELECT_ROOM", roomId: "music" })).toBe(transition);
    expect(reduceNavigation(transition, { type: "TRANSITION_FINISHED", roomId: "garden" })).toBe(
      transition,
    );

    const room = reduceNavigation(transition, {
      type: "TRANSITION_FINISHED",
      roomId: "train",
    });
    expect(room).toEqual({ kind: "room", roomId: "train" });
    expect(reduceNavigation(room, { type: "HOME" })).toEqual({ kind: "playroom" });
  });

  it("treats repeated Play and Home input as idempotent", () => {
    const playroom = reduceNavigation(initialAppView, { type: "PLAY" });
    expect(reduceNavigation(playroom, { type: "PLAY" })).toBe(playroom);
    expect(reduceNavigation(playroom, { type: "HOME" })).toEqual({ kind: "playroom" });
    expect(reduceNavigation(initialAppView, { type: "HOME" })).toBe(initialAppView);
  });
});
