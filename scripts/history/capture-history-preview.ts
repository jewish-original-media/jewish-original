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
  // Capture is skipped by the missing-secret check below.
}

import { chromium, expect } from "@playwright/test";

const slugs = [
  "bialystok-ghetto-established",
  "samuel-willenberg-dies",
  "anti-jewish-riots-tripoli",
];
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

async function main() {
  const secret = process.env.DRAFT_MODE_SECRET;
  if (!secret) throw new Error("DRAFT_MODE_SECRET is required.");

  const outputDirectory = resolve("artifacts/history-preview");
  await mkdir(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });

  try {
    await page.goto(`${baseURL}/history`, {
      waitUntil: "load",
    });
    await expect(
      page.getByRole("heading", { name: /on this day in jewish history/i }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: resolve(outputDirectory, "history-index-public.png"),
      fullPage: true,
    });

    for (const slug of slugs) {
      await page.goto(
        `${baseURL}/api/draft-mode/enable?secret=${encodeURIComponent(secret)}&slug=${slug}`,
        { waitUntil: "load" },
      );
      await expect(page.getByText("Private editorial preview")).toBeVisible({
        timeout: 20_000,
      });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(850);
      await page.screenshot({
        path: resolve(outputDirectory, `${slug}-desktop.png`),
        fullPage: true,
      });
    }

    for (const slug of slugs) {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(
        `${baseURL}/api/draft-mode/enable?secret=${encodeURIComponent(secret)}&slug=${slug}`,
        { waitUntil: "load" },
      );
      await expect(page.getByText("Private editorial preview")).toBeVisible({
        timeout: 20_000,
      });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(850);
      await page.screenshot({
        path: resolve(outputDirectory, `${slug}-tablet.png`),
        fullPage: true,
      });

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(
        `${baseURL}/api/draft-mode/enable?secret=${encodeURIComponent(secret)}&slug=${slug}`,
        { waitUntil: "load" },
      );
      await expect(page.getByText("Private editorial preview")).toBeVisible({
        timeout: 20_000,
      });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(850);
      await page.screenshot({
        path: resolve(outputDirectory, `${slug}-mobile.png`),
        fullPage: true,
      });
    }
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
