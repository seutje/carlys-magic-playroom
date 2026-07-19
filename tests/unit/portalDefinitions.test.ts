import { PORTALS } from "../../src/playroom/portalDefinitions";

describe("playroom portal definitions", () => {
  it("spells CARLY from left to right", () => {
    const leftToRight = [...PORTALS].sort(
      (first, second) => first.position[0] - second.position[0],
    );

    expect(leftToRight.map((portal) => portal.letter).join("")).toBe("CARLY");
  });
});
