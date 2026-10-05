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
  await expect(page.locator("[data-home-hero]")).toBeVisible();
  await expect(
    page.locator(
      "link[rel='preload'][as='image'][imagesrcset*='morning-tefillin']",
    ),
  ).toHaveCount(1);
  await expect(
    page.locator("link[rel='preload'][as='image'][imagesrcset*='/archive/']"),
  ).toHaveCount(0);
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
  const livingArchive = page.locator("[data-home-living-archive]");
  await expect(livingArchive).toBeVisible();
  await expect(
    livingArchive.getByRole("heading", {
      name: "One people. Many places. Time carried forward.",
    }),
  ).toBeVisible();
  await expect(livingArchive.locator("figure")).toHaveCount(3);
  await expect(livingArchive.locator("img")).toHaveCount(3);
  for (const image of await livingArchive.locator("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await expect(
    livingArchive.getByRole("link", { name: /Library of Congress/ }),
  ).toHaveCount(3);
  const historyRegion = page.getByRole("region", {
    name: "History",
    exact: true,
  });
  await expect(historyRegion).toBeVisible();
  await expect(historyRegion.locator("figure")).toHaveCount(3);
  expect(
    await historyRegion
      .locator("figure")
      .locator("img, [data-home-media-fallback]")
      .count(),
  ).toBe(3);
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
    page
      .getByRole("navigation", { name: "Discover Jewish Original" })
      .getByRole("link", { name: /events/i }),
  ).toHaveAttribute("href", "/events");
  const menuToggle = page.locator("summary").filter({ hasText: "Menu" });
  await menuToggle.click();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Mobile" })
      .getByRole("link", { name: "Events" }),
  ).toHaveAttribute("href", "/events");
  await menuToggle.click();
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
  await expect(historyRegion.locator("article")).toHaveCount(3);
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
    originals.getByText("What Drives Us", { exact: true }),
  ).toBeVisible();
  await expect(
    originals.getByRole("link", { name: "The journal" }),
  ).toHaveAttribute("href", "/originals");
  await expect(
    originals.locator("img, [data-home-media-fallback]").first(),
  ).toBeVisible();
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
    page.getByRole("heading", {
      name: "History is the foundation. Identity is the work.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Help build what Jewish media can become.",
    }),
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

test("reduced motion keeps the Living Archive visible and still", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const archive = page.locator("[data-home-living-archive]");
  await expect(archive).toBeVisible();
  await expect(archive.locator("[data-archive-position='1']")).toBeVisible();

  const motion = await archive.evaluate((element) => {
    const object = element.querySelector<HTMLElement>(
      "[data-archive-position='1']",
    );
    const continuum = element.querySelector<HTMLElement>(
      "[data-archive-continuum]",
    );

    return {
      object: object ? getComputedStyle(object).animationName : null,
      continuum: continuum ? getComputedStyle(continuum).animationName : null,
    };
  });

  expect(motion).toEqual({ object: "none", continuum: "none" });
  await expectNoOverflow(page);
});
