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
import {
  calculateGearAngles,
  FACTORY_GEARS,
  factoryDriveSpeed,
  gearPitchRadius,
} from "../../src/rooms/shapes/shapeFactory.model";

describe("deterministic shape factory", () => {
  it("meshes the factory gears at tangent pitch circles", () => {
    for (let index = 1; index < FACTORY_GEARS.length; index += 1) {
      const previous = FACTORY_GEARS[index - 1];
      const current = FACTORY_GEARS[index];
      expect(previous).toBeDefined();
      expect(current).toBeDefined();
      if (!previous || !current) return;
      const distance = Math.hypot(
        current.position[0] - previous.position[0],
        current.position[1] - previous.position[1],
      );
      expect(distance).toBeCloseTo(
        gearPitchRadius(previous.teeth) + gearPitchRadius(current.teeth),
        3,
      );
    }
  });

  it("turns meshed gears in alternating directions at tooth-count ratios", () => {
    const driveAngle = 1.75;
    const resting = calculateGearAngles(0);
    const angles = calculateGearAngles(driveAngle);
    const travel = {
      drive: angles.drive - resting.drive,
      idler: angles.idler - resting.idler,
      output: angles.output - resting.output,
    };
    expect(travel.drive).toBe(driveAngle);
    expect(travel.idler).toBeCloseTo(-(driveAngle * 14) / 22);
    expect(travel.output).toBeCloseTo((driveAngle * 14) / 16);
    expect(Math.abs(travel.drive * 14)).toBeCloseTo(Math.abs(travel.idler * 22));
    expect(Math.abs(travel.idler * 22)).toBeCloseTo(Math.abs(travel.output * 16));

    for (let index = 1; index < FACTORY_GEARS.length; index += 1) {
      const driver = FACTORY_GEARS[index - 1];
      const driven = FACTORY_GEARS[index];
      expect(driver).toBeDefined();
      expect(driven).toBeDefined();
      if (!driver || !driven) return;
      const lineAngle = Math.atan2(
        driven.position[1] - driver.position[1],
        driven.position[0] - driver.position[0],
      );
      const contactPhase =
        driver.teeth * (lineAngle - angles[driver.id]) +
        driven.teeth * (lineAngle + Math.PI - angles[driven.id]);
      expect(Math.cos(contactPhase)).toBeCloseTo(-1);
    }
  });

  it("stops motion for drag, pause, completion, and reduced motion", () => {
    expect(factoryDriveSpeed({ phase: "waiting", conveyorPaused: false }, false)).toBeGreaterThan(
      0,
    );
    expect(factoryDriveSpeed({ phase: "waiting", conveyorPaused: true }, false)).toBe(0);
    expect(factoryDriveSpeed({ phase: "processing", conveyorPaused: true }, false)).toBeGreaterThan(
      1,
    );
    expect(factoryDriveSpeed({ phase: "paused", conveyorPaused: false }, false)).toBe(0);
    expect(factoryDriveSpeed({ phase: "complete", conveyorPaused: false }, false)).toBe(0);
    expect(factoryDriveSpeed({ phase: "processing", conveyorPaused: true }, true)).toBe(0);
  });

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
