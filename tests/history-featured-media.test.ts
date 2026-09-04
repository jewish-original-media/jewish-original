import assert from "node:assert/strict";
import test from "node:test";

import {
  HistoryFeaturedMedia,
  HistoryMediaAbsent,
} from "../src/components/history/history-featured-media";
import {
  HistoryArtifact,
  HistoryContextualFact,
  HistoryTimelineMarker,
} from "../src/components/history/history-rhythm";

test("featured media renders nothing without a rights-cleared image", () => {
  assert.equal(HistoryFeaturedMedia({}), null);
  assert.equal(HistoryFeaturedMedia({ image: undefined }), null);
});

test("absent-media treatment is a section break, not an image frame", () => {
  const node = HistoryMediaAbsent();
  assert.equal(node.props["aria-hidden"], "true");
  assert.equal(node.props.className, "history-section-break");
});

test("rhythm components stay empty until they have real content", () => {
  assert.equal(HistoryContextualFact({}), null);
  assert.equal(HistoryTimelineMarker({}), null);
  assert.equal(HistoryArtifact({}), null);
  assert.equal(HistoryArtifact({ src: "/x.jpg" }), null);
});
