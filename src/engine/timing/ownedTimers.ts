export interface TimerClock {
  setTimeout(callback: () => void, delayMs: number): unknown;
  clearTimeout(timer: unknown): void;
}

const browserTimerClock: TimerClock = {
  setTimeout: (callback, delayMs) => window.setTimeout(callback, delayMs),
  clearTimeout: (timer) => window.clearTimeout(timer as ReturnType<typeof window.setTimeout>),
};

/** Owns timers and watchdogs so a lifecycle can dispose them as one resource. */
export class OwnedTimers {
  private readonly timers = new Set<unknown>();

  public constructor(private readonly clock: TimerClock = browserTimerClock) {}

  public schedule(callback: () => void, delayMs: number): unknown {
    if (!Number.isFinite(delayMs) || delayMs < 0)
      throw new Error("Timer delay must be non-negative");
    const timer = this.clock.setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delayMs);
    this.timers.add(timer);
    return timer;
  }

  public watchdog(callback: () => void, deadlineMs: number): unknown {
    return this.schedule(callback, deadlineMs);
  }

  public cancelAll(): void {
    for (const timer of this.timers) this.clock.clearTimeout(timer);
    this.timers.clear();
  }

  public get size(): number {
    return this.timers.size;
  }
}
