import { expect, test } from "@playwright/test";

interface ManifestIcon {
  readonly src: string;
  readonly sizes: string;
  readonly type: string;
}

function isManifest(value: unknown): value is { readonly icons: readonly ManifestIcon[] } {
  if (!value || typeof value !== "object") return false;
  const icons = (value as { icons?: unknown }).icons;
  return (
    Array.isArray(icons) &&
    icons.every(
      (icon: unknown) =>
        Boolean(icon) &&
        typeof icon === "object" &&
        typeof (icon as ManifestIcon).src === "string" &&
        typeof (icon as ManifestIcon).sizes === "string" &&
        typeof (icon as ManifestIcon).type === "string",
    )
  );
}

test("exposes a valid base-aware install manifest", async ({ page, context }) => {
  await page.goto("./");
  const manifestResponse = await page.request.get("./manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest: unknown = await manifestResponse.json();
  expect(manifest).toMatchObject({
    name: "Carly's Magic Playroom",
    short_name: "Magic Playroom",
    start_url: "/carlys-magic-playroom/",
    scope: "/carlys-magic-playroom/",
    display: "standalone",
  });
  expect(isManifest(manifest)).toBe(true);
  if (!isManifest(manifest)) return;
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: "192x192", type: "image/png" }),
      expect.objectContaining({ sizes: "512x512", type: "image/png" }),
    ]),
  );
  for (const icon of manifest.icons) {
    expect((await page.request.get(icon.src)).ok()).toBe(true);
  }

  const cdp = await context.newCDPSession(page);
  const appManifest = await cdp.send("Page.getAppManifest");
  expect(appManifest.errors).toEqual([]);
  expect(appManifest.url).toContain("/carlys-magic-playroom/manifest.webmanifest");

  const serviceWorker = await page.request.get("./sw.js");
  expect(serviceWorker.ok()).toBe(true);
  const workerSource = await serviceWorker.text();
  expect(workerSource).not.toContain("skipWaiting");
  expect(workerSource).toContain("ignoreVary: true");
  expect(workerSource).toContain("caches.delete");
  expect(workerSource).toContain("/carlys-magic-playroom/models/train/locomotive.glb");
  expect(workerSource).toContain("/carlys-magic-playroom/models/train/cargo-car.glb");
  expect(workerSource).toContain("/carlys-magic-playroom/models/train/duck.glb");
});

test("loads every room and saved progress offline with partial audio loss", async ({
  page,
  context,
}) => {
  test.setTimeout(75_000);
  await page.goto("./");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);

  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Play with the train" }).click();
  await page.getByRole("button", { name: "Load yellow duck" }).first().click();
  await page.getByRole("button", { name: "Load yellow duck" }).first().click();
  await expect(page.getByText("Trips: 1")).toBeVisible();

  await page.evaluate(async () => {
    for (const key of await caches.keys()) {
      const cache = await caches.open(key);
      for (const request of await cache.keys()) {
        if (new URL(request.url).pathname.includes("/audio/music/")) await cache.delete(request);
      }
    }
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Carly's Magic Playroom" })).toBeVisible();
  await page.getByRole("button", { name: "Play" }).click();

  const rooms = [
    ["Play with the train", "Tiny Delivery Train"],
    ["Build a critter", "Build-a-Critter Lab"],
    ["Visit the garden", "Little Garden"],
    ["Visit the shape factory", "Magic Shape Factory"],
    ["Make some music", "Musical Corner"],
  ] as const;
  for (const [button, heading] of rooms) {
    await page.getByRole("button", { name: button }).click();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(1);
    if (heading === "Tiny Delivery Train") await expect(page.getByText("Trips: 1")).toBeVisible();
    if (heading === "Musical Corner") {
      await page.getByRole("button", { name: "Play target sound again" }).click();
      await expect(page.getByText(/Listen, then tap/)).toBeVisible();
    }
    await page.getByRole("button", { name: "Go home" }).click();
  }
  await expect(page.getByRole("heading", { name: "Where shall we play?" })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
});

test("reports a diagnostics-only low-quality profile and bounded frame metrics", async ({
  page,
}) => {
  await page.goto("?diagnostics=1&quality=low");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByText("Build diagnostics").click();
  await expect(page.getByText("low", { exact: true })).toBeVisible();
  await expect(page.getByText(/playroom: .* ms average, .* draw calls/)).toBeVisible({
    timeout: 4_000,
  });
  await page.getByRole("button", { name: "Reset performance metrics" }).click();
  await expect(page.getByRole("status")).toHaveText("Performance metrics reset.");
});
