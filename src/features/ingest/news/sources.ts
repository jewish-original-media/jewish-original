import type { NewsDesk } from "../config";

export type NewsSourceDefinition = {
  id: string;
  name: string;
  attributionLabel: string;
  canonicalSite: string;
  feedUrl: string;
  hosts: readonly string[];
  sourceType: "rss";
  defaultDesk: NewsDesk;
  perRunCap: number;
  dailyCap: number;
  enabled: boolean;
  notes: string;
};

export const NEWS_SOURCE_REGISTRY: readonly NewsSourceDefinition[] = [
  {
    id: "jta",
    name: "Jewish Telegraphic Agency",
    attributionLabel: "JTA",
    canonicalSite: "https://www.jta.org",
    feedUrl: "https://www.jta.org/feed",
    hosts: ["jta.org"],
    sourceType: "rss",
    defaultDesk: "jewish-world",
    perRunCap: 4,
    dailyCap: 8,
    enabled: true,
    notes:
      "Identifiers and JOM context only. Do not store or publish excerpts.",
  },
  {
    id: "times-of-israel",
    name: "Times of Israel",
    attributionLabel: "Times of Israel",
    canonicalSite: "https://www.timesofisrael.com",
    feedUrl: "https://www.timesofisrael.com/feed/",
    hosts: ["timesofisrael.com"],
    sourceType: "rss",
    defaultDesk: "israel",
    perRunCap: 3,
    dailyCap: 6,
    enabled: true,
    notes: "Identifiers only. Residual ToS risk accepted by founder allowlist.",
  },
  {
    id: "jpost-diaspora",
    name: "Jerusalem Post — Diaspora",
    attributionLabel: "Jerusalem Post",
    canonicalSite: "https://www.jpost.com",
    feedUrl: "https://www.jpost.com/rss/rssfeedsdiaspora.aspx",
    hosts: ["jpost.com"],
    sourceType: "rss",
    defaultDesk: "jewish-world",
    perRunCap: 2,
    dailyCap: 4,
    enabled: true,
    notes: "Section feed only. Combined JPost daily cap is 4.",
  },
  {
    id: "jpost-archaeology",
    name: "Jerusalem Post — Archaeology",
    attributionLabel: "Jerusalem Post",
    canonicalSite: "https://www.jpost.com",
    feedUrl: "https://www.jpost.com/rss/rssarchaeology",
    hosts: ["jpost.com"],
    sourceType: "rss",
    defaultDesk: "heritage",
    perRunCap: 2,
    dailyCap: 4,
    enabled: true,
    notes: "Section feed only.",
  },
  {
    id: "jpost-culture",
    name: "Jerusalem Post — Culture",
    attributionLabel: "Jerusalem Post",
    canonicalSite: "https://www.jpost.com",
    feedUrl: "https://www.jpost.com/rss/rssfeedsculture.aspx",
    hosts: ["jpost.com"],
    sourceType: "rss",
    defaultDesk: "culture",
    perRunCap: 2,
    dailyCap: 4,
    enabled: true,
    notes: "Section feed only.",
  },
  {
    id: "forward",
    name: "Forward",
    attributionLabel: "Forward",
    canonicalSite: "https://forward.com",
    feedUrl: "https://forward.com/news/feed/",
    hosts: ["forward.com"],
    sourceType: "rss",
    defaultDesk: "jewish-world",
    perRunCap: 3,
    dailyCap: 6,
    enabled: true,
    notes: "News feed only. Link out; do not use reprint rights in V1.",
  },
  {
    id: "jns",
    name: "Jewish News Syndicate",
    attributionLabel: "JNS",
    canonicalSite: "https://www.jns.org",
    feedUrl: "https://www.jns.org/feed/",
    hosts: ["jns.org"],
    sourceType: "rss",
    defaultDesk: "israel",
    perRunCap: 2,
    dailyCap: 4,
    enabled: true,
    notes: "Volume-capped so JNS cannot dominate.",
  },
  {
    id: "ejewishphilanthropy",
    name: "eJewishPhilanthropy",
    attributionLabel: "eJewishPhilanthropy",
    canonicalSite: "https://ejewishphilanthropy.com",
    feedUrl: "https://ejewishphilanthropy.com/feed/",
    hosts: ["ejewishphilanthropy.com"],
    sourceType: "rss",
    defaultDesk: "jewish-world",
    perRunCap: 2,
    dailyCap: 4,
    enabled: true,
    notes: "Parse leniently. Identifiers and JOM context only.",
  },
  {
    id: "biblical-archaeology",
    name: "Biblical Archaeology Society",
    attributionLabel: "Biblical Archaeology Society",
    canonicalSite: "https://www.biblicalarchaeology.org",
    feedUrl: "https://www.biblicalarchaeology.org/feed/",
    hosts: ["biblicalarchaeology.org"],
    sourceType: "rss",
    defaultDesk: "heritage",
    perRunCap: 2,
    dailyCap: 4,
    enabled: true,
    notes: "Heritage desk. Freshness window is seven days.",
  },
] as const;

export const JPOST_FAMILY_IDS = [
  "jpost-diaspora",
  "jpost-archaeology",
  "jpost-culture",
] as const;

export const JPOST_FAMILY_DAILY_CAP = 4;

export function newsPublisherKey(source: NewsSourceDefinition) {
  return source.attributionLabel;
}

export function enabledNewsSources() {
  return NEWS_SOURCE_REGISTRY.filter((source) => source.enabled);
}
