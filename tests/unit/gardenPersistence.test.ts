import "fake-indexeddb/auto";

import { resetSaveData, updateSaveData } from "../../src/persistence/saveData";
import { generateGardenActivity } from "../../src/rooms/garden/garden.generator";
import {
  loadGardenProgress,
  migrateGardenProgress,
  recordGardenCompletion,
} from "../../src/rooms/garden/garden.persistence";

describe("garden progress", () => {
  beforeEach(() => resetSaveData());

  it("records activities, concepts, and skills idempotently", async () => {
    const definition = generateGardenActivity("progress");
    const first = await recordGardenCompletion(definition, 1, "garden:1");
    const duplicate = await recordGardenCompletion(definition, 1, "garden:1");
    expect(first).toMatchObject({
      completedActivities: 1,
      skillAttempts: 4,
      skillSuccesses: 3,
    });
    expect([...first.concepts].sort()).toEqual(["sun", "water"]);
    expect(duplicate).toEqual(first);
    expect(await loadGardenProgress()).toEqual(first);
  });

  it("migrates legacy progress and recovers corrupt fields", async () => {
    expect(migrateGardenProgress({ schemaVersion: 0, completed: 4 })).toMatchObject({
      schemaVersion: 1,
      completedActivities: 4,
    });
    await updateSaveData((save) => ({
      ...save,
      roomProgress: {
        ...save.roomProgress,
        garden: {
          schemaVersion: 1,
          completedActivities: -2,
          concepts: ["water", "bad"],
          recentCompletionIds: ["valid", 4],
        },
      },
    }));
    expect(await loadGardenProgress()).toMatchObject({
      completedActivities: 0,
      concepts: ["water"],
      recentCompletionIds: ["valid"],
    });
  });
});
