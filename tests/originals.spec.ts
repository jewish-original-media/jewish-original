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

test("serves the featured house essay with Article JSON-LD", async ({
  page,
}) => {
  const response = await page.goto("/originals/our-path-forward");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Our Path Forward" }),
  ).toBeVisible();
  await expect(
    page.getByText("Meyer Grunberg and Isaac Simon").first(),
  ).toBeVisible();
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
  const jsonLd = await readJsonLd<{
    "@type"?: string;
    headline?: string;
    author?: { name?: string }[];
  }>(page, "Article");
  expect(jsonLd["@type"]).toBe("Article");
  expect(jsonLd.headline).toBe("Our Path Forward");
  expect(jsonLd.author?.map((author) => author.name)).toEqual([
    "Meyer Grunberg",
    "Isaac Simon",
  ]);
});

test("keeps unpublished Original slugs off the public site", async ({
  page,
}) => {
  const response = await page.goto("/originals/this-essay-does-not-exist");
  expect(response?.status()).toBe(404);
});

test("includes published Original slugs in the sitemap only", async ({
  page,
}) => {
  const sitemap = await page.goto("/sitemap.xml");
  expect(sitemap?.status()).toBe(200);
  const xml = (await page.content()) || "";
  expect(xml).toContain("https://jewishoriginal.com/originals");
  expect(xml).toContain("/originals/our-path-forward");
  expect(xml).toContain("/originals/what-drives-us");
  expect(xml).not.toContain("/originals/this-essay-does-not-exist");
});
