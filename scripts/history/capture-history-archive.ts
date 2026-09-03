import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const [name, value] = line.split("=", 2);
    if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name)) continue;
    if (process.env[name]) continue;
    process.env[name] = value.replace(/^["']|["']$/g, "");
  }
} catch {
  // Capture can still run against a public production server.
}

import { chromium, expect } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

const viewports = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "laptop", width: 1280, height: 900 },
  { name: "tablet-1024", width: 1024, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
] as const;

async function main() {
  const outputDirectory = resolve("artifacts/history-archive");
  await mkdir(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage();

  try {
    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(`${baseURL}/history`, { waitUntil: "load" });
      await expect(
        page.getByRole("heading", { name: /on this day in jewish history/i }),
      ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      await page.screenshot({
        path: resolve(outputDirectory, `history-archive-${viewport.name}.png`),
        fullPage: true,
      });
    }

    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto(`${baseURL}/history?month=4&day=29`, { waitUntil: "load" });
    await expect(
      page.getByRole("heading", { name: "On April 29" }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: resolve(outputDirectory, "history-archive-april-29.png"),
      fullPage: true,
    });

    await page.goto(`${baseURL}/history?month=9&day=2`, { waitUntil: "load" });
    await expect(
      page.getByText("No reviewed story is attached to this date yet."),
    ).toBeVisible();
    await page.screenshot({
      path: resolve(outputDirectory, "history-archive-empty-day.png"),
      fullPage: true,
    });

    await page.goto(`${baseURL}/history?topic=holocaust`, { waitUntil: "load" });
    await expect(page.getByRole("heading", { name: "Holocaust" })).toBeVisible();
    await page.screenshot({
      path: resolve(outputDirectory, "history-archive-topic.png"),
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
