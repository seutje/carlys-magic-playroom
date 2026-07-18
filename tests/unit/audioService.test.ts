import { AudioService, type ResumableAudioContext } from "../../src/engine/audio/audioService";

function fakeContext(initialState: AudioContextState = "suspended") {
  let state = initialState;
  const resume = vi.fn(() => {
    state = "running";
    return Promise.resolve();
  });
  const close = vi.fn(() => {
    state = "closed";
    return Promise.resolve();
  });
  const context: ResumableAudioContext = {
    get state() {
      return state;
    },
    resume,
    close,
  };
  return { context, resume };
}

describe("AudioService", () => {
  it("initializes after a gesture once and resumes a suspended context", async () => {
    const { context, resume } = fakeContext();
    const factory = vi.fn(() => context);
    const service = new AudioService(factory);

    await expect(service.initialize()).resolves.toBe("ready");
    await expect(service.initialize()).resolves.toBe("ready");
    expect(factory).toHaveBeenCalledOnce();
    expect(resume).toHaveBeenCalledOnce();
  });

  it("keeps visual play available when audio creation fails", async () => {
    const { context } = fakeContext("running");
    const factory = vi.fn(() => {
      if (factory.mock.calls.length === 1) throw new Error("blocked");
      return context;
    });
    const service = new AudioService(factory);
    await expect(service.initialize()).resolves.toBe("unavailable");
    await expect(service.initialize()).resolves.toBe("ready");
  });

  it("clamps volume and stores mute state", () => {
    const service = new AudioService(() => fakeContext("running").context);
    service.setMasterVolume(4);
    service.setMuted(true);
    expect(service.getSettings()).toEqual({ masterVolume: 1, muted: true });
  });
});
