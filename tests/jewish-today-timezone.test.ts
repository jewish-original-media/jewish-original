import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  civilDateInTimeZone,
  isIsoDate,
  nextSaturdayInclusive,
  previousSaturdayInclusive,
  resolveCivilDate,
  weekdayUtc,
} from "../src/features/jewish-today/timezone";

describe("Jewish Today timezone", () => {
  it("accepts only real Gregorian dates", () => {
    assert.equal(isIsoDate("2026-09-01"), true);
    assert.equal(isIsoDate("2026-02-29"), false);
    assert.equal(isIsoDate("2024-02-29"), true);
    assert.equal(isIsoDate("09-01-2026"), false);
  });

  it("uses the civil date in America/New_York", () => {
    const lateMondayUtc = new Date("2026-09-01T03:30:00.000Z");
    assert.equal(civilDateInTimeZone(lateMondayUtc), "2026-08-31");

    const morningEt = new Date("2026-09-01T12:00:00.000Z");
    assert.equal(civilDateInTimeZone(morningEt), "2026-09-01");
  });

  it("looks ahead to the coming Saturday, inclusive", () => {
    assert.equal(nextSaturdayInclusive("2026-09-01"), "2026-09-05");
    assert.equal(nextSaturdayInclusive("2026-09-05"), "2026-09-05");
    assert.equal(weekdayUtc("2026-09-05"), 6);
  });

  it("includes the previous Saturday so last week’s portion can still be derived", () => {
    assert.equal(previousSaturdayInclusive("2026-09-09"), "2026-09-05");
    assert.equal(previousSaturdayInclusive("2026-09-05"), "2026-09-05");
    assert.equal(previousSaturdayInclusive("2026-09-01"), "2026-08-29");
  });

  it("prefers an explicit valid date over the clock", () => {
    assert.equal(
      resolveCivilDate("2026-04-02", new Date("2026-09-01T16:00:00.000Z")),
      "2026-04-02",
    );
    assert.equal(
      resolveCivilDate("not-a-date", new Date("2026-09-01T16:00:00.000Z")),
      "2026-09-01",
    );
  });
});
