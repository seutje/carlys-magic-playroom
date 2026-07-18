import "fake-indexeddb/auto";

import { generateTrainActivity } from "../../src/rooms/train/train.generator";
import {
  clearTrainProgressForTests,
  loadTrainProgress,
  migrateTrainProgress,
  recordTrainCompletion,
} from "../../src/rooms/train/train.progress";

const definition = generateTrainActivity({
  seed: "progress-ducks",
  difficulty: 2,
  target: { category: "duck", color: "yellow", count: 2 },
});

describe("train progress", () => {
  beforeEach(async () => {
    await clearTrainProgressForTests();
  });

  it("records completion and skill results exactly once per completion id", async () => {
    const first = await recordTrainCompletion(definition, 1, "session:1:round:0", 1234);
    const duplicate = await recordTrainCompletion(definition, 1, "session:1:round:0", 9999);

    expect(first.completedActivities).toBe(1);
    expect(first.lastPlayedAt).toBe(1234);
    expect(first.skills["count-2"]).toEqual({ attempts: 3, successes: 1 });
    expect(duplicate).toEqual(first);
    expect(await loadTrainProgress()).toEqual(first);
  });

  it("migrates legacy progress and preserves valid sections of corrupt data", () => {
    expect(
      migrateTrainProgress({ schemaVersion: 0, completedCount: 3, lastPlayedAt: 42 }),
    ).toMatchObject({ schemaVersion: 1, completedActivities: 3, lastPlayedAt: 42 });

    expect(
      migrateTrainProgress({
        schemaVersion: 1,
        completedActivities: -4,
        recentCompletionIds: ["valid", 9],
        skills: {
          "count-2": { attempts: 4, successes: 1 },
          broken: null,
        },
      }),
    ).toEqual({
      schemaVersion: 1,
      completedActivities: 0,
      lastPlayedAt: undefined,
      recentCompletionIds: ["valid"],
      skills: { "count-2": { attempts: 4, successes: 1 } },
    });
  });

  it("falls back safely for unknown schemas", () => {
    expect(migrateTrainProgress({ schemaVersion: 999, completedActivities: 8 })).toMatchObject({
      schemaVersion: 1,
      completedActivities: 0,
    });
  });
});
