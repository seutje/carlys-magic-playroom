import "fake-indexeddb/auto";

import {
  defaultSaveData,
  loadSaveData,
  migrateSaveData,
  resetSaveData,
  updateSaveData,
} from "../../src/persistence/saveData";

describe("root save data", () => {
  beforeEach(() => resetSaveData());

  it("loads a fresh install and persists validated updates", async () => {
    expect(await loadSaveData()).toEqual(defaultSaveData);
    await updateSaveData((save) => ({
      ...save,
      settings: { ...save.settings, muted: true },
      completedTutorials: ["train"],
    }));
    expect(await loadSaveData()).toMatchObject({
      schemaVersion: 1,
      settings: { muted: true },
      completedTutorials: ["train"],
    });
  });

  it("recovers valid subsections and bounds local diagnostic metadata", () => {
    const recovered = migrateSaveData({
      schemaVersion: 1,
      settings: { muted: true, masterVolume: 5, reducedMotion: "bad" },
      roomProgress: { train: { schemaVersion: 1 }, unknown: { secret: true } },
      completedTutorials: ["valid", 2],
      savedCreatures: Array.from({ length: 25 }, (_, id) => ({ id })),
      diagnosticCodes: Array.from({ length: 30 }, (_, id) => `code-${id}`),
    });
    expect(recovered.settings).toMatchObject({ muted: true, masterVolume: 1 });
    expect(recovered.roomProgress).toEqual({ train: { schemaVersion: 1 } });
    expect(recovered.completedTutorials).toEqual(["valid"]);
    expect(recovered.savedCreatures).toHaveLength(20);
    expect(recovered.diagnosticCodes).toHaveLength(20);
  });

  it("migrates the legacy train subsection into the root format", () => {
    const legacy = { schemaVersion: 1, completedActivities: 3 };
    expect(migrateSaveData(undefined, legacy).roomProgress.train).toEqual(legacy);
  });
});
