import assert from "node:assert/strict";
import test from "node:test";

import {
  eventsNavEligible,
  newsNavEligible,
} from "../src/features/ingest/select";
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
    ["/today", "/explore", "/history", "/podcasts", "/about", "/support"],
  );
  assert.deepEqual(
    resolvePrimaryNavigation({ originalsLive: true }).map((item) => item.href),
    [
      "/today",
      "/explore",
      "/history",
      "/originals",
      "/podcasts",
      "/about",
      "/support",
    ],
  );
});

test("News enters the Today submenu only at five items and three publishers", () => {
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
  const navigation = resolvePrimaryNavigation({
    originalsLive: true,
    newsLive: true,
  });
  assert.equal(
    navigation.some((item) => item.href === "/news"),
    false,
  );
  assert.equal(
    navigation
      .find((item) => item.href === "/today")
      ?.children?.some((item) => item.href === "/news"),
    true,
  );
});

test("Events uses the same diversity gate in the Today submenu", () => {
  const thin = [
    { organizer: "One", geoBucket: "New York" },
    { organizer: "One", geoBucket: "New York" },
  ];
  const ready = [
    { organizer: "One", geoBucket: "New York" },
    { organizer: "Two", geoBucket: "Online" },
  ];
  assert.equal(eventsNavEligible(thin), false);
  assert.equal(eventsNavEligible(ready), true);
  const today = resolvePrimaryNavigation({ eventsLive: true }).find(
    (item) => item.href === "/today",
  );
  assert.equal(
    today?.children?.some((item) => item.href === "/events"),
    true,
  );
});

test("footer Explore adds Originals when the journal is live and keeps News", () => {
  assert.equal(
    resolveFooterExplore().some((item) => item.href === "/originals"),
    false,
  );
  assert.equal(
    resolveFooterExplore().some((item) => item.href === "/events"),
    false,
  );
  const explore = resolveFooterExplore({
    originalsLive: true,
    eventsLive: true,
  });
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
