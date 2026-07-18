import { AudioCoordinator, type AudioClipPlayer } from "../../src/engine/audio/audioCoordinator";
import { FakeAudioPlayer } from "../../src/testing/helpers";

type Cue = "ambient" | "instruction" | "count";

function controlledPlayer() {
  const played: Cue[] = [];
  const pending: (() => void)[] = [];
  const ducked: boolean[] = [];
  const stop = vi.fn(() => pending.shift()?.());
  const player: AudioClipPlayer<Cue> = {
    play: vi.fn((cue: Cue) => {
      played.push(cue);
      return new Promise<void>((resolve) => pending.push(resolve));
    }),
    stop,
    setBackgroundDucked: vi.fn((value: boolean) => ducked.push(value)),
  };
  return { player, stop, played, ducked, finish: () => pending.shift()?.() };
}

describe("AudioCoordinator", () => {
  it("works with the shared controlled audio double", async () => {
    const player = new FakeAudioPlayer<Cue>();
    const audio = new AudioCoordinator(player, () => ({ muted: false, masterVolume: 0.4 }));
    audio.play({ cue: "count", channel: "educational-target", ownerId: "mock" });
    await vi.waitFor(() => expect(player.played).toEqual(["count"]));
    expect(player.volumes).toEqual([0.4]);
    player.finish();
  });

  it("interrupts lower priority audio, ducks for instructions, and serializes voices", async () => {
    const { player, stop, played, ducked, finish } = controlledPlayer();
    const audio = new AudioCoordinator(player, () => ({ muted: false, masterVolume: 0.5 }));

    audio.play({ cue: "ambient", channel: "ambient", ownerId: "shell" });
    await vi.waitFor(() => expect(played).toEqual(["ambient"]));
    audio.play({ cue: "instruction", channel: "instructions", ownerId: "train" });
    audio.play({ cue: "count", channel: "educational-target", ownerId: "train" });
    await vi.waitFor(() => expect(played).toEqual(["ambient", "instruction"]));
    expect(stop).toHaveBeenCalledOnce();
    expect(ducked).toContain(true);
    finish();
    await vi.waitFor(() => expect(played).toEqual(["ambient", "instruction", "count"]));
  });

  it("stops room-owned audio and recovers when resume fails", async () => {
    const { player, played } = controlledPlayer();
    const resume = vi
      .fn()
      .mockRejectedValueOnce(new Error("suspended"))
      .mockResolvedValue(undefined);
    const audio = new AudioCoordinator(player, () => ({ muted: false, masterVolume: 1 }), resume);
    audio.play({ cue: "instruction", channel: "instructions", ownerId: "train" });
    audio.play({ cue: "count", channel: "educational-target", ownerId: "train" });
    audio.stopOwner("train");
    await vi.waitFor(() => expect(resume).toHaveBeenCalled());
    expect(played).toEqual([]);
  });

  it("applies persisted music and speech channel volumes", async () => {
    const player = new FakeAudioPlayer<Cue>();
    const audio = new AudioCoordinator(player, () => ({
      muted: false,
      masterVolume: 0.5,
      musicVolume: 0.4,
      speechVolume: 0.8,
    }));
    audio.play({ cue: "ambient", channel: "music", ownerId: "shell" });
    await vi.waitFor(() => expect(player.volumes).toEqual([0.2]));
    player.finish();
    audio.play({ cue: "instruction", channel: "instructions", ownerId: "room" });
    await vi.waitFor(() => expect(player.volumes).toEqual([0.2, 0.4]));
  });
});
