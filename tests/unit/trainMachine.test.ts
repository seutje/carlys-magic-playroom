import { generateTrainActivity } from "../../src/rooms/train/train.generator";
import { initialTrainState, reduceTrainActivity } from "../../src/rooms/train/train.machine";
import type { TrainActivityState } from "../../src/rooms/train/train.types";
import { runStateMachine } from "../../src/testing/helpers";

const definition = generateTrainActivity({
  seed: "machine-ducks",
  difficulty: 2,
  target: { category: "duck", color: "yellow", count: 2 },
});
const correct = definition.objects.filter(
  (object) => object.category === "duck" && object.color === "yellow",
);
const incorrect = definition.objects.find(
  (object) => object.category !== "duck" || object.color !== "yellow",
);

function waitingState(): TrainActivityState {
  return runStateMachine(reduceTrainActivity, initialTrainState, [
    { type: "LOADED", definition },
    { type: "INTRO_FINISHED" },
    { type: "INSTRUCTION_FINISHED" },
  ]);
}

describe("reduceTrainActivity", () => {
  it("accepts matching objects, rejects gently, and completes exactly once", () => {
    const first = correct[0];
    const second = correct[1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(incorrect).toBeDefined();
    if (!first || !second || !incorrect) return;

    let state = waitingState();
    state = reduceTrainActivity(state, { type: "OBJECT_DROPPED", objectId: incorrect.id });
    expect(state.lastDrop?.result).toBe("rejected");
    expect(state.loadedObjectIds).toEqual([]);
    state = reduceTrainActivity(state, { type: "EVALUATION_FINISHED" });

    state = reduceTrainActivity(state, { type: "OBJECT_DROPPED", objectId: first.id });
    expect(state.lastDrop?.result).toBe("accepted");
    state = reduceTrainActivity(state, { type: "EVALUATION_FINISHED" });
    state = reduceTrainActivity(state, { type: "OBJECT_DROPPED", objectId: second.id });
    state = reduceTrainActivity(state, { type: "EVALUATION_FINISHED" });
    expect(state.phase).toBe("celebrating");
    expect(state.completedOnce).toBe(true);
    expect(reduceTrainActivity(state, { type: "EVALUATION_FINISHED" })).toBe(state);
    state = reduceTrainActivity(state, { type: "CELEBRATION_FINISHED" });
    expect(state.phase).toBe("complete");
  });

  it("prevents duplicate inventory and escalates bounded hints", () => {
    const first = correct[0];
    if (!first) return;
    let state = waitingState();
    state = reduceTrainActivity(state, { type: "OBJECT_DROPPED", objectId: first.id });
    state = reduceTrainActivity(state, { type: "EVALUATION_FINISHED" });
    state = reduceTrainActivity(state, { type: "OBJECT_DROPPED", objectId: first.id });
    expect(state.lastDrop?.result).toBe("duplicate");
    expect(state.loadedObjectIds).toEqual([first.id]);
    state = reduceTrainActivity(state, { type: "EVALUATION_FINISHED" });
    for (let index = 0; index < 5; index += 1) {
      state = reduceTrainActivity(state, { type: "HINT_TIMEOUT" });
    }
    expect(state.hintLevel).toBe(3);
  });

  it("pauses, resumes, recovers, resets, and exits safely", () => {
    let state = waitingState();
    state = reduceTrainActivity(state, { type: "PAUSE" });
    expect(state.phase).toBe("paused");
    state = reduceTrainActivity(state, { type: "RESUME" });
    expect(state.phase).toBe("waiting");
    state = reduceTrainActivity(state, { type: "FAIL" });
    state = reduceTrainActivity(state, { type: "RECOVER" });
    expect(state.phase).toBe("instruction");
    state = reduceTrainActivity(state, { type: "RESET" });
    expect(state.phase).toBe("intro");
    state = reduceTrainActivity(state, { type: "EXIT" });
    expect(state.phase).toBe("exiting");
    expect(reduceTrainActivity(state, { type: "EXIT" })).toBe(state);
  });
});
