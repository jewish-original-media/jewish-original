import assert from "node:assert/strict";
import test from "node:test";

import {
  collectPublishedFacets,
  filterAndSortHistoryArchive,
  hasPublishedRelatedHistoryEntry,
  historyArchiveHref,
  historyCardLocation,
  historyCardRegion,
  isUsefulPublishedFacet,
  paginateHistoryArchive,
  parseHistoryArchiveSearch,
  selectPublishedHistoryEntries,
} from "../src/content/history/archive";
import type { HistoryEntrySummary } from "../src/content/history/types";
import { formatHistoricalDate } from "../src/lib/history/format-date";
import { matchesOnThisDayHistory } from "../src/lib/history/on-this-day";
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
    region: undefined,
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
    region: undefined,
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
    region: undefined,
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
    region: undefined,
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

test("recently updated sort uses editorial update, not import created time", () => {
  const importedEarlier: HistoryEntrySummary = {
    ...dachau,
    _id: "imported-earlier",
    slug: "imported-earlier",
    _createdAt: "2026-09-17T00:00:00Z",
    _updatedAt: "2026-09-17T00:00:00Z",
  };
  const reviewedLater: HistoryEntrySummary = {
    ...dachau,
    _id: "reviewed-later",
    slug: "reviewed-later",
    title: "Reviewed later",
    _createdAt: "2026-09-02T00:00:00Z",
    _updatedAt: "2026-09-19T00:00:00Z",
  };
  const results = filterAndSortHistoryArchive(
    [importedEarlier, reviewedLater],
    parseHistoryArchiveSearch({ sort: "added-newest" }),
  );
  assert.deepEqual(
    results.map((entry) => entry.slug),
    ["reviewed-later", "imported-earlier"],
  );
});

test("year-only, Julian, and recurring records stay discoverable with honest labels", () => {
  const yearOnly: HistoryEntrySummary = {
    ...dachau,
    _id: "year-only",
    slug: "year-only",
    title: "Year-only published story",
    historicalDate: {
      calendarSystem: "gregorian",
      precision: "year",
      start: { year: 1492 },
    },
  };
  const julian: HistoryEntrySummary = {
    ...dachau,
    _id: "julian",
    slug: "julian",
    title: "Julian published story",
    historicalDate: {
      calendarSystem: "julian",
      precision: "day",
      start: { year: 1569, month: 1, day: 25 },
    },
  };
  const recurring: HistoryEntrySummary = {
    ...dachau,
    _id: "recurring",
    slug: "yom-hazikaron",
    title: "Yom HaZikaron",
    entryKind: "recurringObservance",
    historicalDate: { calendarSystem: "hebrew", precision: "unknown" },
    observanceRule: {
      nominalHebrewDay: 4,
      nominalHebrewMonth: "Iyar",
    },
  };

  const unfiltered = filterAndSortHistoryArchive(
    [dachau, yearOnly, julian, recurring],
    parseHistoryArchiveSearch({}),
  );
  assert.deepEqual(
    unfiltered.map((entry) => entry.slug),
    ["us-liberates-dachau", "julian", "year-only", "yom-hazikaron"],
  );

  const april29 = filterAndSortHistoryArchive(
    [dachau, yearOnly, julian, recurring],
    parseHistoryArchiveSearch({ month: "4", day: "29" }),
  );
  assert.deepEqual(
    april29.map((entry) => entry.slug),
    ["us-liberates-dachau"],
  );
  assert.equal(matchesOnThisDayHistory(yearOnly, 4, 29), false);
  assert.equal(matchesOnThisDayHistory(julian, 1, 25), false);
  assert.equal(matchesOnThisDayHistory(recurring, 5, 4), false);
  assert.equal(
    formatHistoricalDate(yearOnly.historicalDate, "historicalEvent"),
    "1492",
  );
  assert.equal(
    formatHistoricalDate(julian.historicalDate, "historicalEvent"),
    "January 25, 1569 (Julian calendar)",
  );
  assert.equal(
    formatHistoricalDate(
      recurring.historicalDate,
      "recurringObservance",
      recurring.observanceRule,
    ),
    "4 Iyar · observed date may vary",
  );
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
  assert.equal(historyCardRegion(dachau), "Europe");
});

test("keeps published records with missing metadata in unfiltered results", () => {
  const sparse: HistoryEntrySummary = {
    ...dachau,
    _id: "historyEntry.sparse",
    title: "Reviewed story without taxonomy",
    slug: "reviewed-story-without-taxonomy",
    topics: [],
    places: [],
    geographicRegions: [],
    eras: [],
  };
  const unfiltered = filterAndSortHistoryArchive(
    [dachau, sparse],
    parseHistoryArchiveSearch({}),
  );
  assert.deepEqual(
    unfiltered.map((entry) => entry.slug),
    ["us-liberates-dachau", "reviewed-story-without-taxonomy"],
  );
  const holocaust = filterAndSortHistoryArchive(
    [dachau, sparse],
    parseHistoryArchiveSearch({ topic: "holocaust" }),
  );
  assert.deepEqual(
    holocaust.map((entry) => entry.slug),
    ["us-liberates-dachau"],
  );
});

test("excludes drafts and unverified calendar systems from public helpers", () => {
  const draft = { ...dachau, _id: "drafts.historyEntry.hidden" };
  const unverified: HistoryEntrySummary = {
    ...dachau,
    _id: "historyEntry.unverified",
    slug: "unverified-parsed-date",
    historicalDate: {
      calendarSystem: "other",
      precision: "day",
      start: { year: 1945, month: 4, day: 29 },
    },
  };

  assert.deepEqual(
    selectPublishedHistoryEntries([dachau, draft]).map((entry) => entry._id),
    [dachau._id],
  );
  assert.equal(hasPublishedRelatedHistoryEntry(draft), false);
  assert.equal(hasPublishedRelatedHistoryEntry(dachau), true);
  assert.equal(
    filterAndSortHistoryArchive(
      [dachau, unverified],
      parseHistoryArchiveSearch({ month: "4", day: "29" }),
    ).map((entry) => entry.slug)[0],
    "us-liberates-dachau",
  );
  assert.deepEqual(
    filterAndSortHistoryArchive(
      [unverified],
      parseHistoryArchiveSearch({ month: "4", day: "29" }),
    ),
    [],
  );
  assert.equal(
    formatHistoricalDate(unverified.historicalDate, "historicalEvent"),
    "Date under review",
  );
  assert.equal(isUsefulPublishedFacet([]), false);
  assert.equal(isUsefulPublishedFacet(dachau.places.slice(0, 1)), false);
  assert.equal(isUsefulPublishedFacet(dachau.places), true);
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
