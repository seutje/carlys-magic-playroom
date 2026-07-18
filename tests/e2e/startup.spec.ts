import { expect, test, type Page } from "@playwright/test";

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

test("completes and persists the fixed two-yellow-duck train activity", async ({ page }) => {
  const voiceRequests: string[] = [];
  page.on("request", (request) => {
    const match = /audio\/train\/([^/.]+)\.(?:ogg|mp3)$/.exec(request.url());
    if (match?.[1]) voiceRequests.push(match[1]);
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Play with the train" }).click();
  await expect(page.getByRole("button", { name: "Load yellow duck" }).first()).toBeEnabled();
  await expect(page).toHaveScreenshot("train-fixed-seed.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });

  const wrongToy = page.getByRole("button", { name: /^Load (?!yellow duck)/ }).first();
  await expect(wrongToy).toBeEnabled();
  await wrongToy.click();
  await expect(page.getByText(/wiggle back/)).toBeVisible();

  const firstDuck = page.getByRole("button", { name: "Load yellow duck" }).first();
  await expect(firstDuck).toBeEnabled();
  const duckBounds = await firstDuck.boundingBox();
  const dropBounds = await page.getByTestId("train-drop-zone").boundingBox();
  expect(duckBounds).not.toBeNull();
  expect(dropBounds).not.toBeNull();
  if (!duckBounds || !dropBounds) return;
  await page.mouse.move(duckBounds.x + duckBounds.width / 2, duckBounds.y + duckBounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(dropBounds.x + dropBounds.width / 2, dropBounds.y + dropBounds.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(page.getByLabel("1 toys loaded")).toBeVisible();

  const secondDuck = page.getByRole("button", { name: "Load yellow duck" }).first();
  await expect(secondDuck).toBeEnabled();
  await secondDuck.click();
  await expect(page.getByLabel("2 toys loaded")).toBeVisible();
  await expect(page.getByText("All aboard!")).toBeVisible();
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  await expect(page.getByText("Trips: 1")).toBeVisible();
  await expect
    .poll(() => voiceRequests, { timeout: 6_000 })
    .toEqual(["instruction-two-yellow-ducks", "count-one", "count-two", "success-all-aboard"]);

  await page.reload();
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Play with the train" }).click();
  await expect(page.getByText("Trips: 1")).toBeVisible();
});

test("assembles, replaces, reacts, and reloads a fixed critter", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const voiceRequests: string[] = [];
  page.on("request", (request) => {
    const match = /audio\/critter\/([^/.]+)\.(?:ogg|mp3)$/.exec(request.url());
    if (match?.[1]) voiceRequests.push(match[1]);
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Build a critter" }).click();

  const starEyes = page.getByRole("button", { name: "Choose eyes-star" });
  await expect(starEyes).toBeEnabled();
  await expect(page).toHaveScreenshot("critter-fixed-seed.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
  await starEyes.click();
  await page.getByRole("button", { name: "Choose eyes-round" }).click();
  await expect(page.getByText("A new part popped into place.")).toBeVisible();
  await page.getByRole("button", { name: "Choose mouth-smile" }).click();
  await page.getByRole("button", { name: "Choose legs-bouncy" }).click();

  await expect(page.getByText("Your critter is ready!")).toBeVisible();
  await expect(page.getByText("Saved critters: 1")).toBeVisible();
  await page.getByRole("button", { name: "wave" }).click();
  await page.getByRole("button", { name: "wave" }).click();
  await expect
    .poll(() => voiceRequests, { timeout: 6_000 })
    .toEqual(["choose-eyes", "choose-mouth", "choose-legs", "critter-ready"]);

  await page.reload();
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Build a critter" }).click();
  await expect(page.getByText("Saved critters: 1")).toBeVisible();
});

test("completes one-step and two-step garden tasks safely", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const voiceRequests: string[] = [];
  page.on("request", (request) => {
    const match = /audio\/garden\/([^/.]+)\.(?:ogg|mp3)$/.exec(request.url());
    if (match?.[1]) voiceRequests.push(match[1]);
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Visit the garden" }).click();

  await expect(page.getByRole("button", { name: "Pause garden" })).toBeEnabled();
  await page.getByRole("button", { name: "Pause garden" }).click();
  await expect(page.getByText("The garden is resting.")).toBeVisible();
  await page.getByRole("button", { name: "Resume garden" }).click();

  const firstHelper = await expectedGardenHelper(page);
  await firstHelper.click({ clickCount: 2 });
  await expect(page.getByText("Growth 1/3")).toBeVisible();
  await expect(page.getByText("Garden games: 1")).toBeVisible();
  await expect(page).toHaveScreenshot("garden-growth.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });

  await page.getByRole("button", { name: "Try two steps" }).click();
  await (await expectedGardenHelper(page)).click();
  await (await expectedGardenHelper(page)).click();
  await expect(page.getByText("Garden games: 2")).toBeVisible();
  await expect
    .poll(() => [...new Set(voiceRequests)].sort())
    .toEqual(["flower-grew", "tap-cloud", "tap-sun"]);

  await page.reload();
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Visit the garden" }).click();
  await expect(page.getByText("Garden games: 2")).toBeVisible();
});

async function expectedGardenHelper(page: Page) {
  await expect(page.getByRole("button", { name: "Tap rain cloud" })).toBeEnabled();
  const wantsWater = await page.getByText("Tap the rain cloud.", { exact: true }).isVisible();
  return page.getByRole("button", { name: wantsWater ? "Tap rain cloud" : "Tap warm sun" });
}
