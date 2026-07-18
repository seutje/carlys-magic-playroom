import { diagnostics } from "../../src/engine/diagnostics/diagnostics";
import { registerServiceWorker } from "../../src/engine/offline/registerServiceWorker";

describe("service-worker registration", () => {
  beforeEach(() => diagnostics.clear());

  it("is inert outside production", async () => {
    const register = vi.fn();
    await expect(
      registerServiceWorker({ production: false, serviceWorker: { register } }),
    ).resolves.toBeUndefined();
    expect(register).not.toHaveBeenCalled();
  });

  it("keeps play available and records a local diagnostic when registration rejects", async () => {
    const register = vi.fn().mockRejectedValue(new Error("unavailable"));
    await expect(
      registerServiceWorker({ production: true, serviceWorker: { register } }),
    ).resolves.toBeUndefined();
    expect(diagnostics.read().at(-1)).toMatchObject({
      category: "asset",
      code: "service-worker-registration-failed",
    });
  });
});
