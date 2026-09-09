import { expect, test } from "@playwright/test";

const kalman =
  "/podcasts/the-two-tall-jews-show/sitting-down-with-kalman-gavriel-the-jerusalem-scribe";
const zapruder =
  "/podcasts/the-two-tall-jews-show/alexandra-zapruder-on-holocaust-remembrance-antisemitism-and-the-importance-of-bearing-witness";
const premier =
  "/podcasts/the-two-tall-jews-show/premier-mel-brooks-annexation-music-from-the-holocaust-a-deep-dive-into-tikkun-olam";

test("publishes the approved show and four pilot episodes", async ({
  page,
}) => {
  const home = await page.goto("/podcasts");
  expect(home?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "The Two Tall Jews Show",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Podcasts are being prepared." }),
  ).toHaveCount(0);
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  await expect(page.getByText("With Kalman Gavriel")).toBeVisible();
  await expect(page.getByText("With Alexandra Zapruder")).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "SEASON 3 FINALE - LOOKING AHEAD TO 2023",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "PREMIER: Mel Brooks, Annexation, Music from the Holocaust, & A Deep Dive into Tikkun Olam",
    }),
  ).toBeVisible();

  const show = await page.goto("/podcasts/the-two-tall-jews-show");
  expect(show?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "The Two Tall Jews Show",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("Listening room").first()).toBeVisible();
  await expect(page.getByText("Meyer Grunberg")).toBeVisible();
  await expect(page.getByText("Isaac Simon")).toBeVisible();
  await expect(page.getByText("Latest episode")).toBeVisible();

  const published = await page.goto(kalman);
  expect(published?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      name: "Sitting Down With: Kalman Gavriel, The Jerusalem Scribe",
    }),
  ).toBeVisible();
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);

  const sitemap = await page.goto("/sitemap.xml");
  expect(sitemap?.status()).toBe(200);
  const xml = (await page.content()) || "";
  expect(xml).toContain("https://jewishoriginal.com/podcasts");
  expect(xml).toContain("/podcasts/the-two-tall-jews-show");
  expect(xml).toContain(
    "sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
  );
  expect(xml).not.toContain("/podcasts/dev/youtube-facade");
});

test("keeps unpublished catalog slugs off the public site", async ({
  page,
}) => {
  const missing = await page.goto(
    "/podcasts/the-two-tall-jews-show/this-episode-was-not-imported",
  );
  expect(missing?.status()).toBe(404);
});

test("previews a guest draft and hides empty transcript and summary", async ({
  page,
}) => {
  const secret = process.env.DRAFT_MODE_SECRET;
  test.skip(
    !secret || !process.env.SANITY_API_READ_TOKEN,
    "Draft preview is not configured in this environment.",
  );

  const preview = await page.goto(
    `/api/draft-mode/enable?secret=${encodeURIComponent(secret || "")}&slug=sitting-down-with-kalman-gavriel-the-jerusalem-scribe&type=podcast`,
  );
  expect(preview?.status()).toBe(200);
  await expect(page.getByText("Private editorial preview")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Sitting Down With: Kalman Gavriel, The Jerusalem Scribe",
    }),
  ).toBeVisible();
  await expect(page.getByText("With Kalman Gavriel")).toBeVisible();
  await expect(page.getByRole("link", { name: "Spotify" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Apple Podcasts" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Transcript" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("heading", { name: "Summary" })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Related History" }),
  ).toHaveCount(0);
  await expect(page.locator("audio")).toHaveCount(1);
  await expect(page.locator("audio")).toHaveAttribute("preload", "none");
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("previews a hosts-only finale and source chapters on the premier", async ({
  page,
}) => {
  const secret = process.env.DRAFT_MODE_SECRET;
  test.skip(
    !secret || !process.env.SANITY_API_READ_TOKEN,
    "Draft preview is not configured in this environment.",
  );

  const finalePreview = await page.goto(
    `/api/draft-mode/enable?secret=${encodeURIComponent(secret || "")}&slug=season-3-finale-looking-ahead-to-2023&type=podcast`,
  );
  expect(finalePreview?.status()).toBe(200);
  await expect(page.locator(".podcast-episode-hero")).not.toContainText(
    "With ",
  );
  await expect(page.getByRole("heading", { name: "Chapters" })).toHaveCount(0);

  const zapruderPreview = await page.goto(zapruder);
  expect(zapruderPreview?.status()).toBe(200);
  await expect(page.getByText("With Alexandra Zapruder")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Related History" }),
  ).toHaveCount(0);

  const premierPreview = await page.goto(premier);
  expect(premierPreview?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Chapters" })).toBeVisible();
  await expect(
    page.getByText("Music from the Holocaust, Reborn", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".podcast-media-frame")).toHaveCount(0);
  await expect(page.locator("audio")).toHaveAttribute("preload", "none");
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("loads the YouTube facade only after a labeled fixture click", async ({
  page,
}) => {
  const response = await page.goto("/podcasts/dev/youtube-facade");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByText("This is not a Two Tall Jews Show episode"),
  ).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: /Play video/i }).click();
  await expect(page.locator("iframe")).toHaveCount(1);
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    /youtube-nocookie\.com\/embed\/jNQXAC9IVRw/,
  );
});
