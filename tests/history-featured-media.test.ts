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

function findText(node: unknown, className: string): string | undefined {
  if (!node || typeof node !== "object") return undefined;
  const element = node as {
    props?: { className?: string; children?: unknown };
  };
  if (element.props?.className === className) {
    return typeof element.props.children === "string"
      ? element.props.children
      : undefined;
  }
  const children = element.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findText(child, className);
      if (found) return found;
    }
    return undefined;
  }
  return findText(children, className);
}

test("illustration media is labeled as illustration, not a photograph", () => {
  const node = HistoryFeaturedMedia({
    image: {
      alt: "Editorial drawing of a synagogue ark",
      visualKind: "illustration",
      creator: "Jewish Original",
      rightsStatus: "cleared",
      asset: {
        url: "/brand/motifs/otd-lion-white.png",
        width: 1024,
        height: 1024,
      },
    },
  });

  assert.equal(
    findText(node, "history-featured-media__kind"),
    "Original illustration",
  );
});

test("rhythm components stay empty until they have real content", () => {
  assert.equal(HistoryContextualFact({}), null);
  assert.equal(HistoryTimelineMarker({}), null);
  assert.equal(HistoryArtifact({}), null);
  assert.equal(HistoryArtifact({ src: "/x.jpg" }), null);
});
