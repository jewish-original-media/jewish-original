import { expect, test } from "@playwright/test";

import { readJsonLd } from "./helpers/json-ld";

test("serves /news as a text-first outward-linking desk", async ({ page }) => {
  const response = await page.goto("/news");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "What we’re following" }),
  ).toBeVisible();
  if (await page.getByText(/no published news items yet/i).count()) {
    await page.reload();
  }
  await expect(page.getByText(/no published news items yet/i)).toHaveCount(0);
  const sourceLinks = page.getByRole("link", { name: /view source/i });
  await expect(sourceLinks).toHaveCount(4);
  await expect(
    page.getByRole("heading", {
      name: "Jewish groups to protest against antisemitism outside United Nations",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "A case pitting Indiana Jews against an abortion ban heads back to court",
    }),
  ).toBeVisible();
  await expect(page.getByText("JTA").first()).toBeVisible();
  await expect(page.getByText("Jerusalem Post").first()).toBeVisible();
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
    .locator("main ol a")
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
        href.startsWith("https://www.jpost.com/"),
    ),
  ).toBe(true);
});
