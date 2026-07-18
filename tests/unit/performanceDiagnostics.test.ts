import { performanceDiagnostics } from "../../src/engine/diagnostics/performanceDiagnostics";

describe("performance diagnostics", () => {
  beforeEach(() => performanceDiagnostics.clear());

  it("summarizes sampled frames and resets without storing user data", () => {
    performanceDiagnostics.recordFrame("garden", 16, 12, 10_000_000);
    performanceDiagnostics.recordFrame("garden", 20, 14, 11_000_000);
    performanceDiagnostics.recordFrame("garden", Number.NaN, 99);

    expect(performanceDiagnostics.read().scenes).toEqual([
      {
        scene: "garden",
        samples: 2,
        averageFrameMs: 18,
        slowestFrameMs: 20,
        lastDrawCalls: 14,
        lastHeapBytes: 11_000_000,
      },
    ]);
    performanceDiagnostics.clear();
    expect(performanceDiagnostics.read()).toEqual({ scenes: [], roomLoads: [] });
  });

  it("bounds room load history", () => {
    for (let index = 0; index < 25; index += 1) {
      performanceDiagnostics.recordRoomLoad(`room-${index}`, index);
    }
    const loads = performanceDiagnostics.read().roomLoads;
    expect(loads).toHaveLength(20);
    expect(loads[0]?.room).toBe("room-5");
    expect(loads.at(-1)?.room).toBe("room-24");
  });
});
