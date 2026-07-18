import type { AudioSettings } from "../../engine/audio/audioService";
import { createHtmlAudioPlayer } from "../../engine/audio/htmlAudioPlayer";
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
  return createHtmlAudioPlayer((cue, format) => assetUrl(`audio/train/${cue}.${format}`));
}
