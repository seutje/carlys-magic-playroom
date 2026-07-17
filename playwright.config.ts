import { defineConfig, devices } from "@playwright/test";

const rootPreview = process.env.PLAYWRIGHT_ROOT === "1";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  (rootPreview ? "http://127.0.0.1:4173/" : "http://127.0.0.1:4173/carlys-magic-playroom/");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "tablet-chromium",
      use: {
        ...devices["iPad (gen 7) landscape"],
        browserName: "chromium",
      },
    },
  ],
  webServer: {
    command: rootPreview ? "npm run preview:root" : "npm run preview:pages",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
