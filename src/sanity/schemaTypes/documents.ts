import {
  defineArrayMember,
  defineField,
  defineType,
  type SanityDocument,
} from "sanity";

const aliasesField = defineField({
  name: "aliases",
  title: "Aliases and transliterations",
  type: "array",
  of: [defineArrayMember({ type: "string" })],
});

const slugField = defineField({
  name: "slug",
  title: "Slug",
  type: "slug",
  options: { source: "name", maxLength: 96 },
  validation: (Rule) => Rule.required().warning("Add a slug before review."),
});

const authorityIdsField = defineField({
  name: "authorityIds",
  title: "External authority IDs",
  type: "array",
  of: [
    defineArrayMember({
      type: "object",
      fields: [
        defineField({ name: "authority", title: "Authority", type: "string" }),
        defineField({
          name: "identifier",
          title: "Identifier",
          type: "string",
        }),
      ],
      preview: {
        select: { authority: "authority", identifier: "identifier" },
        prepare: ({ authority, identifier }) => ({
          title: authority || "Authority",
          subtitle: identifier,
        }),
      },
    }),
  ],
});

export const person = defineType({
  name: "person",
  title: "Person",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Preferred display name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    slugField,
    aliasesField,
    defineField({
      name: "birthDate",
      title: "Birth date",
      type: "historicalDate",
    }),
    defineField({
      name: "deathDate",
      title: "Death date",
      type: "historicalDate",
    }),
    defineField({
      name: "biography",
      title: "Short biography",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "editorialImage",
    }),
    authorityIdsField,
    defineField({
      name: "mergeHistory",
      title: "Merge history",
      type: "array",
      readOnly: true,
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "mergedAt",
              title: "Merged at",
              type: "datetime",
            }),
            defineField({
              name: "sourceId",
              title: "Source document ID",
              type: "string",
            }),
            defineField({ name: "note", title: "Note", type: "string" }),
          ],
        }),
      ],
    }),
  ],
  preview: { select: { title: "name", media: "portrait.asset" } },
});

export const geographicRegion = defineType({
  name: "geographicRegion",
  title: "Geographic region",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    slugField,
    defineField({
      name: "regionType",
      title: "Region type",
      type: "string",
      options: {
        list: [
          { title: "Continent", value: "continent" },
          { title: "Subregion", value: "subregion" },
          { title: "Country", value: "country" },
          { title: "Historical region", value: "historicalRegion" },
          { title: "Diaspora area", value: "diasporaArea" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({
      name: "parent",
      title: "Parent region",
      type: "reference",
      to: [{ type: "geographicRegion" }],
    }),
    aliasesField,
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
    }),
  ],
});

export const place = defineType({
  name: "place",
  title: "Place",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Preferred name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    slugField,
    defineField({
      name: "historicalNames",
      title: "Historical names",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    aliasesField,
    defineField({
      name: "placeType",
      title: "Place type",
      type: "string",
      options: {
        list: [
          { title: "City or town", value: "city" },
          { title: "Site", value: "site" },
          { title: "Building", value: "building" },
          { title: "Camp or ghetto", value: "campOrGhetto" },
          { title: "Natural feature", value: "naturalFeature" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({
      name: "coordinates",
      title: "Coordinates",
      type: "geopoint",
    }),
    defineField({
      name: "modernJurisdiction",
      title: "Modern jurisdiction",
      type: "string",
    }),
    defineField({
      name: "regions",
      title: "Geographic regions",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "geographicRegion" }],
        }),
      ],
    }),
    defineField({
      name: "historicalContext",
      title: "Historical context",
      type: "text",
      rows: 4,
    }),
    authorityIdsField,
  ],
});

export const topic = defineType({
  name: "topic",
  title: "Topic",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    slugField,
    aliasesField,
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "parent",
      title: "Parent topic",
      type: "reference",
      to: [{ type: "topic" }],
    }),
    defineField({
      name: "relatedTopics",
      title: "Related topics",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "topic" }] })],
    }),
    defineField({
      name: "scopeNote",
      title: "Scope note",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "active",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Proposed", value: "proposed" },
          { title: "Deprecated", value: "deprecated" },
        ],
      },
    }),
  ],
});

export const historicalEra = defineType({
  name: "historicalEra",
  title: "Historical era",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    slugField,
    defineField({
      name: "start",
      title: "Approximate start",
      type: "datePart",
    }),
    defineField({ name: "end", title: "Approximate end", type: "datePart" }),
    defineField({
      name: "boundaryNote",
      title: "Boundary note",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
    }),
  ],
});

export const organization = defineType({
  name: "organization",
  title: "Organization",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Canonical name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    slugField,
    aliasesField,
    defineField({
      name: "organizationType",
      title: "Organization type",
      type: "string",
      options: {
        list: [
          { title: "Government", value: "government" },
          { title: "Military", value: "military" },
          { title: "Religious", value: "religious" },
          { title: "Cultural", value: "cultural" },
          { title: "Educational", value: "educational" },
          { title: "Advocacy", value: "advocacy" },
          { title: "Business", value: "business" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({ name: "canonicalUrl", title: "Canonical URL", type: "url" }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    authorityIdsField,
  ],
});

export const source = defineType({
  name: "source",
  title: "Source",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Canonical name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    slugField,
    aliasesField,
    defineField({
      name: "sourceType",
      title: "Source type",
      type: "string",
      options: {
        list: [
          { title: "Publication", value: "publication" },
          { title: "Archive", value: "archive" },
          { title: "Book", value: "book" },
          { title: "Institution", value: "institution" },
          { title: "Website", value: "website" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({ name: "canonicalUrl", title: "Canonical URL", type: "url" }),
    defineField({ name: "publisher", title: "Publisher", type: "string" }),
    defineField({
      name: "trustNote",
      title: "Editorial trust or scope note",
      type: "text",
      rows: 4,
      description:
        "Internal context only. A source record does not imply blanket factual approval.",
    }),
    authorityIdsField,
  ],
});

type HistoryDraft = {
  entryKind?: string;
  title?: string;
  slug?: { current?: string };
  excerpt?: string;
  body?: unknown[];
  historicalDate?: { start?: { year?: number }; precision?: string };
  observanceRule?: {
    observanceKey?: string;
    calendarSystem?: string;
    nominalHebrewMonth?: string;
    nominalHebrewDay?: number;
    adjustmentPolicy?: string;
    calculationProvider?: string;
  };
  citations?: unknown[];
  primaryImage?: {
    asset?: unknown;
    alt?: string;
    rightsStatus?: string;
  };
  workflowStatus?: string;
  reviewFlags?: { severity?: string; status?: string }[];
};

function publicationReadiness(document: SanityDocument | undefined) {
  if (!document) return true;
  const draft = document as unknown as HistoryDraft;

  if (draft.workflowStatus !== "ready") {
    return {
      message:
        "Publication is blocked until Review status is Ready. Drafts still save normally.",
      path: ["workflowStatus"],
    };
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
  if (!draft.excerpt?.trim()) {
    errors.push({
      message: "Add a reviewed excerpt before publication.",
      path: ["excerpt"],
    });
  }
  if (!draft.body?.length) {
    errors.push({
      message: "Add the story before publication.",
      path: ["body"],
    });
  }
  if (
    draft.entryKind !== "recurringObservance" &&
    draft.historicalDate?.precision !== "unknown" &&
    draft.historicalDate?.start?.year === undefined
  ) {
    errors.push({
      message: "Complete or explicitly mark the historical date unknown.",
      path: ["historicalDate"],
    });
  }
  if (draft.entryKind === "recurringObservance") {
    if (!draft.observanceRule?.observanceKey) {
      errors.push({
        message: "Add a stable observance key before publication.",
        path: ["observanceRule", "observanceKey"],
      });
    }
    if (draft.observanceRule?.calendarSystem !== "hebrew") {
      errors.push({
        message:
          "The current recurring-observance model requires an explicitly reviewed Hebrew-calendar basis.",
        path: ["observanceRule", "calendarSystem"],
      });
    }
    if (
      !draft.observanceRule?.nominalHebrewMonth ||
      draft.observanceRule?.nominalHebrewDay === undefined
    ) {
      errors.push({
        message: "Add the reviewed nominal Hebrew date before publication.",
        path: ["observanceRule"],
      });
    }
    if (
      draft.observanceRule?.adjustmentPolicy === "externalProvider" &&
      !draft.observanceRule?.calculationProvider
    ) {
      errors.push({
        message: "Choose the verified calendar provider before publication.",
        path: ["observanceRule", "calculationProvider"],
      });
    }
  }
  if (!draft.citations?.length) {
    errors.push({
      message: "Add at least one citation before publication.",
      path: ["citations"],
    });
  }
  if (draft.primaryImage?.asset) {
    if (!draft.primaryImage.alt?.trim()) {
      errors.push({
        message: "Add alternative text for the primary image.",
        path: ["primaryImage", "alt"],
      });
    }
    if (
      !["cleared", "publicDomain", "licensed"].includes(
        draft.primaryImage.rightsStatus || "",
      )
    ) {
      errors.push({
        message: "Clear image rights before publication.",
        path: ["primaryImage", "rightsStatus"],
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

export const historyEntry = defineType({
  name: "historyEntry",
  title: "History entry",
  type: "document",
  groups: [
    { name: "story", title: "Story", default: true },
    { name: "date", title: "Date" },
    { name: "connections", title: "People, places & topics" },
    { name: "sources", title: "Sources" },
    { name: "media", title: "Image" },
    { name: "related", title: "Related content" },
    { name: "seo", title: "SEO" },
    { name: "review", title: "Review" },
    { name: "advanced", title: "Advanced" },
  ],
  validation: (Rule) => Rule.custom(publicationReadiness),
  fields: [
    defineField({
      name: "entryKind",
      title: "Entry type",
      type: "string",
      group: "date",
      initialValue: "historicalEvent",
      options: {
        layout: "radio",
        list: [
          { title: "One-time historical event", value: "historicalEvent" },
          { title: "Recurring observance", value: "recurringObservance" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
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
      name: "historicalDate",
      title: "Historical date",
      type: "historicalDate",
      group: "date",
      options: { collapsible: true, collapsed: false },
      validation: (Rule) =>
        Rule.required().warning(
          "Add or explicitly mark the date unknown before review.",
        ),
    }),
    defineField({
      name: "hebrewDate",
      title: "Hebrew date context",
      type: "hebrewDate",
      group: "date",
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "observanceRule",
      title: "Recurring observance",
      type: "observanceRule",
      group: "date",
      hidden: ({ document }) => document?.entryKind !== "recurringObservance",
      options: { collapsible: true, collapsed: false },
    }),
    defineField({
      name: "body",
      title: "Story",
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
        Rule.required().warning("Add the story before review."),
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
      name: "contentWarnings",
      title: "Content warnings",
      type: "array",
      group: "story",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Antisemitic violence", value: "antisemiticViolence" },
          { title: "Genocide or mass death", value: "genocide" },
          { title: "Terrorism", value: "terrorism" },
          { title: "Graphic violence", value: "graphicViolence" },
          { title: "Death", value: "death" },
        ],
      },
    }),
    defineField({
      name: "contentWarningNote",
      title: "Content warning note",
      type: "text",
      rows: 2,
      group: "story",
      hidden: ({ document }) =>
        !(document?.contentWarnings as unknown[] | undefined)?.length,
    }),
    defineField({
      name: "topics",
      title: "Topics",
      type: "array",
      group: "connections",
      of: [defineArrayMember({ type: "reference", to: [{ type: "topic" }] })],
    }),
    defineField({
      name: "people",
      title: "People",
      type: "array",
      group: "connections",
      of: [defineArrayMember({ type: "reference", to: [{ type: "person" }] })],
    }),
    defineField({
      name: "places",
      title: "Places",
      type: "array",
      group: "connections",
      of: [defineArrayMember({ type: "reference", to: [{ type: "place" }] })],
    }),
    defineField({
      name: "geographicRegions",
      title: "Geographic regions",
      type: "array",
      group: "connections",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "geographicRegion" }],
        }),
      ],
    }),
    defineField({
      name: "eras",
      title: "Historical eras",
      type: "array",
      group: "connections",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "historicalEra" }],
        }),
      ],
    }),
    defineField({
      name: "organizations",
      title: "Organizations",
      type: "array",
      group: "connections",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "organization" }],
        }),
      ],
    }),
    defineField({
      name: "citations",
      title: "Sources",
      type: "array",
      group: "sources",
      of: [defineArrayMember({ type: "citation" })],
    }),
    defineField({
      name: "primaryImage",
      title: "Primary image",
      type: "editorialImage",
      group: "media",
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      group: "media",
      of: [defineArrayMember({ type: "editorialImage" })],
    }),
    defineField({
      name: "relatedHistory",
      title: "Related history",
      type: "array",
      group: "related",
      of: [defineArrayMember({ type: "relatedHistoryItem" })],
    }),
    defineField({
      name: "relatedPodcastEpisodes",
      title: "Related podcast episodes",
      type: "array",
      group: "related",
      of: [defineArrayMember({ type: "relatedPodcastItem" })],
      description:
        "Editor-approved relationships only. Suggestions stay in review notes until accepted.",
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
          { title: "Duplicate candidate", value: "duplicateCandidate" },
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
        "Enables authenticated design preview only. This is not publication or factual approval.",
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
      description: "Do not enter contributor PII or confidential information.",
    }),
    defineField({
      name: "correctionHistory",
      title: "Correction history",
      type: "array",
      group: "review",
      of: [defineArrayMember({ type: "correction" })],
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
      title: "Historical date, newest",
      name: "historicalDateDesc",
      by: [
        { field: "historicalDate.start.year", direction: "desc" },
        { field: "historicalDate.start.month", direction: "desc" },
        { field: "historicalDate.start.day", direction: "desc" },
      ],
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
      day: "historicalDate.start.day",
      month: "historicalDate.start.month",
      year: "historicalDate.start.year",
      status: "workflowStatus",
      media: "primaryImage.asset",
    },
    prepare: ({ title, day, month, year, status, media }) => {
      const date = [month, day, year]
        .filter((part) => part !== undefined)
        .join("/");
      return {
        title: title || "Untitled history entry",
        subtitle: [date || "Date unknown", status].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});

export const documentTypes = [
  person,
  place,
  geographicRegion,
  topic,
  historicalEra,
  organization,
  source,
  historyEntry,
];
