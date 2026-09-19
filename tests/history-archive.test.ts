import assert from "node:assert/strict";
import test from "node:test";

import {
  collectPublishedFacets,
  filterAndSortHistoryArchive,
  historyArchiveHref,
  historyCardLocation,
  paginateHistoryArchive,
  parseHistoryArchiveSearch,
} from "../src/content/history/archive";
import type { HistoryEntrySummary } from "../src/content/history/types";
import { buildHistoryArchiveMetadata } from "../src/lib/seo/history";

const dachau: HistoryEntrySummary = {
  _id: "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc",
  _createdAt: "2026-08-30T12:00:00Z",
  title: "US Liberates Dachau",
  slug: "us-liberates-dachau",
  excerpt: "American troops liberated Dachau on April 29, 1945.",
  entryKind: "historicalEvent",
  historicalDate: {
    calendarSystem: "gregorian",
    precision: "day",
    start: { year: 1945, month: 4, day: 29 },
  },
  topics: [
    { name: "Holocaust", slug: "holocaust" },
    { name: "World War II", slug: "world-war-ii" },
    { name: "Antisemitism", slug: "antisemitism" },
  ],
  people: [],
  places: [
    { name: "Dachau concentration camp", slug: "dachau-concentration-camp" },
    { name: "Tegernsee", slug: "tegernsee" },
  ],
  eras: [{ name: "World War II", slug: "world-war-ii" }],
  organizations: [],
  geographicRegions: [{ name: "Europe", slug: "europe" }],
};

test("parses date and taxonomy archive search without inventing values", () => {
  assert.deepEqual(parseHistoryArchiveSearch({}), {
    filter: undefined,
    query: undefined,
    topic: undefined,
    place: undefined,
    month: undefined,
    day: undefined,
    sort: "historical-newest",
    page: 1,
    isBrowsing: false,
  });
  assert.deepEqual(parseHistoryArchiveSearch({ month: "4", day: "29" }), {
    filter: undefined,
    query: undefined,
    topic: undefined,
    place: undefined,
    month: 4,
    day: 29,
    sort: "historical-newest",
    page: 1,
    isBrowsing: true,
  });
  assert.deepEqual(parseHistoryArchiveSearch({ day: "29" }), {
    filter: undefined,
    query: undefined,
    topic: undefined,
    place: undefined,
    month: undefined,
    day: undefined,
    sort: "historical-newest",
    page: 1,
    isBrowsing: false,
  });
  assert.deepEqual(parseHistoryArchiveSearch({ topic: "holocaust" }), {
    filter: { type: "topic", slug: "holocaust" },
    query: undefined,
    topic: "holocaust",
    place: undefined,
    month: undefined,
    day: undefined,
    sort: "historical-newest",
    page: 1,
    isBrowsing: true,
  });
  assert.equal(
    parseHistoryArchiveSearch({ topic: "not a slug" }).filter,
    undefined,
  );
});

test("searches and combines public fields before pagination", () => {
  const tripoli: HistoryEntrySummary = {
    ...dachau,
    _id: "tripoli",
    _createdAt: "2026-09-02T12:00:00Z",
    title: "Anti-Jewish Riots Break Out in Tripoli, Libya",
    slug: "anti-jewish-riots-tripoli",
    historicalDate: {
      calendarSystem: "gregorian",
      precision: "day",
      start: { year: 1945, month: 11, day: 5 },
    },
    topics: [{ name: "Antisemitism", slug: "antisemitism" }],
    places: [{ name: "Tripoli", slug: "tripoli" }],
  };
  const search = parseHistoryArchiveSearch({
    q: "tripoli antisemitism",
    place: "tripoli",
    sort: "added-newest",
  });
  const results = filterAndSortHistoryArchive([dachau, tripoli], search);
  assert.deepEqual(
    results.map((entry) => entry.slug),
    ["anti-jewish-riots-tripoli"],
  );
  assert.equal(paginateHistoryArchive(results, 4).page, 1);
});

test("builds durable archive query URLs instead of empty taxonomy routes", () => {
  assert.equal(historyArchiveHref({}), "/history");
  assert.equal(
    historyArchiveHref({ month: 4, day: 29 }),
    "/history?month=4&day=29",
  );
  assert.equal(
    historyArchiveHref({ filter: { type: "place", slug: "tegernsee" } }),
    "/history?place=tegernsee",
  );
});

test("derives public facets only from published entries that actually have them", () => {
  const facets = collectPublishedFacets([dachau]);
  assert.deepEqual(
    facets.topics.map((item) => item.slug),
    ["antisemitism", "holocaust", "world-war-ii"],
  );
  assert.deepEqual(
    facets.places.map((item) => item.slug),
    ["dachau-concentration-camp", "tegernsee"],
  );
  assert.deepEqual(facets.people, []);
  assert.deepEqual(facets.organizations, []);
  assert.equal(historyCardLocation(dachau), "Dachau concentration camp");
});

test("keeps filtered archive views out of the public index", () => {
  const landing = buildHistoryArchiveMetadata({
    browsing: false,
    preview: false,
  });
  const filtered = buildHistoryArchiveMetadata({
    browsing: true,
    preview: false,
    title: "Holocaust",
  });

  assert.deepEqual(landing.robots, { index: true, follow: true });
  assert.deepEqual(filtered.robots, { index: false, follow: true });
  assert.deepEqual(landing.alternates, { canonical: "/history" });
  assert.deepEqual(filtered.alternates, { canonical: "/history" });
});
