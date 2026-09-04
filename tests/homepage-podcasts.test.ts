import assert from "node:assert/strict";
import { test } from "node:test";

import { buildPodcastHomeContract } from "../src/features/homepage/sections";

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
