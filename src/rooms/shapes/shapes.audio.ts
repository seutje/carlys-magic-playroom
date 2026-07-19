import { assetUrl } from "../../engine/assets/assetUrl";
import { AudioCoordinator } from "../../engine/audio/audioCoordinator";
import type { AudioSettings } from "../../engine/audio/audioService";
import { createHtmlAudioPlayer } from "../../engine/audio/htmlAudioPlayer";
import type { ShapeRule } from "./shapes.types";

type ShapeAudioCue =
  | "instruction"
  | "instruction-blue-circle"
  | "instruction-yellow-triangle"
  | "instruction-green-diamond"
  | "success";

export class ShapeAudioController {
  private readonly audio: AudioCoordinator<ShapeAudioCue>;

  public constructor(getSettings: () => AudioSettings, resume: () => Promise<unknown>) {
    this.audio = new AudioCoordinator(
      createHtmlAudioPlayer((cue, format) => assetUrl(`audio/shapes/${cue}.${format}`)),
      getSettings,
      resume,
    );
  }

  public instruct(target: ShapeRule, interrupt = false): void {
    const cue = instructionCue(target);
    if (!cue) return;
    this.audio.play({
      cue,
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

function instructionCue(target: ShapeRule): ShapeAudioCue | undefined {
  const key = `${target.color}:${target.kind}`;
  switch (key) {
    case "red:square":
      return "instruction";
    case "blue:circle":
      return "instruction-blue-circle";
    case "yellow:triangle":
      return "instruction-yellow-triangle";
    case "green:diamond":
      return "instruction-green-diamond";
    default:
      return undefined;
  }
}
