import assert from "node:assert/strict";
import test from "node:test";

import type { HistoryArchiveFacets } from "../src/content/history/types";
import { suggestHistoryArchiveTerms } from "../src/lib/history/suggestions";

const facets: HistoryArchiveFacets = {
  topics: [
    { name: "Holocaust", slug: "holocaust" },
    { name: "Antisemitism", slug: "antisemitism" },
  ],
  people: [{ name: "Samuel Willenberg", slug: "samuel-willenberg" }],
  places: [
    { name: "Dachau concentration camp", slug: "dachau-concentration-camp" },
    {
      name: "Treblinka extermination camp",
      slug: "treblinka-extermination-camp",
    },
  ],
  regions: [{ name: "Europe", slug: "europe" }],
  eras: [],
  organizations: [],
};

test("suggests labeled published taxonomy and ranks exact starts first", () => {
  const suggestions = suggestHistoryArchiveTerms("hol", facets);
  assert.equal(suggestions[0]?.slug, "holocaust");
  assert.equal(suggestions[0]?.kind, "topic");
  assert.ok(suggestions.length <= 6);
});

test("can suggest people, places, and regions from published facets only", () => {
  const samuel = suggestHistoryArchiveTerms("samuel", facets);
  assert.deepEqual(samuel, [
    {
      kind: "person",
      name: "Samuel Willenberg",
      slug: "samuel-willenberg",
    },
  ]);

  const europe = suggestHistoryArchiveTerms("eur", facets);
  assert.equal(europe[0]?.kind, "region");
  assert.equal(europe[0]?.slug, "europe");
});

test("does not invent unpublished taxonomy", () => {
  assert.deepEqual(suggestHistoryArchiveTerms("herzl", facets), []);
  assert.deepEqual(suggestHistoryArchiveTerms("", facets), []);
});
