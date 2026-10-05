import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { LIVING_ARCHIVE_OBJECTS } from "../src/content/media/living-archive";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Living Archive review collection", () => {
  it("keeps every object local, attributed, and linked to its source record", () => {
    assert.equal(LIVING_ARCHIVE_OBJECTS.length, 3);
    assert.equal(
      new Set(LIVING_ARCHIVE_OBJECTS.map((object) => object.id)).size,
      LIVING_ARCHIVE_OBJECTS.length,
    );

    for (const object of LIVING_ARCHIVE_OBJECTS) {
      assert.equal(object.rightsStatus, "noKnownRestrictions");
      assert.match(object.sourcePageUrl, /^https:\/\/www\.loc\.gov\//);
      assert.match(object.downloadUrl, /^https:\/\/cdn\.loc\.gov\//);
      assert.match(object.reproductionNumber, /^LC-/);
      assert.ok(object.alt.length > 30);
      assert.ok(object.creditLine.includes("Library of Congress"));
      assert.ok(object.editorialNote.length > 30);
      assert.equal(existsSync(join(root, "public", object.src.slice(1))), true);
    }
  });
});
