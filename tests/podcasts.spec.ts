import { expect, test } from "@playwright/test";

test("serves the podcasts home and TTJS show without inventing the full catalog", async ({
  page,
}) => {
  const home = await page.goto("/podcasts");
  expect(home?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "The Two Tall Jews Show" }),
  ).toBeVisible();
  await expect(page.getByText("With Kalman Gavriel")).toBeVisible();
  await expect(page.getByText("With Alexandra Zapruder")).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);

  const show = await page.goto("/podcasts/the-two-tall-jews-show");
  expect(show?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Listen in" })).toBeVisible();
  await expect(page.getByText("4 episodes")).toBeVisible();
});

test("renders a guest episode and hides empty transcript and summary", async ({
  page,
}) => {
  const response = await page.goto(
    "/podcasts/the-two-tall-jews-show/sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
  );
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      name: "Sitting Down With: Kalman Gavriel, The Jerusalem Scribe",
    }),
  ).toBeVisible();
  await expect(page.getByText("With Kalman Gavriel")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Transcript" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Summary" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Related History" })).toHaveCount(
    0,
  );
  await expect(page.locator("audio")).toHaveCount(1);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/podcasts/the-two-tall-jews-show/sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
  );
});

test("renders a host-only finale and source chapters on the premier", async ({
  page,
}) => {
  const finale = await page.goto(
    "/podcasts/the-two-tall-jews-show/season-3-finale-looking-ahead-to-2023",
  );
  expect(finale?.status()).toBe(200);
  await expect(page.locator(".podcast-episode-hero")).not.toContainText("With ");
  await expect(page.getByRole("heading", { name: "Chapters" })).toHaveCount(0);

  const premier = await page.goto(
    "/podcasts/the-two-tall-jews-show/premier-mel-brooks-annexation-music-from-the-holocaust-a-deep-dive-into-tikkun-olam",
  );
  expect(premier?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Chapters" })).toBeVisible();
  await expect(
    page.getByText("Music from the Holocaust, Reborn", { exact: true }),
  ).toBeVisible();
});

test("keeps unknown slugs unpublished and adds podcasts to the sitemap", async ({
  page,
}) => {
  const missing = await page.goto(
    "/podcasts/the-two-tall-jews-show/this-episode-does-not-exist",
  );
  expect(missing?.status()).toBe(404);

  const sitemap = await page.goto("/sitemap.xml");
  expect(sitemap?.status()).toBe(200);
  const xml = (await page.content()) || "";
  expect(xml).toContain("https://jewishoriginal.com/podcasts");
  expect(xml).toContain(
    "https://jewishoriginal.com/podcasts/the-two-tall-jews-show/sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
  );
});
