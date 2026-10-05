import assert from "node:assert/strict";
import test from "node:test";

import {
  eventsNavEligible,
  newsNavEligible,
} from "../src/features/ingest/select";
import {
  resolveFooterExplore,
  resolvePrimaryNavigation,
  selectHistoryMenuFacets,
  siteSocial,
} from "../src/lib/site";

test("primary nav keeps Explore secondary and adds Originals only when live", () => {
  const baseline = resolvePrimaryNavigation();
  assert.ok(
    baseline.every(
      (item) => typeof item.href === "string" && typeof item.label === "string",
    ),
    "desktop and mobile navigation must share the resolved gated items",
  );
  assert.deepEqual(
    baseline.map((item) => item.href),
    ["/today", "/history", "/podcasts", "/about", "/support"],
  );
  assert.equal(
    baseline.some((item) => item.href === "/explore"),
    false,
  );
  assert.equal(
    baseline
      .find((item) => item.href === "/history")
      ?.children?.some(
        (child) =>
          child.href === "/explore" && child.label === "Search the archive",
      ),
    true,
  );
  assert.equal(
    baseline
      .find((item) => item.href === "/about")
      ?.children?.some(
        (child) => child.href === siteSocial[0].href && child.external,
      ),
    true,
  );
  assert.equal(
    baseline.find((item) => item.href === "/support")?.emphasis,
    true,
  );
  assert.deepEqual(
    resolvePrimaryNavigation({ originalsLive: true }).map((item) => item.href),
    ["/today", "/history", "/originals", "/podcasts", "/about", "/support"],
  );
});

test("History submenu uses the busiest real topics, places, and eras", () => {
  const facets = selectHistoryMenuFacets(
    [
      {
        topics: [
          { name: "Zionism", slug: "zionism" },
          { name: "Zionism", slug: "zionism" },
        ],
        places: [{ name: "Jerusalem", slug: "jerusalem" }],
        eras: [{ name: "Antiquity", slug: "antiquity" }],
      },
      {
        topics: [{ name: "Zionism", slug: "zionism" }],
        places: [
          { name: "Jerusalem", slug: "jerusalem" },
          { name: "Warsaw", slug: "warsaw" },
        ],
        eras: [{ name: "Antiquity", slug: "antiquity" }],
      },
    ].flatMap((entry) => [entry, entry]),
  );
  assert.ok(facets.length <= 6);
  assert.equal(facets[0]?.slug, "zionism");
  assert.ok(facets.some((facet) => facet.type === "place"));
  assert.ok(facets.some((facet) => facet.type === "era"));
  const history = resolvePrimaryNavigation({
    historyFacets: facets,
    onThisDayHref: "/history?month=10&day=5",
    originalEssays: [{ title: "Our Path Forward", slug: "our-path-forward" }],
    originalsLive: true,
  }).find((item) => item.href === "/history");
  assert.equal(
    history?.children?.some(
      (child) => child.href === "/history?month=10&day=5",
    ),
    true,
  );
  assert.equal(
    history?.children?.some((child) => child.href === "/history?topic=zionism"),
    true,
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
