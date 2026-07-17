import { expect, test } from "@playwright/test";

test("loads the startup shell from the repository subpath", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Carly's Magic Playroom" })).toBeVisible();
  await expect(page.locator("main")).toHaveCSS("min-height", /\d+px/);
});

test("keeps diagnostics out of the ordinary child-facing view", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByText("Build diagnostics")).toHaveCount(0);

  await page.goto("?diagnostics=1");
  await expect(page.getByText("Build diagnostics")).toBeVisible();
});
