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
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /remember, rebuild, and create/i,
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
    await menu.click();
  } else {
    await expect(
      page.getByRole("navigation", { name: "Primary" }),
    ).toBeVisible();
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
