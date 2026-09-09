import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  findEventDuplicate,
  findNewsDuplicate,
} from "../src/features/ingest/dedupe";
import {
  isNewsFresh,
  isUpcomingEvent,
  newsExpiresAt,
  parsePublicationDate,
} from "../src/features/ingest/freshness";
import {
  canonicalizeUrl,
  hostAllowed,
  isIndexUrl,
} from "../src/features/ingest/url";

describe("URL canonicalization", () => {
  it("https-normalizes, strips www, tracking, and trailing slash", () => {
    const url = canonicalizeUrl(
      "http://www.jta.org/2026/09/09/story/?utm_source=x&fbclid=1",
    );
    assert.equal(url?.host, "jta.org");
    assert.equal(url?.normalized, "https://jta.org/2026/09/09/story");
  });

  it("rejects non-http URLs and index paths", () => {
    assert.equal(canonicalizeUrl("javascript:alert(1)"), null);
    const home = canonicalizeUrl("https://jta.org/");
    assert.equal(home && isIndexUrl(home), true);
    assert.equal(
      hostAllowed("www.jta.org".replace(/^www\./, ""), ["jta.org"]),
      true,
    );
  });
});

describe("freshness and expiration", () => {
  const now = new Date("2026-09-09T16:00:00.000Z");

  it("parses publication dates and applies desk windows", () => {
    assert.ok(parsePublicationDate("Tue, 09 Sep 2026 12:00:00 GMT"));
    assert.equal(parsePublicationDate("not-a-date"), null);
    assert.equal(
      isNewsFresh(new Date("2026-09-08T10:00:00.000Z"), "israel", now),
      true,
    );
    assert.equal(
      isNewsFresh(new Date("2026-09-01T10:00:00.000Z"), "israel", now),
      false,
    );
    assert.equal(
      isNewsFresh(new Date("2026-09-03T10:00:00.000Z"), "heritage", now),
      true,
    );
  });

  it("recedes news after 14 days instead of deleting", () => {
    const published = new Date("2026-09-09T00:00:00.000Z");
    assert.equal(
      newsExpiresAt(published).toISOString(),
      "2026-09-23T00:00:00.000Z",
    );
  });

  it("keeps events in their own upcoming window", () => {
    assert.equal(
      isUpcomingEvent(new Date("2026-09-21T19:00:00.000Z"), now),
      true,
    );
    assert.equal(
      isUpcomingEvent(new Date("2026-08-01T19:00:00.000Z"), now),
      false,
    );
  });
});

describe("dedupe", () => {
  const existing = [
    {
      sourceId: "jta",
      canonicalUrl: "https://jta.org/a",
      normalizedUrl: "https://jta.org/a",
      normalizedTitle: "israel cabinet meets tonight",
      sourcePublishedAt: "2026-09-09T12:00:00.000Z",
    },
  ];

  it("matches canonical, normalized, and same-source title", () => {
    assert.equal(
      findNewsDuplicate(
        { ...existing[0]!, canonicalUrl: "https://jta.org/a" },
        existing,
      )?.kind,
      "canonical-url",
    );
    assert.equal(
      findNewsDuplicate(
        {
          sourceId: "jta",
          canonicalUrl: "https://jta.org/b",
          normalizedUrl: "https://jta.org/a",
          normalizedTitle: "other",
        },
        existing,
      )?.kind,
      "normalized-url",
    );
    assert.equal(
      findNewsDuplicate(
        {
          sourceId: "jta",
          canonicalUrl: "https://jta.org/c",
          normalizedUrl: "https://jta.org/c",
          normalizedTitle: "Israel cabinet meets tonight!",
          sourcePublishedAt: "2026-09-09T13:00:00.000Z",
        },
        existing,
      )?.kind,
      "publisher-title",
    );
  });

  it("does not cluster across publishers", () => {
    assert.equal(
      findNewsDuplicate(
        {
          sourceId: "jns",
          canonicalUrl: "https://jns.org/a",
          normalizedUrl: "https://jns.org/a",
          normalizedTitle: "israel cabinet meets tonight",
          sourcePublishedAt: "2026-09-09T12:00:00.000Z",
        },
        existing,
      ),
      null,
    );
  });

  it("matches events by uid, url, or organizer+title+start", () => {
    const event = {
      sourceUid: "abc",
      canonicalUrl: "https://huc.edu/e1",
      organizer: "Hebrew Union College",
      title: "Lecture",
      startAt: "2026-09-21T19:00:00.000Z",
    };
    assert.equal(findEventDuplicate(event, [event])?.kind, "source-uid");
    assert.equal(
      findEventDuplicate({ ...event, sourceUid: "other" }, [event])?.kind,
      "canonical-url",
    );
    assert.equal(
      findEventDuplicate(
        {
          ...event,
          sourceUid: "other",
          canonicalUrl: "https://huc.edu/e2",
        },
        [event],
      )?.kind,
      "organizer-title-start",
    );
  });
});
