import type { AudioClipPlayer } from "../engine/audio/audioCoordinator";
import type { Point2D } from "../engine/input/pointerDrag";
import type { TimerClock } from "../engine/timing/ownedTimers";
import type { RoomSession } from "../rooms/roomSession";

export function runStateMachine<State, Event>(
  reducer: (state: State, event: Event) => State,
  initial: State,
  events: readonly Event[],
): State {
  return events.reduce(reducer, initial);
}

export function seededFixtures<T>(
  seeds: readonly string[],
  create: (seed: string) => T,
): readonly T[] {
  return seeds.map(create);
}

export function exerciseRoomLifecycle(session: RoomSession): void {
  session.start();
  session.pause();
  session.resume();
  session.restart();
  session.exit();
  session.dispose();
}

export class FakeAudioPlayer<Cue extends string> implements AudioClipPlayer<Cue> {
  public readonly played: Cue[] = [];
  public readonly volumes: number[] = [];
  public readonly ducked: boolean[] = [];
  public stopCount = 0;
  private readonly pending: (() => void)[] = [];

  public play(cue: Cue, volume: number): Promise<void> {
    this.played.push(cue);
    this.volumes.push(volume);
    return new Promise<void>((resolve) => this.pending.push(resolve));
  }

  public stop(): void {
    this.stopCount += 1;
    this.pending.shift()?.();
  }

  public setBackgroundDucked(ducked: boolean): void {
    this.ducked.push(ducked);
  }

  public finish(): void {
    this.pending.shift()?.();
  }
}

export class MemoryPersistence<T> {
  public constructor(private value: T) {}

  public load(): Promise<T> {
    return Promise.resolve(structuredClone(this.value));
  }

  public save(value: T): Promise<void> {
    this.value = structuredClone(value);
    return Promise.resolve();
  }

  public reset(value: T): Promise<void> {
    this.value = structuredClone(value);
    return Promise.resolve();
  }
}

/** Deterministic timer and animation time source for unit and visual adapters. */
export class DeterministicClock implements TimerClock {
  private timeMs = 0;
  private nextId = 0;
  private readonly scheduled = new Map<
    number,
    { readonly due: number; readonly run: () => void }
  >();

  public now(): number {
    return this.timeMs;
  }

  public setTimeout(callback: () => void, delayMs: number): number {
    const id = ++this.nextId;
    this.scheduled.set(id, { due: this.timeMs + delayMs, run: callback });
    return id;
  }

  public clearTimeout(timer: unknown): void {
    this.scheduled.delete(timer as number);
  }

  public advance(milliseconds: number): void {
    this.timeMs += milliseconds;
    for (const [id, task] of [...this.scheduled].sort((a, b) => a[1].due - b[1].due)) {
      if (task.due > this.timeMs) continue;
      this.scheduled.delete(id);
      task.run();
    }
  }
}

export function pointerPath(from: Point2D, to: Point2D, steps: number): readonly Point2D[] {
  if (!Number.isSafeInteger(steps) || steps < 1) throw new Error("Pointer steps must be positive");
  return Array.from({ length: steps + 1 }, (_, index) => ({
    x: from.x + ((to.x - from.x) * index) / steps,
    y: from.y + ((to.y - from.y) * index) / steps,
  }));
}
