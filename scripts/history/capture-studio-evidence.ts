import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium, expect, type Page } from "@playwright/test";
import { getCliClient } from "sanity/cli";

const records = [
  {
    file: "studio-clean-us-liberates-dachau.png",
    id: "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc",
    title: "US Liberates Dachau",
    group: "Story",
  },
  {
    file: "studio-duplicate-romanian-yellow-stars.png",
    id: "historyEntry.jom-94b0e003311359c0c85cbb03ad6f57bd",
    title: "Romanian Jews were Forced to Wear the Yellow Stars",
    group: "Review",
  },
  {
    file: "studio-incomplete-jerusalem-capital.png",
    id: "historyEntry.jom-9b5b8aeb863e4222480133b5bbe360b1",
    title: "US Congress Recognizes Jerusalem the Capital of Israel",
    group: "Review",
  },
  {
    file: "studio-recurring-yom-hazikaron.png",
    id: "historyEntry.jom-2b082850a893ebcd0e8d5f09d507ebd9",
    title: "Yom HaZikaron",
    group: "Story",
  },
] as const;

async function selectGroup(page: Page, group: string) {
  const tab = page.getByRole("tab", { name: group, exact: true });
  if (await tab.count()) {
    await tab.click();
    return;
  }
  const button = page.getByRole("button", { name: group, exact: true });
  if (await button.count()) await button.click();
}

async function main() {
  const client = getCliClient({ apiVersion: "2026-08-31", useCdn: false });
  const config = client.config();
  const token = config.token;
  const projectId =
    config.projectId || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!token)
    throw new Error("No authenticated Sanity user token is available.");
  if (!projectId) throw new Error("Missing Sanity project ID.");

  const outputDirectory = resolve("artifacts/studio-evidence");
  await mkdir(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify({ token: value }));
    },
    { key: `__studio_auth_token_${projectId}`, value: token },
  );

  try {
    for (const record of records) {
      await page.goto(
        `http://localhost:3000/admin/structure/historyEntry;${record.id}`,
        { waitUntil: "domcontentloaded" },
      );
      await expect(
        page.getByText(record.title, { exact: true }).first(),
      ).toBeVisible({
        timeout: 30_000,
      });
      await selectGroup(page, record.group);
      await page.waitForTimeout(1_000);
      await page.screenshot({
        path: resolve(outputDirectory, record.file),
        fullPage: false,
      });
    }
  } finally {
    await browser.close();
  }

  process.stdout.write(
    `Captured ${records.length} authenticated Studio screenshots in ${outputDirectory}.\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Studio evidence capture failed: ${message}\n`);
  process.exitCode = 1;
});
