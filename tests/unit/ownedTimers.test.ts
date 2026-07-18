import { OwnedTimers } from "../../src/engine/timing/ownedTimers";
import { DeterministicClock } from "../../src/testing/helpers";

describe("OwnedTimers", () => {
  it("owns ordinary timers and watchdogs and cancels them together", () => {
    const clock = new DeterministicClock();
    const timers = new OwnedTimers(clock);
    const scheduled = vi.fn();
    timers.schedule(scheduled, 10);
    timers.watchdog(vi.fn(), 20);
    expect(timers.size).toBe(2);
    clock.advance(10);
    expect(scheduled).toHaveBeenCalledOnce();
    expect(timers.size).toBe(1);
    timers.cancelAll();
    expect(timers.size).toBe(0);
    expect(() => timers.schedule(vi.fn(), -1)).toThrow(/non-negative/);
  });
});
