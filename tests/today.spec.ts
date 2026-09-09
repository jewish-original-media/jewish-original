import { expect, test } from "@playwright/test";

async function expectNoOverflow(page: import("@playwright/test").Page) {
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
}

test("renders an ordinary weekday without empty sections", async ({
  page,
}, testInfo) => {
  await page.goto("/today?date=2026-09-01");

  await expect(
    page.getByRole("heading", { level: 1, name: "Today" }),
  ).toBeVisible();
  await expect(page.getByText("Tuesday, September 1, 2026")).toBeVisible();
  await expect(page.getByText("19 Elul 5786")).toBeVisible();
  await expect(page.getByText("This week in Torah")).toBeVisible();
  await expect(page.getByText("Most recent Torah portion")).toHaveCount(0);
  await expect(page.getByText("Eastern Time")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /nitzavim.vayeilech/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /jewish calendar/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /today in jewish history/i }),
  ).toHaveCount(0);
  await expect(
    page.getByText(
      "No published History entries match this Gregorian date yet.",
    ),
  ).toHaveCount(0);
  await expect(
    page.getByText(/civil gregorian|america\/new_york/i),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Hebcal" })).toBeVisible();

  await expectNoOverflow(page);
  await page.screenshot({
    path: `artifacts/today-weekday-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("labels a prior portion when the coming Saturday is a festival", async ({
  page,
}) => {
  await page.goto("/today?date=2026-09-09");

  await expect(page.getByText("Most recent Torah portion")).toBeVisible();
  await expect(page.getByText("This week in Torah")).toHaveCount(0);
  await expect(page.getByText("Festival").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /nitzavim.vayeilech/i }),
  ).toBeVisible();
});

test("renders holiday, Omer, Shabbat, and Rosh Chodesh fixtures", async ({
  page,
}, testInfo) => {
  await page.goto("/today?date=2026-04-02");
  await expect(page.getByText("Pesach I").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /this week in torah/i }),
  ).toHaveCount(0);

  if (testInfo.project.name === "desktop") {
    await page.screenshot({
      path: "artifacts/today-holiday-desktop.png",
      fullPage: true,
    });
  } else {
    await page.screenshot({
      path: "artifacts/today-holiday-mobile.png",
      fullPage: true,
    });
  }

  await page.goto("/today?date=2026-04-20");
  await expect(page.getByText(/18th day of the omer/i)).toBeVisible();

  await page.goto("/today?date=2026-09-05");
  await expect(
    page.getByText("Shabbat", { exact: false }).first(),
  ).toBeVisible();
  await expect(page.getByText(/leil selichot/i)).toBeVisible();

  await page.goto("/today?date=2026-01-19");
  await expect(page.getByText(/rosh chodesh/i).first()).toBeVisible();

  await page.goto("/today?date=2026-02-28");
  await expect(page.getByText(/shabbat zachor/i)).toBeVisible();
});

test("retrieves the published Dachau History entry on April 29", async ({
  page,
}, testInfo) => {
  await page.goto("/today?date=2026-04-29");

  const dachau = page.getByRole("link", { name: "US Liberates Dachau" });
  await expect(dachau).toBeVisible();
  await expect(dachau).toHaveAttribute("href", "/history/us-liberates-dachau");
  await dachau.scrollIntoViewIfNeeded();
  await dachau.click();
  await expect(page).toHaveURL(/\/history\/us-liberates-dachau$/, {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("heading", { name: "US Liberates Dachau" }),
  ).toBeVisible();
  await page.goto("/today?date=2026-04-29");
  await expect(page.getByText("April 29, 1945", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/american troops liberated the dachau concentration camp/i),
  ).toBeVisible();
  await expect(page.getByText(/holocaust/i).first()).toBeVisible();
  await expect(
    page
      .locator("article")
      .filter({ hasText: "US Liberates Dachau" })
      .locator("img"),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: /related/i })).toHaveCount(0);

  await expectNoOverflow(page);
  await page.screenshot({
    path: `artifacts/today-dachau-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("does not fabricate History results on unmatched dates", async ({
  page,
}) => {
  for (const date of ["2026-09-01", "2026-04-02", "2026-02-02"]) {
    await page.goto(`/today?date=${date}`);
    await expect(
      page.getByRole("link", { name: /us liberates dachau/i }),
    ).toHaveCount(0);
  }
});

test("keeps a useful page when Hebcal is unavailable", async ({
  page,
}, testInfo) => {
  await page.goto("/today?date=2026-04-29&preview=calendar-unavailable");

  await expect(page.getByText("Wednesday, April 29, 2026")).toBeVisible();
  await expect(
    page.getByText(/hebrew calendar is briefly unavailable/i),
  ).toBeVisible();
  await expect(page.getByText(/12 iyyar|י״ב אייר/i)).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /this week in torah/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "US Liberates Dachau" }),
  ).toBeVisible();
  await expect(
    page.getByText(/http|stack|hebcal calendar request/i),
  ).toHaveCount(0);

  await page.screenshot({
    path: `artifacts/today-unavailable-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
