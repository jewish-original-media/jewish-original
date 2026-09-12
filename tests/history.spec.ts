import { expect, test } from "@playwright/test";

import { readJsonLd } from "./helpers/json-ld";

test("publishes the five reviewed History articles on the public archive", async ({
  page,
}) => {
  const response = await page.goto("/history");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: /on this day in jewish history/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "US Liberates Dachau" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Joop Westerweel Is Murdered at Vught" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Bialystok Ghetto Is Sealed" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Samuel Willenberg Dies" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("link", {
      name: "Anti-Jewish Riots Break Out in Tripoli, Libya",
    }),
  ).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Eras" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Places" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Regions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "People" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Organizations" }),
  ).toHaveCount(0);
  await expect(page.locator(".history-hero-lion")).toHaveCount(1);
  await expect(page.locator(".history-entry-card__media")).toHaveCount(0);
  await expect(page.getByText("Theodore Herzl")).toHaveCount(0);
  await expect(page.getByText("Isaak Rülf")).toHaveCount(0);
  await expect(page.getByText("Rehavam")).toHaveCount(0);
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
  await expect(
    page.getByRole("link", { name: "US Liberates Dachau" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

  await page.goto("/history?month=8&day=11");
  await expect(
    page.getByRole("heading", { name: "On August 11" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Joop Westerweel Is Murdered at Vught" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "US Liberates Dachau" }),
  ).toHaveCount(0);

  await page.goto("/history?month=8&day=1");
  await expect(
    page.getByRole("heading", { name: "On August 1" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Bialystok Ghetto Is Sealed" }),
  ).toBeVisible();

  await page.goto("/history?month=2&day=19");
  await expect(
    page.getByRole("link", { name: "Samuel Willenberg Dies" }),
  ).toBeVisible();

  await page.goto("/history?month=11&day=5");
  await expect(
    page.getByRole("link", {
      name: "Anti-Jewish Riots Break Out in Tripoli, Libya",
    }),
  ).toBeVisible();

  await page.goto("/history?month=9&day=2");
  await expect(
    page.getByText("No reviewed story is attached to this date yet."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "US Liberates Dachau" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Joop Westerweel Is Murdered at Vught" }),
  ).toHaveCount(0);
});

test("filters the archive by published taxonomy and keeps empty people hidden", async ({
  page,
}) => {
  const response = await page.goto("/history?topic=holocaust");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Holocaust" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "US Liberates Dachau" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Joop Westerweel Is Murdered at Vught" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Bialystok Ghetto Is Sealed" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Samuel Willenberg Dies" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Anti-Jewish Riots Break Out in Tripoli, Libya",
    }),
  ).toHaveCount(0);
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

test("serves the five published History articles and keeps other slugs unpublished", async ({
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
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Joop Westerweel Is Murdered at Vught" }),
  ).toBeVisible();

  const joop = await page.goto("/history/joop-westerweel-murdered");
  expect(joop?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Joop Westerweel Is Murdered at Vught" }),
  ).toBeVisible();
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);

  expect(
    (await page.goto("/history/bialystok-ghetto-established"))?.status(),
  ).toBe(200);
  expect((await page.goto("/history/samuel-willenberg-dies"))?.status()).toBe(
    200,
  );
  expect(
    (await page.goto("/history/anti-jewish-riots-tripoli"))?.status(),
  ).toBe(200);
  expect((await page.goto("/history/theodore-herzl-birthday"))?.status()).toBe(
    404,
  );
  expect(
    (await page.goto("/history/isaac-rulfs-birthday-import-0011"))?.status(),
  ).toBe(404);
  expect(
    (
      await page.goto(
        "/history/pflp-murders-israeli-mk-rehavam-zeevi-import-0111",
      )
    )?.status(),
  ).toBe(404);
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

  const jsonLd = await readJsonLd<{
    "@type"?: string;
    headline?: string;
    url?: string;
    citation?: string[];
    datePublished?: string;
    dateModified?: string;
  }>(page, "Article");
  expect(jsonLd["@type"]).toBe("Article");
  expect(jsonLd.headline).toBe("US Liberates Dachau");
  expect(jsonLd.datePublished).toBeTruthy();
  expect(jsonLd.dateModified).toBeTruthy();
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
  expect(sitemapXml).toContain(
    "https://jewishoriginal.com/history/joop-westerweel-murdered",
  );
  expect(sitemapXml).toContain(
    "https://jewishoriginal.com/history/bialystok-ghetto-established",
  );
  expect(sitemapXml).toContain(
    "https://jewishoriginal.com/history/samuel-willenberg-dies",
  );
  expect(sitemapXml).toContain(
    "https://jewishoriginal.com/history/anti-jewish-riots-tripoli",
  );
  expect(sitemapXml).not.toContain("theodore-herzl-birthday");
});

test("exposes canonical, Open Graph, JSON-LD, citations, and sitemap for Westerweel", async ({
  page,
}) => {
  const response = await page.goto("/history/joop-westerweel-murdered");
  expect(response?.status()).toBe(200);
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/history/joop-westerweel-murdered",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Joop Westerweel Is Murdered at Vught — August 11, 1944 | Jewish Original",
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "article",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://jewishoriginal.com/history/joop-westerweel-murdered",
  );

  const jsonLd = await readJsonLd<{
    "@type"?: string;
    headline?: string;
    url?: string;
    citation?: string[];
  }>(page, "Article");
  expect(jsonLd["@type"]).toBe("Article");
  expect(jsonLd.headline).toBe("Joop Westerweel Is Murdered at Vught");
  expect(jsonLd.url).toBe(
    "https://jewishoriginal.com/history/joop-westerweel-murdered",
  );
  expect(jsonLd.citation).toEqual(
    expect.arrayContaining([
      "https://www.yadvashem.org/yv/en/exhibitions/righteous-teachers/westerweel.asp",
      "https://www.nmkampvught.nl/ontdekken/het-verhaal/vermoord-in-vught/westerweel-johan-gerard/",
    ]),
  );
  expect(jsonLd.citation).toHaveLength(2);

  await expect(
    page.getByRole("heading", { name: "Sources and further reading" }),
  ).toBeVisible();
  await expect(page.getByText("Johan (Joop) Westerweel")).toBeVisible();
  await expect(page.getByText("Johan Gerard Westerweel")).toBeVisible();
  await expect(page.getByText(/150 to 200/i)).toHaveCount(0);
  await expect(page.getByText(/march 14, 1944/i)).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Related Jewish Original stories" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "US Liberates Dachau" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Organizations" }),
  ).toHaveCount(0);
});

test("serves an honest support foundation without a payment form", async ({
  page,
}) => {
  const response = await page.goto("/support");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: /stand with us\. build with us/i }),
  ).toBeVisible();
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.getByText(/tax-deductible/i)).toHaveCount(0);
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
    page.getByText(
      /at least 40,000 people died within the dachau camp system/i,
    ),
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
  await expect(
    page.getByRole("link", { name: "X", exact: true }),
  ).toBeVisible();
});

test("serves the published Batch 2 articles with founder-final copy and metadata", async ({
  page,
}) => {
  const bialystok = await page.goto("/history/bialystok-ghetto-established");
  expect(bialystok?.status()).toBe(200);
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Bialystok Ghetto Is Sealed" }),
  ).toBeVisible();
  await expect(
    page.getByText(/confined about 50,000 jews/i).first(),
  ).toBeVisible();
  await expect(page.getByText(/soviet union/i)).toHaveCount(0);
  await expect(page.getByText(/three-quarters/i)).toHaveCount(0);
  await expect(page.getByText(/liberated the bialystok ghetto/i)).toHaveCount(
    0,
  );
  await expect(page.locator(".history-entry-card__media")).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/history/bialystok-ghetto-established",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Bialystok Ghetto Is Sealed — August 1, 1941 | Jewish Original",
  );
  const bialystokJsonLd = await readJsonLd<{
    "@type"?: string;
    headline?: string;
    citation?: string[];
  }>(page, "Article");
  expect(bialystokJsonLd["@type"]).toBe("Article");
  expect(bialystokJsonLd.headline).toBe("Bialystok Ghetto Is Sealed");
  expect(bialystokJsonLd.citation).toEqual(
    expect.arrayContaining([
      "https://encyclopedia.ushmm.org/content/en/article/bialystok",
      "https://www.yadvashem.org/odot_pdf/Microsoft%20Word%20-%206011.pdf",
    ]),
  );
  await expect(
    page.getByRole("heading", { name: "Related Jewish Original stories" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Samuel Willenberg Dies" }),
  ).toBeVisible();

  const willenberg = await page.goto("/history/samuel-willenberg-dies");
  expect(willenberg?.status()).toBe(200);
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Samuel Willenberg Dies" }),
  ).toBeVisible();
  await expect(
    page.getByText(/created sculptures about what he had witnessed/i),
  ).toBeVisible();
  await expect(
    page.getByText(/made sculpture about what he had seen/i),
  ).toHaveCount(0);
  await expect(page.getByText(/sonderkommando/i)).toHaveCount(0);
  await expect(page.getByText(/warsaw ghetto uprising/i)).toHaveCount(0);
  await expect(page.getByText(/875,000/i)).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/history/samuel-willenberg-dies",
  );
  const willenbergJsonLd = await readJsonLd<{
    "@type"?: string;
    headline?: string;
    citation?: string[];
  }>(page, "Article");
  expect(willenbergJsonLd["@type"]).toBe("Article");
  expect(willenbergJsonLd.headline).toBe("Samuel Willenberg Dies");
  expect(willenbergJsonLd.citation).toEqual(
    expect.arrayContaining([
      "https://www.yadvashem.org/blog/one-of-the-last-survivors-of-treblinka-passes-away.html",
      "https://encyclopedia.ushmm.org/content/en/article/treblinka",
      "https://apnews.com/general-news-4a90900b1e7340cb83efab37a1ea99b4",
    ]),
  );

  const tripoli = await page.goto("/history/anti-jewish-riots-tripoli");
  expect(tripoli?.status()).toBe(200);
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "Anti-Jewish Riots Break Out in Tripoli, Libya",
    }),
  ).toBeVisible();
  await expect(page.getByText(/killed about 120 jews/i).first()).toBeVisible();
  await expect(page.getByText(/rioters killed 120 jews and/i)).toHaveCount(0);
  await expect(page.getByText(/instigated the violence/i)).toHaveCount(0);
  await expect(page.getByText(/ethnically cleansed/i)).toHaveCount(0);
  await expect(page.getByText("Unreviewed draft source")).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/history/anti-jewish-riots-tripoli",
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    "On November 5, 1945, anti-Jewish riots broke out in Tripoli, killing about 120 Jews over three days.",
  );
  const tripoliJsonLd = await readJsonLd<{
    "@type"?: string;
    headline?: string;
    citation?: string[];
  }>(page, "Article");
  expect(tripoliJsonLd["@type"]).toBe("Article");
  expect(tripoliJsonLd.headline).toBe(
    "Anti-Jewish Riots Break Out in Tripoli, Libya",
  );
  expect(tripoliJsonLd.citation).toEqual(
    expect.arrayContaining([
      "https://www.yadvashem.org/articles/general/the-jews-of-libya.html",
      "https://www.yadvashem.org/odot_pdf/Microsoft%20Word%20-%206407.pdf",
      "https://www.jta.org/archive/ed-outbreaks-in-tripolitania-feared-public-demonstrations-prohibited-in-egypt",
    ]),
  );
});

test("opens the published Joop Westerweel article without a preview banner", async ({
  page,
}) => {
  const published = await page.goto("/history/joop-westerweel-murdered");
  expect(published?.status()).toBe(200);
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Joop Westerweel Is Murdered at Vught" }),
  ).toBeVisible();
  await expect(
    page.getByText(/vught concentration camp/i).first(),
  ).toBeVisible();
  await expect(page.getByText(/arrested on march 11, 1944/i)).toBeVisible();
  await expect(
    page.getByText(
      /in 1964, yad vashem recognized westerweel and his wife, wilhelmina, as righteous among the nations/i,
    ),
  ).toBeVisible();
  await expect(page.getByText(/150 to 200/i)).toHaveCount(0);
  await expect(page.getByText(/march 14, 1944/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "People" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Organizations" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Sources and further reading" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Email" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Related Jewish Original stories" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "US Liberates Dachau" }),
  ).toBeVisible();
  await expect(page.locator(".history-entry-card__media")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "support Jewish Original" }),
  ).toBeVisible();
});
