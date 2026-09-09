import assert from "node:assert/strict";
import { test } from "node:test";

import type { HistoryEntrySummary } from "../src/content/history/types";
import { composeHomeHistory } from "../src/features/homepage/history";

function entry(id: string, title: string): HistoryEntrySummary {
  return {
    _id: id,
    title,
    slug: id,
    excerpt: `${title} excerpt`,
    historicalDate: { start: { year: 1945, month: 4, day: 29 } },
    entryKind: "historicalEvent",
    topics: [],
    people: [],
    places: [],
    eras: [],
    organizations: [],
    geographicRegions: [],
  };
}

test("uses an On This Day match as the homepage lead", () => {
  const dachau = entry("dachau", "US Liberates Dachau");
  const joop = entry("joop", "Joop Westerweel Is Murdered at Vught");
  const composed = composeHomeHistory([joop, dachau], [dachau]);

  assert.equal(composed.onThisDay, true);
  assert.equal(composed.title, "On this day");
  assert.equal(composed.lead?._id, "dachau");
  assert.deepEqual(
    composed.supporting.map((item) => item._id),
    ["joop"],
  );
});

test("keeps only two supporting History items on the homepage", () => {
  const lead = entry("lead", "Samuel Willenberg Dies");
  const extras = ["a", "b", "c", "d"].map((id) => entry(id, id));
  const composed = composeHomeHistory([lead, ...extras], []);

  assert.equal(composed.lead?._id, "lead");
  assert.deepEqual(
    composed.supporting.map((item) => item._id),
    ["a", "b"],
  );
});

test("falls back to archive order when no On This Day match exists", () => {
  const first = entry("first", "Samuel Willenberg Dies");
  const second = entry("second", "Bialystok Ghetto Is Sealed");
  const composed = composeHomeHistory([first, second], []);

  assert.equal(composed.onThisDay, false);
  assert.equal(composed.title, "From the archive");
  assert.equal(composed.lead?._id, "first");
  assert.equal(composed.supporting[0]?._id, "second");
});
