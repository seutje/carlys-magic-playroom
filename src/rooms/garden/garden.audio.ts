import { AudioCoordinator } from "../../engine/audio/audioCoordinator";
import type { AudioSettings } from "../../engine/audio/audioService";
import { createHtmlAudioPlayer } from "../../engine/audio/htmlAudioPlayer";
import { assetUrl } from "../../engine/assets/assetUrl";
import type { GardenAction } from "./garden.types";

type GardenAudioCue = "tap-cloud" | "tap-sun" | "flower-grew";

export class GardenAudioController {
  private readonly audio: AudioCoordinator<GardenAudioCue>;

  public constructor(getSettings: () => AudioSettings, resume: () => Promise<unknown>) {
    this.audio = new AudioCoordinator(
      createHtmlAudioPlayer((cue, format) => assetUrl(`audio/garden/${cue}.${format}`)),
      getSettings,
      resume,
    );
  }

  public instruct(action: GardenAction, interrupt = false): void {
    this.audio.play({
      cue: action === "water" ? "tap-cloud" : "tap-sun",
      channel: "instructions",
      ownerId: GARDEN_OWNER,
      interrupt,
    });
  }

  public celebrate(): void {
    this.audio.play({
      cue: "flower-grew",
      channel: "speech",
      ownerId: GARDEN_OWNER,
      interrupt: true,
    });
  }

  public stop(): void {
    this.audio.stopOwner(GARDEN_OWNER);
  }
}

const GARDEN_OWNER = "garden";
