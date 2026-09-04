import { expect, test } from "@playwright/test";

test("public navigation and footer expose only live destinations", async ({
  page,
}, testInfo) => {
  await page.goto("/");

  if (testInfo.project.name === "mobile") {
    await page.getByText("Menu", { exact: true }).click();
  }

  const nav =
    testInfo.project.name === "mobile"
      ? page.getByRole("navigation", { name: "Mobile" })
      : page.getByRole("navigation", { name: "Primary" });

  await expect(nav.getByRole("link", { name: "Today" })).toHaveAttribute(
    "href",
    "/today",
  );
  await expect(nav.getByRole("link", { name: "History" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Podcasts" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "About" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Support" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "News" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Events" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Originals" })).toHaveCount(0);

  await expect(
    page.getByRole("link", { name: "Search Jewish Original Media" }),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Privacy" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("contentinfo")
      .getByRole("link", { name: "hello@jewishoriginal.com" }),
  ).toHaveAttribute("href", "mailto:hello@jewishoriginal.com");
});

test("serves About from founder-provided copy", async ({ page }) => {
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Our path forward" }),
  ).toBeVisible();
  await expect(page.getByText("Meyer Grunberg and Isaac Simon")).toBeVisible();
  await expect(
    page.getByText("We’re not here to copy trends.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("We’re in it for legacy.")).toBeVisible();
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
});

test("serves Support without checkout or tax claims", async ({ page }) => {
  const response = await page.goto("/support");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Stand with us. Build with us." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Email to support" }),
  ).toHaveAttribute("href", /mailto:hello@jewishoriginal\.com/);
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.getByText(/tax-deductible/i)).toHaveCount(0);
  await expect(page.getByText("10 Days Delivery")).toHaveCount(0);
});

test("serves an honest Privacy page for current product behavior", async ({
  page,
}) => {
  const response = await page.goto("/privacy");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "What this site does now" }),
  ).toBeVisible();
  await expect(page.getByText(/marketing cookies/i)).toBeVisible();
  await expect(page.getByText(/founder review required/i)).toBeVisible();
  await expect(page.getByText(/not enabled on this build/i)).toBeVisible();
});
