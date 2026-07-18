import type { AudioSettings } from "../../engine/audio/audioService";
import { AudioCoordinator, type AudioClipPlayer } from "../../engine/audio/audioCoordinator";
import { assetUrl } from "../../engine/assets/assetUrl";

export type TrainAudioCue =
  "instruction-two-yellow-ducks" | "count-one" | "count-two" | "count-three" | "success-all-aboard";

export type TrainClipPlayer = AudioClipPlayer<TrainAudioCue>;

/** Serializes speech so rapid child input never creates overlapping voices. */
export class TrainAudioController {
  private readonly coordinator: AudioCoordinator<TrainAudioCue>;
  private activeRound: number | undefined;

  public constructor(
    player: TrainClipPlayer,
    getSettings: () => AudioSettings,
    resume: () => Promise<unknown> = () => Promise.resolve(),
  ) {
    this.coordinator = new AudioCoordinator(player, getSettings, resume);
  }

  public beginRound(round: number): void {
    if (this.activeRound === round) return;
    this.activeRound = round;
    this.replayInstruction();
  }

  public repeatInstruction(): void {
    this.play("instruction-two-yellow-ducks", "instructions");
  }

  public replayInstruction(): void {
    this.play("instruction-two-yellow-ducks", "instructions", true);
  }

  public speakCount(count: 1 | 2 | 3): void {
    this.play(`count-${COUNT_NAMES[count]}`, "educational-target");
  }

  public celebrate(): void {
    this.play("success-all-aboard", "speech");
  }

  public stop(): void {
    this.activeRound = undefined;
    this.coordinator.stopOwner(TRAIN_AUDIO_OWNER);
  }

  private play(
    cue: TrainAudioCue,
    channel: "instructions" | "educational-target" | "speech",
    interrupt = false,
  ): void {
    this.coordinator.play({ cue, channel, interrupt, ownerId: TRAIN_AUDIO_OWNER });
  }
}

const TRAIN_AUDIO_OWNER = "train";
const COUNT_NAMES = { 1: "one", 2: "two", 3: "three" } as const;

export function createBrowserTrainClipPlayer(): TrainClipPlayer {
  let current: HTMLAudioElement | undefined;
  let settleCurrent: (() => void) | undefined;
  const format = selectAudioFormat();

  return {
    play(cue, volume) {
      return new Promise<void>((resolve) => {
        const audio = new Audio(assetUrl(`audio/train/${cue}.${format}`));
        current = audio;
        audio.preload = "auto";
        audio.volume = volume;
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
