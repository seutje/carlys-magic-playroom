import type { AudioSettings } from "./audioService";

export type AudioChannel =
  "speech" | "instructions" | "educational-target" | "effects" | "music" | "ambient";

export interface AudioClipPlayer<Cue extends string> {
  play(cue: Cue, volume: number): Promise<void>;
  stop(): void;
  setBackgroundDucked?(ducked: boolean): void;
}

export interface AudioRequest<Cue extends string> {
  readonly cue: Cue;
  readonly channel: AudioChannel;
  readonly ownerId: string;
  readonly interrupt?: boolean;
}

interface QueuedRequest<Cue extends string> extends AudioRequest<Cue> {
  readonly priority: number;
}

const CHANNEL_PRIORITY: Readonly<Record<AudioChannel, number>> = {
  speech: 60,
  instructions: 100,
  "educational-target": 80,
  effects: 40,
  music: 20,
  ambient: 10,
};

/** One-voice coordinator with priority interruption, ducking, and room ownership. */
export class AudioCoordinator<Cue extends string> {
  private pending: QueuedRequest<Cue>[] = [];
  private active: QueuedRequest<Cue> | undefined;
  private playbackToken = 0;

  public constructor(
    private readonly player: AudioClipPlayer<Cue>,
    private readonly getSettings: () => AudioSettings,
    private readonly resume: () => Promise<unknown> = () => Promise.resolve(),
  ) {}

  public play(request: AudioRequest<Cue>): void {
    const queued = { ...request, priority: CHANNEL_PRIORITY[request.channel] };
    if (request.interrupt) {
      this.pending = [];
      this.interruptActive();
    } else if (this.active && queued.priority > this.active.priority) {
      this.interruptActive();
    }
    this.pending.push(queued);
    void this.pump();
  }

  public stopOwner(ownerId: string): void {
    this.pending = this.pending.filter((request) => request.ownerId !== ownerId);
    if (this.active?.ownerId === ownerId) this.interruptActive();
    void this.pump();
  }

  public stopAll(): void {
    this.pending = [];
    this.interruptActive();
  }

  private interruptActive(): void {
    this.playbackToken += 1;
    this.active = undefined;
    this.player.stop();
    this.player.setBackgroundDucked?.(false);
  }

  private async pump(): Promise<void> {
    if (this.active) return;
    const request = this.pending.shift();
    if (!request) return;
    if (this.getSettings().muted) {
      void this.pump();
      return;
    }

    this.active = request;
    const token = ++this.playbackToken;
    const ducksBackground = request.priority >= CHANNEL_PRIORITY["educational-target"];
    if (ducksBackground) this.player.setBackgroundDucked?.(true);
    try {
      await this.resume();
      if (token !== this.playbackToken) return;
      await this.player.play(request.cue, this.getSettings().masterVolume);
    } catch {
      // Audio failure remains nonfatal and the queue continues.
    } finally {
      if (token === this.playbackToken) {
        if (ducksBackground) this.player.setBackgroundDucked?.(false);
        this.active = undefined;
        void this.pump();
      }
    }
  }
}
