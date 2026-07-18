export type RoomSessionPhase = "ready" | "running" | "paused" | "exiting" | "disposed";

export interface RoomSession {
  readonly id: string;
  readonly phase: RoomSessionPhase;
  start(): void;
  pause(): void;
  resume(): void;
  restart(): void;
  exit(): void;
  dispose(): void;
}

/** Idempotent resource-owner lifecycle shared by every lazy room module. */
export class BasicRoomSession implements RoomSession {
  private currentPhase: RoomSessionPhase = "ready";

  public constructor(
    public readonly id: string,
    private readonly onRestart: () => void = () => undefined,
    private readonly onDispose: () => void = () => undefined,
  ) {}

  public get phase(): RoomSessionPhase {
    return this.currentPhase;
  }

  public start(): void {
    if (this.currentPhase === "ready") this.currentPhase = "running";
  }

  public pause(): void {
    if (this.currentPhase === "running") this.currentPhase = "paused";
  }

  public resume(): void {
    if (this.currentPhase === "paused") this.currentPhase = "running";
  }

  public restart(): void {
    if (this.currentPhase !== "running" && this.currentPhase !== "paused") return;
    this.currentPhase = "running";
    this.onRestart();
  }

  public exit(): void {
    if (this.currentPhase !== "disposed") this.currentPhase = "exiting";
  }

  public dispose(): void {
    if (this.currentPhase === "disposed") return;
    this.currentPhase = "disposed";
    this.onDispose();
  }
}
