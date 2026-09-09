import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { JOM_MOTIF_NAMES, JomMotif } from "../src/components/brand/jom-motif";

test("JOM motifs are decorative line studies, not documentary images", () => {
  assert.deepEqual(JOM_MOTIF_NAMES, [
    "arch",
    "menorah",
    "seal",
    "manuscript",
    "masonry",
  ]);

  for (const name of JOM_MOTIF_NAMES) {
    const html = renderToStaticMarkup(createElement(JomMotif, { name }));
    assert.match(html, /aria-hidden="true"/);
    assert.match(html, /role="presentation"/);
    assert.match(html, new RegExp(`data-motif="${name}"`));
    assert.doesNotMatch(html, /<img/i);
  }
});
