import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export function isPreviewDeployment() {
  return process.env.VERCEL_ENV === "preview";
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    email: siteConfig.email,
    description: siteConfig.description,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function breadcrumbJsonLd(
  items: readonly { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  const indexable = input.index !== false && !isPreviewDeployment();
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    robots: {
      index: indexable,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: siteConfig.name,
      title: input.title,
      description: input.description,
      url: input.path,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}

export function newsCollectionJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "What we’re following",
    description:
      "Publisher headlines Jewish Original is following, with short original context and outbound source links.",
    url: `${siteConfig.url}/news`,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function publicStaticSitemapPaths(options?: {
  includeEvents?: boolean;
}) {
  const paths = [
    "/",
    "/today",
    "/history",
    "/podcasts",
    "/originals",
    "/news",
    "/about",
    "/support",
    "/privacy",
  ];
  if (options?.includeEvents) paths.splice(6, 0, "/events");
  return paths;
}
