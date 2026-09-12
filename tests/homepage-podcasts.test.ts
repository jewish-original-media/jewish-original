import assert from "node:assert/strict";
import { test } from "node:test";

import { composeHomePodcasts } from "../src/features/homepage/podcasts";
import { buildPodcastHomeContract } from "../src/features/homepage/sections";
import type { PodcastEpisodeSummary } from "../src/content/podcasts/types";

test("unpublished Podcast shows keep the homepage in the prepared state", () => {
  const contract = buildPodcastHomeContract(null);

  assert.equal(contract.status, "preparing");
  assert.equal(contract.show, null);
  assert.deepEqual(contract.episodes, []);
});

test("a published show uses EpisodeCard data and invents no episodes", () => {
  const contract = buildPodcastHomeContract({
    _id: "podcastShow.ttjs",
    title: "The Two Tall Jews Show",
    slug: "the-two-tall-jews-show",
    description: "Official show description from Sanity.",
    hosts: [],
  });

  assert.equal(contract.status, "live");
  assert.equal(contract.show?.slug, "the-two-tall-jews-show");
  assert.deepEqual(contract.episodes, []);
});

test("homepage Podcasts use the latest published episode as the lead", () => {
  const latest = {
    _id: "episode.latest",
    title: "Sitting Down With: Kalman Gavriel, The Jerusalem Scribe",
    slug: "sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
    showSlug: "the-two-tall-jews-show",
    showTitle: "The Two Tall Jews Show",
    guestNames: ["Kalman Gavriel"],
  } as PodcastEpisodeSummary;
  const earlier = {
    ...latest,
    _id: "episode.earlier",
    title: "SEASON 3 FINALE - LOOKING AHEAD TO 2023",
    slug: "season-3-finale-looking-ahead-to-2023",
    guestNames: [],
  };
  const composed = composeHomePodcasts([latest, earlier]);

  assert.equal(composed.lead?._id, "episode.latest");
  assert.equal(composed.moreCount, 1);
  assert.deepEqual(
    composed.more.map((item) => item._id),
    ["episode.earlier"],
  );
});
