import type { AudioSettings } from "../../engine/audio/audioService";
import { assetUrl } from "../../engine/assets/assetUrl";

export type TrainAudioCue =
  "instruction-two-yellow-ducks" | "count-one" | "count-two" | "count-three" | "success-all-aboard";

export interface TrainClipPlayer {
  play(cue: TrainAudioCue): Promise<void>;
  stop(): void;
}

/** Serializes speech so rapid child input never creates overlapping voices. */
export class TrainAudioController {
  private queue: Promise<void> = Promise.resolve();
  private generation = 0;
  private activeRound: number | undefined;

  public constructor(
    private readonly player: TrainClipPlayer,
    private readonly getSettings: () => AudioSettings,
  ) {}

  public beginRound(round: number): void {
    if (this.activeRound === round) return;
    this.activeRound = round;
    this.replayInstruction();
  }

  public repeatInstruction(): void {
    this.enqueue("instruction-two-yellow-ducks");
  }

  public replayInstruction(): void {
    this.interrupt();
    this.enqueue("instruction-two-yellow-ducks");
  }

  public speakCount(count: 1 | 2 | 3): void {
    this.enqueue(`count-${COUNT_NAMES[count]}`);
  }

  public celebrate(): void {
    this.enqueue("success-all-aboard");
  }

  public stop(): void {
    this.activeRound = undefined;
    this.interrupt();
  }

  private interrupt(): void {
    this.generation += 1;
    this.player.stop();
    this.queue = Promise.resolve();
  }

  private enqueue(cue: TrainAudioCue): void {
    const generation = this.generation;
    this.queue = this.queue
      .then(async () => {
        if (generation !== this.generation || this.getSettings().muted) return;
        await this.player.play(cue);
      })
      .catch(() => {
        // Voice is supportive feedback; playback failure must never stop visual play.
      });
  }
}

const COUNT_NAMES = { 1: "one", 2: "two", 3: "three" } as const;

export function createBrowserTrainClipPlayer(getSettings: () => AudioSettings): TrainClipPlayer {
  let current: HTMLAudioElement | undefined;
  let settleCurrent: (() => void) | undefined;
  const format = selectAudioFormat();

  return {
    play(cue) {
      return new Promise<void>((resolve) => {
        const audio = new Audio(assetUrl(`audio/train/${cue}.${format}`));
        current = audio;
        audio.preload = "auto";
        audio.volume = getSettings().masterVolume;
        const settle = () => {
          if (current === audio) current = undefined;
          if (settleCurrent === settle) settleCurrent = undefined;
          audio.removeEventListener("ended", settle);
          audio.removeEventListener("error", settle);
          resolve();
        };
        settleCurrent = settle;
        audio.addEventListener("ended", settle, { once: true });
        audio.addEventListener("error", settle, { once: true });
        void audio.play().catch(settle);
      });
    },
    stop() {
      current?.pause();
      current = undefined;
      settleCurrent?.();
      settleCurrent = undefined;
    },
  };
}

function selectAudioFormat(): "ogg" | "mp3" {
  const probe = document.createElement("audio");
  return probe.canPlayType('audio/ogg; codecs="vorbis"') ? "ogg" : "mp3";
}
