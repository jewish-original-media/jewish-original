import assert from "node:assert/strict";
import test from "node:test";

import type { HistoryEntry } from "../src/content/history/types";
import {
  buildHistoryJsonLd,
  buildHistoryMetadata,
} from "../src/lib/seo/history";

function entry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    _id: "drafts.historyEntry.test",
    title: "US Liberates Dachau",
    slug: "us-liberates-dachau",
    excerpt:
      "On April 29, 1945, American troops liberated the Dachau concentration camp, freeing approximately 32,000 prisoners after twelve years of Nazi imprisonment, forced labor, medical experimentation, and mass death.",
    body: [],
    contentWarnings: [],
    topics: [
      { name: "Holocaust", slug: "holocaust" },
      { name: "World War II", slug: "world-war-ii" },
    ],
    people: [],
    places: [
      { name: "Dachau concentration camp", slug: "dachau-concentration-camp" },
      { name: "Tegernsee", slug: "tegernsee" },
    ],
    geographicRegions: [{ name: "Europe", slug: "europe" }],
    eras: [],
    organizations: [],
    relatedHistory: [],
    citations: [
      {
        _key: "citation-ushmm-dachau",
        title: "Dachau",
        url: "https://encyclopedia.ushmm.org/content/en/article/dachau",
        verificationStatus: "verified",
      },
    ],
    historicalDate: {
      calendarSystem: "gregorian",
      precision: "day",
      qualifier: "exact",
      start: { year: 1945, month: 4, day: 29 },
    },
    seo: {
      title: "US Liberates Dachau on April 29, 1945 | Jewish Original",
      description:
        "On April 29, 1945, American troops liberated approximately 32,000 prisoners from Dachau. Learn the history of the camp, its victims, and its liberation.",
    },
    _updatedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

test("uses an absolute SEO title so the site template is not doubled", () => {
  const metadata = buildHistoryMetadata(entry(), true);
  assert.deepEqual(metadata.title, {
    absolute: "US Liberates Dachau on April 29, 1945 | Jewish Original",
  });
  assert.deepEqual(metadata.robots, { index: false, follow: false });
  assert.equal(
    metadata.description,
    "On April 29, 1945, American troops liberated approximately 32,000 prisoners from Dachau. Learn the history of the camp, its victims, and its liberation.",
  );
});

test("builds JSON-LD from the reviewed excerpt, date, places, and verified citations", () => {
  const jsonLd = buildHistoryJsonLd(entry());
  assert.equal(jsonLd.headline, "US Liberates Dachau");
  assert.equal(
    jsonLd.description,
    "On April 29, 1945, American troops liberated the Dachau concentration camp, freeing approximately 32,000 prisoners after twelve years of Nazi imprisonment, forced labor, medical experimentation, and mass death.",
  );
  assert.equal(jsonLd.temporalCoverage, "April 29, 1945");
  assert.deepEqual(jsonLd.about, [
    "Holocaust",
    "World War II",
    "Dachau concentration camp",
    "Tegernsee",
    "Europe",
  ]);
  assert.deepEqual(jsonLd.citation, [
    "https://encyclopedia.ushmm.org/content/en/article/dachau",
  ]);
  assert.equal(jsonLd.image, undefined);
});
