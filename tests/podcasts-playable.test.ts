import assert from "node:assert/strict";
import test from "node:test";

import { isPlayableAudioUrl } from "../src/lib/podcasts/playable-media";

test("accepts https enclosure audio and rejects store pages", () => {
  assert.equal(
    isPlayableAudioUrl(
      "https://d3ctxlq1ktw2nl.cloudfront.net/staging/2024-0-9/362807089-44100-2-ec933a9b1bc46.mp3",
    ),
    true,
  );
  assert.equal(
    isPlayableAudioUrl(
      "https://podcasts.apple.com/us/podcast/jewish-original-media/id1521741221",
    ),
    false,
  );
  assert.equal(
    isPlayableAudioUrl("https://open.spotify.com/show/4zOBjBbKwHzWrwtWKIGC5N"),
    false,
  );
  assert.equal(isPlayableAudioUrl("http://example.com/file.mp3"), false);
});
