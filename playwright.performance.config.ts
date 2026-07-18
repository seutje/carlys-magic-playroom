import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/carlys-magic-playroom/";

export default defineConfig({
  testDir: "./tests/performance",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "performance-report" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "tablet-chromium",
      use: { ...devices["iPad (gen 7) landscape"], browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run preview:pages",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
