import { expect, test } from "@playwright/test";

test("serves /news as a text-first outward-linking desk", async ({ page }) => {
  const response = await page.goto("/news");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "What we’re following" }),
  ).toBeVisible();
  await expect(page.getByText(/no published news items yet/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /view source/i })).toHaveCount(0);
});
