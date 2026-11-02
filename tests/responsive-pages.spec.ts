import { expect, test } from "@playwright/test";

const INDEX_ROUTES = [
  "/",
  "/today",
  "/history",
  "/explore",
  "/originals",
  "/podcasts",
  "/about",
  "/support",
] as const;

async function expectResponsivePage(page: import("@playwright/test").Page) {
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
}

for (const route of INDEX_ROUTES) {
  test(`${route} has no responsive shell overflow`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.ok(), `${route} should load`).toBe(true);
    await expectResponsivePage(page);
  });
}

test("owned-content detail pages retain the responsive shell", async ({
  page,
}) => {
  for (const indexRoute of ["/history", "/originals"] as const) {
    await page.goto(indexRoute);
    const detailLink = page
      .locator(`main a[href^="${indexRoute}/"]:not([href="${indexRoute}/"])`)
      .first();
    await expect(detailLink).toBeVisible();
    const href = await detailLink.getAttribute("href");
    expect(href).toBeTruthy();

    const response = await page.goto(href || indexRoute);
    expect(response?.ok(), `${href} should load`).toBe(true);
    await expectResponsivePage(page);
  }
});
