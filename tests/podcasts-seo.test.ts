import assert from "node:assert/strict";
import test from "node:test";

import { pilotEpisodes, pilotShow } from "../src/content/podcasts/pilot";
import {
  buildPodcastEpisodeJsonLd,
  buildPodcastEpisodeMetadata,
  buildPodcastShowMetadata,
  podcastEpisodeUrl,
} from "../src/lib/seo/podcasts";

test("episode metadata uses the nested canonical URL and original title", () => {
  const episode = pilotEpisodes[0];
  assert.ok(episode);
  const metadata = buildPodcastEpisodeMetadata(episode);
  assert.equal(
    metadata.alternates?.canonical,
    "/podcasts/the-two-tall-jews-show/sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
  );
  assert.equal(metadata.title, episode.title);
  assert.equal(
    podcastEpisodeUrl(episode.showSlug, episode.slug),
    "https://jewishoriginal.com/podcasts/the-two-tall-jews-show/sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
  );
});

test("JSON-LD is a PodcastEpisode without a fabricated video object", () => {
  const episode = pilotEpisodes[0];
  assert.ok(episode);
  const jsonLd = buildPodcastEpisodeJsonLd(episode);
  assert.equal(jsonLd["@type"], "PodcastEpisode");
  assert.equal(jsonLd.name, episode.title);
  assert.equal(jsonLd.associatedMedia?.["@type"], "MediaObject");
  assert.equal("VideoObject" in (jsonLd.associatedMedia || {}), false);
});

test("show metadata keeps the editorial TTJS title", () => {
  const metadata = buildPodcastShowMetadata(pilotShow);
  assert.equal(metadata.title, "The Two Tall Jews Show");
  assert.equal(
    metadata.alternates?.canonical,
    "/podcasts/the-two-tall-jews-show",
  );
});
