import assert from "node:assert/strict";
import test from "node:test";

import type { OriginalArticle } from "../src/content/originals/types";
import {
  buildOriginalJsonLd,
  buildOriginalMetadata,
  buildOriginalsBreadcrumbJsonLd,
  buildOriginalsHomeMetadata,
  originalArticleUrl,
  originalsCollectionJsonLd,
} from "../src/lib/seo/originals";
import { siteConfig } from "../src/lib/site";

function article(overrides: Partial<OriginalArticle> = {}): OriginalArticle {
  return {
    _id: "article.our-path-forward",
    title: "Our Path Forward",
    slug: "our-path-forward",
    excerpt:
      "Jewish Original Media started as a response: to loss, to longing, to the silence we felt in the spaces we loved.",
    publishedAt: "2026-09-12T04:05:00.000Z",
    authors: [
      { name: "Meyer Grunberg", slug: "meyer-grunberg" },
      { name: "Isaac Simon", slug: "isaac-simon" },
    ],
    topics: [],
    body: [],
    citations: [],
    relatedHistory: [],
    relatedPodcastEpisodes: [],
    seo: {
      title: "Our Path Forward",
      description:
        "The founding essay of Jewish Original Media: remember, rebuild, and create.",
    },
    _createdAt: "2026-09-12T04:05:00.000Z",
    _updatedAt: "2026-09-12T04:05:00.000Z",
    ...overrides,
  };
}

test("Originals home metadata uses a CollectionPage canonical", () => {
  const metadata = buildOriginalsHomeMetadata();
  assert.equal(metadata.title, "Originals");
  assert.equal(metadata.alternates?.canonical, "/originals");
  const jsonLd = originalsCollectionJsonLd();
  assert.equal(jsonLd["@type"], "CollectionPage");
  assert.equal(jsonLd.url, `${siteConfig.url}/originals`);
});

test("published Original metadata is indexable Article JSON-LD", () => {
  const published = article();
  const metadata = buildOriginalMetadata(published, false);
  assert.deepEqual(metadata.title, { absolute: "Our Path Forward" });
  assert.equal(
    metadata.alternates?.canonical,
    "https://jewishoriginal.com/originals/our-path-forward",
  );
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.equal(
    (metadata.openGraph as { type?: string } | undefined)?.type,
    "article",
  );
  assert.equal(
    originalArticleUrl(published.slug),
    "https://jewishoriginal.com/originals/our-path-forward",
  );

  const jsonLd = buildOriginalJsonLd(published);
  assert.equal(jsonLd["@type"], "Article");
  assert.equal(jsonLd.headline, "Our Path Forward");
  assert.deepEqual(jsonLd.author, [
    { "@type": "Person", name: "Meyer Grunberg" },
    { "@type": "Person", name: "Isaac Simon" },
  ]);
});

test("preview and noindex Originals stay out of the index", () => {
  const preview = buildOriginalMetadata(article(), true);
  assert.deepEqual(preview.robots, { index: false, follow: false });
  const flagged = buildOriginalMetadata(
    article({ seo: { noIndex: true } }),
    false,
  );
  assert.deepEqual(flagged.robots, { index: false, follow: false });
});

test("Originals breadcrumbs include Home and the journal", () => {
  const home = buildOriginalsBreadcrumbJsonLd();
  assert.equal(home.itemListElement[1]?.name, "Originals");
  const articleTrail = buildOriginalsBreadcrumbJsonLd({
    title: "Our Path Forward",
    slug: "our-path-forward",
  });
  assert.equal(
    articleTrail.itemListElement[2]?.item,
    originalArticleUrl("our-path-forward"),
  );
});
