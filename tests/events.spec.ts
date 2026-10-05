import { expect, test } from "@playwright/test";

test("serves /events as a museum calendar without inventing programs", async ({
  page,
}) => {
  const response = await page.goto("/events");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Upcoming events" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Events" }),
  ).toHaveCount(0);
  await expect(
    page.getByText(/no upcoming events are published yet/i),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: /see events and news together in current/i,
    }),
  ).toHaveAttribute("href", "/explore?view=current");

  const outboundEvents = page.locator(
    'a[data-analytics-event="event_outbound"]',
  );
  for (const eventLink of await outboundEvents.all()) {
    await expect(eventLink).toHaveAttribute("target", "_blank");
  }
});
