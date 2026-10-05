import assert from "node:assert/strict";
import test from "node:test";

import { newsNavEligible } from "../src/features/ingest/select";
import {
  resolveFooterExplore,
  resolvePrimaryNavigation,
} from "../src/lib/site";

test("primary nav adds Originals only when the journal is live", () => {
  const baseline = resolvePrimaryNavigation();
  assert.ok(
    baseline.every(
      (item) => typeof item.href === "string" && typeof item.label === "string",
    ),
    "desktop and mobile navigation must share the resolved gated items",
  );
  assert.deepEqual(
    baseline.map((item) => item.href),
    [
      "/today",
      "/explore",
      "/history",
      "/podcasts",
      "/events",
      "/about",
      "/support",
    ],
  );
  assert.deepEqual(
    resolvePrimaryNavigation({ originalsLive: true }).map((item) => item.href),
    [
      "/today",
      "/explore",
      "/history",
      "/originals",
      "/podcasts",
      "/events",
      "/about",
      "/support",
    ],
  );
});

test("News enters primary nav only at five items and three publishers", () => {
  assert.equal(newsNavEligible([{ publisher: "JTA" }]), false);
  assert.equal(
    newsNavEligible([
      { publisher: "JTA" },
      { publisher: "JTA" },
      { publisher: "Jerusalem Post" },
      { publisher: "Jerusalem Post" },
    ]),
    false,
  );
  assert.deepEqual(
    resolvePrimaryNavigation({
      originalsLive: true,
      newsLive: true,
    }).map((item) => item.label),
    [
      "Today",
      "Explore",
      "History",
      "Originals",
      "Podcasts",
      "News",
      "Events",
      "About",
      "Support",
    ],
  );
});

test("footer Explore adds Originals when the journal is live and keeps News", () => {
  assert.equal(
    resolveFooterExplore().some((item) => item.href === "/originals"),
    false,
  );
  const explore = resolveFooterExplore({ originalsLive: true });
  assert.deepEqual(
    explore.map((item) => item.href),
    [
      "/explore",
      "/today",
      "/history",
      "/originals",
      "/podcasts",
      "/news",
      "/events",
      "/about",
      "/support",
    ],
  );
});
