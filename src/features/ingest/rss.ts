import { decodeMarkup, htmlToPlainText, truncateSourceText } from "./text";

export type RssItem = {
  title: string;
  link: string;
  publishedAt: string | null;
  guid?: string;
  sourceText: string;
};

export type RssFeed = {
  title?: string;
  items: RssItem[];
  parseWarnings: string[];
};

function firstTag(block: string, tag: string) {
  const match = block.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"),
  );
  return decodeMarkup(match?.[1] ?? "");
}

function firstAttr(block: string, tag: string, name: string) {
  const match = block.match(
    new RegExp(`<${tag}[^>]*\\s${name}="([^"]+)"[^>]*/?>`, "i"),
  );
  return match?.[1] ? decodeMarkup(match[1]) : "";
}

function itemBlocks(xml: string, tag: string) {
  return [
    ...xml.matchAll(
      new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "gi"),
    ),
  ].map((match) => match[1] ?? "");
}

export function parseRssFeed(xml: string): RssFeed {
  const warnings: string[] = [];
  const cleaned = xml.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  const isAtom = /<feed[\s>]/i.test(cleaned);
  const blocks = isAtom
    ? itemBlocks(cleaned, "entry")
    : itemBlocks(cleaned, "item");
  if (blocks.length === 0) {
    warnings.push("no-items");
  }

  const items = blocks
    .map((block) => {
      const title = firstTag(block, "title");
      const link =
        firstTag(block, "link") ||
        firstAttr(block, "link", "href") ||
        firstTag(block, "guid") ||
        firstTag(block, "id");
      const publishedAt =
        firstTag(block, "pubDate") ||
        firstTag(block, "published") ||
        firstTag(block, "updated") ||
        firstTag(block, "dc:date") ||
        null;
      const guid =
        firstTag(block, "guid") || firstTag(block, "id") || undefined;
      const sourceText = truncateSourceText(
        firstTag(block, "description") ||
          firstTag(block, "summary") ||
          firstTag(block, "content:encoded") ||
          firstTag(block, "content"),
      );
      return {
        title: htmlToPlainText(title),
        link: htmlToPlainText(link),
        publishedAt: publishedAt || null,
        guid,
        sourceText,
      };
    })
    .filter((item) => item.title && item.link);

  return {
    title: firstTag(cleaned, "title") || undefined,
    items,
    parseWarnings: warnings,
  };
}
