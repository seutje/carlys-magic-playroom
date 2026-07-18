import { hintDelay, nextHintStep, validateHintPlan } from "../../src/engine/hints/hintPlan";
import { TRAIN_HINT_PLAN } from "../../src/rooms/train/train.hints";

describe("shared hint plan", () => {
  it("escalates, repeats, simplifies, and clamps at the strongest hint", () => {
    expect(validateHintPlan(TRAIN_HINT_PLAN)).toBe(true);
    expect(nextHintStep(TRAIN_HINT_PLAN, 0).repeatInstruction).toBe(true);
    expect(nextHintStep(TRAIN_HINT_PLAN, 1).motion).toBe("wiggle");
    expect(nextHintStep(TRAIN_HINT_PLAN, 2).simplifyChoices).toBe(true);
    expect(nextHintStep(TRAIN_HINT_PLAN, 20).level).toBe(3);
    expect(hintDelay(TRAIN_HINT_PLAN, 0)).toBe(5_000);
    expect(nextHintStep(TRAIN_HINT_PLAN, 0).reducedMotion).toBe("outline");
  });

  it("rejects an unordered plan", () => {
    const invalid = {
      steps: [
        {
          level: 2,
          delayMs: 1,
          repeatInstruction: false,
          simplifyChoices: false,
          motion: "none" as const,
          reducedMotion: "none" as const,
        },
      ],
    };
    expect(validateHintPlan(invalid)).toBe(false);
    expect(() => nextHintStep(invalid, 0)).toThrow(/ordered/);
  });
});
