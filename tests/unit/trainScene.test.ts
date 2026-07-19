import { nextTrainDepartureX } from "../../src/rooms/train/train.animation";

describe("train scene departure", () => {
  it("moves while departing and returns to its starting position when the round restarts", () => {
    const departedX = nextTrainDepartureX(0, 2, true, false);

    expect(departedX).toBe(9);
    expect(nextTrainDepartureX(departedX, 0.016, false, false)).toBe(0);
  });

  it("keeps the train still when reduced motion is enabled", () => {
    expect(nextTrainDepartureX(0, 2, true, true)).toBe(0);
  });
});
