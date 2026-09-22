import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 1000 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1024", width: 1024, height: 768 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
  { name: "375", width: 375, height: 812 },
] as const;

async function expectNoOverflow(page: import("@playwright/test").Page) {
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
}

test("composes the homepage from Jewish Today and published History", async ({
  page,
}, testInfo) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /remember, rebuild, and create/i,
    }),
  ).toBeVisible();
  await expect(page.locator("[data-brand-plaque]")).toBeVisible();
  await expect(page.locator("main .history-hero-lion")).toHaveCount(0);
  await expect(page.locator("[data-motif]")).toHaveCount(0);
  await expect(
    page.getByRole("contentinfo").getByRole("img", { name: /Jewish Original/ }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("region", { name: "Remember, rebuild, and create." })
      .getByText(
        /a modern home for jewish history, culture, education, connection, and identity/i,
      ),
  ).toBeVisible();
  await expect(
    page.locator("p.eyebrow").filter({ hasText: "Jewish Today" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Today" }).first(),
  ).toHaveAttribute("href", "/today");
  await page.getByRole("link", { name: "Discover Jewish Today" }).click();
  await expect(page).toHaveURL(/\/today$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Today" }),
  ).toBeVisible();
  await expect(page.getByText(/preparing today’s homepage/i)).toHaveCount(0);
  await page.goto("/");
  await expect(page.getByRole("region", { name: "History" })).toBeVisible();
  await expect(
    page
      .getByText(
        /This week in Torah|Most recent Torah portion|Festival|Rosh Hashana/,
      )
      .first(),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Discover Jewish Original" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "A man wearing tefillin reads from a Hebrew book",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Meyer Grunberg and Isaac Simon standing at a weathered Jerusalem street corner",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Enter the Archive", exact: true }),
  ).toHaveAttribute("href", "/history");
  await expect(
    page.getByRole("region", { name: "History" }).locator("article a[href^='/history/']"),
  ).toHaveCount(3);
  await expect(
    page
      .getByRole("navigation", { name: "Discover Jewish Original" })
      .getByRole("link", { name: /originals/i }),
  ).toHaveAttribute("href", "/originals");
  const originals = page.getByRole("region", { name: "Originals" });
  await expect(originals).toBeVisible();
  await expect(
    originals.getByRole("heading", { name: "Our Path Forward" }),
  ).toBeVisible();
  await expect(
    originals.getByRole("link", { name: "What Drives Us" }),
  ).toBeVisible();
  await expect(
    originals.getByRole("link", { name: "The journal" }),
  ).toHaveAttribute("href", "/originals");
  await expect(
    page.getByRole("heading", { name: "The Two Tall Jews Show" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Podcasts are being prepared." }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      name: "Sitting Down With: Kalman Gavriel, The Jerusalem Scribe",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View all episodes" }),
  ).toHaveAttribute("href", "/podcasts");
  const podcasts = page.getByRole("region", { name: "Podcasts" });
  await expect(podcasts.locator("audio")).toHaveCount(0);
  await expect(
    podcasts.getByRole("link", { name: "Listen on the episode page" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Stand with us. Build with us." }),
  ).toBeVisible();
  await expect(
    page.getByText("We don’t ask what’s going viral.", { exact: false }),
  ).toHaveCount(0);
  const following = page.getByRole("region", {
    name: "What we’re following",
  });
  if ((await following.count()) > 0) {
    await expect(following.locator("li")).toHaveCount(3);
    await expect(
      following.getByRole("link", { name: "Full desk" }),
    ).toHaveAttribute("href", "/news");
    await expect(following.locator("a[href^='/news/']")).toHaveCount(0);
  } else {
    await expect(following).toHaveCount(0);
  }
  await expect(page.getByText("Upcoming Events")).toHaveCount(0);
  await expect(
    page
      .getByRole("region", { name: "Podcasts" })
      .getByText("Meyer Grunberg")
      .first(),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Podcasts" })
      .getByText("Isaac Simon")
      .first(),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Podcasts" })
      .getByText("With Kalman Gavriel"),
  ).toBeVisible();
  await expect(page.getByText("With Alexandra Zapruder")).toHaveCount(0);
  await expect(page.getByText("Private editorial preview")).toHaveCount(0);

  await expectNoOverflow(page);
  await page.screenshot({
    path: `artifacts/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("homepage rhythm holds at publication widths", async ({
  page,
}, testInfo) => {
  const viewports =
    testInfo.project.name === "mobile"
      ? VIEWPORTS.filter((viewport) => viewport.width <= 768)
      : VIEWPORTS.filter((viewport) => viewport.width >= 768);

  for (const viewport of viewports) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /remember, rebuild, and create/i,
      }),
    ).toBeVisible();
    await expectNoOverflow(page);
  }
});
