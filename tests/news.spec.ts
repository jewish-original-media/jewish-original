import { expect, test } from "@playwright/test";

import { readJsonLd } from "./helpers/json-ld";

test("serves /news as a text-first outward-linking desk", async ({ page }) => {
  const response = await page.goto("/news");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "What we’re following" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Continue exploring" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Continue exploring" })
      .getByRole("link", { name: "Current" }),
  ).toHaveAttribute("href", "/explore?view=current");
  if (await page.getByText(/not following a current story/i).count()) {
    await page.reload();
  }
  await expect(page.getByText(/not following a current story/i)).toHaveCount(0);
  await expect(page.getByText(/couldn't load the news desk/i)).toHaveCount(0);
  await expect(page.getByText(/no published news items yet/i)).toHaveCount(0);
  const sourceLinks = page.getByRole("link", { name: /view source/i });
  expect(await sourceLinks.count()).toBeGreaterThan(0);
  for (const sourceLink of await sourceLinks.all()) {
    await expect(sourceLink).toHaveAttribute(
      "data-analytics-event",
      "news_outbound",
    );
  }
  await expect(
    page.getByRole("link", {
      name: /see news and events together in current/i,
    }),
  ).toHaveAttribute("href", "/explore?view=current");
  await expect(page.getByText(/according to reports/i)).toHaveCount(0);
  await expect(page.getByText(/highlights the intersection/i)).toHaveCount(0);
  await expect(page.locator('a[href^="/news/"]')).toHaveCount(0);
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/news",
  );
  const collection = await readJsonLd<{ "@type"?: string }>(
    page,
    "CollectionPage",
  );
  expect(collection["@type"]).toBe("CollectionPage");
  const hrefs = await page
    .locator('a[data-analytics-event="news_outbound"]')
    .evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
    );
  expect(hrefs.length).toBeGreaterThan(0);
  expect(
    hrefs.every(
      (href) =>
        href.startsWith("https://jta.org/") ||
        href.startsWith("https://jpost.com/") ||
        href.startsWith("https://www.jta.org/") ||
        href.startsWith("https://www.jpost.com/") ||
        href.startsWith("https://biblicalarchaeology.org/") ||
        href.startsWith("https://www.biblicalarchaeology.org/"),
    ),
  ).toBe(true);
});
