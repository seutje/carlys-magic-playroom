import { nextTrainDepartureX } from "../../src/rooms/train/train.animation";
import { trainPlankToyX } from "../../src/rooms/train/train.layout";

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

describe("train plank layout", () => {
  it("fills the usable plank width evenly for a four-toy round", () => {
    const positions = Array.from({ length: 4 }, (_, index) => trainPlankToyX(index, 4));

    expect(positions[0]).toBeCloseTo(-4.5);
    expect(positions[1]).toBeCloseTo(-2.7);
    expect(positions[2]).toBeCloseTo(-0.9);
    expect(positions[3]).toBeCloseTo(0.9);
  });

  it("centers a single remaining toy", () => {
    expect(trainPlankToyX(0, 1)).toBe(-1.8);
  });

  it("rejects invalid slot requests", () => {
    expect(() => trainPlankToyX(0, 0)).toThrow("at least one toy");
    expect(() => trainPlankToyX(3, 3)).toThrow("outside the available toy range");
  });
});
