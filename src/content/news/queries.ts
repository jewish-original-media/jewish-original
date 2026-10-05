import { defineQuery } from "next-sanity";

const publicNews = `
  !(_id in path("drafts.**")) &&
  status == "published" &&
  sourcePublishedAt > $since
`;

const newsProjection = `{
  "id": _id,
  "publisher": publisherName,
  "headline": originalHeadline,
  "sourceUrl": sourceUrl,
  "sourcePublishedAt": sourcePublishedAt,
  "jomContext": jomContext,
  desk,
  "topics": coalesce(topics, [])
}`;

export const newsIndexQuery = defineQuery(`
  *[_type == "curatedNewsItem" && ${publicNews}]
    | order(sourcePublishedAt desc)[0...80] ${newsProjection}
`);

export const newsHomeQuery = defineQuery(`
  *[_type == "curatedNewsItem" && ${publicNews}]
    | order(sourcePublishedAt desc)[0...40] ${newsProjection}
`);
