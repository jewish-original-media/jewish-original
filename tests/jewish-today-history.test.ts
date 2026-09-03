import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatOnThisDayDate,
  mapOnThisDayRows,
  matchesOnThisDayHistory,
} from "../src/content/jewish-today/on-this-day";

describe("Today in Jewish History matching", () => {
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

  it("matches a published Gregorian day-precision historical event", () => {
    assert.equal(matchesOnThisDayHistory(dachau, 4, 29), true);
  });

  it("does not match a different month or day", () => {
    assert.equal(matchesOnThisDayHistory(dachau, 9, 1), false);
    assert.equal(matchesOnThisDayHistory(dachau, 4, 28), false);
  });

  it("excludes recurring observances even if a Gregorian month/day exists", () => {
    assert.equal(
      matchesOnThisDayHistory(
        {
          ...dachau,
          entryKind: "recurringObservance",
          historicalDate: {
            precision: "day",
            calendarSystem: "gregorian",
            start: { month: 4, day: 29 },
          },
        },
        4,
        29,
      ),
      false,
    );
  });

  it("excludes drafts, incomplete dates, and Hebrew-calendar events", () => {
    assert.equal(
      matchesOnThisDayHistory(
        { ...dachau, workflowStatus: "needsReview" },
        4,
        29,
      ),
      false,
    );
    assert.equal(
      matchesOnThisDayHistory(
        {
          ...dachau,
          historicalDate: {
            precision: "year",
            calendarSystem: "gregorian",
            start: { year: 1945, month: 4, day: 29 },
          },
        },
        4,
        29,
      ),
      false,
    );
    assert.equal(
      matchesOnThisDayHistory(
        {
          ...dachau,
          historicalDate: {
            precision: "day",
            calendarSystem: "hebrew",
            start: { month: 4, day: 29 },
          },
        },
        4,
        29,
      ),
      false,
    );
    assert.equal(
      matchesOnThisDayHistory(
        { ...dachau, workflowStatus: "duplicateCandidate" },
        4,
        29,
      ),
      false,
    );
  });

  it("maps a published Sanity row without inventing related or image fields", () => {
    const [entry] = mapOnThisDayRows([
      {
        _id: "historyEntry.dachau",
        title: "US Liberates Dachau",
        slug: "us-liberates-dachau",
        excerpt: "On April 29, 1945, American troops liberated Dachau.",
        year: 1945,
        month: 4,
        day: 29,
        topics: [
          { name: "Holocaust", slug: "holocaust" },
          { name: "World War II", slug: "world-war-ii" },
        ],
        places: [{ name: "Tegernsee" }],
      },
    ]);

    assert.equal(entry?.href, "/history/us-liberates-dachau");
    assert.equal(entry?.dateLabel, "April 29, 1945");
    assert.equal(entry?.location, "Tegernsee");
    assert.deepEqual(
      entry?.topics.map((topic) => topic.slug),
      ["holocaust", "world-war-ii"],
    );
    assert.equal("primaryImage" in (entry ?? {}), false);
  });

  it("formats the historical date without treating year as the event date", () => {
    assert.equal(
      formatOnThisDayDate({ year: 1945, month: 4, day: 29 }),
      "April 29, 1945",
    );
  });
});
