import {
  defineArrayMember,
  defineField,
  defineType,
  type SanityDocument,
} from "sanity";

type OriginalDraft = {
  title?: string;
  slug?: { current?: string };
  authors?: unknown[];
  excerpt?: string;
  body?: unknown[];
  publishedAt?: string;
  featuredMedia?: {
    asset?: unknown;
    alt?: string;
    rightsStatus?: string;
  };
  workflowStatus?: string;
  reviewFlags?: { severity?: string; status?: string }[];
};

function originalPublicationReadiness(document: SanityDocument | undefined) {
  if (!document) return true;
  const draft = document as unknown as OriginalDraft;

  if (draft.workflowStatus !== "published") {
    return true;
  }

  const errors: { message: string; path: (string | number)[] }[] = [];
  if (!draft.title?.trim()) {
    errors.push({
      message: "Add a title before publication.",
      path: ["title"],
    });
  }
  if (!draft.slug?.current) {
    errors.push({ message: "Add a slug before publication.", path: ["slug"] });
  }
  if (!draft.authors?.length) {
    errors.push({
      message: "Add at least one author before publication.",
      path: ["authors"],
    });
  }
  if (!draft.excerpt?.trim()) {
    errors.push({
      message: "Add a reviewed excerpt before publication.",
      path: ["excerpt"],
    });
  }
  if (!draft.body?.length) {
    errors.push({
      message: "Add the essay before publication.",
      path: ["body"],
    });
  }
  if (!draft.publishedAt) {
    errors.push({
      message: "Add a publication date before publication.",
      path: ["publishedAt"],
    });
  }
  if (draft.featuredMedia?.asset) {
    if (!draft.featuredMedia.alt?.trim()) {
      errors.push({
        message: "Add alternative text for the featured image.",
        path: ["featuredMedia", "alt"],
      });
    }
    if (
      !["cleared", "publicDomain", "licensed"].includes(
        draft.featuredMedia.rightsStatus || "",
      )
    ) {
      errors.push({
        message: "Clear image rights before publication.",
        path: ["featuredMedia", "rightsStatus"],
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

export const article = defineType({
  name: "article",
  title: "Original",
  type: "document",
  groups: [
    { name: "story", title: "Story", default: true },
    { name: "connections", title: "Connections" },
    { name: "sources", title: "Sources" },
    { name: "media", title: "Image" },
    { name: "seo", title: "SEO" },
    { name: "review", title: "Review" },
  ],
  validation: (Rule) => Rule.custom(originalPublicationReadiness),
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "story",
      validation: (Rule) =>
        Rule.required().warning("Add a title before review."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "story",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) =>
        Rule.required().warning("Add a slug before review."),
    }),
    defineField({
      name: "authors",
      title: "Authors",
      type: "array",
      group: "story",
      of: [defineArrayMember({ type: "reference", to: [{ type: "person" }] })],
      validation: (Rule) =>
        Rule.required().warning("Add an author before review."),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 4,
      group: "story",
      validation: (Rule) => [
        Rule.required().warning("Add a reviewed excerpt before publication."),
        Rule.max(240).warning("Aim for 240 characters or fewer."),
      ],
    }),
    defineField({
      name: "body",
      title: "Essay",
      type: "array",
      group: "story",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
        }),
      ],
      validation: (Rule) =>
        Rule.required().warning("Add the essay before review."),
    }),
    defineField({
      name: "publishedAt",
      title: "Publication date",
      type: "datetime",
      group: "story",
    }),
    defineField({
      name: "topics",
      title: "Topics",
      type: "array",
      group: "connections",
      of: [defineArrayMember({ type: "reference", to: [{ type: "topic" }] })],
    }),
    defineField({
      name: "relatedHistory",
      title: "Related history",
      type: "array",
      group: "connections",
      of: [defineArrayMember({ type: "relatedHistoryItem" })],
    }),
    defineField({
      name: "relatedPodcastEpisodes",
      title: "Related podcast episodes",
      type: "array",
      group: "connections",
      of: [defineArrayMember({ type: "relatedPodcastItem" })],
    }),
    defineField({
      name: "citations",
      title: "Sources",
      type: "array",
      group: "sources",
      of: [defineArrayMember({ type: "citation" })],
    }),
    defineField({
      name: "featuredMedia",
      title: "Featured image",
      type: "editorialImage",
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
      title: "Publication status",
      type: "string",
      group: "review",
      initialValue: "draft",
      options: {
        layout: "radio",
        list: [
          { title: "Draft", value: "draft" },
          { title: "Review", value: "review" },
          { title: "Scheduled", value: "scheduled" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
      },
      validation: (Rule) => Rule.required(),
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
      media: "featuredMedia.asset",
    },
    prepare: ({ title, publishedAt, status, media }) => ({
      title: title || "Untitled Original",
      subtitle: [publishedAt?.slice(0, 10), status].filter(Boolean).join(" · "),
      media,
    }),
  },
});

export const originalDocumentTypes = [article];
