import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { newsDocumentId } from "../src/features/ingest/ids";
import {
  buildApprovedSourceDocuments,
  buildCuratedNewsDocument,
  buildEventDocument,
  buildNewsExceptionDocument,
} from "../src/features/ingest/documents";
import { isTransientIngestReason } from "../src/features/ingest/persist";
import {
  contextLooksGeneric,
  newsNavEligible,
  selectFirstNewsBatch,
  shouldShowHomepageEvents,
  shouldShowHomepageNews,
} from "../src/features/ingest/select";
import {
  assertIngestWriteDocument,
  FORBIDDEN_WRITE_TYPES,
} from "../src/features/ingest/write-scope";
import type { NewsDecision } from "../src/features/ingest/news/pipeline";

const candidate = {
  sourceId: "jta",
  publisher: "JTA",
  headline: "Diaspora communities mark the new year",
  canonicalUrl: "https://www.jta.org/2026/09/10/story",
  normalizedUrl: "https://www.jta.org/2026/09/10/story",
  sourcePublishedAt: "2026-09-10T12:00:00.000Z",
  desk: "jewish-world",
  jomContext:
    "JTA reports that diaspora communities are marking the new year with public gatherings.",
  topics: ["diaspora"],
  expiresAt: "2026-09-24T12:00:00.000Z",
  relevance: 0.9,
  deskConfidence: 0.84,
  model: "openai/gpt-4.1-nano",
};

function publishDecision(
  overrides: Partial<NewsDecision["candidate"]> &
    Pick<NewsDecision, "headline" | "sourceId"> & { url: string },
): NewsDecision {
  return {
    action: "publish",
    reason: "gates-passed",
    sourceId: overrides.sourceId,
    headline: overrides.headline,
    url: overrides.url,
    candidate: {
      ...candidate,
      ...overrides,
      canonicalUrl: overrides.url,
      normalizedUrl: overrides.url,
    },
  };
}

describe("ingest write scope", () => {
  it("allows only News and Event ingest documents", () => {
    const news = buildCuratedNewsDocument(candidate, "run-1");
    assert.doesNotThrow(() => assertIngestWriteDocument(news));
    assert.equal(news._id, newsDocumentId("jta", candidate.canonicalUrl));
    assert.equal("body" in news, false);
    assert.equal("excerpt" in news, false);
    assert.equal("image" in news, false);

    assert.throws(() =>
      assertIngestWriteDocument({
        _id: "historyEntry.jom-test",
        _type: "historyEntry",
        title: "no",
      }),
    );
    for (const type of FORBIDDEN_WRITE_TYPES) {
      assert.throws(() =>
        assertIngestWriteDocument({
          _id: `${type}.forbidden`,
          _type: type,
        }),
      );
    }
  });

  it("seeds only the approved source registry", () => {
    const sources = buildApprovedSourceDocuments();
    assert.equal(sources.length, 11);
    assert.ok(sources.every((source) => source._type === "ingestSource"));
    assert.ok(sources.some((source) => source._id === "ingestSource.news.jta"));
    assert.ok(
      sources.some((source) => source._id === "ingestSource.events.huc"),
    );
    assert.equal(
      sources.some((source) =>
        String(source.name).toLowerCase().includes("haaretz"),
      ),
      false,
    );
  });

  it("keeps exceptions unpublished", () => {
    const exception = buildNewsExceptionDocument({
      sourceId: "jta",
      headline: "Developing",
      url: "https://www.jta.org/2026/09/10/x",
      reason: "sensitive",
    });
    assert.equal(exception.status, "open");
    assert.equal(exception._type, "ingestException");
  });

  it("builds idempotent News and Event ids", () => {
    const first = buildCuratedNewsDocument(candidate, "run-1");
    const second = buildCuratedNewsDocument(candidate, "run-2");
    assert.equal(first._id, second._id);
    const event = buildEventDocument(
      {
        sourceId: "huc",
        title: "Public lecture",
        organizer: "Hebrew Union College",
        eventUrl: "https://huc.edu/event/1",
        sourceUid: "huc-1",
        startAt: "2026-09-21T23:00:00.000Z",
        endAt: null,
        timezone: "America/New_York",
        attendanceMode: "in-person",
        venueName: "New York",
        geoBucket: "united-states",
        jomContext: "HUC is hosting a public lecture on Jewish law.",
        expiresAt: "2026-09-22T23:00:00.000Z",
      },
      "run-1",
    );
    assert.equal(event._id, "event.huc." + event._id.split(".").pop());
    assert.doesNotThrow(() => assertIngestWriteDocument(event));
  });
});

describe("first-publish selection", () => {
  it("rejects generic context and caps publishers", () => {
    assert.equal(
      contextLooksGeneric("This article discusses a vote in Israel."),
      true,
    );
    assert.equal(
      contextLooksGeneric(
        "This event highlights the intersection of technology and heritage, according to reports.",
      ),
      true,
    );
    const selected = selectFirstNewsBatch([
      publishDecision({
        sourceId: "jns",
        publisher: "JNS",
        headline: "One",
        url: "https://www.jns.org/one",
        jomContext: "This article discusses a cabinet meeting in Jerusalem.",
      }),
      publishDecision({
        sourceId: "jta",
        publisher: "JTA",
        headline: "Two",
        url: "https://www.jta.org/two",
        desk: "jewish-world",
      }),
      publishDecision({
        sourceId: "jta",
        publisher: "JTA",
        headline: "Three",
        url: "https://www.jta.org/three",
        desk: "israel",
      }),
      publishDecision({
        sourceId: "jta",
        publisher: "JTA",
        headline: "Four",
        url: "https://www.jta.org/four",
        desk: "culture",
      }),
      publishDecision({
        sourceId: "forward",
        publisher: "Forward",
        headline: "Five",
        url: "https://forward.com/five",
        desk: "culture",
      }),
    ]);
    assert.equal(
      selected.some((item) => item.publisher === "JNS"),
      false,
    );
    assert.ok(selected.length <= 10);
    assert.ok(selected.filter((item) => item.publisher === "JTA").length <= 2);
  });

  it("does not persist transient gateway exceptions", () => {
    assert.equal(isTransientIngestReason("gateway-429"), true);
    assert.equal(isTransientIngestReason("low-confidence"), false);
    assert.equal(isTransientIngestReason("ambiguous-attendance"), false);
  });

  it("gates homepage and nav from real inventory", () => {
    assert.equal(shouldShowHomepageNews(2), false);
    assert.equal(shouldShowHomepageNews(3), true);
    assert.equal(
      shouldShowHomepageEvents([
        { organizer: "Hebrew Union College", geoBucket: "united-states" },
        { organizer: "Hebrew Union College", geoBucket: "united-states" },
      ]),
      false,
    );
    assert.equal(
      newsNavEligible([
        { publisher: "JTA" },
        { publisher: "JTA" },
        { publisher: "Forward" },
      ]),
      false,
    );
    assert.equal(
      newsNavEligible([
        { publisher: "JTA" },
        { publisher: "Forward" },
        { publisher: "Times of Israel" },
        { publisher: "JNS" },
        { publisher: "Biblical Archaeology Society" },
      ]),
      true,
    );
  });
});
