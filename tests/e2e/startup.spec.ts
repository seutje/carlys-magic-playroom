import { expect, test } from "@playwright/test";

test("loads the startup shell from the repository subpath", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Carly's Magic Playroom" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
  await expect(page.locator("main")).toHaveCSS("min-height", /\d+px/);
});

test("keeps diagnostics out of the ordinary child-facing view", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByText("Build diagnostics")).toHaveCount(0);

  await page.goto("?diagnostics=1");
  await expect(page.getByText("Build diagnostics")).toBeVisible();
});

test("starts, enters the train room, replays, and returns home", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).click();

  const trainPortal = page.getByRole("button", { name: "Play with the train" });
  await expect(trainPortal).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Choose a room" }).getByRole("button"),
  ).toHaveCount(5);
  const box = await trainPortal.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(64);

  await trainPortal.click();
  await expect(page.getByRole("heading", { name: "Tiny Delivery Train" })).toBeVisible();
  await page.getByRole("button", { name: "Replay instruction" }).click();
  await expect(page.getByText("Instruction replayed")).toHaveText("Instruction replayed");
  await page.getByRole("button", { name: "Go home" }).click();
  await expect(page.getByRole("heading", { name: "Where shall we play?" })).toBeVisible();
});

test("supports keyboard settings and reduced-motion room transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).press("Enter");
  await page.getByRole("button", { name: "Open settings" }).click();
  await expect(page.getByRole("dialog", { name: "Sound settings" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Visit the garden" }).click();
  await expect(page.getByRole("heading", { name: "Little Garden" })).toBeVisible({
    timeout: 2_000,
  });
});
