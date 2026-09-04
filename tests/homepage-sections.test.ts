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

test("only Jewish Today and the masthead are live modules", () => {
  assert.equal(HOME_SECTION_ORDER[0]?.status, "live");
  assert.equal(HOME_SECTION_ORDER[1]?.status, "live");
  assert.equal(HOME_SECTION_ORDER[2]?.status, "pending-history-merge");
  assert.equal(HOME_SECTION_ORDER[3]?.status, "pending-podcasts-merge");
  assert.equal(HOME_SECTION_ORDER[4]?.status, "later-desk");
});

test("History contract names the three temporary adapters to replace", () => {
  assert.equal(HISTORY_HOME_CONTRACT.status, "pending-history-merge");
  assert.deepEqual(HISTORY_HOME_CONTRACT.replaceOnMerge, [
    "fetchOnThisDayHistory -> getOnThisDayHistory",
    'TodayHistoryCard -> HistoryEntryCard variant="archive"',
    "formatOnThisDayDate -> formatHistoricalDate",
  ]);
});

test("Podcasts contract names future inputs and invents no episodes", () => {
  assert.equal(PODCASTS_HOME_CONTRACT.status, "pending-podcasts-merge");
  assert.deepEqual(PODCASTS_HOME_CONTRACT.expectedInputs, [
    "featuredOrRecentEpisodes",
    "showMetadata",
    "episodeCards",
    "mediaLinks",
  ]);
});

test("later desks stay named only", () => {
  assert.deepEqual(
    LATER_DESKS.map((desk) => desk.id),
    ["news", "events", "culture", "support"],
  );
  assert.ok(LATER_DESKS.every((desk) => desk.status === "later-desk"));
});
