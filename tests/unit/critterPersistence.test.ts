import "fake-indexeddb/auto";

import { resetSaveData, updateSaveData } from "../../src/persistence/saveData";
import { loadSavedCreatures, saveCreature } from "../../src/rooms/critter/critter.persistence";
import type { SavedCreature } from "../../src/rooms/critter/critter.types";

const creature: SavedCreature = {
  schemaVersion: 1,
  id: "fixed-critter",
  bodyId: "round",
  color: "mint",
  pattern: "spots",
  parts: { eyes: "eyes-star", mouth: "mouth-smile", legs: "legs-bouncy" },
  reaction: "wave",
  savedAt: 123,
};

describe("critter persistence", () => {
  beforeEach(() => resetSaveData());

  it("saves and reloads a completed creature without duplicates", async () => {
    await saveCreature(creature);
    await saveCreature(creature);
    expect(await loadSavedCreatures()).toEqual([creature]);
  });

  it("isolates corruption while migrating a compatible old creature", async () => {
    await updateSaveData((save) => ({
      ...save,
      savedCreatures: [
        { broken: true },
        {
          schemaVersion: 0,
          id: "legacy",
          body: "round",
          color: "peach",
          eyes: "eyes-round",
          mouth: "mouth-o",
          legs: "legs-stompy",
        },
      ],
    }));
    const loaded = await loadSavedCreatures();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toMatchObject({ id: "legacy", schemaVersion: 1, color: "peach" });
  });
});
