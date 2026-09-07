import { expect, test, type Page } from "@playwright/test";
import { MUSIC_SOUND_IDS } from "../../src/rooms/music/music.types";

function collapseRepeated(values: readonly string[]): readonly string[] {
  return values.filter((value, index) => index === 0 || value !== values[index - 1]);
}

test("loads the startup shell from the repository subpath", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Carly's Magic Playroom" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
  await expect(page.locator("main")).toHaveCSS("min-height", /\d+px/);
});

test("serves every Musical Corner cue format from the repository subpath", async ({ request }) => {
  for (const soundId of MUSIC_SOUND_IDS) {
    for (const format of ["ogg", "mp3"] as const) {
      const response = await request.get(`audio/music/${soundId}.${format}`);
      expect(response.ok(), `${soundId}.${format}`).toBe(true);
      expect((await response.body()).byteLength, `${soundId}.${format}`).toBeGreaterThan(1_000);
    }
  }
});

test("keeps Musical Corner pitch, volume, and envelope contrasts pronounced", async ({ page }) => {
  await page.goto("./");
  const metrics = await page.evaluate(async () => {
    const context = new AudioContext();
    const measure = async (soundId: string) => {
      const response = await fetch(`audio/music/${soundId}.ogg`);
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      const samples = buffer.getChannelData(0);
      let squareSum = 0;
      let peak = 0;
      let zeroCrossings = 0;
      for (let index = 0; index < samples.length; index += 1) {
        const sample = samples[index] ?? 0;
        squareSum += sample * sample;
        peak = Math.max(peak, Math.abs(sample));
        if (index > 0 && (samples[index - 1] ?? 0) <= 0 && sample > 0) zeroCrossings += 1;
      }
      return {
        duration: buffer.duration,
        peak,
        rms: Math.sqrt(squareSum / samples.length),
        zeroCrossingsPerSecond: zeroCrossings / buffer.duration,
      };
    };
    const result = {
      loud: await measure("drum-loud"),
      soft: await measure("drum-soft"),
      high: await measure("bell-high"),
      low: await measure("bell-low"),
      bell: await measure("bell-normal"),
      xylophone: await measure("xylophone-normal"),
    };
    await context.close();
    return result;
  });

  expect(metrics.loud.rms / metrics.soft.rms).toBeGreaterThan(2.5);
  expect(metrics.soft.rms).toBeGreaterThan(0.05);
  expect(metrics.loud.peak).toBeLessThan(0.85);
  expect(metrics.high.zeroCrossingsPerSecond / metrics.low.zeroCrossingsPerSecond).toBeGreaterThan(
    2.2,
  );
  expect(metrics.xylophone.duration / metrics.bell.duration).toBeLessThan(0.6);
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

test("keeps the train activity playable when its models are unavailable", async ({ page }) => {
  await page.route("**/models/train/*.glb", (route) => route.abort("failed"));
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Play with the train" }).click();

  await expect(page.getByRole("heading", { name: "Tiny Delivery Train" })).toBeVisible();
  await page.getByRole("button", { name: "Load yellow duck" }).first().click();
  await page.getByRole("button", { name: "Load yellow duck" }).first().click();
  await expect(page.getByText("Trips: 1")).toBeVisible();
});

test("keeps critter assembly playable when its component models are unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: undefined });
  });
  await page.route("**/models/critter/*.glb", (route) => route.abort("failed"));
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Build a critter" }).click();

  await page.getByRole("button", { name: "Choose eyes-star" }).click();
  await page.getByRole("button", { name: "Choose mouth-smile" }).click();
  await page.getByRole("button", { name: "Choose legs-bouncy" }).click();
  await expect(page.getByText("Your critter is ready!")).toBeVisible();
  await expect(page).toHaveScreenshot("critter-fallback-complete.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
  await page.getByRole("button", { name: "Build another" }).click();
  await page.getByRole("button", { name: "Choose eyes-round" }).click();
  await page.getByRole("button", { name: "Choose mouth-o" }).click();
  await page.getByRole("button", { name: "Choose legs-stompy" }).click();
  await expect(page).toHaveScreenshot("critter-fallback-round-mouth.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
});

test("keeps musical matching playable when its instrument models are unavailable", async ({
  page,
}) => {
  await page.route("**/models/music/*.glb", (route) => route.abort("failed"));
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Make some music" }).click();

  await tapExpectedMusicInstrument(page);
  await expect(page.getByText("Songs matched: 1")).toBeVisible();
});

test("keeps garden growth playable when its character models are unavailable", async ({ page }) => {
  await page.route("**/models/garden/*.glb", (route) => route.abort("failed"));
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Visit the garden" }).click();

  await (await expectedGardenHelper(page)).click();
  await expect(page.getByText("Growth 1/3")).toBeVisible();
  await (await expectedGardenHelper(page)).click();
  await (await expectedGardenHelper(page)).click();
  await expect(page.getByText("Growth 3/3")).toBeVisible();
  await expect(page.getByRole("button", { name: "Grow another" })).toBeVisible();
});

test("supports keyboard settings and reduced-motion room transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).press("Enter");
  await page.getByRole("button", { name: "Open settings" }).click();
  await unlockParentArea(page);
  await expect(page.getByText("Local controls")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open settings" })).toBeFocused();

  await page.getByRole("button", { name: "Visit the garden" }).click();
  await expect(page.getByRole("heading", { name: "Little Garden" })).toBeVisible({
    timeout: 2_000,
  });
});

test("persists accessible parent controls and confirms local reset", async ({ page }) => {
  test.setTimeout(45_000);

  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Open settings" }).click();
  await expect(page.getByText(/not a security lock/)).toBeVisible();
  await page.getByRole("button", { name: "Back to play" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Open settings" }).click();
  await unlockParentArea(page);
  await expect(page.getByText(/not a diagnosis/)).toBeVisible();
  await expect(page).toHaveScreenshot("parent-controls.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
  await page.getByRole("slider", { name: "Master volume" }).fill("0.4");
  await page.getByRole("checkbox", { name: "Reduce motion" }).check();
  await page.getByRole("checkbox", { name: "Reduce decorative effects" }).check();
  await page.getByRole("checkbox", { name: "High-contrast interaction outlines" }).check();
  await page.getByLabel("Hint timing").selectOption("8000");
  await page.getByRole("checkbox", { name: "Musical Corner" }).uncheck();
  await page.getByRole("button", { name: "Back to play" }).click();
  await expect(page.locator("main.game-shell")).toHaveClass(/high-contrast/);
  await expect(page.getByRole("button", { name: "Make some music" })).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.getByRole("button", { name: "Make some music" })).toHaveCount(0);
  await page.getByRole("button", { name: "Open settings" }).click();
  await unlockParentArea(page);
  await expect(page.getByRole("slider", { name: "Master volume" })).toHaveValue("0.4");
  await expect(page.getByText(/No activities recorded yet/)).toBeVisible();

  await page.getByRole("button", { name: "Reset all local data" }).click();
  await expect(page.getByText("Confirm reset all local data?")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("slider", { name: "Master volume" })).toHaveValue("0.4");
  await page.getByRole("button", { name: "Reset all local data" }).click();
  await page.getByRole("button", { name: "Yes, reset" }).click();
  await expect(page.getByRole("slider", { name: "Master volume" })).toHaveValue("1");
  await page.getByRole("button", { name: "Back to play" }).click();
  await expect(page.getByRole("button", { name: "Make some music" })).toBeVisible();
});

test("completes and persists the fixed two-yellow-duck train activity", async ({ page }) => {
  test.setTimeout(45_000);
  const voiceRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() !== "media") return;
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
    .poll(() => collapseRepeated(voiceRequests), { timeout: 6_000 })
    .toEqual(["instruction-two-yellow-ducks", "count-one", "count-two", "success-all-aboard"]);

  await page.getByRole("button", { name: "Play again" }).click();
  await expect(page.getByLabel("0 toys loaded")).toBeVisible();
  await expect(page.getByRole("button", { name: "Load yellow duck" }).first()).toBeEnabled();

  await page.reload();
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Play with the train" }).click();
  await expect(page.getByText("Trips: 1")).toBeVisible();
});

test("assembles, replaces, reacts, and reloads a fixed critter", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const voiceRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() !== "media") return;
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
  await page.getByRole("button", { name: "mint", exact: true }).click();
  await expect(page.getByRole("button", { name: "mint", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page).toHaveScreenshot("critter-complete-fixed-seed.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
  await page.getByRole("button", { name: "wave" }).click();
  await page.getByRole("button", { name: "wave" }).click();
  await expect
    .poll(() => collapseRepeated(voiceRequests), { timeout: 6_000 })
    .toEqual(["choose-eyes", "choose-mouth", "choose-legs", "critter-ready"]);

  await page.getByRole("button", { name: "Tall Body" }).click();
  await page.getByRole("button", { name: "Choose legs-tall" }).click();
  await expect(page.getByText("Saved critters: 1")).toBeVisible();
  await expect(page).toHaveScreenshot("critter-tall-complete-fixed-seed.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });

  await page.reload();
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Build a critter" }).click();
  await expect(page.getByText("Saved critters: 1")).toBeVisible();
});

test("completes three-step garden tasks safely", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const voiceRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() !== "media") return;
    const match = /audio\/garden\/([^/.]+)\.(?:ogg|mp3)$/.exec(request.url());
    if (match?.[1]) voiceRequests.push(match[1]);
  });
  // Keep this visual baseline independent of the runner's hardware signals.
  await page.goto("./?diagnostics=1&quality=high");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Visit the garden" }).click();

  await expect(page.getByRole("button", { name: "Pause garden" })).toBeEnabled();
  await page.getByRole("button", { name: "Pause garden" }).click();
  await expect(page.getByText("The garden is resting.")).toBeVisible();
  await page.getByRole("button", { name: "Resume garden" }).click();

  const firstHelper = await expectedGardenHelper(page);
  await firstHelper.click({ clickCount: 2 });
  await expect(page.getByText("Growth 1/3")).toBeVisible();
  await tapExpectedGardenModel(page);
  await tapExpectedGardenModel(page);
  await expect(page.getByText("Garden games: 1")).toBeVisible();
  await expect(page).toHaveScreenshot("garden-growth.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });

  await page.getByRole("button", { name: "Grow another" }).click();
  await tapExpectedGardenModel(page);
  await tapExpectedGardenModel(page);
  await tapExpectedGardenModel(page);
  await expect(page.getByText("Garden games: 2")).toBeVisible();
  await expect(page).toHaveScreenshot("garden-bee.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
  await expect
    .poll(() => [...new Set(voiceRequests)].sort())
    .toEqual(["flower-grew", "tap-cloud", "tap-sun"]);

  await page.reload();
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Visit the garden" }).click();
  await expect(page.getByText("Garden games: 2")).toBeVisible();
});

test("reduces choices and completes the fixed shape factory puzzle", async ({ page }) => {
  // This flow intentionally exercises four processing cycles and two visual baselines. Give
  // software-rendered CI enough headroom when the other WebGL rooms run concurrently.
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const voiceRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() !== "media") return;
    const match = /audio\/shapes\/([^/.]+)\.(?:ogg|mp3)$/.exec(request.url());
    if (match?.[1]) voiceRequests.push(match[1]);
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Visit the shape factory" }).click();

  const correct = page.getByRole("button", { name: "small red square" });
  await expect(correct).toBeEnabled();
  const wrong = page.locator('.shape-tray button:not([aria-label="small red square"])').first();
  await wrong.click();
  await wrong.click();
  await expect(page.getByText("Only the matching shape is left.")).toBeVisible();
  await expect(page.locator(".shape-tray button")).toHaveCount(1);
  await expect(page).toHaveScreenshot("shape-factory-hint.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });

  const shapeBounds = await correct.boundingBox();
  const openingBounds = await page.getByTestId("shape-opening").boundingBox();
  expect(shapeBounds).not.toBeNull();
  expect(openingBounds).not.toBeNull();
  if (!shapeBounds || !openingBounds) return;
  await page.mouse.move(
    shapeBounds.x + shapeBounds.width / 2,
    shapeBounds.y + shapeBounds.height / 2,
  );
  await page.mouse.down();
  await expect(page.locator(".shape-tray")).toHaveClass(/paused/);
  await page.mouse.move(
    openingBounds.x + openingBounds.width / 2,
    openingBounds.y + openingBounds.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(page.getByText("Step 2 of 4")).toBeVisible();
  await page.getByRole("button", { name: "big blue circle" }).click();
  await expect(page.getByText("Step 3 of 4")).toBeVisible();
  await page.getByRole("button", { name: "small yellow triangle" }).click();
  await expect(page.getByText("Step 4 of 4")).toBeVisible();
  await page.getByRole("button", { name: "big green diamond" }).click();
  await expect(page.getByRole("button", { name: "Make another" })).toBeVisible();
  await expect(page.getByText(/Factories finished:\s*1/)).toBeVisible();
  await expect
    .poll(() => [...new Set(voiceRequests)].sort())
    .toEqual([
      "instruction",
      "instruction-blue-circle",
      "instruction-green-diamond",
      "instruction-yellow-triangle",
      "success",
    ]);

  await page.reload();
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Visit the shape factory" }).click();
  await expect(page.getByText(/Factories finished:\s*1/)).toBeVisible();
});

test("shows a clear final shape with standard and reduced motion", async ({ page }) => {
  test.setTimeout(45_000);

  for (const reducedMotion of [false, true]) {
    await page.emulateMedia({ reducedMotion: reducedMotion ? "reduce" : "no-preference" });
    await page.goto("./");
    await page.getByRole("button", { name: "Play" }).click();
    await page.getByRole("button", { name: "Visit the shape factory" }).click();
    const correctShape = page.getByRole("button", { name: "small red square" });
    await expect(correctShape).toBeEnabled();
    // The standard-motion tray intentionally drifts a few pixels like a conveyor. A real tap does
    // not require the target to become stationary, so bypass Playwright's stability heuristic.
    await correctShape.click({ force: true });
    await expect(page.getByRole("status")).toContainText("Shape made!");
    await expect(page).toHaveScreenshot(
      reducedMotion ? "shape-factory-output-reduced.png" : "shape-factory-output-standard.png",
      {
        animations: "disabled",
        maxDiffPixelRatio: 0.01,
      },
    );
  }
});

test("replays, mutes, bounds taps, and matches a musical target", async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const soundRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() !== "media") return;
    const match = /audio\/music\/([^/.]+)\.(?:ogg|mp3)$/.exec(request.url());
    if (match?.[1]) soundRequests.push(match[1]);
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Make some music" }).click();

  await expect(page.getByRole("button", { name: "Play target sound again" })).toBeVisible();
  const wrong = page.locator('.music-choices button[data-target="false"]').first();
  await expect(wrong).toBeEnabled();
  await wrong.click();
  await expect(page.getByText("Watch the target picture bounce.")).toBeVisible();
  const nextWrong = page.locator('.music-choices button[data-target="false"]').first();
  if (await nextWrong.isVisible()) {
    // Under a heavily loaded parallel run, the automatic hint can simplify the
    // choices between this check and the click. Either path must reach the same
    // child-safe one-choice state without spending the rest of the test timeout.
    await nextWrong.click({ timeout: 1_000 }).catch(() => undefined);
  }
  await expect(page.getByText("Here is the matching picture.")).toBeVisible();
  await expect(page.locator(".music-choices button")).toHaveCount(1);
  await expect(page).toHaveScreenshot("music-stage.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
  await page.getByRole("button", { name: "Replay instruction" }).click();
  await page.getByRole("button", { name: "Play target sound again" }).click();

  await page.getByRole("button", { name: "Open settings" }).click();
  await unlockParentArea(page);
  const soundToggle = page.getByRole("checkbox", { name: "Sound on" });
  await soundToggle.uncheck();
  await expect(soundToggle).not.toBeChecked();
  await page.getByRole("button", { name: "Back to play" }).click();
  await page.getByRole("button", { name: "Play target sound again" }).click();

  await page.getByRole("button", { name: "Open settings" }).click();
  await page.getByRole("checkbox", { name: "Sound on" }).check();
  await expect(page.getByRole("checkbox", { name: "Sound on" })).toBeChecked();
  await page.getByRole("button", { name: "Back to play" }).click();
  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Play target sound again" }).click();
  }
  await expect(page.locator(".music-choices button")).toHaveCount(1);
  await tapExpectedMusicInstrument(page);
  await expect(page.getByRole("button", { name: "Try another sound" })).toBeVisible();
  await expect(page.getByText("Songs matched: 1")).toBeVisible();
  await expect.poll(() => new Set(soundRequests).size).toBeGreaterThanOrEqual(2);

  await page.reload();
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Make some music" }).click();
  await expect(page.getByText("Songs matched: 1")).toBeVisible();
});

async function expectedGardenHelper(page: Page) {
  await expect(page.getByRole("button", { name: "Tap rain cloud" })).toBeEnabled();
  const wantsWater = await page.getByText("Tap the rain cloud.", { exact: true }).isVisible();
  return page.getByRole("button", { name: wantsWater ? "Tap rain cloud" : "Tap warm sun" });
}

async function tapExpectedMusicInstrument(page: Page) {
  const target = page.locator('.music-choices button[data-target="true"]');
  await expect(target).toBeEnabled();
  const label = await target.getAttribute("aria-label");
  const canvas = page.locator(".music-canvas canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Musical Corner canvas is unavailable");
  const visibleChoices = page.locator(".music-choices button");
  const count = await visibleChoices.count();
  const xRatio =
    count === 1
      ? 0.5
      : count === 2
        ? label?.startsWith("high") || label?.startsWith("loud")
          ? 0.35
          : 0.65
        : label === "drum"
          ? 0.27
          : label === "bell"
            ? 0.5
            : 0.73;
  const x = bounds.x + bounds.width * xRatio;
  const y = bounds.y + bounds.height * 0.63;
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

async function tapExpectedGardenModel(page: Page) {
  await expect(page.getByRole("button", { name: "Pause garden" })).toBeEnabled();
  const wantsWater = await page.getByText("Tap the rain cloud.", { exact: true }).isVisible();
  const canvas = page.locator(".garden-canvas canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Garden canvas is unavailable");
  await page.mouse.click(
    bounds.x + bounds.width * (wantsWater ? 0.76 : 0.25),
    bounds.y + bounds.height * 0.16,
  );
}

async function unlockParentArea(page: Page) {
  const hold = page.getByRole("button", { name: "Hold for grown-up controls" });
  await expect(hold).toBeVisible();
  await hold.focus();
  await page.keyboard.down("Enter");
  await page.waitForTimeout(1_850);
  await page.keyboard.up("Enter");
  await expect(page.getByText("Local controls")).toBeVisible();
}
