import { reduceActivityLifecycle } from "../../src/engine/activity/activityState";

describe("reduceActivityLifecycle", () => {
  it("shares guarded lifecycle events while leaving room events extensible", () => {
    const waiting = { phase: "waiting" as const, value: 2 };
    const paused = reduceActivityLifecycle(
      waiting,
      { type: "PAUSE" },
      {
        pausable: ["waiting"],
        recover: (state) => state,
      },
    );
    expect(paused).toMatchObject({ phase: "paused", pausedFrom: "waiting", value: 2 });
    expect(
      reduceActivityLifecycle(
        waiting,
        { type: "ROOM_EVENT" },
        {
          pausable: ["waiting"],
          recover: (state) => state,
        },
      ),
    ).toBeUndefined();
  });
});
