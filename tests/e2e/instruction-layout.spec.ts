import { expect, test, type Locator, type Page } from "@playwright/test";

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const viewports = [
  { name: "narrow portrait", width: 320, height: 568 },
  { name: "short landscape", width: 667, height: 375 },
  { name: "tablet landscape", width: 1024, height: 768 },
] as const;

const rooms = [
  {
    portal: "Play with the train",
    guide: ".train-instruction",
    targets: ".train-toy-controls button",
  },
  {
    portal: "Build a critter",
    guide: ".critter-guide",
    targets: ".critter-customize button, .critter-part-tray button",
  },
  {
    portal: "Visit the garden",
    guide: ".garden-guide",
    targets: ".garden-controls button, .garden-pause",
  },
  {
    portal: "Visit the shape factory",
    guide: ".shape-factory-guide",
    targets: ".shape-opening.active, .shape-tray button",
  },
  {
    portal: "Make some music",
    guide: ".music-guide",
    targets: ".music-target, .music-choices button",
  },
] as const;

test("keeps instruction panels clear of tap targets across responsive layouts", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.route("**/models/**/*.glb", (route) => route.abort("failed"));

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    for (const room of rooms) {
      await openRoom(page, room.portal);
      const guide = page.locator(room.guide);
      await expect(guide).toBeVisible();
      await expectNoOverlap(guide, page.locator(".global-controls button"));
      await expectNoOverlap(guide, page.locator(room.targets));

      if (room.guide === ".garden-guide") {
        await expectGardenCanvasTargetsClear(page, guide);
      }
    }
  }
});

async function openRoom(page: Page, portalName: string) {
  await page.goto("./");
  await page.addStyleTag({ content: ":root { font-size: 112.5%; }" });
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: portalName }).click();
}

async function expectNoOverlap(guide: Locator, targets: Locator) {
  const guideBox = await guide.boundingBox();
  expect(guideBox).not.toBeNull();
  if (!guideBox) return;

  for (const target of await targets.all()) {
    if (!(await target.isVisible())) continue;
    const targetBox = await target.boundingBox();
    expect(targetBox).not.toBeNull();
    if (targetBox) {
      expect(targetBox.width).toBeGreaterThanOrEqual(64);
      expect(targetBox.height).toBeGreaterThanOrEqual(64);
      expect(overlapArea(guideBox, targetBox)).toBe(0);
    }
  }
}

async function expectGardenCanvasTargetsClear(page: Page, guide: Locator) {
  const guideBox = await guide.boundingBox();
  const canvasBox = await page.locator(".garden-canvas canvas").boundingBox();
  expect(guideBox).not.toBeNull();
  expect(canvasBox).not.toBeNull();
  if (!guideBox || !canvasBox) return;

  // These are the stable projected centers used by the deterministic garden interaction test.
  // An 80px square conservatively protects the visible helper and its forgiving collider.
  for (const [xRatio, yRatio] of [
    [0.25, 0.16],
    [0.76, 0.16],
  ] as const) {
    const targetBox = {
      x: canvasBox.x + canvasBox.width * xRatio - 40,
      y: canvasBox.y + canvasBox.height * yRatio - 40,
      width: 80,
      height: 80,
    };
    expect(overlapArea(guideBox, targetBox)).toBe(0);
  }
}

function overlapArea(first: Rect, second: Rect): number {
  const width = Math.max(
    0,
    Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x),
  );
  const height = Math.max(
    0,
    Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y),
  );
  return width * height;
}
