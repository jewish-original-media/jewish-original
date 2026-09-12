import type { Page } from "@playwright/test";

export async function readJsonLd<T extends { "@type"?: string }>(
  page: Page,
  type: string,
) {
  const texts = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  for (const text of texts) {
    const value = JSON.parse(text) as T;
    if (value["@type"] === type) return value;
  }
  throw new Error(`Missing ${type} JSON-LD`);
}
