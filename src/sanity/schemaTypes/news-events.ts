import { defineArrayMember, defineField, defineType } from "sanity";

const newsDesks = [
  { title: "Jewish World", value: "jewish-world" },
  { title: "Israel", value: "israel" },
  { title: "Culture", value: "culture" },
  { title: "Heritage", value: "heritage" },
];

export const ingestSource = defineType({
  name: "ingestSource",
  title: "Ingest source",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Desk",
      type: "string",
      options: { list: ["news", "events"] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sourceType",
      title: "Source type",
      type: "string",
      options: { list: ["rss", "ics", "api", "manual"] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "feedUrl", title: "Feed or ICS URL", type: "url" }),
    defineField({
      name: "canonicalSite",
      title: "Canonical site",
      type: "url",
    }),
    defineField({
      name: "attributionLabel",
      title: "Attribution label",
      type: "string",
    }),
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "defaultDesk",
      title: "Default News desk",
      type: "string",
      options: { list: newsDesks },
      hidden: ({ document }) => document?.kind !== "news",
    }),
    defineField({ name: "perRunCap", title: "Per-run cap", type: "number" }),
    defineField({ name: "dailyCap", title: "Daily cap", type: "number" }),
    defineField({
      name: "hostAllowlist",
      title: "Host allowlist",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "notes",
      title: "Ingestion notes",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "lastSuccessAt",
      title: "Last success",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "lastError",
      title: "Last error",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "lastFetchedCount",
      title: "Last fetched count",
      type: "number",
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: "name", kind: "kind", enabled: "enabled" },
    prepare: ({ title, kind, enabled }) => ({
      title: title || "Source",
      subtitle: `${kind || "unknown"}${enabled === false ? " · disabled" : ""}`,
    }),
  },
});

export const curatedNewsItem = defineType({
  name: "curatedNewsItem",
  title: "Curated news item",
  type: "document",
  fields: [
    defineField({
      name: "publisherName",
      title: "Publisher",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publisher",
      title: "Publisher reference",
      type: "reference",
      to: [{ type: "organization" }, { type: "source" }],
    }),
    defineField({
      name: "ingestSource",
      title: "Ingest source",
      type: "reference",
      to: [{ type: "ingestSource" }],
    }),
    defineField({
      name: "originalHeadline",
      title: "Original headline",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sourceUrl",
      title: "Canonical source URL",
      type: "url",
      validation: (Rule) => Rule.required().uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "normalizedUrl",
      title: "Normalized URL",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "sourcePublishedAt",
      title: "Source publication datetime",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "jomContext",
      title: "JOM context",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().min(40).max(320),
    }),
    defineField({
      name: "desk",
      title: "Desk",
      type: "string",
      options: { list: newsDesks },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "topics",
      title: "Topics",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "published",
      options: {
        list: [
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
      },
    }),
    defineField({ name: "expiresAt", title: "Expires at", type: "datetime" }),
    defineField({
      name: "featured",
      title: "Featured override",
      type: "boolean",
    }),
    defineField({
      name: "provenance",
      title: "Provenance",
      type: "object",
      fields: [
        defineField({ name: "sourceId", type: "string" }),
        defineField({ name: "feedUrl", type: "url" }),
        defineField({ name: "fetchedAt", type: "datetime" }),
      ],
    }),
    defineField({
      name: "ingest",
      title: "Ingest metadata",
      type: "object",
      hidden: true,
      fields: [
        defineField({ name: "runId", type: "string" }),
        defineField({ name: "model", type: "string" }),
        defineField({ name: "relevance", type: "number" }),
        defineField({ name: "deskConfidence", type: "number" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "originalHeadline",
      publisher: "publisherName",
      desk: "desk",
    },
    prepare: ({ title, publisher, desk }) => ({
      title: title || "News item",
      subtitle: [publisher, desk].filter(Boolean).join(" · "),
    }),
  },
});

export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "organizer",
      title: "Organizer",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "organizerRef",
      title: "Organizer reference",
      type: "reference",
      to: [{ type: "organization" }],
    }),
    defineField({
      name: "eventUrl",
      title: "Canonical source URL",
      type: "url",
      validation: (Rule) => Rule.required().uri({ scheme: ["https"] }),
    }),
    defineField({ name: "sourceUid", title: "Source UID", type: "string" }),
    defineField({
      name: "startAt",
      title: "Start",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "endAt", title: "End", type: "datetime" }),
    defineField({
      name: "timezone",
      title: "IANA timezone",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "attendanceMode",
      title: "Attendance mode",
      type: "string",
      options: { list: ["online", "in-person", "hybrid"] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "venueName", title: "Venue", type: "string" }),
    defineField({ name: "city", title: "City", type: "string" }),
    defineField({ name: "region", title: "Region / state", type: "string" }),
    defineField({ name: "country", title: "Country", type: "string" }),
    defineField({
      name: "geoBucket",
      title: "Geography",
      type: "string",
      options: {
        list: ["online", "israel", "united-states", "international"],
      },
    }),
    defineField({ name: "onlineUrl", title: "Online URL", type: "url" }),
    defineField({
      name: "jomContext",
      title: "JOM context",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "topics",
      title: "Topics",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "eventStatus",
      title: "Calendar status",
      type: "string",
      initialValue: "scheduled",
      options: { list: ["scheduled", "cancelled", "postponed"] },
    }),
    defineField({
      name: "status",
      title: "Publication status",
      type: "string",
      initialValue: "published",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
      },
    }),
    defineField({ name: "expiresAt", title: "Expires at", type: "datetime" }),
    defineField({
      name: "ingestSource",
      title: "Ingest source",
      type: "reference",
      to: [{ type: "ingestSource" }],
    }),
    defineField({
      name: "provenance",
      title: "Provenance",
      type: "object",
      fields: [
        defineField({ name: "sourceId", type: "string" }),
        defineField({ name: "feedUrl", type: "url" }),
        defineField({ name: "fetchedAt", type: "datetime" }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", organizer: "organizer", startAt: "startAt" },
    prepare: ({ title, organizer, startAt }) => ({
      title: title || "Event",
      subtitle: [organizer, startAt].filter(Boolean).join(" · "),
    }),
  },
});

export const ingestReceipt = defineType({
  name: "ingestReceipt",
  title: "Ingest receipt",
  type: "document",
  fields: [
    defineField({
      name: "kind",
      type: "string",
      options: { list: ["news", "events"] },
    }),
    defineField({ name: "sourceId", type: "string" }),
    defineField({ name: "key", type: "string" }),
    defineField({ name: "outcome", type: "string" }),
    defineField({ name: "reason", type: "string" }),
    defineField({ name: "expiresAt", type: "datetime" }),
  ],
});

export const ingestException = defineType({
  name: "ingestException",
  title: "Ingest exception",
  type: "document",
  fields: [
    defineField({
      name: "kind",
      type: "string",
      options: { list: ["news", "events"] },
    }),
    defineField({ name: "sourceId", type: "string" }),
    defineField({ name: "headline", type: "string" }),
    defineField({ name: "url", type: "url" }),
    defineField({ name: "reason", type: "string" }),
    defineField({
      name: "status",
      type: "string",
      initialValue: "open",
      options: { list: ["open", "archived"] },
    }),
    defineField({ name: "expiresAt", type: "datetime" }),
  ],
  preview: {
    select: { title: "headline", reason: "reason", kind: "kind" },
    prepare: ({ title, reason, kind }) => ({
      title: title || "Exception",
      subtitle: [kind, reason].filter(Boolean).join(" · "),
    }),
  },
});

export const ingestRun = defineType({
  name: "ingestRun",
  title: "Ingest run",
  type: "document",
  fields: [
    defineField({
      name: "job",
      type: "string",
      options: { list: ["news", "events"] },
    }),
    defineField({ name: "runId", type: "string" }),
    defineField({ name: "dryRun", type: "boolean" }),
    defineField({ name: "aiReady", type: "boolean" }),
    defineField({ name: "fetched", type: "number" }),
    defineField({ name: "autoPublished", type: "number" }),
    defineField({ name: "exceptions", type: "number" }),
    defineField({ name: "duplicates", type: "number" }),
    defineField({ name: "aiCalls", type: "number" }),
    defineField({ name: "estimatedUsd", type: "number" }),
    defineField({ name: "finishedAt", type: "datetime" }),
  ],
  preview: {
    select: { job: "job", runId: "runId", autoPublished: "autoPublished" },
    prepare: ({ job, runId, autoPublished }) => ({
      title: `${job || "ingest"} ${runId || ""}`.trim(),
      subtitle: `published ${autoPublished ?? 0}`,
    }),
  },
});

export const newsEventDocumentTypes = [
  ingestSource,
  curatedNewsItem,
  event,
  ingestReceipt,
  ingestException,
  ingestRun,
];
