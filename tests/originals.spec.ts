import { expect, test } from "@playwright/test";

import { readJsonLd } from "./helpers/json-ld";

test("serves Originals as a house journal, not a blog index", async ({
  page,
}) => {
  const response = await page.goto("/originals");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Writing from the house." }),
  ).toBeVisible();
  await expect(page.getByText(/no published originals yet/i)).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Our Path Forward" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What Drives Us" }),
  ).toBeVisible();
  await expect(
    page.getByText("Sample editorial content. Final essays coming soon."),
  ).toHaveCount(2);
  await expect(page.getByText("Meyer Grunberg and Isaac Simon")).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/originals",
  );
  const collection = await readJsonLd<{ "@type"?: string }>(
    page,
    "CollectionPage",
  );
  expect(collection["@type"]).toBe("CollectionPage");
  await expect(page.getByRole("link", { name: "Blog" })).toHaveCount(0);
});

test("serves the featured sample honestly without founder author metadata", async ({
  page,
}) => {
  const response = await page.goto("/originals/our-path-forward");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Our Path Forward" }),
  ).toBeVisible();
  await expect(
    page.getByText("Sample editorial content. Final essays coming soon."),
  ).toBeVisible();
  await expect(
    page
      .locator("[class*='articleMeta']")
      .getByText("Meyer Grunberg and Isaac Simon"),
  ).toHaveCount(0);
  await expect(
    page.getByText(
      "We don’t ask what’s going viral. We ask what’s worth remembering in 100 years.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Meyer Grunberg and Isaac Simon on Jerusalem limestone steps",
    }),
  ).toBeVisible();
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/originals/our-path-forward",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(
    page.locator('script[type="application/ld+json"]').filter({
      hasText: '"@type":"Article"',
    }),
  ).toHaveCount(0);
});

test("keeps unpublished Original slugs off the public site", async ({
  page,
}) => {
  const response = await page.goto("/originals/this-essay-does-not-exist");
  expect(response?.status()).toBe(404);
});

test("keeps sample Original slugs out of the sitemap", async ({
  page,
}) => {
  const sitemap = await page.goto("/sitemap.xml");
  expect(sitemap?.status()).toBe(200);
  const xml = (await page.content()) || "";
  expect(xml).toContain("https://jewishoriginal.com/originals");
  expect(xml).not.toContain("/originals/our-path-forward");
  expect(xml).not.toContain("/originals/what-drives-us");
  expect(xml).not.toContain("/originals/this-essay-does-not-exist");
});
