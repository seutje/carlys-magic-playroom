import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { chromium } from "@playwright/test";

const iconDirectory = new URL("../public/icons/", import.meta.url);
const sourceUrl = pathToFileURL(new URL("playroom-icon.svg", iconDirectory).pathname).href;

await mkdir(iconDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const size of [192, 512]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.goto(sourceUrl);
    await page.locator("svg").screenshot({
      path: new URL(`playroom-icon-${size}.png`, iconDirectory).pathname,
      omitBackground: true,
    });
  }
} finally {
  await browser.close();
}
