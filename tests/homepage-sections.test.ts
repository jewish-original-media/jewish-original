import assert from "node:assert/strict";
import { test } from "node:test";

import {
  HIDDEN_HOME_MODULES,
  HISTORY_HOME_CONTRACT,
  HOME_INTENDED_ORDER_WHEN_POPULATED,
  HOME_SECTION_ORDER,
  PODCASTS_HOME_CONTRACT,
  resolveHomeSectionOrder,
} from "../src/features/homepage/sections";

test("homepage section order is masthead, today, history, manifesto, podcasts, support", () => {
  assert.deepEqual(
    HOME_SECTION_ORDER.map((section) => section.id),
    ["masthead", "jewish-today", "history", "manifesto", "podcasts", "support"],
  );
});

test("live homepage modules do not invent later desks", () => {
  assert.ok(HOME_SECTION_ORDER.every((section) => section.status === "live"));
  assert.equal(HOME_SECTION_ORDER.length, 6);
});

test("History homepage contract uses published archive entries", () => {
  assert.equal(HISTORY_HOME_CONTRACT.status, "live");
  assert.deepEqual(HISTORY_HOME_CONTRACT.entries, []);
});

test("Podcasts contract starts empty and invents no episodes", () => {
  assert.equal(PODCASTS_HOME_CONTRACT.status, "preparing");
  assert.equal(PODCASTS_HOME_CONTRACT.show, null);
  assert.deepEqual(PODCASTS_HOME_CONTRACT.episodes, []);
});

test("Originals, News, and Events stay hidden until published documents exist", () => {
  assert.deepEqual(
    HIDDEN_HOME_MODULES.map((module) => module.id),
    ["originals", "news", "events"],
  );
  assert.ok(HIDDEN_HOME_MODULES.every((module) => module.status === "hidden"));
  assert.deepEqual(resolveHomeSectionOrder({ newsCount: 0, eventCount: 0 }), [
    "masthead",
    "jewish-today",
    "history",
    "manifesto",
    "podcasts",
    "support",
  ]);
  assert.deepEqual(resolveHomeSectionOrder({ newsCount: 2, eventCount: 1 }), [
    "masthead",
    "jewish-today",
    "history",
    "manifesto",
    "podcasts",
    "support",
  ]);
});

test("populated Originals, News, and Events insert in journal order", () => {
  assert.deepEqual(
    [...HOME_INTENDED_ORDER_WHEN_POPULATED],
    [
      "masthead",
      "jewish-today",
      "history",
      "originals",
      "news",
      "podcasts",
      "events",
      "manifesto",
      "support",
    ],
  );
  assert.deepEqual(resolveHomeSectionOrder({ newsCount: 3, eventCount: 3 }), [
    "masthead",
    "jewish-today",
    "history",
    "news",
    "podcasts",
    "events",
    "manifesto",
    "support",
  ]);
  assert.deepEqual(
    resolveHomeSectionOrder({
      originalsCount: 2,
      newsCount: 3,
      eventCount: 0,
    }),
    [
      "masthead",
      "jewish-today",
      "history",
      "originals",
      "news",
      "podcasts",
      "manifesto",
      "support",
    ],
  );
});
