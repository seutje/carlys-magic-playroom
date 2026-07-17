import { diagnostics } from "../../src/engine/diagnostics/diagnostics";

describe("diagnostics", () => {
  it("stores only the most recent bounded records", () => {
    for (let index = 0; index < 55; index += 1) {
      diagnostics.record({ category: "activity", code: `event-${index}` });
    }

    const records = diagnostics.read();
    expect(records).toHaveLength(50);
    expect(records[0]?.code).toBe("event-5");
  });

  it("can be cleared", () => {
    diagnostics.record({ category: "asset", code: "missing-decoration" });
    diagnostics.clear();
    expect(diagnostics.read()).toEqual([]);
  });
});
