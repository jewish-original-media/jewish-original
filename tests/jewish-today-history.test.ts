import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { historyCardLocation } from "../src/content/history/archive";
import type { HistoryEntrySummary } from "../src/content/history/types";
import { formatHistoricalDate } from "../src/lib/history/format-date";
import { matchesOnThisDayHistory } from "../src/lib/history/on-this-day";

describe("Jewish Today uses canonical History matching", () => {
  const dachau = {
    entryKind: "historicalEvent",
    workflowStatus: "ready",
    published: true,
    slug: "us-liberates-dachau",
    historicalDate: {
      precision: "day" as const,
      calendarSystem: "gregorian" as const,
      start: { year: 1945, month: 4, day: 29 },
    },
  };

  it("matches Dachau on April 29 through History’s matcher", () => {
    assert.equal(matchesOnThisDayHistory(dachau, 4, 29), true);
    assert.equal(matchesOnThisDayHistory(dachau, 9, 1), false);
  });

  it("formats the Dachau date with formatHistoricalDate", () => {
    assert.equal(
      formatHistoricalDate(dachau.historicalDate, "historicalEvent"),
      "April 29, 1945",
    );
  });

  it("reads location from History card helpers without inventing image fields", () => {
    const entry: HistoryEntrySummary = {
      _id: "historyEntry.dachau",
      title: "US Liberates Dachau",
      slug: "us-liberates-dachau",
      excerpt: "On April 29, 1945, American troops liberated Dachau.",
      historicalDate: dachau.historicalDate,
      topics: [
        { name: "Holocaust", slug: "holocaust" },
        { name: "World War II", slug: "world-war-ii" },
      ],
      people: [],
      places: [{ name: "Tegernsee", slug: "tegernsee" }],
      eras: [],
      organizations: [],
      geographicRegions: [],
    };

    assert.equal(historyCardLocation(entry), "Tegernsee");
    assert.equal("primaryImage" in entry, false);
  });
});
