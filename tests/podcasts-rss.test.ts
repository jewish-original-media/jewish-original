import assert from "node:assert/strict";
import test from "node:test";

import {
  extractSourceChapters,
  htmlToPlainText,
  inferGuestNameFromTitle,
  parsePodcastRss,
  redactEmails,
  slugifyPodcastTitle,
} from "../src/lib/podcasts/rss";

const fixture = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title><![CDATA[Jewish Original Media]]></title>
    <description><![CDATA[A Jewish Original Media production.]]></description>
    <item>
      <title><![CDATA[Alexandra Zapruder on Holocaust Remembrance]]></title>
      <guid isPermaLink="false">0bfea698-4523-4a11-9b1b-b89f24422b88</guid>
      <pubDate>Mon, 09 May 2022 13:08:55 GMT</pubDate>
      <description><![CDATA[<p>Contact guest@example.com for rights.</p>]]></description>
      <enclosure url="https://example.com/a.mp3" type="audio/mpeg"/>
      <itunes:duration>00:36:01</itunes:duration>
      <itunes:season>3</itunes:season>
      <itunes:episode>46</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
    </item>
    <item>
      <title><![CDATA[SEASON 3 FINALE - LOOKING AHEAD TO 2023]]></title>
      <guid isPermaLink="false">89aba54c-5d52-4520-b129-3a7aa4da1c55</guid>
      <pubDate>Tue, 07 Feb 2023 22:43:52 GMT</pubDate>
      <description><![CDATA[<p>Hosts only.</p>]]></description>
      <enclosure url="https://example.com/b.m4a" type="audio/x-m4a"/>
      <itunes:duration>00:43:34</itunes:duration>
      <itunes:season>3</itunes:season>
      <itunes:episode>56</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
    </item>
  </channel>
</rss>`;

test("redacts emails and preserves surrounding copy", () => {
  const result = redactEmails("Write guest@example.com for more.");
  assert.equal(result.count, 1);
  assert.equal(result.text, "Write [redacted] for more.");
});

test("infers guests from titles and skips host-only finales", () => {
  assert.equal(
    inferGuestNameFromTitle(
      "Alexandra Zapruder on Holocaust Remembrance, Antisemitism and the Importance of Bearing Witness",
    ),
    "Alexandra Zapruder",
  );
  assert.equal(
    inferGuestNameFromTitle("Sitting Down With: Kalman Gavriel, The Jerusalem Scribe"),
    "Kalman Gavriel",
  );
  assert.equal(
    inferGuestNameFromTitle("SEASON 3 FINALE - LOOKING AHEAD TO 2023"),
    undefined,
  );
});

test("extracts only source-provided chapter timestamps", () => {
  const chapters = extractSourceChapters(
    "Intro- 00:00-02:00 Annexation Talk- 08:30-21:00",
  );
  assert.deepEqual(chapters, [
    { title: "Intro", start: "00:00" },
    { title: "Annexation Talk", start: "08:30" },
  ]);
});

test("parses the RSS fixture without inventing YouTube IDs", () => {
  const { show, episodes } = parsePodcastRss(fixture);
  assert.equal(show.sourceTitle, "Jewish Original Media");
  assert.equal(episodes.length, 2);
  assert.equal(episodes[0]?.sourceGuestNames[0], "Alexandra Zapruder");
  assert.equal(episodes[0]?.redactedEmailCount, 1);
  assert.equal(episodes[0]?.description.includes("guest@example.com"), false);
  assert.deepEqual(episodes[0]?.sourceYouTubeIds, []);
  assert.equal(episodes[1]?.sourceGuestNames.length, 0);
  assert.equal(
    slugifyPodcastTitle("Sitting Down With: Kalman Gavriel, The Jerusalem Scribe"),
    "sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
  );
  assert.equal(htmlToPlainText("<p>One<br>Two</p>").includes("One"), true);
});
