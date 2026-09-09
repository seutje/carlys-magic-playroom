import { BackgroundMusicController } from "../../src/engine/audio/backgroundMusic";
import type { AudioSettings } from "../../src/engine/audio/audioService";

function settings(overrides: Partial<AudioSettings> = {}): AudioSettings {
  return {
    muted: false,
    masterVolume: 1,
    musicVolume: 0.8,
    speechVolume: 1,
    ...overrides,
  };
}

function fakeAudio() {
  const audio = {
    loop: false,
    paused: true,
    preload: "none",
    volume: 1,
    play: vi.fn(() => {
      audio.paused = false;
      return Promise.resolve();
    }),
    pause: vi.fn(() => {
      audio.paused = true;
    }),
  };
  return audio;
}

describe("BackgroundMusicController", () => {
  it("starts the bundled soundtrack loop at the default 80% music volume", () => {
    const audio = fakeAudio();
    const createAudio = vi.fn(() => audio);
    const music = new BackgroundMusicController(createAudio);

    music.start(settings());

    expect(createAudio).toHaveBeenCalledWith(
      `${import.meta.env.BASE_URL}audio/music/soundtrack.mp3`,
    );
    expect(audio.loop).toBe(true);
    expect(audio.preload).toBe("auto");
    expect(audio.volume).toBe(0.8);
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it("follows master, music, and mute settings after playback starts", async () => {
    const audio = fakeAudio();
    const music = new BackgroundMusicController(() => audio);
    music.start(settings());
    await Promise.resolve();

    music.updateSettings(settings({ masterVolume: 0.5, musicVolume: 0.6 }));
    expect(audio.volume).toBeCloseTo(0.3);

    music.updateSettings(settings({ muted: true }));
    expect(audio.pause).toHaveBeenCalledOnce();

    music.updateSettings(settings({ muted: false }));
    await vi.waitFor(() => expect(audio.play).toHaveBeenCalledTimes(2));
  });

  it("keeps a blocked playback attempt nonfatal", async () => {
    const audio = fakeAudio();
    audio.play.mockRejectedValueOnce(new Error("blocked"));
    const music = new BackgroundMusicController(() => audio);

    expect(() => music.start(settings())).not.toThrow();
    await Promise.resolve();
  });
});
