import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  auditOwnedBody,
  portableTextToPlainText,
} from "../src/lib/content/body-completeness";

function body(...paragraphs: string[]) {
  return paragraphs.map((text) => ({
    _type: "block",
    children: [{ text }],
  }));
}

describe("owned body completeness", () => {
  it("preserves paragraph boundaries when extracting Portable Text", () => {
    assert.equal(
      portableTextToPlainText(body("First paragraph.", "Second paragraph.")),
      "First paragraph.\n\nSecond paragraph.",
    );
  });

  it("flags a body that merely repeats its card excerpt", () => {
    const audit = auditOwnedBody({
      body: body("A short card excerpt."),
      excerpt: "A short card excerpt.",
    });

    assert.equal(audit.state, "excerptOnly");
  });

  it("recognizes a complete imported source despite whitespace differences", () => {
    const audit = auditOwnedBody({
      body: body("First paragraph.", "Second paragraph."),
      excerpt: "First paragraph.",
      sourceBody: "First paragraph.\r\n\r\nSecond paragraph.",
    });

    assert.equal(audit.state, "sourceEquivalent");
  });

  it("flags an editorial body that is materially shorter than its source", () => {
    const audit = auditOwnedBody({
      body: body("Only the beginning remains."),
      excerpt: "A separate excerpt.",
      sourceBody:
        "Only the beginning remains. The complete source continues with substantial additional context and detail.",
    });

    assert.equal(audit.state, "shorterThanSource");
  });
});
