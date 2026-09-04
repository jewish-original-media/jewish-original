import {
  defineArrayMember,
  defineField,
  defineType,
  type SanityDocument,
} from "sanity";

import { parseYouTubeId } from "@/lib/podcasts/youtube";

type PodcastDraft = {
  title?: string;
  slug?: { current?: string };
  show?: { _ref?: string };
  publishedAt?: string;
  excerpt?: string;
  description?: string;
  featuredImage?: {
    asset?: unknown;
    alt?: string;
    rightsStatus?: string;
  };
  workflowStatus?: string;
  reviewFlags?: { severity?: string; status?: string }[];
};

function podcastPublicationReadiness(document: SanityDocument | undefined) {
  if (!document) return true;
  const draft = document as unknown as PodcastDraft;

  if (draft.workflowStatus !== "ready") {
    return {
      message:
        "Publication is blocked until Review status is Ready. Drafts still save normally.",
      path: ["workflowStatus"],
    };
  }

  const errors: { message: string; path: (string | number)[] }[] = [];
  if (!draft.title?.trim()) {
    errors.push({ message: "Add a title before publication.", path: ["title"] });
  }
  if (!draft.slug?.current) {
    errors.push({ message: "Add a slug before publication.", path: ["slug"] });
  }
  if (!draft.show) {
    errors.push({ message: "Assign a show before publication.", path: ["show"] });
  }
  if (!draft.publishedAt) {
    errors.push({
      message: "Add a publication date before publication.",
      path: ["publishedAt"],
    });
  }
  if (!draft.excerpt?.trim()) {
    errors.push({
      message: "Add a reviewed excerpt before publication.",
      path: ["excerpt"],
    });
  }
  if (!draft.description?.trim()) {
    errors.push({
      message: "Add the original description before publication.",
      path: ["description"],
    });
  }
  if (draft.featuredImage?.asset) {
    if (!draft.featuredImage.alt?.trim()) {
      errors.push({
        message: "Add alternative text for the featured image.",
        path: ["featuredImage", "alt"],
      });
    }
    if (
      !["cleared", "publicDomain", "licensed"].includes(
        draft.featuredImage.rightsStatus || "",
      )
    ) {
      errors.push({
        message: "Clear image rights before publication.",
        path: ["featuredImage", "rightsStatus"],
      });
    }
  }
  if (
    draft.reviewFlags?.some(
      (flag) => flag.severity === "blocking" && flag.status === "open",
    )
  ) {
    errors.push({
      message: "Resolve every open blocking review flag before publication.",
      path: ["reviewFlags"],
    });
  }

  return errors.length ? errors : true;
}

export const relatedPodcastItem = defineType({
  name: "relatedPodcastItem",
  title: "Related podcast episode",
  type: "object",
  fields: [
    defineField({
      name: "episode",
      title: "Episode",
      type: "reference",
      to: [{ type: "podcastEpisode" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "relationType",
      title: "Relationship",
      type: "string",
      options: {
        list: [
          { title: "Related", value: "related" },
          { title: "Earlier episode", value: "earlier" },
          { title: "Later episode", value: "later" },
          { title: "Same series or conversation", value: "sameSeries" },
        ],
      },
    }),
    defineField({ name: "note", title: "Editorial note", type: "string" }),
    defineField({
      name: "origin",
      title: "Origin",
      type: "string",
      initialValue: "editorial",
      options: {
        list: [
          { title: "Editorial", value: "editorial" },
          { title: "Imported", value: "imported" },
          { title: "Suggested", value: "suggested" },
        ],
      },
    }),
  ],
});

export const podcastPlatformLink = defineType({
  name: "podcastPlatformLink",
  title: "Podcast platform link",
  type: "object",
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: {
        list: [
          { title: "YouTube", value: "youtube" },
          { title: "Spotify", value: "spotify" },
          { title: "Apple Podcasts", value: "apple" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "identifier",
      title: "Platform identifier",
      type: "string",
    }),
    defineField({
      name: "source",
      title: "Verification source",
      type: "string",
    }),
    defineField({
      name: "verified",
      title: "Verified official episode link",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "platform", subtitle: "url" },
  },
});

export const podcastChapter = defineType({
  name: "podcastChapter",
  title: "Chapter",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "start",
      title: "Start timestamp",
      type: "string",
      description: "Use the source timestamp, for example 08:30.",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", start: "start" },
    prepare: ({ title, start }) => ({
      title: title || "Chapter",
      subtitle: start,
    }),
  },
});

export const podcastShow = defineType({
  name: "podcastShow",
  title: "Podcast show",
  type: "document",
  groups: [
    { name: "show", title: "Show", default: true },
    { name: "media", title: "Media" },
    { name: "seo", title: "SEO" },
    { name: "review", title: "Review" },
    { name: "advanced", title: "Advanced" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "show",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "show",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "show",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 6,
      group: "show",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "hosts",
      title: "Hosts",
      type: "array",
      group: "show",
      of: [defineArrayMember({ type: "reference", to: [{ type: "person" }] })],
    }),
    defineField({
      name: "artwork",
      title: "Show artwork",
      type: "editorialImage",
      group: "media",
    }),
    defineField({
      name: "rssUrl",
      title: "RSS feed",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "appleUrl",
      title: "Apple Podcasts",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "spotifyUrl",
      title: "Spotify",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "websiteUrl",
      title: "Website",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "seo",
      title: "Search and social",
      type: "seo",
      group: "seo",
    }),
    defineField({
      name: "workflowStatus",
      title: "Review status",
      type: "string",
      group: "review",
      initialValue: "needsReview",
      options: {
        layout: "radio",
        list: [
          { title: "Imported", value: "imported" },
          { title: "Needs review", value: "needsReview" },
          { title: "Ready", value: "ready" },
          { title: "Archived", value: "archived" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publicTestCandidate",
      title: "Public experience test candidate",
      type: "boolean",
      group: "review",
      initialValue: false,
    }),
    defineField({
      name: "editorialNotes",
      title: "Editorial notes",
      type: "text",
      rows: 3,
      group: "review",
    }),
    defineField({
      name: "sourceTitle",
      title: "Source feed title",
      type: "string",
      group: "advanced",
      readOnly: true,
    }),
    defineField({
      name: "provenance",
      title: "Import provenance",
      type: "provenance",
      group: "advanced",
      readOnly: true,
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    select: { title: "title", media: "artwork.asset" },
  },
});

export const podcastEpisode = defineType({
  name: "podcastEpisode",
  title: "Podcast episode",
  type: "document",
  groups: [
    { name: "episode", title: "Episode", default: true },
    { name: "media", title: "Media" },
    { name: "guests", title: "Guests" },
    { name: "summary", title: "Summary" },
    { name: "transcript", title: "Transcript" },
    { name: "topics", title: "Topics" },
    { name: "related", title: "Related Content" },
    { name: "seo", title: "SEO" },
    { name: "review", title: "Review" },
    { name: "advanced", title: "Advanced" },
  ],
  validation: (Rule) => Rule.custom(podcastPublicationReadiness),
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "episode",
      validation: (Rule) =>
        Rule.required().warning("Add a title before review."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "episode",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) =>
        Rule.required().warning("Add a slug before review."),
    }),
    defineField({
      name: "show",
      title: "Show",
      type: "reference",
      group: "episode",
      to: [{ type: "podcastShow" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "season",
      title: "Season",
      type: "number",
      group: "episode",
      validation: (Rule) => Rule.integer().min(1),
    }),
    defineField({
      name: "episodeNumber",
      title: "Episode number",
      type: "number",
      group: "episode",
      validation: (Rule) => Rule.integer().min(1),
    }),
    defineField({
      name: "publishedAt",
      title: "Publication date",
      type: "datetime",
      group: "episode",
      validation: (Rule) =>
        Rule.required().warning("Add a publication date before review."),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "episode",
      validation: (Rule) => [
        Rule.required().warning("Add a reviewed excerpt before publication."),
        Rule.max(240).warning("Aim for 240 characters or fewer."),
      ],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 10,
      group: "episode",
      description:
        "Preserve the original episode description. Do not silently rewrite historical copy.",
    }),
    defineField({
      name: "youtubeUrl",
      title: "Official YouTube episode URL",
      type: "url",
      group: "media",
      description:
        "Verified TTJS episode watch URL only. Do not paste guest-channel or description links.",
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true;
          return parseYouTubeId(String(value))
            ? true
            : "Use a full YouTube watch, short, or embed URL.";
        }),
    }),
    defineField({
      name: "youtubeId",
      title: "YouTube ID",
      type: "string",
      group: "media",
      readOnly: true,
      hidden: ({ parent }) => !parent?.youtubeId && !parent?.youtubeUrl,
    }),
    defineField({
      name: "audioUrl",
      title: "Audio URL",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "spotifyUrl",
      title: "Official Spotify episode URL",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "appleUrl",
      title: "Official Apple Podcasts episode URL",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "primaryMedia",
      title: "Primary media",
      type: "string",
      group: "media",
      initialValue: "auto",
      options: {
        layout: "radio",
        list: [
          { title: "Automatic (YouTube, then audio)", value: "auto" },
          { title: "YouTube", value: "youtube" },
          { title: "Jewish Original audio", value: "audio" },
        ],
      },
      description:
        "Automatic uses a verified official YouTube episode when present, otherwise the RSS audio enclosure.",
    }),
    defineField({
      name: "durationSeconds",
      title: "Duration (seconds)",
      type: "number",
      group: "media",
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: "featuredImage",
      title: "Featured image",
      type: "editorialImage",
      group: "media",
    }),
    defineField({
      name: "chapters",
      title: "Chapters",
      type: "array",
      group: "media",
      of: [defineArrayMember({ type: "podcastChapter" })],
      description: "Use only timestamps present in the source or confirmed by an editor.",
    }),
    defineField({
      name: "guests",
      title: "Guests",
      type: "array",
      group: "guests",
      of: [defineArrayMember({ type: "reference", to: [{ type: "person" }] })],
    }),
    defineField({
      name: "hosts",
      title: "Hosts for this episode",
      type: "array",
      group: "guests",
      of: [defineArrayMember({ type: "reference", to: [{ type: "person" }] })],
      description: "Leave empty to inherit the show hosts.",
    }),
    defineField({
      name: "summary",
      title: "Editorial summary",
      type: "text",
      rows: 8,
      group: "summary",
      description:
        "Reviewed summary only. AI drafts belong in Advanced until an editor accepts them.",
    }),
    defineField({
      name: "reviewedTranscript",
      title: "Reviewed transcript",
      type: "text",
      rows: 16,
      group: "transcript",
      description:
        "Publishable transcript after human review. Raw capture stays under Advanced.",
    }),
    defineField({
      name: "topics",
      title: "Topics",
      type: "array",
      group: "topics",
      of: [defineArrayMember({ type: "reference", to: [{ type: "topic" }] })],
    }),
    defineField({
      name: "people",
      title: "People",
      type: "array",
      group: "topics",
      of: [defineArrayMember({ type: "reference", to: [{ type: "person" }] })],
    }),
    defineField({
      name: "places",
      title: "Places",
      type: "array",
      group: "topics",
      of: [defineArrayMember({ type: "reference", to: [{ type: "place" }] })],
    }),
    defineField({
      name: "relatedHistory",
      title: "Related history",
      type: "array",
      group: "related",
      of: [defineArrayMember({ type: "relatedHistoryItem" })],
      description:
        "Editor-approved relationships only. Keyword matches must stay suggestions until reviewed.",
    }),
    defineField({
      name: "relatedEpisodes",
      title: "Related episodes",
      type: "array",
      group: "related",
      of: [defineArrayMember({ type: "relatedPodcastItem" })],
    }),
    defineField({
      name: "sources",
      title: "Sources",
      type: "array",
      group: "related",
      of: [defineArrayMember({ type: "citation" })],
    }),
    defineField({
      name: "seo",
      title: "Search and social",
      type: "seo",
      group: "seo",
    }),
    defineField({
      name: "workflowStatus",
      title: "Review status",
      type: "string",
      group: "review",
      initialValue: "needsReview",
      options: {
        layout: "radio",
        list: [
          { title: "Imported", value: "imported" },
          { title: "Needs review", value: "needsReview" },
          { title: "Fact check", value: "factCheck" },
          { title: "Rights review", value: "rightsReview" },
          { title: "Ready", value: "ready" },
          { title: "Rejected", value: "rejected" },
          { title: "Archived", value: "archived" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publicTestCandidate",
      title: "Public experience test candidate",
      type: "boolean",
      group: "review",
      initialValue: false,
      description:
        "Enables authenticated design preview only. This is not publication.",
    }),
    defineField({
      name: "reviewFlags",
      title: "Review flags",
      type: "array",
      group: "review",
      of: [defineArrayMember({ type: "reviewFlag" })],
    }),
    defineField({
      name: "editorialNotes",
      title: "Editorial notes",
      type: "text",
      rows: 4,
      group: "review",
    }),
    defineField({
      name: "correctionHistory",
      title: "Correction history",
      type: "array",
      group: "review",
      of: [defineArrayMember({ type: "correction" })],
    }),
    defineField({
      name: "sourceGuestNames",
      title: "Source guest names",
      type: "array",
      group: "advanced",
      of: [defineArrayMember({ type: "string" })],
      readOnly: true,
    }),
    defineField({
      name: "sourceArtworkUrl",
      title: "Source artwork URL",
      type: "url",
      group: "advanced",
      readOnly: true,
      description:
        "Official feed artwork. Do not treat this as rights-cleared featured media.",
    }),
    defineField({
      name: "showSlug",
      title: "Show slug",
      type: "string",
      group: "advanced",
      readOnly: true,
      description:
        "Denormalized import slug so draft preview can resolve before the show is published.",
    }),
    defineField({
      name: "platformLinks",
      title: "Verified platform links",
      type: "array",
      group: "advanced",
      of: [defineArrayMember({ type: "podcastPlatformLink" })],
      readOnly: true,
    }),
    defineField({
      name: "rawTranscript",
      title: "Raw transcript",
      type: "text",
      rows: 16,
      group: "advanced",
      description:
        "Unreviewed capture. Never publish this field automatically.",
    }),
    defineField({
      name: "transcriptStatus",
      title: "Transcript status",
      type: "string",
      group: "advanced",
      initialValue: "none",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Raw", value: "raw" },
          { title: "Cleanup suggested", value: "cleanupSuggested" },
          { title: "Reviewed", value: "reviewed" },
        ],
      },
    }),
    defineField({
      name: "aiSuggestions",
      title: "AI suggestions",
      type: "text",
      rows: 6,
      group: "advanced",
      description:
        "Suggestions only. AI must not fabricate quotations or silently alter meaning.",
    }),
    defineField({
      name: "provenance",
      title: "Import provenance",
      type: "provenance",
      group: "advanced",
      readOnly: true,
      options: { collapsible: true, collapsed: true },
    }),
  ],
  orderings: [
    {
      title: "Publication date, newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Title",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      publishedAt: "publishedAt",
      status: "workflowStatus",
      media: "featuredImage.asset",
    },
    prepare: ({ title, publishedAt, status, media }) => ({
      title: title || "Untitled episode",
      subtitle: [publishedAt?.slice(0, 10), status].filter(Boolean).join(" · "),
      media,
    }),
  },
});

export const podcastObjectTypes = [
  relatedPodcastItem,
  podcastChapter,
  podcastPlatformLink,
];
export const podcastDocumentTypes = [podcastShow, podcastEpisode];
