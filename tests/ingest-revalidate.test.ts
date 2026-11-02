import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  revalidateCalendarSurfaces,
  revalidateNewsSurfaces,
  type RevalidationAdapter,
} from "../src/features/ingest/revalidate";

function recorder() {
  const paths: string[] = [];
  const tags: string[] = [];
  const adapter: RevalidationAdapter = {
    path: (path) => paths.push(path),
    tag: (tag) => tags.push(tag),
  };
  return { adapter, paths, tags };
}

describe("ingest revalidation", () => {
  it("invalidates news surfaces only after a dataset change", () => {
    const unchanged = recorder();
    assert.equal(
      revalidateNewsSurfaces({ persisted: 0, purged: 0 }, unchanged.adapter),
      false,
    );
    assert.deepEqual(unchanged, {
      adapter: unchanged.adapter,
      paths: [],
      tags: [],
    });

    const changed = recorder();
    assert.equal(
      revalidateNewsSurfaces({ persisted: 1, purged: 0 }, changed.adapter),
      true,
    );
    assert.deepEqual(changed.tags, ["news"]);
    assert.deepEqual(changed.paths, ["/", "/news", "/today", "/explore"]);
  });

  it("invalidates the calendar tag and its two date surfaces", () => {
    const changed = recorder();
    revalidateCalendarSurfaces(changed.adapter);
    assert.deepEqual(changed.tags, ["jewish-today"]);
    assert.deepEqual(changed.paths, ["/", "/today"]);
  });
});
