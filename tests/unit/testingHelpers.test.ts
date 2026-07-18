import { MemoryPersistence, runStateMachine, seededFixtures } from "../../src/testing/helpers";

describe("shared testing helpers", () => {
  it("builds seeded fixtures and reducer sequences", () => {
    expect(seededFixtures(["a", "b"], (seed) => `fixture:${seed}`)).toEqual([
      "fixture:a",
      "fixture:b",
    ]);
    expect(runStateMachine((state: number, event: number) => state + event, 0, [1, 2, 3])).toBe(6);
  });

  it("provides isolated in-memory persistence", async () => {
    const persistence = new MemoryPersistence({ count: 0 });
    await persistence.save({ count: 2 });
    const loaded = await persistence.load();
    loaded.count = 9;
    expect(await persistence.load()).toEqual({ count: 2 });
  });
});
