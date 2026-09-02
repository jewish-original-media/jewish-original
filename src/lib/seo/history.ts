import type { Metadata } from "next";

import type { HistoryEntry } from "@/content/history/types";
import { formatHistoricalDate } from "@/lib/history/format-date";
import { siteConfig } from "@/lib/site";

export function historyEntryUrl(slug: string) {
  return `${siteConfig.url}/history/${slug}`;
}

export function buildHistoryMetadata(
  entry: HistoryEntry,
  preview: boolean,
): Metadata {
  const url = historyEntryUrl(entry.slug);
  const title = entry.seo?.title
    ? { absolute: entry.seo.title }
    : entry.title;
  const description =
    entry.seo?.description ||
    entry.excerpt ||
    `A Jewish Original history entry about ${entry.title}.`;
  const image = entry.primaryImage?.asset.url;
  const socialTitle = entry.seo?.openGraphTitle || entry.seo?.title || entry.title;

  return {
    title,
    description,
    alternates: {
      canonical: entry.seo?.canonicalUrl || url,
    },
    robots:
      preview || entry.seo?.noIndex
        ? { index: false, follow: false }
        : { index: true, follow: true },
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      title: socialTitle,
      description: entry.seo?.openGraphDescription || description,
      url,
      images: image
        ? [{ url: image, alt: entry.primaryImage?.alt || entry.title }]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: socialTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function buildHistoryJsonLd(entry: HistoryEntry) {
  const url = historyEntryUrl(entry.slug);
  const about = [
    ...entry.topics,
    ...entry.people,
    ...entry.places,
    ...entry.geographicRegions,
  ].map((item) => item.name);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description:
      entry.excerpt || `A Jewish Original history entry about ${entry.title}.`,
    url,
    mainEntityOfPage: url,
    dateModified: entry._updatedAt,
    temporalCoverage: formatHistoricalDate(
      entry.historicalDate,
      entry.entryKind,
      entry.observanceRule,
    ),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    about: about.length ? [...new Set(about)] : undefined,
    citation: entry.citations
      .filter((citation) => citation.verificationStatus === "verified")
      .map((citation) => citation.url || citation.title)
      .filter(Boolean),
    image: entry.primaryImage?.asset.url,
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
