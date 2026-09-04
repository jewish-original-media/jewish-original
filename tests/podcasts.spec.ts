import { expect, test } from "@playwright/test";

const kalman =
  "/podcasts/the-two-tall-jews-show/sitting-down-with-kalman-gavriel-the-jerusalem-scribe";
const zapruder =
  "/podcasts/the-two-tall-jews-show/alexandra-zapruder-on-holocaust-remembrance-antisemitism-and-the-importance-of-bearing-witness";
const premier =
  "/podcasts/the-two-tall-jews-show/premier-mel-brooks-annexation-music-from-the-holocaust-a-deep-dive-into-tikkun-olam";

test("keeps unpublished pilots off the public catalog and sitemap", async ({
  page,
}) => {
  const home = await page.goto("/podcasts");
  expect(home?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Podcasts are being prepared." }),
  ).toBeVisible();
  await expect(page.getByText("With Kalman Gavriel")).toHaveCount(0);

  const unpublishedShow = await page.goto("/podcasts/the-two-tall-jews-show");
  expect(unpublishedShow?.status()).toBe(404);

  const unpublished = await page.goto(kalman);
  expect(unpublished?.status()).toBe(404);

  const sitemap = await page.goto("/sitemap.xml");
  expect(sitemap?.status()).toBe(200);
  const xml = (await page.content()) || "";
  expect(xml).toContain("https://jewishoriginal.com/podcasts");
  expect(xml).not.toContain("/podcasts/the-two-tall-jews-show");
  expect(xml).not.toContain(
    "sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
  );
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
