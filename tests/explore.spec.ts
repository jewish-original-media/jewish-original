import { expect, test } from "@playwright/test";

test("searches the living archive with canonical noindex query views", async ({
  page,
}) => {
  const response = await page.goto("/explore");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Everything connects." }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/explore",
  );
  await expect(
    page.getByRole("navigation", { name: "Continue exploring" }),
  ).toBeVisible();
  const entryPaths = page.getByRole("region", {
    name: "A person. A place. An idea. See where it leads.",
  });
  await expect(entryPaths).toBeVisible();
  const entryHref = await entryPaths.locator("a").first().getAttribute("href");
  expect(entryHref).toMatch(
    /^\/explore\?(topic|person|place|region|era|organization)=[^&]+$/,
  );

  const search = page.getByRole("combobox", { name: "Search the archive" });
  await search.focus();
  await search.fill("identity");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/explore\?q=identity/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jewishoriginal.com/explore",
  );
  await expect(
    page.getByRole("navigation", { name: "Active filters" }),
  ).toBeVisible();
});

test("connects archive tags to canonical entity pages and returns unknown entities as 404", async ({
  page,
}) => {
  await page.goto("/explore");
  const facet = page
    .locator(
      "a[href^='/topics/'], a[href^='/people/'], a[href^='/places/'], a[href^='/regions/'], a[href^='/eras/'], a[href^='/organizations/']",
    )
    .first();
  await expect(facet).toBeVisible();
  const href = await facet.getAttribute("href");
  expect(href).toBeTruthy();

  await page.goto(href!);
  await expect(page).toHaveURL(new RegExp(`${href!.replace("/", "\\/")}$`));
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://jewishoriginal.com${href}`,
  );
  await expect(
    page.getByRole("link", { name: /explore the full archive/i }),
  ).toBeVisible();
  const filteredCollection = page.getByRole("link", {
    name: /open this collection in explore/i,
  });
  await expect(filteredCollection).toHaveAttribute(
    "href",
    /^\/explore\?(topic|person|place|region|era|organization)=[^&]+$/,
  );

  const missing = await page.goto("/topics/not-a-real-archive-entity");
  expect(missing?.status()).toBe(404);
});

test("keeps Explore usable without horizontal overflow and links it from chrome", async ({
  page,
}) => {
  await page.goto("/");
  const exploreLinks = page.getByRole("link", { name: "Explore", exact: true });
  await expect(exploreLinks.first()).toBeVisible();
  await exploreLinks.first().click();
  await expect(page).toHaveURL("/explore");

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("explains the source-honest Current view and links its editorial desks", async ({
  page,
}) => {
  await page.goto("/explore?view=current");

  await expect(
    page.getByText(
      /without turning outbound records into permanent archive articles/i,
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open the News desk" }),
  ).toHaveAttribute("href", "/news");
  await expect(
    page.getByRole("link", { name: "Open the Events calendar" }),
  ).toHaveAttribute("href", "/events");
  await expect(
    page.getByRole("combobox", { name: "Search the archive" }),
  ).toHaveAttribute("placeholder", "Search current news and events");
  await expect(page.getByText("Begin with a thread")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Continue exploring" }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
