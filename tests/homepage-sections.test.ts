import assert from "node:assert/strict";
import { test } from "node:test";

import {
  HISTORY_HOME_CONTRACT,
  HOME_SECTION_ORDER,
  LATER_DESKS,
  PODCASTS_HOME_CONTRACT,
} from "../src/features/homepage/sections";

test("homepage section order is masthead, today, history, podcasts, later desks", () => {
  assert.deepEqual(
    HOME_SECTION_ORDER.map((section) => section.id),
    ["masthead", "jewish-today", "history", "podcasts", "later-desks"],
  );
});

test("masthead, Jewish Today, and History are live modules", () => {
  assert.equal(HOME_SECTION_ORDER[0]?.status, "live");
  assert.equal(HOME_SECTION_ORDER[1]?.status, "live");
  assert.equal(HOME_SECTION_ORDER[2]?.status, "live");
  assert.equal(HOME_SECTION_ORDER[3]?.status, "preparing");
  assert.equal(HOME_SECTION_ORDER[4]?.status, "later-desk");
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

test("later desks stay named only", () => {
  assert.deepEqual(
    LATER_DESKS.map((desk) => desk.id),
    ["news", "events", "culture", "support"],
  );
  assert.ok(LATER_DESKS.every((desk) => desk.status === "later-desk"));
});
