import { chooseQuality, resolveQuality } from "../../src/engine/rendering/quality";

const capableSignals = {
  deviceMemory: 8,
  hardwareConcurrency: 8,
  devicePixelRatio: 2,
  viewportWidth: 1200,
} as const;

describe("adaptive quality", () => {
  it("selects low quality for constrained memory or CPU", () => {
    expect(chooseQuality({ ...capableSignals, deviceMemory: 4 })).toBe("low");
    expect(chooseQuality({ ...capableSignals, hardwareConcurrency: 2 })).toBe("low");
  });

  it("selects high only for a capable, sufficiently large display", () => {
    expect(chooseQuality(capableSignals)).toBe("high");
    expect(chooseQuality({ ...capableSignals, viewportWidth: 800 })).toBe("medium");
    expect(chooseQuality({ ...capableSignals, devicePixelRatio: 3 })).toBe("medium");
  });

  it("accepts explicit overrides only with diagnostics enabled", () => {
    expect(resolveQuality("?quality=low", capableSignals).level).toBe("high");
    expect(resolveQuality("?diagnostics=1&quality=low", capableSignals)).toMatchObject({
      level: "low",
      dpr: 1,
      shadows: false,
      particleCount: 1,
      decorativeObjects: false,
    });
  });
});
