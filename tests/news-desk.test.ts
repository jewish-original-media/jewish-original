import assert from "node:assert/strict";
import test from "node:test";

import {
  NEWS_INDEX_EMPTY,
  NEWS_INDEX_UNAVAILABLE,
  newsIndexState,
} from "../src/lib/news/display";
import {
  newsNavEligible,
  shouldShowHomepageNews,
} from "../src/features/ingest/select";

test("homepage News needs three fresh items; nav needs five items and three publishers", () => {
  assert.equal(shouldShowHomepageNews(0), false);
  assert.equal(shouldShowHomepageNews(2), false);
  assert.equal(shouldShowHomepageNews(3), true);
  assert.equal(
    newsNavEligible([{ publisher: "JTA" }, { publisher: "Jerusalem Post" }]),
    false,
  );
  assert.equal(
    newsNavEligible([
      { publisher: "JTA" },
      { publisher: "JTA" },
      { publisher: "Jerusalem Post" },
      { publisher: "Forward" },
      { publisher: "Times of Israel" },
    ]),
    true,
  );
});

test("empty News desk copy is reader-facing and distinct from a failed load", () => {
  assert.equal(newsIndexState(4), "ready");
  assert.equal(newsIndexState(0), "empty");
  assert.equal(newsIndexState(0, true), "unavailable");
  assert.equal(newsIndexState(4, true), "unavailable");
  assert.match(NEWS_INDEX_EMPTY, /Today/);
  assert.match(NEWS_INDEX_EMPTY, /History/);
  assert.doesNotMatch(NEWS_INDEX_EMPTY, /automation|gates|published News items yet/i);
  assert.match(NEWS_INDEX_UNAVAILABLE, /couldn't load/i);
  assert.doesNotMatch(NEWS_INDEX_UNAVAILABLE, /automation|gates/i);
});
