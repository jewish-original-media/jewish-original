import { defineQuery } from "next-sanity";

const publicVisibility =
  '!(_id in path("drafts.**")) && workflowStatus == "ready"';
const previewVisibility = "publicTestCandidate == true";

const referenceProjection = `{
  "name": name,
  "slug": slug.current
}`;

const episodeArtworkProjection = `"artwork": select(
  featuredImage.rightsStatus in ["cleared", "publicDomain", "licensed"] &&
  defined(featuredImage.asset) &&
  defined(featuredImage.alt) => {
    "url": featuredImage.asset->url,
    "alt": featuredImage.alt,
    "width": featuredImage.asset->metadata.dimensions.width,
    "height": featuredImage.asset->metadata.dimensions.height
  }
)`;

const showArtworkProjection = `"artwork": select(
  artwork.rightsStatus in ["cleared", "publicDomain", "licensed"] &&
  defined(artwork.asset) &&
  defined(artwork.alt) => {
    "url": artwork.asset->url,
    "alt": artwork.alt,
    "width": artwork.asset->metadata.dimensions.width,
    "height": artwork.asset->metadata.dimensions.height
  }
)`;

const episodeSummaryProjection = `{
  _id,
  title,
  "slug": slug.current,
  "showSlug": show->slug.current,
  "showTitle": show->title,
  excerpt,
  publishedAt,
  durationSeconds,
  season,
  episodeNumber,
  "guestNames": coalesce(sourceGuestNames, []),
  ${episodeArtworkProjection}
}`;

export const podcastShowQuery = defineQuery(`*[
  _type == "podcastShow" &&
  slug.current == $showSlug &&
  select($preview => ${previewVisibility}, ${publicVisibility})
][0]{
  _id,
  title,
  "slug": slug.current,
  tagline,
  description,
  "hosts": coalesce(hosts[]->${referenceProjection}, []),
  rssUrl,
  spotifyUrl,
  appleUrl,
  youtubeUrl,
  websiteUrl,
  seo,
  ${showArtworkProjection}
}`);

export const podcastEpisodeIndexQuery = defineQuery(`*[
  _type == "podcastEpisode" &&
  defined(slug.current) &&
  show->slug.current == $showSlug &&
  select($preview => ${previewVisibility}, ${publicVisibility})
] | order(publishedAt desc) ${episodeSummaryProjection}`);

export const podcastEpisodeQuery = defineQuery(`*[
  _type == "podcastEpisode" &&
  slug.current == $slug &&
  show->slug.current == $showSlug &&
  select($preview => ${previewVisibility}, ${publicVisibility})
][0]{
  ${episodeSummaryProjection.slice(1, -1)},
  description,
  audioUrl,
  youtubeId,
  youtubeUrl,
  summary,
  reviewedTranscript,
  "chapters": coalesce(chapters[], []),
  "topics": coalesce(topics[]->${referenceProjection}, []),
  "people": coalesce(people[]->${referenceProjection}, []),
  "places": coalesce(places[]->${referenceProjection}, []),
  "hosts": coalesce(hosts[]->${referenceProjection}, show->hosts[]->${referenceProjection}, []),
  "relatedHistory": coalesce(relatedHistory[]{
    relationType,
    note,
    "entry": entry->{
      title,
      "slug": slug.current,
      excerpt
    }
  }, []),
  "relatedEpisodes": coalesce(relatedEpisodes[]{
    relationType,
    "episode": episode->${episodeSummaryProjection}
  }, []),
  seo
}`);

export const podcastEpisodeSlugsQuery = defineQuery(`*[
  _type == "podcastEpisode" &&
  ${publicVisibility} &&
  defined(slug.current) &&
  defined(show->slug.current)
]{
  "showSlug": show->slug.current,
  "slug": slug.current
}`);

export const podcastShowSlugsQuery = defineQuery(`*[
  _type == "podcastShow" &&
  ${publicVisibility} &&
  defined(slug.current)
]{"showSlug": slug.current}`);
