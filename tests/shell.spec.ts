import { expect, test } from "@playwright/test";

test("renders the responsive, accessible application shell", async ({
  page,
}, testInfo) => {
  const browserErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      const text = message.text();
      const sourceUrl = message.location().url;
      const combined = `${text} ${sourceUrl}`;
      if (/\/(?:search|news|events|contact|terms)(?:\?|$)/.test(combined)) {
        return;
      }
      browserErrors.push(sourceUrl ? `${text} (${sourceUrl})` : text);
    }
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) {
      const path = new URL(response.url()).pathname;
      if (/^(?:\/search|\/news|\/events|\/contact|\/terms)$/.test(path)) {
        return;
      }
      browserErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  const dailyRibbon = page.getByRole("navigation", {
    name: "The day across Jewish Original",
  });
  await expect(dailyRibbon).toBeVisible();
  await expect(dailyRibbon.getByRole("link").first()).toBeVisible();
  const ribbonLabelSize = await dailyRibbon
    .getByRole("link")
    .first()
    .locator("span")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    );
  expect(ribbonLabelSize).toBeGreaterThanOrEqual(13);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Jewish Original Media, history, culture, education/i,
    }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  if (testInfo.project.name === "mobile") {
    const menu = page.getByText("Menu", { exact: true });
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(
      page.getByRole("navigation", { name: "Mobile" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Mobile" })
        .getByRole("link", { name: /Jewish calendar/ }),
    ).toBeVisible();
    await menu.click();
  } else {
    const primary = page.getByRole("navigation", { name: "Primary" });
    await expect(primary).toBeVisible();
    await primary.getByRole("link", { name: "Today", exact: true }).hover();
    await expect(
      primary.getByRole("link", { name: /Jewish calendar/ }),
    ).toBeVisible();
    const history = primary.getByRole("link", { name: "History", exact: true });
    await history.focus();
    await history.hover();
    const archiveSearch = primary.getByRole("link", {
      name: "Search the archive",
    });
    await expect(archiveSearch).toBeVisible();
    await page.mouse.move(720, 960);
    await expect(archiveSearch).toBeHidden();
  }

  await page.screenshot({
    path: `artifacts/shell-${testInfo.project.name}-verified.png`,
    fullPage: true,
  });

  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();

  expect(browserErrors).toEqual([]);
});

test("serves generated discovery and crawler metadata", async ({ request }) => {
  for (const path of [
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.webmanifest",
    "/icon",
    "/opengraph-image",
  ]) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should return a successful response`).toBe(
      true,
    );
  }

  const sitemap = await request.get("/sitemap.xml");
  const xml = await sitemap.text();
  expect(xml).toContain("/news");
  expect(xml).toContain("/originals");
  expect(xml).not.toContain("/events");
  expect(xml).not.toContain("/admin");
});

test("history submenu links open the matching archive", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "desktop primary navigation");
  await page.goto("/");
  const primary = page.getByRole("navigation", { name: "Primary" });
  const history = primary.getByRole("link", { name: "History", exact: true });
  await history.hover();
  const hrefs = await history
    .locator("xpath=ancestor::li[1]")
    .locator("a")
    .evaluateAll((anchors) =>
      anchors
        .map((anchor) => anchor.getAttribute("href"))
        .filter((href): href is string => Boolean(href)),
    );

  expect(hrefs).toContain("/history");
  expect(hrefs).toContain("/explore");
  expect(hrefs.some((href) => /^\/history\?month=\d+&day=\d+$/.test(href))).toBe(
    true,
  );
  expect(hrefs.some((href) => href.startsWith("/history?topic="))).toBe(true);
  expect(hrefs.some((href) => href.startsWith("/history?place="))).toBe(true);
  expect(hrefs.some((href) => href.startsWith("/history?era="))).toBe(true);

  for (const href of hrefs.filter((item) => item !== "/history")) {
    const response = await page.goto(href);
    expect(response?.ok(), href).toBe(true);
    if (href.startsWith("/history?")) {
      await expect(page.getByRole("heading", { name: /\d+ stories/ })).toBeVisible();
      const chip = page.getByRole("list", { name: "Active filters" });
      await expect(chip).toBeVisible();
    }
  }
});
