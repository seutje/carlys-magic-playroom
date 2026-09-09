import { assetUrl } from "../assets/assetUrl";
import type { AudioSettings } from "./audioService";

interface LoopingAudioElement {
  loop: boolean;
  paused: boolean;
  preload: string;
  volume: number;
  play(): Promise<void>;
  pause(): void;
}

type BackgroundAudioFactory = (source: string) => LoopingAudioElement;

const SOUNDTRACK_URL = assetUrl("audio/music/soundtrack.mp3");

/** Owns the app-wide soundtrack and keeps it aligned with the persisted sound settings. */
export class BackgroundMusicController {
  private audio: LoopingAudioElement | undefined;
  private playbackRequested = false;
  private playPending = false;
  private replayAfterPending = false;
  private settings: AudioSettings | undefined;

  public constructor(
    private readonly createAudio: BackgroundAudioFactory = (source) => new Audio(source),
  ) {}

  /** Must be called from the Play gesture so browsers permit media playback. */
  public start(settings: AudioSettings): void {
    this.playbackRequested = true;
    this.settings = settings;
    const audio = this.getAudio();
    this.applySettings(audio, settings);
    if (!settings.muted) this.play(audio);
  }

  public updateSettings(settings: AudioSettings): void {
    this.settings = settings;
    if (!this.audio) return;
    this.applySettings(this.audio, settings);

    if (settings.muted) {
      this.audio.pause();
    } else if (this.playbackRequested && this.audio.paused) {
      this.play(this.audio);
    }
  }

  public stop(): void {
    this.playbackRequested = false;
    this.replayAfterPending = false;
    this.audio?.pause();
  }

  private getAudio(): LoopingAudioElement {
    this.audio ??= this.createAudio(SOUNDTRACK_URL);
    this.audio.loop = true;
    this.audio.preload = "auto";
    return this.audio;
  }

  private applySettings(audio: LoopingAudioElement, settings: AudioSettings): void {
    const musicVolume = settings.musicVolume ?? 1;
    audio.volume = Math.min(1, Math.max(0, settings.masterVolume * musicVolume));
  }

  private play(audio: LoopingAudioElement): void {
    if (this.playPending) {
      this.replayAfterPending = true;
      return;
    }
    this.playPending = true;
    void audio
      .play()
      .catch(() => {
        // Soundtrack failure is nonfatal; all play remains available visually.
      })
      .finally(() => {
        this.playPending = false;
        const shouldReplay = this.replayAfterPending;
        this.replayAfterPending = false;
        if (shouldReplay && this.playbackRequested && !this.settings?.muted && audio.paused) {
          this.play(audio);
        }
      });
  }
}
