import { expect, test } from "@playwright/test";

test("publishes only the reviewed Dachau article on the public collection", async ({
  page,
}) => {
  const response = await page.goto("/history");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: /jewish history, held with care/i }),
  ).toBeVisible();
  await expect(page.getByText("US Liberates Dachau")).toBeVisible();
  await expect(page.getByText("Joop Westerweel")).toHaveCount(0);
  await expect(page.getByText("Samuel Willenberg")).toHaveCount(0);
  await expect(page.getByText("Theodore Herzl")).toHaveCount(0);
  await expect(
    page.getByText(/first public collection is in editorial review/i),
  ).toHaveCount(0);
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
});

test("serves the published Dachau article and keeps other slugs unpublished", async ({
  page,
}) => {
  const published = await page.goto("/history/us-liberates-dachau");
  expect(published?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "US Liberates Dachau" }),
  ).toBeVisible();
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Related Jewish Original stories" }),
  ).toHaveCount(0);

  const unpublished = await page.goto("/history/joop-westerweel-murdered");
  expect(unpublished?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: /this page is not available yet/i }),
  ).toBeVisible();
});

test("exposes canonical, Open Graph, JSON-LD, citations, and sitemap for Dachau", async ({
  page,
}) => {
  const response = await page.goto("/history/us-liberates-dachau");
  expect(response?.status()).toBe(200);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/history/us-liberates-dachau",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "US Liberates Dachau on April 29, 1945 | Jewish Original",
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "article",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://jewishoriginal.com/history/us-liberates-dachau",
  );

  const jsonLd = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ||
      "{}",
  ) as {
    "@type"?: string;
    headline?: string;
    url?: string;
    citation?: string[];
  };
  expect(jsonLd["@type"]).toBe("Article");
  expect(jsonLd.headline).toBe("US Liberates Dachau");
  expect(jsonLd.url).toBe(
    "https://jewishoriginal.com/history/us-liberates-dachau",
  );
  expect(jsonLd.citation).toEqual(
    expect.arrayContaining([
      "https://encyclopedia.ushmm.org/content/en/article/dachau",
      "https://encyclopedia.ushmm.org/content/en/timeline-event/holocaust/1942-1945/liberation-of-dachau",
      "https://collections.yadvashem.org/en/about/o6242",
      "https://www.kz-gedenkstaette-dachau.de/en/historical-site/dachau-concentration-camp-1933-1945/",
    ]),
  );

  await expect(
    page.getByRole("heading", { name: "Sources and further reading" }),
  ).toBeVisible();
  await expect(
    page.getByText("United States Holocaust Memorial Museum").first(),
  ).toBeVisible();
  await expect(page.getByText("Yad Vashem").first()).toBeVisible();
  await expect(page.getByText("KZ-Gedenkstätte Dachau").first()).toBeVisible();
  await expect(page.getByText(/significant majority/i)).toHaveCount(0);
  await expect(page.getByText(/flags/i)).toHaveCount(0);

  const sitemap = await page.goto("/sitemap.xml");
  expect(sitemap?.status()).toBe(200);
  const sitemapXml = (await page.content()) || "";
  expect(sitemapXml).toContain(
    "https://jewishoriginal.com/history/us-liberates-dachau",
  );
  expect(sitemapXml).not.toContain("joop-westerweel-murdered");
});

test("serves an honest support foundation without a payment form", async ({
  page,
}) => {
  const response = await page.goto("/support");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: /help keep this history/i }),
  ).toBeVisible();
  await expect(page.locator("form")).toHaveCount(0);
});

test("opens an authenticated draft preview without publishing other drafts", async ({
  page,
}) => {
  const secret = process.env.DRAFT_MODE_SECRET;
  test.skip(
    !secret || !process.env.SANITY_API_READ_TOKEN,
    "Draft preview is not configured in this environment.",
  );

  const response = await page.goto(
    `/api/draft-mode/enable?secret=${encodeURIComponent(secret || "")}&slug=us-liberates-dachau`,
  );
  expect(response?.status()).toBe(200);
  await expect(page.getByText("Private editorial preview")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "US Liberates Dachau" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
  await expect(page.getByText("World War II").first()).toBeVisible();
  await expect(
    page.getByText(/dachau concentration camp/i).first(),
  ).toBeVisible();
  await expect(page.getByText("Tegernsee").first()).toBeVisible();
  await expect(
    page.getByText(/liberated approximately 32,000 prisoners/i),
  ).toBeVisible();
  await expect(
    page.getByText(/at least 40,000 people died within the dachau camp system/i),
  ).toBeVisible();
  await expect(
    page.getByText(/medical experiments against their will/i),
  ).toBeVisible();
  await expect(page.getByText(/significant majority/i)).toHaveCount(0);
  await expect(page.getByText(/flags/i)).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Sources and further reading" }),
  ).toBeVisible();
  await expect(page.getByText("Unreviewed draft source")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Email" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Facebook" })).toBeVisible();
  await expect(page.getByRole("link", { name: "X", exact: true })).toBeVisible();
});
