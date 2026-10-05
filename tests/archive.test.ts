import assert from "node:assert/strict";
import test from "node:test";

import {
  presentHistoryRecord,
  presentOriginalRecord,
  presentPodcastRecord,
} from "../src/content/archive/presenters";
import {
  archiveEntityHref,
  archiveSearchHref,
  collectArchiveFacets,
  filterArchiveRecords,
  isArchiveEntityIndexable,
  paginateArchiveRecords,
  parseArchiveSearchParams,
} from "../src/content/archive/search";
import type { ArchiveRecord } from "../src/content/archive/types";
import { buildPageMetadata } from "../src/lib/seo/site";

function record(
  overrides: Partial<ArchiveRecord> & Pick<ArchiveRecord, "id" | "title">,
): ArchiveRecord {
  return {
    kind: "history",
    durability: "durable",
    href: `/history/${overrides.id}`,
    external: false,
    eyebrow: "History",
    topics: [],
    people: [],
    places: [],
    regions: [],
    eras: [],
    organizations: [],
    tags: [],
    searchText: overrides.title,
    ...overrides,
  };
}

test("presenters normalize durable content without discarding entity references", () => {
  const history = presentHistoryRecord({
    _id: "history-1",
    title: "A Jewish school opens",
    slug: "school-opens",
    excerpt: "A community builds a school.",
    topics: [{ name: "Education", slug: "education" }],
    people: [],
    places: [{ name: "Baghdad", slug: "baghdad" }],
    geographicRegions: [{ name: "Middle East", slug: "middle-east" }],
    eras: [],
    organizations: [],
  });
  const original = presentOriginalRecord({
    _id: "original-1",
    title: "What we carry",
    slug: "what-we-carry",
    authors: [{ name: "Editor", slug: "editor" }],
    topics: [{ name: "Identity", slug: "identity" }],
  });
  const podcast = presentPodcastRecord({
    _id: "podcast-1",
    title: "Across the diaspora",
    slug: "across-the-diaspora",
    showSlug: "show",
    showTitle: "The Show",
    publishedAt: "2026-01-01T00:00:00Z",
    guestNames: ["Guest"],
    topics: [{ name: "Diaspora", slug: "diaspora" }],
    people: [],
    places: [{ name: "Morocco", slug: "morocco" }],
    hosts: [{ name: "Host", slug: "host" }],
  });

  assert.equal(history.kind, "history");
  assert.equal(history.places[0]?.slug, "baghdad");
  assert.equal(original.people[0]?.slug, "editor");
  assert.equal(podcast.people[0]?.slug, "host");
  assert.match(podcast.searchText, /Guest/);
});

test("cross-content search uses words and resolved entity names", () => {
  const records = [
    record({
      id: "1",
      title: "A school opens",
      searchText: "A school opens Education Baghdad",
    }),
    record({
      id: "2",
      kind: "podcast",
      title: "Oral histories",
      searchText: "Oral histories Montréal diaspora",
    }),
  ];
  const state = parseArchiveSearchParams({ q: "montreal diaspora" });

  assert.deepEqual(
    filterArchiveRecords(records, state).map((item) => item.id),
    ["2"],
  );
});

test("facets are unique, sorted, and durable records stay separate from current", () => {
  const records = [
    record({
      id: "1",
      title: "One",
      topics: [{ name: "Zionism", slug: "zionism" }],
    }),
    record({
      id: "2",
      title: "Two",
      topics: [
        { name: "Diaspora", slug: "diaspora" },
        { name: "Zionism", slug: "zionism" },
      ],
    }),
    record({
      id: "3",
      title: "Three",
      kind: "news",
      durability: "current",
      href: "https://example.com",
      external: true,
    }),
  ];

  assert.deepEqual(
    collectArchiveFacets(
      records.filter((item) => item.durability === "durable"),
    ).topic,
    [
      { name: "Diaspora", slug: "diaspora" },
      { name: "Zionism", slug: "zionism" },
    ],
  );
  assert.deepEqual(
    filterArchiveRecords(records, parseArchiveSearchParams({})).map(
      (item) => item.id,
    ),
    ["1", "2"],
  );
  assert.deepEqual(
    filterArchiveRecords(
      records,
      parseArchiveSearchParams({ view: "current" }),
    ).map((item) => item.id),
    ["3"],
  );
});

test("pagination clamps pages and href helpers preserve filters", () => {
  const records = Array.from({ length: 25 }, (_, index) =>
    record({ id: String(index), title: `Record ${index}` }),
  );
  const page = paginateArchiveRecords(records, 99);

  assert.equal(page.page, 3);
  assert.equal(page.items.length, 1);
  assert.equal(
    archiveEntityHref("organization", "jewish-agency"),
    "/organizations/jewish-agency",
  );
  assert.equal(
    archiveSearchHref(
      {
        q: "school",
        view: "archive",
        topic: "education",
        sort: "newest",
      },
      { page: 2 },
    ),
    "/explore?q=school&topic=education&page=2",
  );
});

test("entity and Explore indexing gates remain conservative", () => {
  assert.equal(isArchiveEntityIndexable("A reviewed description.", 3), true);
  assert.equal(isArchiveEntityIndexable("", 10), false);
  assert.equal(isArchiveEntityIndexable("A reviewed description.", 2), false);

  const clean = parseArchiveSearchParams({});
  const filtered = parseArchiveSearchParams({ q: "identity" });
  assert.equal(clean.isBrowsing, false);
  assert.equal(filtered.isBrowsing, true);

  const metadata = buildPageMetadata({
    title: "Search",
    description: "Search the archive.",
    path: "/explore",
    index: false,
  });
  assert.deepEqual(metadata.alternates, { canonical: "/explore" });
  assert.deepEqual(metadata.robots, { index: false, follow: true });
});
