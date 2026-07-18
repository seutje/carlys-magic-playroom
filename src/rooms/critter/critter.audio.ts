import { AudioCoordinator } from "../../engine/audio/audioCoordinator";
import type { AudioSettings } from "../../engine/audio/audioService";
import { createHtmlAudioPlayer } from "../../engine/audio/htmlAudioPlayer";
import { assetUrl } from "../../engine/assets/assetUrl";
import type { CritterSocketId } from "./critter.types";

export type CritterAudioCue = "choose-eyes" | "choose-mouth" | "choose-legs" | "critter-ready";

export class CritterAudioController {
  private readonly audio: AudioCoordinator<CritterAudioCue>;

  public constructor(getSettings: () => AudioSettings, resume: () => Promise<unknown>) {
    this.audio = new AudioCoordinator(
      createHtmlAudioPlayer((cue, format) => assetUrl(`audio/critter/${cue}.${format}`)),
      getSettings,
      resume,
    );
  }

  public instruct(socketId: CritterSocketId, interrupt = false): void {
    this.audio.play({
      cue: `choose-${socketId}`,
      channel: "instructions",
      ownerId: CRITTER_OWNER,
      interrupt,
    });
  }

  public ready(): void {
    this.audio.play({ cue: "critter-ready", channel: "speech", ownerId: CRITTER_OWNER });
  }

  public stop(): void {
    this.audio.stopOwner(CRITTER_OWNER);
  }
}

const CRITTER_OWNER = "critter";
