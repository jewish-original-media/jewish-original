import assert from "node:assert/strict";
import test from "node:test";

import { PILOT_PLATFORM_MAPPINGS } from "../src/content/podcasts/pilot-platforms";
import {
  canonicalizeAppleEpisodeUrl,
  parseAppleEpisodeId,
  parseOpenSpotifyEpisodeId,
  parseSpotifyEpisodeCode,
} from "../src/lib/podcasts/platforms";
import { resolvePrimaryMedia } from "../src/lib/podcasts/primary-media";

test("canonicalizes verified Apple episode URLs from the iTunes lookup", () => {
  assert.equal(
    parseAppleEpisodeId(
      "https://podcasts.apple.com/us/podcast/sitting-down-with-kalman-gavriel-the-jerusalem-scribe/id1521741221?i=1000641079552&uo=4",
    ),
    "1000641079552",
  );
  assert.equal(
    canonicalizeAppleEpisodeUrl(
      "https://podcasts.apple.com/us/podcast/sitting-down-with-kalman-gavriel-the-jerusalem-scribe/id1521741221?i=1000641079552&uo=4",
    ),
    "https://podcasts.apple.com/us/podcast/sitting-down-with-kalman-gavriel-the-jerusalem-scribe/id1521741221?i=1000641079552",
  );
});

test("parses official Spotify for Podcasters episode codes and rejects guessed open.spotify IDs", () => {
  assert.equal(
    parseSpotifyEpisodeCode(
      "https://podcasters.spotify.com/pod/show/jewishoriginalmedia/episodes/Sitting-Down-With-Kalman-Gavriel--The-Jerusalem-Scribe-e2e7kch",
    ),
    "e2e7kch",
  );
  assert.equal(
    parseOpenSpotifyEpisodeId(
      "https://open.spotify.com/show/4zOBjBbKwHzWrwtWKIGC5N",
    ),
    undefined,
  );
});

test("keeps YouTube primary only when a verified ID exists", () => {
  assert.equal(
    resolvePrimaryMedia({
      youtubeId: "abcdefghijk",
      audioUrl: "https://example.com/a.mp3",
    }),
    "youtube",
  );
  assert.equal(
    resolvePrimaryMedia({
      audioUrl: "https://example.com/a.mp3",
    }),
    "audio",
  );
  assert.equal(
    resolvePrimaryMedia({
      primaryMedia: "youtube",
      audioUrl: "https://example.com/a.mp3",
    }),
    "audio",
  );
});

test("pilot mappings do not invent official YouTube videos", () => {
  for (const mapping of Object.values(PILOT_PLATFORM_MAPPINGS)) {
    assert.equal(mapping.youtube, undefined);
    assert.ok(mapping.apple?.verified);
    assert.ok(mapping.spotify?.verified);
    assert.ok(mapping.unresolved.some((item) => item.includes("YouTube")));
  }
});
