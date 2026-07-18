import { TrainAudioController, type TrainAudioCue } from "../../src/rooms/train/train.audio";

function controlledPlayer() {
  const played: TrainAudioCue[] = [];
  const pending: (() => void)[] = [];
  const player = {
    play: vi.fn((cue: TrainAudioCue) => {
      played.push(cue);
      return new Promise<void>((resolve) => pending.push(resolve));
    }),
    stop: vi.fn(() => pending.shift()?.()),
  };
  return { player, played, finish: () => pending.shift()?.() };
}

describe("TrainAudioController", () => {
  it("plays an instruction only once when the same round renders repeatedly", async () => {
    const { player, played } = controlledPlayer();
    const controller = new TrainAudioController(player, () => ({ muted: false, masterVolume: 1 }));

    controller.beginRound(0);
    controller.beginRound(0);
    await vi.waitFor(() => expect(played).toEqual(["instruction-two-yellow-ducks"]));
  });

  it("serializes counts and success speech in child-action order", async () => {
    const { player, played, finish } = controlledPlayer();
    const controller = new TrainAudioController(player, () => ({ muted: false, masterVolume: 1 }));

    controller.speakCount(1);
    controller.speakCount(2);
    controller.celebrate();
    await vi.waitFor(() => expect(played).toEqual(["count-one"]));
    finish();
    await vi.waitFor(() => expect(played).toEqual(["count-one", "count-two"]));
    finish();
    await vi.waitFor(() =>
      expect(played).toEqual(["count-one", "count-two", "success-all-aboard"]),
    );
  });

  it("interrupts queued speech to replay the instruction cleanly", async () => {
    const { player, played } = controlledPlayer();
    const controller = new TrainAudioController(player, () => ({ muted: false, masterVolume: 1 }));

    controller.speakCount(1);
    controller.speakCount(2);
    await vi.waitFor(() => expect(played).toEqual(["count-one"]));
    controller.replayInstruction();
    await vi.waitFor(() => expect(played).toEqual(["count-one", "instruction-two-yellow-ducks"]));
    expect(player.stop).toHaveBeenCalledOnce();
  });

  it("keeps muted play silent without blocking the queue", async () => {
    const { player } = controlledPlayer();
    const controller = new TrainAudioController(player, () => ({ muted: true, masterVolume: 1 }));

    controller.beginRound(0);
    controller.speakCount(1);
    await vi.waitFor(() => expect(player.play).not.toHaveBeenCalled());
  });
});
