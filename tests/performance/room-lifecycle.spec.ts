import { expect, test } from "@playwright/test";

test("keeps low-quality room lifecycles responsive and bounded", async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const cdp = await context.newCDPSession(page);
  await cdp.send("HeapProfiler.enable");

  await page.goto("?diagnostics=1&quality=low");
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.getByRole("heading", { name: "Where shall we play?" })).toBeVisible();
  await cdp.send("HeapProfiler.collectGarbage");
  const before = await cdp.send("Runtime.getHeapUsage");

  const rooms = [
    ["Play with the train", "Tiny Delivery Train"],
    ["Build a critter", "Build-a-Critter Lab"],
    ["Visit the garden", "Little Garden"],
    ["Visit the shape factory", "Magic Shape Factory"],
    ["Make some music", "Musical Corner"],
  ] as const;
  for (let cycle = 0; cycle < 2; cycle += 1) {
    for (const [button, heading] of rooms) {
      await page.getByRole("button", { name: button }).click();
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      await expect(page.locator("canvas")).toHaveCount(1);
      await page.waitForTimeout(600);
      await page.getByRole("button", { name: "Go home" }).click();
      await expect(page.getByRole("heading", { name: "Where shall we play?" })).toBeVisible();
    }
  }

  await page.waitForTimeout(800);
  await cdp.send("HeapProfiler.collectGarbage");
  const after = await cdp.send("Runtime.getHeapUsage");
  expect(after.usedSize - before.usedSize).toBeLessThan(25 * 1_048_576);
  await expect(page.locator("canvas")).toHaveCount(1);

  await page.getByText("Build diagnostics").click();
  const samples = page.locator(".build-diagnostics li");
  await expect(samples).toHaveCount(6);
  const rows = await samples.allTextContents();
  for (const row of rows) {
    const match = /: ([\d.]+) ms average, (\d+) draw calls/.exec(row);
    expect(match, row).not.toBeNull();
    expect(Number(match?.[1])).toBeLessThanOrEqual(34);
    expect(Number(match?.[2])).toBeGreaterThan(0);
  }
});

test("holds the playroom profile within its device-tier frame budget", async ({
  page,
}, testInfo) => {
  await page.goto("?diagnostics=1&quality=high");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByText("Build diagnostics").click();
  const row = page.locator(".build-diagnostics li", { hasText: "playroom:" });
  await expect(row).toBeVisible({ timeout: 4_000 });
  const text = await row.textContent();
  const average = /playroom: ([\d.]+) ms average/.exec(text ?? "")?.[1];
  const tablet = testInfo.project.name.includes("tablet");
  expect(Number(average)).toBeLessThanOrEqual(tablet ? 34 : 18.5);

  const canvas = page.locator("canvas");
  const backingWidth = await canvas.getAttribute("width");
  const bounds = await canvas.boundingBox();
  const devicePixelRatio = await page.evaluate(() => window.devicePixelRatio);
  const expectedRatio = Math.min(devicePixelRatio, 1.5);
  expect(Number(backingWidth)).toBeGreaterThanOrEqual((bounds?.width ?? 0) * (expectedRatio - 0.1));
});
