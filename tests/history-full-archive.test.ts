import assert from "node:assert/strict";
import test from "node:test";

import {
  collectPublishedFacets,
  filterAndSortHistoryArchive,
  isUsefulPublishedFacet,
  paginateHistoryArchive,
  parseHistoryArchiveSearch,
  selectPublishedHistoryEntries,
} from "../src/content/history/archive";
import {
  HISTORY_V1_CURRENT_PUBLISHED,
  HISTORY_V1_DUPLICATE_SOURCE_ROWS,
  HISTORY_V1_SOURCE_ROWS,
  HISTORY_V1_UNIQUE_STORIES,
  currentPublishedHistoryEntries,
  eligibleHistoryEntriesAfterReview,
  getHistoryV1CompletionLedger,
  uniqueHistoryV1Rows,
} from "../src/content/history/v1-eligible-archive";
import { composeHomeHistory } from "../src/features/homepage/history";
import { matchesOnThisDayHistory } from "../src/lib/history/on-this-day";

const ledger = getHistoryV1CompletionLedger();
const uniqueRows = uniqueHistoryV1Rows();
const afterReview = eligibleHistoryEntriesAfterReview();
const currentPublished = currentPublishedHistoryEntries();

test("History completion ledger is 332 source rows and 298 unique stories", () => {
  assert.equal(ledger.workbookRows, HISTORY_V1_SOURCE_ROWS);
  assert.equal(ledger.rows.length, HISTORY_V1_SOURCE_ROWS);
  assert.equal(ledger.uniqueStories, HISTORY_V1_UNIQUE_STORIES);
  assert.equal(
    ledger.sourceRowsLinkedAsDuplicates,
    HISTORY_V1_DUPLICATE_SOURCE_ROWS,
  );
  assert.equal(uniqueRows.length, HISTORY_V1_UNIQUE_STORIES);
  assert.equal(
    ledger.buckets.uniqueStoriesPublished,
    HISTORY_V1_CURRENT_PUBLISHED,
  );
  assert.equal(
    uniqueRows.length + ledger.buckets.duplicateSourceRowsLinked,
    HISTORY_V1_SOURCE_ROWS,
  );
});

test("current public History remains the 9 reviewed publications", () => {
  assert.equal(currentPublished.length, HISTORY_V1_CURRENT_PUBLISHED);
  assert.ok(
    currentPublished.every((entry) => !entry._id.startsWith("drafts.")),
  );
});

test("full unique archive search, sort, and pagination operate before paging", () => {
  const publicEntries = selectPublishedHistoryEntries(afterReview);
  assert.equal(publicEntries.length, HISTORY_V1_UNIQUE_STORIES);
  assert.ok(publicEntries.every((entry) => !entry._id.startsWith("drafts.")));

  const unfiltered = filterAndSortHistoryArchive(
    publicEntries,
    parseHistoryArchiveSearch({}),
  );
  assert.equal(unfiltered.length, HISTORY_V1_UNIQUE_STORIES);

  const search = filterAndSortHistoryArchive(
    publicEntries,
    parseHistoryArchiveSearch({ q: "Dachau" }),
  );
  assert.ok(search.length >= 2);
  assert.ok(search.some((entry) => entry.title === "US Liberates Dachau"));

  const oldest = filterAndSortHistoryArchive(
    publicEntries,
    parseHistoryArchiveSearch({ sort: "historical-oldest" }),
  );
  const newest = filterAndSortHistoryArchive(
    publicEntries,
    parseHistoryArchiveSearch({}),
  );
  assert.ok((oldest[0]?.historicalDate?.start?.year ?? 0) <= 1569);
  assert.ok((newest[0]?.historicalDate?.start?.year ?? 0) >= 2016);

  const firstPage = paginateHistoryArchive(unfiltered, 1);
  const lastPage = paginateHistoryArchive(unfiltered, 99);
  assert.equal(firstPage.total, HISTORY_V1_UNIQUE_STORIES);
  assert.equal(firstPage.pageCount, 25);
  assert.equal(firstPage.items.length, 12);
  assert.equal(lastPage.page, 25);
  assert.equal(lastPage.items.length, 10);
});

test("missing metadata stays in unfiltered results and is not a useful facet", () => {
  const facets = collectPublishedFacets(afterReview);
  assert.equal(isUsefulPublishedFacet(facets.topics), false);
  assert.equal(isUsefulPublishedFacet(facets.places), false);

  const unfiltered = filterAndSortHistoryArchive(
    afterReview,
    parseHistoryArchiveSearch({}),
  );
  assert.equal(unfiltered.length, HISTORY_V1_UNIQUE_STORIES);
});

test("Today matching covers the complete reviewed archive and may be empty", () => {
  const april29 = afterReview.filter((entry) =>
    matchesOnThisDayHistory(entry, 4, 29),
  );
  assert.ok(april29.length >= 3);
  assert.ok(april29.some((entry) => entry.title === "US Liberates Dachau"));
  assert.ok(
    april29.some((entry) =>
      entry.title.includes("Ravensbruck Concentration Camp"),
    ),
  );

  const april26 = afterReview.filter((entry) =>
    matchesOnThisDayHistory(entry, 4, 26),
  );
  assert.ok(april26.length >= 2);
  assert.ok(
    april26.some((entry) =>
      entry.title.includes("Jerusalem the Capital of Israel"),
    ),
  );

  const september19 = afterReview.filter((entry) =>
    matchesOnThisDayHistory(entry, 9, 19),
  );
  assert.deepEqual(september19, []);

  const observances = afterReview.filter(
    (entry) => entry.entryKind === "recurringObservance",
  );
  assert.equal(observances.length, 2);
  assert.ok(
    observances.every(
      (entry) =>
        matchesOnThisDayHistory(entry, 4, 29) === false &&
        matchesOnThisDayHistory(entry, 5, 14) === false,
    ),
  );
});

test("homepage stays curated when the complete archive is eligible", () => {
  const composed = composeHomeHistory(afterReview, []);
  assert.equal(composed.supporting.length, 2);
  assert.ok(composed.lead);
  assert.equal(
    new Set([
      composed.lead._id,
      ...composed.supporting.map((entry) => entry._id),
    ]).size,
    3,
  );
});
