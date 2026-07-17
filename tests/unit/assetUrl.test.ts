import { assetUrl } from "../../src/engine/assets/assetUrl";

describe("assetUrl", () => {
  it("resolves app-owned assets beneath the configured Vite base", () => {
    expect(assetUrl("audio/welcome.mp3")).toBe(`${import.meta.env.BASE_URL}audio/welcome.mp3`);
  });

  it.each(["", "/audio/welcome.mp3", "../secret.txt"])(
    "rejects an unsafe runtime path: %s",
    (path) => {
      expect(() => assetUrl(path)).toThrow(/relative/);
    },
  );
});
