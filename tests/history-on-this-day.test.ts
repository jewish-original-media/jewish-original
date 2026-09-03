import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  civilDateParts,
  formatCivilDateLabel,
  isValidGregorianMonthDay,
  matchesOnThisDayHistory,
} from "../src/lib/history/on-this-day";

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

describe("Today in Jewish History matching", () => {
  it("matches a published Gregorian day-precision historical event", () => {
    assert.equal(matchesOnThisDayHistory(dachau, 4, 29), true);
  });

  it("does not match a different month or day", () => {
    assert.equal(matchesOnThisDayHistory(dachau, 9, 2), false);
    assert.equal(matchesOnThisDayHistory(dachau, 4, 28), false);
  });

  it("excludes recurring observances even if a Gregorian month/day exists", () => {
    assert.equal(
      matchesOnThisDayHistory(
        {
          ...dachau,
          entryKind: "recurringObservance",
        },
        4,
        29,
      ),
      false,
    );
  });

  it("excludes drafts, duplicates, incomplete dates, and Hebrew-calendar events", () => {
    assert.equal(
      matchesOnThisDayHistory({ ...dachau, workflowStatus: "needsReview" }, 4, 29),
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
    assert.equal(
      matchesOnThisDayHistory({ ...dachau, published: false }, 4, 29),
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
  });
});

describe("History civil date helpers", () => {
  it("reads the civil month and day in Eastern Time", () => {
    const parts = civilDateParts(
      new Date("2026-09-02T06:30:00.000Z"),
      "America/New_York",
    );
    assert.deepEqual(parts, { year: 2026, month: 9, day: 2 });
  });

  it("keeps late-evening Eastern dates on the same civil day", () => {
    const parts = civilDateParts(
      new Date("2026-09-03T03:30:00.000Z"),
      "America/New_York",
    );
    assert.deepEqual(parts, { year: 2026, month: 9, day: 2 });
  });

  it("formats a civil masthead date without shifting timezones", () => {
    assert.equal(
      formatCivilDateLabel({ year: 1945, month: 4, day: 29 }),
      "Sunday, April 29, 1945",
    );
  });

  it("accepts February 29 as a browseable calendar day", () => {
    assert.equal(isValidGregorianMonthDay(2, 29), true);
    assert.equal(isValidGregorianMonthDay(2, 30), false);
    assert.equal(isValidGregorianMonthDay(4, 29), true);
    assert.equal(isValidGregorianMonthDay(9, 31), false);
  });
});
