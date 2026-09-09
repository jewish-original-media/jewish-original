import { expect, test } from "@playwright/test";

test("serves the embedded Sanity Studio without public site chrome", async ({
  page,
}) => {
  const response = await page.goto("/admin");

  expect(response?.status()).toBe(200);
  await expect(page.locator(".page-shell")).toHaveCount(0);
  await expect(
    page
      .getByText(
        /Choose login provider|All history entries|Podcast shows|News|Events|Connect this Studio to your project|Add CORS origin/,
      )
      .first(),
  ).toBeVisible({ timeout: 15_000 });

  const robots = await page
    .locator('meta[name="robots"]')
    .getAttribute("content");
  expect(robots).toContain("noindex");
});
