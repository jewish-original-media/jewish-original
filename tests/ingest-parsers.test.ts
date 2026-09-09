import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isValidIanaTimeZone,
  nextRruleInstance,
  parseIcsEvents,
} from "../src/features/ingest/ics";
import { parseRssFeed } from "../src/features/ingest/rss";

describe("RSS parser", () => {
  it("reads RSS items without keeping publisher bodies", () => {
    const feed = parseRssFeed(`<?xml version="1.0"?>
      <rss><channel>
        <item>
          <title>A Jewish headline long enough</title>
          <link>https://www.jta.org/2026/09/09/story</link>
          <pubDate>Tue, 09 Sep 2026 12:00:00 GMT</pubDate>
          <description><![CDATA[Do not publish this excerpt.]]></description>
        </item>
      </channel></rss>`);
    assert.equal(feed.items.length, 1);
    assert.equal(feed.items[0]?.title, "A Jewish headline long enough");
    assert.equal(feed.items[0]?.link, "https://www.jta.org/2026/09/09/story");
    assert.match(feed.items[0]?.publishedAt || "", /2026/);
    assert.ok((feed.items[0]?.sourceText.length || 0) < 80);
  });

  it("reads Atom entries and survives broken CDATA", () => {
    const feed = parseRssFeed(`<feed>
      <entry>
        <title>Forward story about Jewish life today</title>
        <link href="https://forward.com/news/story" />
        <updated>2026-09-09T12:00:00Z</updated>
        <summary><![CDATA[Unclosed text</summary>
      </entry>
    </feed>`);
    assert.equal(feed.items[0]?.link, "https://forward.com/news/story");
  });
});

describe("ICS parser", () => {
  it("reads VEVENT fields and timezone", () => {
    const events = parseIcsEvents(`BEGIN:VCALENDAR
BEGIN:VEVENT
UID:huc-1
SUMMARY:Public lecture
DTSTART;TZID=America/New_York:20260921T190000
DTEND;TZID=America/New_York:20260921T203000
LOCATION:New York
URL:https://huc.edu/event/1
STATUS:CONFIRMED
DESCRIPTION:Do not reprint this long official blurb as JOM voice.
END:VEVENT
END:VCALENDAR`);
    assert.equal(events.length, 1);
    assert.equal(events[0]?.uid, "huc-1");
    assert.equal(events[0]?.timezone, "America/New_York");
    assert.equal(events[0]?.url, "https://huc.edu/event/1");
    assert.ok(events[0]?.startAt);
    assert.equal(isValidIanaTimeZone("America/New_York"), true);
    assert.equal(isValidIanaTimeZone("Not/AZone"), false);
  });

  it("returns the next RRULE instance only", () => {
    const events = parseIcsEvents(`BEGIN:VCALENDAR
BEGIN:VEVENT
UID:huc-2
SUMMARY:Weekly seminar
DTSTART:20260105T190000Z
RRULE:FREQ=WEEKLY;INTERVAL=1
URL:https://huc.edu/event/2
END:VEVENT
END:VCALENDAR`);
    const next = nextRruleInstance(
      events[0]!,
      new Date("2026-09-09T00:00:00.000Z"),
    );
    assert.ok(next);
    assert.ok(
      Date.parse(next.startAt) > Date.parse("2026-09-09T00:00:00.000Z"),
    );
  });
});
