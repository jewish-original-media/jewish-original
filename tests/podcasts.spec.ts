import { expect, test } from "@playwright/test";

const show = "/podcasts/the-two-tall-jews-show";
const kalman =
  "/podcasts/the-two-tall-jews-show/sitting-down-with-kalman-gavriel-the-jerusalem-scribe";
const finale =
  "/podcasts/the-two-tall-jews-show/season-3-finale-looking-ahead-to-2023";
const zapruder =
  "/podcasts/the-two-tall-jews-show/alexandra-zapruder-on-holocaust-remembrance-antisemitism-and-the-importance-of-bearing-witness";
const premier =
  "/podcasts/the-two-tall-jews-show/premier-mel-brooks-annexation-music-from-the-holocaust-a-deep-dive-into-tikkun-olam";

test("publishes the show and four pilots without preview chrome", async ({
  page,
}) => {
  const home = await page.goto("/podcasts");
  expect(home?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "The Two Tall Jews Show", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  await expect(page.getByText("With Kalman Gavriel")).toBeVisible();
  await expect(page.getByText("With Alexandra Zapruder")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "SEASON 3 FINALE - LOOKING AHEAD TO 2023" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /PREMIER: Mel Brooks/,
    }),
  ).toBeVisible();

  const showPage = await page.goto(show);
  expect(showPage?.status()).toBe(200);
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  await expect(page.locator(".podcast-episode-card")).toHaveCount(4);

  const sitemap = await page.goto("/sitemap.xml");
  expect(sitemap?.status()).toBe(200);
  const xml = (await page.content()) || "";
  expect(xml).toContain("https://jewishoriginal.com/podcasts");
  expect(xml).toContain(
    "https://jewishoriginal.com/podcasts/the-two-tall-jews-show",
  );
  expect(xml).toContain(
    "https://jewishoriginal.com/podcasts/the-two-tall-jews-show/sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
  );
  expect(xml).not.toContain("/podcasts/dev/youtube-facade");
});

test("keeps unpublished catalog slugs off the public site", async ({ page }) => {
  const missing = await page.goto(
    "/podcasts/the-two-tall-jews-show/this-episode-was-not-imported",
  );
  expect(missing?.status()).toBe(404);
});

test("serves a published guest episode with audio and platform links", async ({
  page,
}) => {
  const response = await page.goto(kalman);
  expect(response?.status()).toBe(200);
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "Sitting Down With: Kalman Gavriel, The Jerusalem Scribe",
    }),
  ).toBeVisible();
  await expect(page.getByText("With Kalman Gavriel")).toBeVisible();
  await expect(page.getByRole("link", { name: "Spotify" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Apple Podcasts" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Transcript" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Summary" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Related History" })).toHaveCount(
    0,
  );
  await expect(page.locator("audio")).toHaveCount(1);
  await expect(page.locator("audio")).toHaveAttribute("preload", "none");
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("serves hosts-only, guest, and chapter pilots without stacked players", async ({
  page,
}) => {
  const finalePage = await page.goto(finale);
  expect(finalePage?.status()).toBe(200);
  await expect(page.locator(".podcast-episode-hero")).not.toContainText("With ");
  await expect(page.getByRole("heading", { name: "Chapters" })).toHaveCount(0);
  await expect(page.locator("iframe")).toHaveCount(0);

  const zapruderPage = await page.goto(zapruder);
  expect(zapruderPage?.status()).toBe(200);
  await expect(page.getByText("With Alexandra Zapruder")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Related History" })).toHaveCount(
    0,
  );

  const premierPage = await page.goto(premier);
  expect(premierPage?.status()).toBe(200);
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
