import { defineQuery } from "next-sanity";

const publicVisibility =
  '!(_id in path("drafts.**")) && workflowStatus == "published" && defined(publishedAt)';
const previewVisibility = 'workflowStatus != "archived"';

const referenceProjection = `{
  "name": name,
  "slug": slug.current
}`;

const imageProjection = `"featuredMedia": select(
  featuredMedia.rightsStatus in ["cleared", "publicDomain", "licensed"] &&
  defined(featuredMedia.asset) &&
  defined(featuredMedia.alt) => featuredMedia{
    alt,
    caption,
    visualKind,
    creator,
    creditLine,
    rightsStatus,
    sourcePageUrl,
    "asset": asset->{
      url,
      "width": metadata.dimensions.width,
      "height": metadata.dimensions.height,
      "lqip": metadata.lqip
    }
  }
)`;

const summaryProjection = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "authors": coalesce(authors[]->${referenceProjection}, []),
  "topics": coalesce(topics[]->${referenceProjection}, []),
  ${imageProjection}
}`;

export const originalsIndexQuery = defineQuery(`*[
  _type == "article" &&
  defined(slug.current) &&
  select($preview => ${previewVisibility}, ${publicVisibility})
] | order(publishedAt desc) ${summaryProjection}`);

export const originalsHomeQuery = defineQuery(`*[
  _type == "article" &&
  defined(slug.current) &&
  ${publicVisibility}
] | order(publishedAt desc)[0...3] ${summaryProjection}`);

export const originalsSlugsQuery = defineQuery(`*[
  _type == "article" &&
  ${publicVisibility} &&
  defined(slug.current)
]{"slug": slug.current}`);

export const originalArticleQuery = defineQuery(`*[
  _type == "article" &&
  slug.current == $slug &&
  select($preview => ${previewVisibility}, ${publicVisibility})
][0]{
  ${summaryProjection.slice(1, -1)},
  "body": coalesce(body[], []),
  "citations": coalesce(citations[verificationStatus == "verified" || $preview]{
    _key,
    title,
    author,
    publication,
    kind,
    url,
    bibliographicDetail,
    locator,
    publicationDate,
    verificationStatus,
    "source": source->{name, canonicalUrl}
  }, []),
  "relatedHistory": coalesce(relatedHistory[]{
    relationType,
    note,
    "entry": entry->{title, "slug": slug.current, excerpt}
  }, []),
  "relatedPodcastEpisodes": coalesce(relatedPodcastEpisodes[]{
    relationType,
    note,
    "episode": episode->{
      title,
      "slug": slug.current,
      "showSlug": show->slug.current
    }
  }, []),
  seo,
  "workflowStatus": select($preview => workflowStatus),
  _createdAt,
  _updatedAt
}`);
