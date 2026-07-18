import { generateTrainActivity } from "../../src/rooms/train/train.generator";
import { validateTrainDefinition } from "../../src/rooms/train/train.validation";

describe("generateTrainActivity", () => {
  it("reproduces a fixed two-yellow-duck scenario", () => {
    const options = {
      seed: "welcome-ducks",
      difficulty: 2 as const,
      target: { category: "duck" as const, color: "yellow" as const, count: 2 as const },
    };
    expect(generateTrainActivity(options)).toEqual(generateTrainActivity(options));
    expect(generateTrainActivity(options).target).toEqual(options.target);
  });

  it("generates serializable, unique, solvable definitions across seeds and difficulties", () => {
    for (let index = 0; index < 300; index += 1) {
      const difficulty = ((index % 3) + 1) as 1 | 2 | 3;
      const definition = generateTrainActivity({ seed: `property-${index}`, difficulty });
      const ids = definition.objects.map((object) => object.id);
      const matches = definition.objects.filter(
        (object) =>
          object.category === definition.target.category &&
          object.color === definition.target.color,
      );

      expect(new Set(ids).size).toBe(ids.length);
      expect(matches).toHaveLength(definition.target.count);
      expect(validateTrainDefinition(JSON.parse(JSON.stringify(definition)))).toBe(true);
    }
  });

  it("rejects invalid persisted definitions", () => {
    expect(validateTrainDefinition({ schemaVersion: 1 })).toBe(false);
    const definition = generateTrainActivity({ seed: "corrupt", difficulty: 1 });
    expect(
      validateTrainDefinition({
        ...definition,
        objects: [definition.objects[0], definition.objects[0]],
      }),
    ).toBe(false);
  });
});
