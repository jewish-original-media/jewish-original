import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { authorizeCronRequest } from "../src/features/ingest/auth";

const original = {
  cron: process.env.CRON_SECRET,
  draft: process.env.DRAFT_MODE_SECRET,
  vercelEnv: process.env.VERCEL_ENV,
};

afterEach(() => {
  process.env.CRON_SECRET = original.cron;
  process.env.DRAFT_MODE_SECRET = original.draft;
  process.env.VERCEL_ENV = original.vercelEnv;
});

describe("cron authorization", () => {
  it("fails closed when no cron secret is configured", () => {
    delete process.env.CRON_SECRET;
    delete process.env.DRAFT_MODE_SECRET;
    delete process.env.VERCEL_ENV;
    const result = authorizeCronRequest(
      new Request("https://example.com/api/cron/news"),
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 503);
      assert.equal(result.error, "cron-unconfigured");
    }
  });

  it("rejects unauthenticated requests when a cron secret exists", () => {
    process.env.CRON_SECRET = "cron-test-secret";
    const result = authorizeCronRequest(
      new Request("https://example.com/api/cron/news"),
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "unauthorized");
  });

  it("accepts Preview draft-mode secret only on Preview", () => {
    process.env.CRON_SECRET = "cron-test-secret";
    process.env.DRAFT_MODE_SECRET = "draft-test-secret";
    process.env.VERCEL_ENV = "preview";
    const preview = authorizeCronRequest(
      new Request("https://example.com/api/cron/news", {
        headers: { authorization: "Bearer draft-test-secret" },
      }),
    );
    assert.equal(preview.ok, true);

    process.env.VERCEL_ENV = "production";
    const production = authorizeCronRequest(
      new Request("https://example.com/api/cron/news", {
        headers: { authorization: "Bearer draft-test-secret" },
      }),
    );
    assert.equal(production.ok, false);
  });
});
