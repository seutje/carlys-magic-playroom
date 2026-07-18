import {
  isSerializableInstruction,
  renderInstruction,
  replayInstruction,
} from "../../src/engine/instructions/instruction";
import { generateTrainActivity } from "../../src/rooms/train/train.generator";
import { renderTrainInstruction } from "../../src/rooms/train/train.instructions";

describe("shared instructions", () => {
  const definition = generateTrainActivity({
    seed: "instruction",
    difficulty: 2,
    target: { category: "duck", color: "yellow", count: 2 },
  });

  it("renders train parameters through a localizable template", () => {
    expect(renderTrainInstruction(definition.instruction)).toBe(
      "Put two yellow ducks in the train.",
    );
    expect(isSerializableInstruction(JSON.parse(JSON.stringify(definition.instruction)))).toBe(
      true,
    );
  });

  it("shows a safe visual placeholder and tolerates missing or failed audio", async () => {
    expect(renderInstruction({ textKey: "key", parameters: {} }, { key: "Find {missing}." })).toBe(
      "Find ….",
    );
    await expect(replayInstruction(definition.instruction)).resolves.toBeUndefined();
    await expect(
      replayInstruction(definition.instruction, () => Promise.reject(new Error("missing"))),
    ).resolves.toBeUndefined();
  });
});
