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
  await expect(nav.getByRole("link", { name: "Originals" })).toHaveAttribute(
    "href",
    "/originals",
  );
  await expect(nav.getByRole("link", { name: "Podcasts" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "About" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Support" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "News" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Events" })).toHaveCount(0);
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Originals" }),
  ).toHaveAttribute("href", "/originals");
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "News" }),
  ).toHaveAttribute("href", "/news");
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Events" }),
  ).toHaveCount(0);

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
    page.getByRole("heading", { level: 1, name: "Jewish Original Media" }),
  ).toBeVisible();
  await expect(page.locator(".history-hero-lion")).toHaveCount(0);
  await expect(page.locator("[data-motif]")).toHaveCount(0);
  await expect(
    page.getByText("Meyer Grunberg and Isaac Simon").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Meyer Grunberg and Isaac Simon on Jerusalem limestone steps",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What we publish" }),
  ).toBeVisible();
  await expect(
    page.getByText("We’re not here to copy trends.", { exact: false }),
  ).toHaveCount(0);
  await expect(page.getByText("We’re in it for legacy.")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Sources, corrections, and tools" }),
  ).toBeVisible();
  await expect(
    page.getByText(/uses automation and AI-assisted tools/i),
  ).toBeVisible();
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);
});

test("serves Support without checkout or tax claims", async ({ page }) => {
  const response = await page.goto("/support");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      name: "Help keep this history in the world.",
    }),
  ).toBeVisible();
  await expect(page.locator("[data-motif]")).toHaveCount(0);
  await expect(
    page.getByRole("img", {
      name: "A man wearing tefillin reads from a Hebrew book",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Support paths" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /give once/i }).first(),
  ).toHaveAttribute("href", "#give-once");
  const oneTime = page.getByRole("link", {
    name: "Open a one-time support draft",
  });
  await expect(oneTime).toHaveAttribute(
    "href",
    /mailto:hello@jewishoriginal\.com\?subject=/,
  );
  const href = await oneTime.getAttribute("href");
  expect(href).toContain("Opening%20this%20draft%20does%20not%20send");
  expect(href).not.toContain("\n");
  await expect(
    page.getByRole("link", { name: "Open an email draft about this day" }),
  ).toBeVisible();
  await expect(page.getByText("$360")).toBeVisible();
  await expect(page.getByText("$18 each month")).toBeVisible();
  await expect(
    page
      .locator("#write")
      .getByRole("link", { name: "hello@jewishoriginal.com" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy address" }),
  ).toBeVisible();
  await expect(page.getByText("Continue to payment")).toHaveCount(0);
  await expect(page.getByText(/stripe/i)).toHaveCount(0);
  await expect(page.getByText(/demonstration/i)).toHaveCount(0);
  await expect(page.getByText(/checkout is not ready/i)).toHaveCount(0);
  await expect(page.getByText(/inquiry was submitted/i)).toHaveCount(0);
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.getByText(/tax-deductible/i)).toHaveCount(0);
  await expect(page.getByText("10 Days Delivery")).toHaveCount(0);
  await expect(
    page.getByText("Jewish Original Media is a for-profit business.").first(),
  ).toBeVisible();

  await page
    .getByRole("link", { name: /give once/i })
    .first()
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#give-once")).toBeInViewport();
  await page
    .getByRole("link", { name: "Open a one-time support draft" })
    .focus();
  await expect(
    page.getByRole("link", { name: "Open a one-time support draft" }),
  ).toBeFocused();
});

test("unknown public routes use the editorial 404", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: /this page is not available yet/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toHaveAttribute(
    "href",
    "/",
  );
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
  await expect(page.getByText(/vercel web analytics/i)).toBeVisible();
  await expect(page.getByText(/cookieless/i)).toBeVisible();
});
