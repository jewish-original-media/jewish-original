import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium, expect } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const secret = process.env.DRAFT_MODE_SECRET;

async function main() {
  if (!secret) {
    throw new Error("DRAFT_MODE_SECRET is required to capture draft preview.");
  }

  const outputDirectory = resolve("artifacts/podcasts/preview");
  await mkdir(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });

  try {
    await page.goto(
      `${baseURL}/api/draft-mode/enable?secret=${encodeURIComponent(secret)}&slug=the-two-tall-jews-show&type=podcast-show`,
      { waitUntil: "load" },
    );
    await expect(
      page.getByRole("heading", { name: "The Two Tall Jews Show" }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: resolve(outputDirectory, "ttjs-show-desktop.png"),
      fullPage: true,
    });

    await page.goto(
      `${baseURL}/podcasts/the-two-tall-jews-show/sitting-down-with-kalman-gavriel-the-jerusalem-scribe`,
      { waitUntil: "load" },
    );
    await expect(
      page.getByRole("heading", {
        name: "Sitting Down With: Kalman Gavriel, The Jerusalem Scribe",
      }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: resolve(outputDirectory, "episode-desktop.png"),
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "load" });
    await expect(
      page.getByRole("heading", {
        name: "Sitting Down With: Kalman Gavriel, The Jerusalem Scribe",
      }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: resolve(outputDirectory, "episode-mobile.png"),
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
