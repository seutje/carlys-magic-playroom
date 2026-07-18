export type AudioAvailability = "idle" | "ready" | "unavailable";

export interface ResumableAudioContext {
  readonly state: AudioContextState;
  resume(): Promise<void>;
  close(): Promise<void>;
}

export type AudioContextFactory = () => ResumableAudioContext;

export interface AudioSettings {
  readonly muted: boolean;
  readonly masterVolume: number;
  readonly musicVolume?: number;
  readonly speechVolume?: number;
}

/** Gesture-initialized audio foundation. Failure never prevents visual play. */
export class AudioService {
  private context: ResumableAudioContext | undefined;
  private initialization: Promise<AudioAvailability> | undefined;
  private settings: AudioSettings = {
    muted: false,
    masterVolume: 1,
    musicVolume: 0.8,
    speechVolume: 1,
  };

  public constructor(private readonly createContext: AudioContextFactory = browserAudioFactory) {}

  public initialize(): Promise<AudioAvailability> {
    if (this.initialization) return this.initialization;
    const attempt = this.initializeOnce();
    this.initialization = attempt;
    void attempt.then((availability) => {
      if (availability === "unavailable" && this.initialization === attempt) {
        this.initialization = undefined;
      }
    });
    return attempt;
  }

  public getSettings(): AudioSettings {
    return this.settings;
  }

  public setMuted(muted: boolean): void {
    this.settings = { ...this.settings, muted };
  }

  public setMasterVolume(masterVolume: number): void {
    this.settings = {
      ...this.settings,
      masterVolume: Math.min(1, Math.max(0, masterVolume)),
    };
  }

  public setChannelVolumes(musicVolume: number, speechVolume: number): void {
    this.settings = {
      ...this.settings,
      musicVolume: Math.min(1, Math.max(0, musicVolume)),
      speechVolume: Math.min(1, Math.max(0, speechVolume)),
    };
  }

  public async resume(): Promise<AudioAvailability> {
    const availability = await this.initialize();
    if (availability !== "ready" || !this.context) return availability;

    try {
      if (this.context.state === "suspended") await this.context.resume();
      return "ready";
    } catch {
      return "unavailable";
    }
  }

  public async dispose(): Promise<void> {
    const context = this.context;
    this.context = undefined;
    this.initialization = undefined;
    if (!context) return;
    try {
      await context.close();
    } catch {
      // Browser shutdown can race context cleanup; there is nothing else to release.
    }
  }

  private async initializeOnce(): Promise<AudioAvailability> {
    try {
      this.context = this.createContext();
      if (this.context.state === "suspended") await this.context.resume();
      return "ready";
    } catch {
      this.context = undefined;
      return "unavailable";
    }
  }
}

function browserAudioFactory(): ResumableAudioContext {
  const AudioContextConstructor = window.AudioContext;
  if (!AudioContextConstructor) throw new Error("Audio is unavailable");
  return new AudioContextConstructor();
}

export const audioService = new AudioService();
