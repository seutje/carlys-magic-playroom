import { assetUrl } from "../../engine/assets/assetUrl";
import { AudioCoordinator, type AudioClipPlayer } from "../../engine/audio/audioCoordinator";
import type { AudioSettings } from "../../engine/audio/audioService";
import { createHtmlAudioPlayer } from "../../engine/audio/htmlAudioPlayer";
import type { SoundId } from "./music.types";

export class MusicAudioController {
  private readonly audio: AudioCoordinator<SoundId>;
  private lastSelectionAt = Number.NEGATIVE_INFINITY;

  public constructor(
    getSettings: () => AudioSettings,
    resume: () => Promise<unknown>,
    private readonly now: () => number = () => performance.now(),
    player?: AudioClipPlayer<SoundId>,
  ) {
    this.audio = new AudioCoordinator(
      player ?? createHtmlAudioPlayer((cue, format) => assetUrl(`audio/music/${cue}.${format}`)),
      getSettings,
      resume,
    );
  }

  public playTarget(soundId: SoundId): void {
    this.audio.play({
      cue: soundId,
      channel: "educational-target",
      ownerId: MUSIC_OWNER,
      interrupt: true,
    });
  }

  public playSelection(soundId: SoundId): boolean {
    const current = this.now();
    if (current - this.lastSelectionAt < 180) return false;
    this.lastSelectionAt = current;
    this.audio.play({ cue: soundId, channel: "effects", ownerId: MUSIC_OWNER, interrupt: true });
    return true;
  }

  public stop(): void {
    this.audio.stopOwner(MUSIC_OWNER);
  }
}

const MUSIC_OWNER = "music";
