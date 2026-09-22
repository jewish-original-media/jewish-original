import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { FOUNDER_PHOTOS } from "../src/content/media/public-assets";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("public founder photography", () => {
  it("keeps only class A photos on the public path with local files", () => {
    for (const photo of Object.values(FOUNDER_PHOTOS)) {
      assert.equal(photo.rightsClass, "A");
      assert.equal(photo.kind, "Photograph");
      assert.ok(photo.alt.length > 12);
      assert.ok(photo.src.startsWith("/media/founder/"));
      assert.equal(existsSync(join(root, "public", photo.src)), true);
    }
  });
});
