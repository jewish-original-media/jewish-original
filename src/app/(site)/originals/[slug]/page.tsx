import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { OriginalsArticleView } from "@/components/originals/originals-article";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getOriginalArticle,
  getPublishedOriginalSlugs,
} from "@/content/originals/fetch";
import {
  buildOriginalJsonLd,
  buildOriginalMetadata,
  buildOriginalsBreadcrumbJsonLd,
} from "@/lib/seo/originals";

type OriginalPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    return await getPublishedOriginalSlugs();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: OriginalPageProps): Promise<Metadata> {
  const [{ slug }, { isEnabled: preview }] = await Promise.all([
    params,
    draftMode(),
  ]);
  const article = await getOriginalArticle(slug, preview);
  if (!article) {
    return { title: "Original", robots: { index: false, follow: false } };
  }
  return buildOriginalMetadata(article, preview);
}

export default async function OriginalArticlePage({
  params,
}: OriginalPageProps) {
  const [{ slug }, { isEnabled: preview }] = await Promise.all([
    params,
    draftMode(),
  ]);
  const article = await getOriginalArticle(slug, preview);
  if (!article) notFound();

  return (
    <>
      {!preview ? (
        <>
          <JsonLd data={buildOriginalJsonLd(article)} />
          <JsonLd
            data={buildOriginalsBreadcrumbJsonLd({
              title: article.title,
              slug: article.slug,
            })}
          />
        </>
      ) : null}
      <OriginalsArticleView article={article} preview={preview} />
    </>
  );
}
