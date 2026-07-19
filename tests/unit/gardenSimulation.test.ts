import {
  generateGardenActivity,
  validateGardenDefinition,
} from "../../src/rooms/garden/garden.generator";
import { createGardenState, reduceGarden } from "../../src/rooms/garden/garden.machine";
import type { GardenEvent } from "../../src/rooms/garden/garden.types";
import { runStateMachine } from "../../src/testing/helpers";

describe("deterministic garden simulation", () => {
  it("reproduces serializable three-step definitions", () => {
    const first = generateGardenActivity("fixed-garden");
    expect(first).toEqual(generateGardenActivity("fixed-garden"));
    expect(first.task).toHaveLength(3);
    expect(first.task[0]).toBe(first.task[2]);
    expect(first.task[0]).not.toBe(first.task[1]);
    expect(validateGardenDefinition(JSON.parse(JSON.stringify(first)))).toBe(true);
  });

  it("produces the same safe growth for the same event sequence", () => {
    const definition = generateGardenActivity("water-sun");
    const events: GardenEvent[] = [
      { type: "INTRO_FINISHED" },
      { type: "ACT", action: definition.task[0] ?? "water" },
      { type: "EFFECT_FINISHED" },
      { type: "ACT", action: definition.task[1] ?? "sun" },
      { type: "EFFECT_FINISHED" },
      { type: "ACT", action: definition.task[2] ?? "water" },
      { type: "EFFECT_FINISHED" },
    ];
    const first = runStateMachine(reduceGarden, createGardenState(definition), events);
    const second = runStateMachine(reduceGarden, createGardenState(definition), events);
    expect(first).toEqual(second);
    expect(first).toMatchObject({ phase: "celebrating", growth: 3, visitor: "bee" });
  });

  it("bounds rapid and excess input without harming or resetting the plant", () => {
    const definition = generateGardenActivity("safe-garden");
    let state = reduceGarden(createGardenState(definition), { type: "INTRO_FINISHED" });
    const wrong = definition.task[0] === "water" ? "sun" : "water";
    state = reduceGarden(state, { type: "ACT", action: wrong });
    const rapid = reduceGarden(state, { type: "ACT", action: wrong });
    expect(rapid).toBe(state);
    expect(state.growth).toBe(0);
    expect(state.water + state.light).toBe(1);
    state = reduceGarden(state, { type: "EFFECT_FINISHED" });
    state = reduceGarden(state, { type: "ACT", action: wrong });
    state = reduceGarden(state, { type: "EFFECT_FINISHED" });
    expect(state.hintLevel).toBe(2);
    state = reduceGarden(state, { type: "PAUSE" });
    expect(reduceGarden(state, { type: "RESUME" }).phase).toBe("waiting");
  });
});
