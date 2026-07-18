import "fake-indexeddb/auto";

import { resetSaveData, updateSaveData } from "../../src/persistence/saveData";
import {
  loadMusicProgress,
  migrateMusicProgress,
  recordMusicCompletion,
} from "../../src/rooms/music/music.persistence";

describe("music progress", () => {
  beforeEach(() => resetSaveData());

  it("records concepts and skill results idempotently", async () => {
    const first = await recordMusicCompletion("pitch", 1, "music:1");
    const duplicate = await recordMusicCompletion("pitch", 1, "music:1");
    expect(first).toMatchObject({
      completedRounds: 1,
      skillAttempts: 2,
      skillSuccesses: 1,
      concepts: ["pitch"],
    });
    expect(duplicate).toEqual(first);
    expect(await loadMusicProgress()).toEqual(first);
  });

  it("migrates legacy progress and isolates corrupt fields", async () => {
    expect(migrateMusicProgress({ schemaVersion: 0, completed: 5 })).toMatchObject({
      completedRounds: 5,
    });
    await updateSaveData((save) => ({
      ...save,
      roomProgress: {
        ...save.roomProgress,
        music: {
          schemaVersion: 1,
          completedRounds: -1,
          skillAttempts: 2,
          concepts: ["volume", "bad"],
          recentCompletionIds: ["ok", 4],
        },
      },
    }));
    expect(await loadMusicProgress()).toEqual({
      schemaVersion: 1,
      completedRounds: 0,
      skillAttempts: 2,
      skillSuccesses: 0,
      concepts: ["volume"],
      recentCompletionIds: ["ok"],
    });
  });
});
