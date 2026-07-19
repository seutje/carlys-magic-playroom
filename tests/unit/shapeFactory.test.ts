import {
  generateShapeFactory,
  generateShapePuzzle,
  matchesRule,
  validateShapeFactory,
  validateShapePuzzle,
} from "../../src/rooms/shapes/shapes.generator";
import {
  activeStep,
  createShapeFactoryState,
  reduceShapeFactory,
} from "../../src/rooms/shapes/shapes.machine";

describe("deterministic shape factory", () => {
  it("reproduces serializable, unambiguous, solvable puzzles across many seeds", () => {
    for (let index = 0; index < 250; index += 1) {
      const seed = `shape-property-${index}`;
      const puzzle = generateShapePuzzle(seed);
      expect(puzzle).toEqual(generateShapePuzzle(seed));
      expect(validateShapePuzzle(JSON.parse(JSON.stringify(puzzle)))).toBe(true);
      expect(puzzle.items.filter((item) => matchesRule(item, puzzle.target))).toHaveLength(1);
      expect(new Set(puzzle.items.map((item) => item.id)).size).toBe(puzzle.items.length);
    }
  });

  it("builds four distinct targets assigned to four distinct machine slots", () => {
    const factory = generateShapeFactory("four-step-factory");
    expect(factory).toEqual(generateShapeFactory("four-step-factory"));
    expect(validateShapeFactory(JSON.parse(JSON.stringify(factory)))).toBe(true);
    expect(factory.steps).toHaveLength(4);
    expect(new Set(factory.steps.map((step) => step.slot)).size).toBe(4);
    const targetPairs = factory.steps.map(
      (step) => `${step.puzzle.target.color}:${step.puzzle.target.kind}`,
    );
    expect(new Set(targetPairs).size).toBe(4);
  });

  it("rejects invalid, duplicate, and ambiguous definitions", () => {
    const valid = generateShapePuzzle("validation");
    expect(validateShapePuzzle({ ...valid, target: { ...valid.target, kind: "star" } })).toBe(
      false,
    );
    expect(validateShapePuzzle({ ...valid, items: [valid.items[0], valid.items[0]] })).toBe(false);
    const correct = valid.items.find((item) => matchesRule(item, valid.target));
    expect(correct).toBeDefined();
    expect(validateShapePuzzle({ ...valid, items: [correct, { ...correct, id: "other" }] })).toBe(
      false,
    );
  });

  it("pauses during drag, returns mismatches, reduces choices, and bounds rapid input", () => {
    const factory = generateShapeFactory("machine-flow");
    const puzzle = factory.steps[0]!.puzzle;
    const correct = puzzle.items.find((item) => matchesRule(item, puzzle.target));
    const wrong = puzzle.items.find((item) => !matchesRule(item, puzzle.target));
    expect(correct).toBeDefined();
    expect(wrong).toBeDefined();
    if (!correct || !wrong) return;

    let state = reduceShapeFactory(createShapeFactoryState(factory), { type: "INTRO_FINISHED" });
    state = reduceShapeFactory(state, { type: "DRAG_STARTED" });
    expect(state.conveyorPaused).toBe(true);
    state = reduceShapeFactory(state, { type: "DRAG_CANCELED" });
    expect(state).toMatchObject({ phase: "waiting", conveyorPaused: false, feedback: "returning" });
    state = reduceShapeFactory(state, {
      type: "ITEM_DROPPED",
      itemId: wrong.id,
      insideOpening: true,
    });
    state = reduceShapeFactory(state, {
      type: "ITEM_DROPPED",
      itemId: wrong.id,
      insideOpening: true,
    });
    expect(state).toMatchObject({ mismatchCount: 2, hintLevel: 2 });

    state = reduceShapeFactory(state, {
      type: "ITEM_DROPPED",
      itemId: correct.id,
      insideOpening: true,
    });
    const duplicate = reduceShapeFactory(state, {
      type: "ITEM_DROPPED",
      itemId: correct.id,
      insideOpening: true,
    });
    expect(duplicate).toBe(state);
  });

  it("processes once and recovers safely if processing is interrupted", () => {
    const factory = generateShapeFactory("watchdog");
    const puzzle = factory.steps[0]!.puzzle;
    const correct = puzzle.items.find((item) => matchesRule(item, puzzle.target));
    expect(correct).toBeDefined();
    if (!correct) return;
    let state = reduceShapeFactory(createShapeFactoryState(factory), { type: "INTRO_FINISHED" });
    state = reduceShapeFactory(state, {
      type: "ITEM_DROPPED",
      itemId: correct.id,
      insideOpening: true,
    });
    expect(state.phase).toBe("processing");
    const recovered = reduceShapeFactory(state, { type: "RECOVER" });
    expect(recovered).toMatchObject({
      phase: "waiting",
      conveyorPaused: false,
      feedback: "recovered",
    });
    state = reduceShapeFactory(state, { type: "PROCESSING_FINISHED" });
    expect(state.phase).toBe("output");
    expect(reduceShapeFactory(state, { type: "PROCESSING_FINISHED" })).toBe(state);
    state = reduceShapeFactory(state, { type: "OUTPUT_FINISHED" });
    state = reduceShapeFactory(state, { type: "CELEBRATION_FINISHED" });
    expect(state.phase).toBe("waiting");
    expect(state.stepIndex).toBe(1);
    expect(state.completedStepIds).toEqual([factory.steps[0]!.id]);

    for (let stepIndex = 1; stepIndex < factory.steps.length; stepIndex += 1) {
      const correctItem = activeStep(state).puzzle.items.find((item) =>
        matchesRule(item, activeStep(state).puzzle.target),
      );
      expect(correctItem).toBeDefined();
      if (!correctItem) return;
      state = reduceShapeFactory(state, {
        type: "ITEM_DROPPED",
        itemId: correctItem.id,
        insideOpening: true,
      });
      state = reduceShapeFactory(state, { type: "PROCESSING_FINISHED" });
      state = reduceShapeFactory(state, { type: "OUTPUT_FINISHED" });
      state = reduceShapeFactory(state, { type: "CELEBRATION_FINISHED" });
    }
    expect(state.phase).toBe("complete");
  });
});
