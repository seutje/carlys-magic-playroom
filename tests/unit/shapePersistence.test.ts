import "fake-indexeddb/auto";

import { resetSaveData, updateSaveData } from "../../src/persistence/saveData";
import { generateShapeFactory } from "../../src/rooms/shapes/shapes.generator";
import {
  loadShapeProgress,
  migrateShapeProgress,
  recordShapeCompletion,
} from "../../src/rooms/shapes/shapes.persistence";

describe("shape progress", () => {
  beforeEach(() => resetSaveData());

  it("records skill outcomes and completion idempotently", async () => {
    const puzzle = generateShapeFactory("progress");
    const first = await recordShapeCompletion(puzzle, 2, "shape:1");
    const duplicate = await recordShapeCompletion(puzzle, 2, "shape:1");
    expect(first).toMatchObject({ completedActivities: 1, skillAttempts: 3, skillSuccesses: 1 });
    expect(first.lastPlayedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(duplicate).toEqual(first);
    expect(await loadShapeProgress()).toEqual(first);
  });

  it("migrates legacy data and isolates corrupt fields", async () => {
    expect(migrateShapeProgress({ schemaVersion: 0, completed: 3 })).toMatchObject({
      schemaVersion: 1,
      completedActivities: 3,
    });
    await updateSaveData((save) => ({
      ...save,
      roomProgress: {
        ...save.roomProgress,
        shapes: {
          schemaVersion: 1,
          completedActivities: -1,
          skillAttempts: 4,
          skillSuccesses: "bad",
          recentCompletionIds: ["valid", 8],
          lastPlayedAt: 4,
        },
      },
    }));
    expect(await loadShapeProgress()).toEqual({
      schemaVersion: 1,
      completedActivities: 0,
      skillAttempts: 4,
      skillSuccesses: 0,
      recentCompletionIds: ["valid"],
    });
  });
});
