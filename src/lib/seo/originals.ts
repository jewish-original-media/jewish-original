import type { Metadata } from "next";

import type { OriginalArticle } from "@/content/originals/types";
import { authorLine } from "@/lib/originals/display";
import { breadcrumbJsonLd } from "@/lib/seo/site";
import { siteConfig } from "@/lib/site";

export function originalsHomeUrl() {
  return `${siteConfig.url}/originals`;
}

export function originalArticleUrl(slug: string) {
  return `${siteConfig.url}/originals/${slug}`;
}

export function buildOriginalsHomeMetadata(): Metadata {
  const title = "Originals";
  const description =
    "Jewish Original Media’s own writing: essays from the house on memory, culture, and Jewish life.";
  return {
    title,
    description,
    alternates: { canonical: "/originals" },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: siteConfig.name,
      title,
      description,
      url: "/originals",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function originalsCollectionJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Originals",
    description:
      "Jewish Original Media’s own writing. Not News, History, or Podcast pages.",
    url: originalsHomeUrl(),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function buildOriginalMetadata(
  article: OriginalArticle,
  preview: boolean,
): Metadata {
  const url = originalArticleUrl(article.slug);
  const title = article.seo?.title
    ? { absolute: article.seo.title }
    : article.title;
  const description =
    article.seo?.description ||
    article.excerpt ||
    `An Original from Jewish Original Media: ${article.title}.`;
  const image = article.featuredMedia?.asset.url;
  const socialTitle =
    article.seo?.openGraphTitle || article.seo?.title || article.title;

  return {
    title,
    description,
    alternates: {
      canonical: article.seo?.canonicalUrl || url,
    },
    robots:
      preview || article.seo?.noIndex
        ? { index: false, follow: false }
        : { index: true, follow: true },
    openGraph: {
      type: "article",
      locale: "en_US",
      siteName: siteConfig.name,
      title: socialTitle,
      description: article.seo?.openGraphDescription || description,
      url,
      images: image
        ? [{ url: image, alt: article.featuredMedia?.alt || article.title }]
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

export function buildOriginalJsonLd(article: OriginalArticle) {
  const url = originalArticleUrl(article.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    url,
    mainEntityOfPage: url,
    datePublished: article.publishedAt || article._createdAt,
    dateModified: article._updatedAt,
    author: article.authors.map((author) => ({
      "@type": "Person",
      name: author.name,
    })),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    image: article.featuredMedia?.asset.url,
    about: article.topics.map((topic) => topic.name),
  };
}

export function buildOriginalsBreadcrumbJsonLd(article?: {
  title: string;
  slug: string;
}) {
  const items = [
    { name: "Home", path: "/" },
    { name: "Originals", path: "/originals" },
  ];
  if (article) {
    items.push({
      name: article.title,
      path: `/originals/${article.slug}`,
    });
  }
  return breadcrumbJsonLd(items);
}

export { authorLine };
