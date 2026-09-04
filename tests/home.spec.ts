import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 1000 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1024", width: 1024, height: 768 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
] as const;

const PUBLISHED_HISTORY = [
  "US Liberates Dachau",
  "Joop Westerweel Is Murdered at Vught",
  "Bialystok Ghetto Is Sealed",
  "Samuel Willenberg Dies",
  "Anti-Jewish Riots Break Out in Tripoli, Libya",
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
      name: /a modern home for jewish history/i,
    }),
  ).toBeVisible();
  await expect(page.getByText("Jewish Today", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open Jewish Today" }),
  ).toHaveAttribute("href", "/today");
  await page.getByRole("link", { name: "Open Jewish Today" }).click();
  await expect(page).toHaveURL(/\/today$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Today" }),
  ).toBeVisible();
  await expect(page.getByText(/preparing today’s homepage/i)).toHaveCount(0);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "From the archive" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open the History archive" }),
  ).toHaveAttribute("href", "/history");
  for (const title of PUBLISHED_HISTORY) {
    await expect(
      page.getByRole("region", { name: "From the archive" }).getByRole("link", {
        name: title,
      }),
    ).toBeVisible();
  }
  await expect(
    page.getByRole("heading", { name: "Shows and episodes belong here" }),
  ).toBeVisible();
  await expect(page.getByText(/no episode is invented here/i)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "News, events, culture, and support" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Shows and episodes belong here" })
      .getByRole("link"),
  ).toHaveCount(0);
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
  if (testInfo.project.name !== "desktop") {
    test.skip();
  }

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /a modern home for jewish history/i,
      }),
    ).toBeVisible();
    await expectNoOverflow(page);
  }
});
