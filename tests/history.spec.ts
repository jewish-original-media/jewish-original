import { expect, test } from "@playwright/test";

test("publishes only the reviewed Dachau article on the public archive", async ({
  page,
}) => {
  const response = await page.goto("/history");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: /on this day in jewish history/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "US Liberates Dachau" })).toHaveCount(
    1,
  );
  await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Eras" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Places" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Regions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "People" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Organizations" })).toHaveCount(
    0,
  );
  await expect(page.locator(".history-entry-card__media")).toHaveCount(0);
  await expect(page.getByText("Joop Westerweel")).toHaveCount(0);
  await expect(page.getByText("Samuel Willenberg")).toHaveCount(0);
  await expect(page.getByText("Theodore Herzl")).toHaveCount(0);
  await expect(
    page.getByText(/first public collection is in editorial review/i),
  ).toHaveCount(0);
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/history",
  );
});

test("browses published history by civil date without fabricating a match", async ({
  page,
}) => {
  await page.goto("/history");
  await page.getByLabel("Month").selectOption("4");
  await page.getByLabel("Day").selectOption("29");
  await page.getByRole("button", { name: /view this day/i }).click();

  await expect(page).toHaveURL(/month=4/);
  await expect(page).toHaveURL(/day=29/);
  await expect(
    page.getByRole("heading", { name: "On April 29" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "US Liberates Dachau" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

  await page.goto("/history?month=9&day=2");
  await expect(
    page.getByText("No reviewed story is attached to this date yet."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "US Liberates Dachau" })).toHaveCount(
    0,
  );
});

test("filters the archive by published taxonomy and keeps empty people hidden", async ({
  page,
}) => {
  const response = await page.goto("/history?topic=holocaust");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Holocaust" })).toBeVisible();
  await expect(page.getByRole("link", { name: "US Liberates Dachau" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/history",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

  await page.goto("/history?person=theodor-herzl");
  await expect(
    page.getByText("No reviewed entry currently matches this connection."),
  ).toBeVisible();
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

test("opens the Joop Westerweel draft preview without publishing it", async ({
  page,
}) => {
  const secret = process.env.DRAFT_MODE_SECRET;
  test.skip(
    !secret || !process.env.SANITY_API_READ_TOKEN,
    "Draft preview is not configured in this environment.",
  );

  const unpublished = await page.goto("/history/joop-westerweel-murdered");
  expect(unpublished?.status()).toBe(404);

  const response = await page.goto(
    `/api/draft-mode/enable?secret=${encodeURIComponent(secret || "")}&slug=joop-westerweel-murdered`,
  );
  expect(response?.status()).toBe(200);
  await expect(page.getByText("Private editorial preview")).toBeVisible();
  await expect(page.getByText("Workflow: ready.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Joop Westerweel Is Murdered at Vught" }),
  ).toBeVisible();
  await expect(page.getByText(/vught concentration camp/i).first()).toBeVisible();
  await expect(
    page.getByText(/arrested on march 11, 1944/i),
  ).toBeVisible();
  await expect(
    page.getByText(
      /in 1964, yad vashem recognized westerweel and his wife, wilhelmina, as righteous among the nations/i,
    ),
  ).toBeVisible();
  await expect(page.getByText(/150 to 200/i)).toHaveCount(0);
  await expect(page.getByText(/march 14, 1944/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "People" })).toBeVisible();
  await expect(page.getByText("Joop Westerweel").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Organizations" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("heading", { name: "Sources and further reading" }),
  ).toBeVisible();
  await expect(page.getByText("Johan (Joop) Westerweel")).toBeVisible();
  await expect(page.getByText("Johan Gerard Westerweel")).toBeVisible();
  await expect(page.getByText("Unreviewed draft source")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Email" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Facebook" })).toBeVisible();
  await expect(page.getByRole("link", { name: "X", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Related Jewish Original stories" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "US Liberates Dachau" })).toBeVisible();
  await expect(page.locator(".history-entry-card__media")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "support Jewish Original" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Exit preview" }).click();
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  const stillUnpublished = await page.goto("/history/joop-westerweel-murdered");
  expect(stillUnpublished?.status()).toBe(404);
});
