import type { AudioClipPlayer } from "../../src/engine/audio/audioCoordinator";
import { MusicAudioController } from "../../src/rooms/music/music.audio";
import type { SoundId } from "../../src/rooms/music/music.types";

describe("MusicAudioController", () => {
  it("interrupts for target replay, resumes audio, and throttles rapid selections", async () => {
    const played: SoundId[] = [];
    const stop = vi.fn();
    const play = vi.fn((cue: SoundId) => {
      played.push(cue);
      return Promise.resolve();
    });
    const player: AudioClipPlayer<SoundId> = {
      play,
      stop,
    };
    let now = 1_000;
    const resume = vi.fn().mockResolvedValue("ready");
    const audio = new MusicAudioController(
      () => ({ muted: false, masterVolume: 0.7 }),
      resume,
      () => now,
      player,
    );
    audio.playTarget("bell-normal");
    await vi.waitFor(() => expect(played).toEqual(["bell-normal"]));
    expect(audio.playSelection("drum-normal")).toBe(true);
    expect(audio.playSelection("xylophone-normal")).toBe(false);
    await vi.waitFor(() => expect(played).toEqual(["bell-normal", "drum-normal"]));
    now += 181;
    expect(audio.playSelection("xylophone-normal")).toBe(true);
    await vi.waitFor(() =>
      expect(played).toEqual(["bell-normal", "drum-normal", "xylophone-normal"]),
    );
    expect(resume).toHaveBeenCalledTimes(3);
    expect(stop).toHaveBeenCalledTimes(3);
  });

  it("keeps muted play visually available without audio", async () => {
    const play = vi.fn((cue: SoundId) => {
      void cue;
      return Promise.resolve();
    });
    const player: AudioClipPlayer<SoundId> = { play, stop: vi.fn() };
    const audio = new MusicAudioController(
      () => ({ muted: true, masterVolume: 1 }),
      () => Promise.resolve(),
      () => 1_000,
      player,
    );
    audio.playTarget("bell-normal");
    expect(audio.playSelection("drum-normal")).toBe(true);
    await vi.waitFor(() => expect(play).not.toHaveBeenCalled());
  });
});
