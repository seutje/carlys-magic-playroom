import { assetUrl } from "../../engine/assets/assetUrl";
import { AudioCoordinator } from "../../engine/audio/audioCoordinator";
import type { AudioSettings } from "../../engine/audio/audioService";
import { createHtmlAudioPlayer } from "../../engine/audio/htmlAudioPlayer";
import type { ShapeRule } from "./shapes.types";

type ShapeAudioCue = "instruction" | "success";

export class ShapeAudioController {
  private readonly audio: AudioCoordinator<ShapeAudioCue>;

  public constructor(getSettings: () => AudioSettings, resume: () => Promise<unknown>) {
    this.audio = new AudioCoordinator(
      createHtmlAudioPlayer((cue, format) => assetUrl(`audio/shapes/${cue}.${format}`)),
      getSettings,
      resume,
    );
  }

  public instruct(_target: ShapeRule, interrupt = false): void {
    this.audio.play({
      cue: "instruction",
      channel: "instructions",
      ownerId: SHAPES_OWNER,
      interrupt,
    });
  }

  public celebrate(): void {
    this.audio.play({
      cue: "success",
      channel: "speech",
      ownerId: SHAPES_OWNER,
      interrupt: true,
    });
  }

  public stop(): void {
    this.audio.stopOwner(SHAPES_OWNER);
  }
}

const SHAPES_OWNER = "shapes";
