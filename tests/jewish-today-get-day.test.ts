import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { HistoryEntrySummary } from "../src/content/history/types";
import { getJewishToday } from "../src/features/jewish-today/get-day";
import type { HebcalCalendarResponse } from "../src/integrations/hebcal/types";

const fixtures = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures/hebcal",
);

function load(name: string): HebcalCalendarResponse {
  return JSON.parse(
    readFileSync(join(fixtures, name), "utf8"),
  ) as HebcalCalendarResponse;
}

function dachauSummary(): HistoryEntrySummary {
  return {
    _id: "history-dachau",
    title: "US Liberates Dachau",
    slug: "us-liberates-dachau",
    excerpt:
      "On April 29, 1945, American troops liberated the Dachau concentration camp.",
    topics: [],
    people: [],
    places: [],
    eras: [],
    organizations: [],
    geographicRegions: [],
  };
}

describe("getJewishToday composition", () => {
  it("composes calendar data with published History matches only", async () => {
    const day = await getJewishToday({
      date: "2026-04-29",
      fetchCalendar: async () => load("weekday-2026-09-01.json"),
      fetchOnThisDay: async (month, dayOfMonth) =>
        month === 4 && dayOfMonth === 29 ? [dachauSummary()] : [],
    });

    assert.equal(day.onThisDay[0]?.slug, "us-liberates-dachau");
    assert.equal(day.attribution.provider, "hebcal");
  });

  it("degrades when the calendar provider fails", async () => {
    const day = await getJewishToday({
      date: "2026-09-01",
      fetchCalendar: async () => {
        throw new Error("Hebcal unavailable");
      },
      fetchOnThisDay: async () => [],
    });

    assert.equal(day.calendarStatus, "unavailable");
    assert.equal(day.gregorianDate, "2026-09-01");
    assert.equal(day.gregorianLabel, "Tuesday, September 1, 2026");
    assert.equal(day.hebrewDate, undefined);
    assert.equal(day.parashah, undefined);
    assert.equal(day.onThisDay.length, 0);
  });

  it("still shows History when the calendar provider fails", async () => {
    const day = await getJewishToday({
      date: "2026-04-29",
      fetchCalendar: async () => {
        throw new Error("Hebcal unavailable");
      },
      fetchOnThisDay: async () => [dachauSummary()],
    });

    assert.equal(day.calendarStatus, "unavailable");
    assert.equal(day.onThisDay.length, 1);
  });

  it("can force the calendar-unavailable preview without calling Hebcal", async () => {
    const day = await getJewishToday({
      date: "2026-04-29",
      forceCalendarUnavailable: true,
      fetchCalendar: async () => {
        throw new Error("Hebcal should not be called");
      },
      fetchOnThisDay: async () => [dachauSummary()],
    });

    assert.equal(day.calendarStatus, "unavailable");
    assert.equal(day.hebrewDate, undefined);
    assert.equal(day.onThisDay[0]?.slug, "us-liberates-dachau");
  });
});
