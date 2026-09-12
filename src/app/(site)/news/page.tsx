import type { Metadata } from "next";

import { NewsIndex } from "@/components/news/news-index";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedNewsIndex } from "@/content/news/fetch";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  newsCollectionJsonLd,
} from "@/lib/seo/site";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: "News",
  description:
    "What Jewish Original is following: publisher headlines, dates, and short original context, with outbound links only.",
  path: "/news",
});

export default async function NewsPage() {
  const items = await getPublishedNewsIndex().catch(() => []);
  return (
    <>
      <JsonLd data={newsCollectionJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "News", path: "/news" },
        ])}
      />
      <NewsIndex items={items} />
    </>
  );
}
