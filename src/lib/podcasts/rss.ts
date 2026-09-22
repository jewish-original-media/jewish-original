import { createHash } from "node:crypto";

import { parseDurationToSeconds } from "./format";
import { TTJS_SHOW_SLUG } from "./urls";
import { parseYouTubeId } from "./youtube";

export { TTJS_SHOW_SLUG };

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const GUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export const PODCAST_RSS_FEED_URL = "https://anchor.fm/s/29786d14/podcast/rss";
export const PODCAST_IMPORTER_VERSION = "1.2.0";
export const TTJS_SOURCE_SHOW_TITLE = "Jewish Original Media";
export const TTJS_EDITORIAL_SHOW_TITLE = "The Two Tall Jews Show";

export type PodcastRssShow = {
  sourceTitle: string;
  description: string;
  link?: string;
  language?: string;
  author?: string;
  imageUrl?: string;
  rssUrl: string;
  lastBuildDate?: string;
};

export type PodcastRssChapter = {
  title: string;
  start: string;
};

export type PodcastRssEpisode = {
  guid: string;
  title: string;
  slug: string;
  publishedAt: string;
  descriptionHtml: string;
  description: string;
  excerpt?: string;
  audioUrl?: string;
  audioType?: string;
  duration?: string;
  durationSeconds?: number;
  season?: number;
  episodeNumber?: number;
  episodeType?: string;
  artworkUrl?: string;
  sourceUrl?: string;
  sourceGuestNames: string[];
  sourceYouTubeIds: string[];
  chapters: PodcastRssChapter[];
  redactedEmailCount: number;
  flags: PodcastImportFlag[];
};

export type PodcastImportFlag = {
  code: string;
  field: string;
  severity: "info" | "warning" | "blocking";
  evidence: string;
};

function firstTag(block: string, tag: string) {
  const match = block.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"),
  );
  return decodeRssText(match?.[1] ?? "");
}

function attribute(block: string, tag: string, name: string) {
  const match = block.match(
    new RegExp(`<${tag}[^>]*\\s${name}="([^"]+)"[^>]*\\/?>`, "i"),
  );
  return match?.[1];
}

function decodeRssText(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function htmlToPlainText(value: string) {
  return decodeRssText(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function redactEmails(value: string) {
  const matches = value.match(EMAIL_PATTERN) || [];
  return {
    text: value.replace(EMAIL_PATTERN, "[redacted]"),
    count: matches.length,
  };
}

export function slugifyPodcastTitle(title: string) {
  const slug = title
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return slug || "episode";
}

export function podcastDocumentId(guid: string) {
  const safe = GUID_PATTERN.test(guid)
    ? guid.toLowerCase()
    : createHash("sha256").update(guid).digest("hex").slice(0, 32);
  return `podcastEpisode.${safe}`;
}

export function showDocumentId(slug: string) {
  return `podcastShow.${slug}`;
}

const CHAPTER_PATTERN =
  /([A-Za-z][^:]{1,120}?)\s*[-–—]\s*(\d{1,2}:\d{2}(?::\d{2})?)(?:\s*[-–—]\s*\d{1,2}:\d{2}(?::\d{2})?)?/g;

export function extractSourceChapters(description: string) {
  const chapters: PodcastRssChapter[] = [];
  for (const match of description.matchAll(CHAPTER_PATTERN)) {
    const title = match[1]?.replace(/^~+\s*/, "").trim();
    const start = match[2];
    if (!title || !start || title.length > 160) continue;
    if (/https?:\/\//i.test(title)) continue;
    chapters.push({ title, start });
  }
  return chapters;
}

const GUEST_TITLE_PATTERN = /^(?:sitting down with:\s*)?(.+?)\s+on\s+/i;

export function inferGuestNameFromTitle(title: string) {
  if (
    /^(season|premier|intro|feed drop|high holidays|yom kippur|pesach|purim|channukah|lag ba)/i.test(
      title,
    )
  ) {
    return undefined;
  }
  const sitting = title.match(/^sitting down with:\s*(.+?)(?:,|$)/i);
  if (sitting?.[1]) return sitting[1].replace(/\s+/g, " ").trim();
  const match = title.match(GUEST_TITLE_PATTERN);
  const name = match?.[1]?.replace(/\s+/g, " ").trim();
  if (!name || name.length < 4 || name.length > 80) return undefined;
  if (/we |our |the two tall/i.test(name)) return undefined;
  return name;
}

function numberValue(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function collectYouTubeIds(html: string) {
  const ids = new Set<string>();
  const matches = html.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  for (const url of matches) {
    const id = parseYouTubeId(url);
    if (id) ids.add(id);
  }
  return [...ids];
}

function episodeFlags(
  episode: Omit<PodcastRssEpisode, "flags">,
): PodcastImportFlag[] {
  const flags: PodcastImportFlag[] = [];
  if (!episode.guid) {
    flags.push({
      code: "missing-guid",
      field: "guid",
      severity: "blocking",
      evidence:
        "The RSS item has no guid, so an idempotent import key cannot be created.",
    });
  }
  if (!episode.audioUrl) {
    flags.push({
      code: "missing-audio",
      field: "audioUrl",
      severity: "warning",
      evidence: "No enclosure audio URL was present on this item.",
    });
  }
  if (episode.season !== undefined && episode.season > 20) {
    flags.push({
      code: "implausible-season",
      field: "season",
      severity: "warning",
      evidence: `Season ${episode.season} is outside the known show range and was preserved as source metadata only.`,
    });
  }
  if (episode.episodeNumber === undefined) {
    flags.push({
      code: "missing-episode-number",
      field: "episodeNumber",
      severity: "info",
      evidence: "itunes:episode was empty or unusable.",
    });
  }
  if (episode.sourceYouTubeIds.length) {
    flags.push({
      code: "youtube-in-description",
      field: "description",
      severity: "warning",
      evidence:
        "YouTube URLs appear in the description. They are treated as related links, not as the episode video, until an editor confirms a TTJS watch URL.",
    });
  }
  if (episode.redactedEmailCount) {
    flags.push({
      code: "pii-redacted",
      field: "description",
      severity: "warning",
      evidence: `${episode.redactedEmailCount} email address(es) were removed from the public description.`,
    });
  }
  if (episode.episodeType === "trailer") {
    flags.push({
      code: "trailer",
      field: "episodeType",
      severity: "info",
      evidence: "This item is marked as a trailer in the source feed.",
    });
  }
  return flags;
}

export function parsePodcastRss(xml: string, rssUrl = PODCAST_RSS_FEED_URL) {
  const channel = xml.match(/<channel>([\s\S]*?)<item>/i)?.[1] || "";
  const rawDescription = firstTag(channel, "description");
  const redactedShow = redactEmails(htmlToPlainText(rawDescription));
  const show: PodcastRssShow = {
    sourceTitle: firstTag(channel, "title") || TTJS_SOURCE_SHOW_TITLE,
    description: redactedShow.text,
    link: firstTag(channel, "link"),
    language: firstTag(channel, "language"),
    author: firstTag(channel, "author") || firstTag(channel, "itunes:author"),
    imageUrl: attribute(channel, "itunes:image", "href"),
    rssUrl,
    lastBuildDate: firstTag(channel, "lastBuildDate"),
  };

  const usedSlugs = new Map<string, number>();
  const episodes = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].flatMap(
    (match) => {
      const block = match[1];
      if (!block) return [];
      const title = firstTag(block, "title");
      const descriptionHtml = firstTag(block, "description");
      const redacted = redactEmails(htmlToPlainText(descriptionHtml));
      const guest = inferGuestNameFromTitle(title);
      let slug = slugifyPodcastTitle(title);
      const seen = usedSlugs.get(slug) || 0;
      usedSlugs.set(slug, seen + 1);
      if (seen > 0) slug = `${slug}-${seen + 1}`.slice(0, 96);

      const season = numberValue(firstTag(block, "itunes:season"));
      const episodeNumber = numberValue(firstTag(block, "itunes:episode"));
      const duration = firstTag(block, "itunes:duration") || undefined;
      const episode: Omit<PodcastRssEpisode, "flags"> = {
        guid: firstTag(block, "guid"),
        title,
        slug,
        publishedAt: new Date(firstTag(block, "pubDate")).toISOString(),
        descriptionHtml,
        description: redacted.text,
        excerpt: excerptFromPlainText(redacted.text),
        audioUrl: attribute(block, "enclosure", "url"),
        audioType: attribute(block, "enclosure", "type"),
        duration,
        durationSeconds: parseDurationToSeconds(duration),
        season,
        episodeNumber,
        episodeType: firstTag(block, "itunes:episodeType") || undefined,
        artworkUrl: attribute(block, "itunes:image", "href"),
        sourceUrl: firstTag(block, "link") || undefined,
        sourceGuestNames: guest ? [guest] : [],
        sourceYouTubeIds: collectYouTubeIds(descriptionHtml),
        chapters: extractSourceChapters(redacted.text),
        redactedEmailCount: redacted.count,
      };
      return { ...episode, flags: episodeFlags(episode) };
    },
  );

  return { show, episodes };
}

function excerptFromPlainText(description: string) {
  const compact = description.replace(/\s+/g, " ").trim();
  if (!compact) return undefined;
  if (compact.length <= 220) return compact;
  const sentence = compact.match(/(.+?[.!?])(\s|$)/)?.[1];
  if (sentence && sentence.length <= 220) return sentence;
  return `${compact.slice(0, 219).trimEnd()}…`;
}

export function findDuplicateGuids(episodes: PodcastRssEpisode[]) {
  const seen = new Map<string, string[]>();
  for (const episode of episodes) {
    const titles = seen.get(episode.guid) || [];
    titles.push(episode.title);
    seen.set(episode.guid, titles);
  }
  return [...seen.entries()]
    .filter(([, titles]) => titles.length > 1)
    .map(([guid, titles]) => ({ guid, titles }));
}
