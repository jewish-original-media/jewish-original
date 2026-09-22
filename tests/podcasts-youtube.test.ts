import assert from "node:assert/strict";
import test from "node:test";

import {
  parseYouTubeId,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from "../src/lib/podcasts/youtube";

test("parses watch, short, and embed YouTube URLs", () => {
  assert.equal(
    parseYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    "dQw4w9WgXcQ",
  );
  assert.equal(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(
    parseYouTubeId("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
    "dQw4w9WgXcQ",
  );
});

test("rejects guest channel URLs and invented identifiers", () => {
  assert.equal(
    parseYouTubeId("https://www.youtube.com/channel/UCKu_IMpM3s9D2xQm7IxpZYw"),
    undefined,
  );
  assert.equal(parseYouTubeId("not-a-video"), undefined);
});

test("builds privacy-friendly embed URLs", () => {
  assert.equal(
    youtubeEmbedUrl("dQw4w9WgXcQ"),
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
  );
  assert.equal(
    youtubeWatchUrl("dQw4w9WgXcQ"),
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  );
});
