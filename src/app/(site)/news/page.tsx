import type { Metadata } from "next";

import { NewsIndex } from "@/components/news/news-index";
import { getPublishedNewsIndex } from "@/content/news/fetch";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "News",
  description:
    "What Jewish Original is following: publisher headlines, dates, and short JOM context.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const items = await getPublishedNewsIndex().catch(() => []);
  return <NewsIndex items={items} />;
}
