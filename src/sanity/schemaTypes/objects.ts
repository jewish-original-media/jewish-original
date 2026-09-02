import { defineArrayMember, defineField, defineType } from "sanity";

const sourceKinds = [
  { title: "Book", value: "book" },
  { title: "Journal", value: "journal" },
  { title: "Newspaper", value: "newspaper" },
  { title: "Archive", value: "archive" },
  { title: "Website", value: "website" },
  { title: "Oral history", value: "oralHistory" },
  { title: "Other", value: "other" },
];

export const datePart = defineType({
  name: "datePart",
  title: "Date",
  type: "object",
  fields: [
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      description:
        "Use astronomical numbering for BCE dates: 1 BCE is year 0, 2 BCE is -1.",
      validation: (Rule) => Rule.integer(),
    }),
    defineField({
      name: "month",
      title: "Month",
      type: "number",
      validation: (Rule) => Rule.integer().min(1).max(12),
    }),
    defineField({
      name: "day",
      title: "Day",
      type: "number",
      validation: (Rule) => Rule.integer().min(1).max(31),
    }),
  ],
  options: { columns: 3 },
});

export const historicalDate = defineType({
  name: "historicalDate",
  title: "Historical date",
  type: "object",
  fields: [
    defineField({
      name: "start",
      title: "Date",
      type: "datePart",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const precision = (
            context.parent as { precision?: string } | undefined
          )?.precision;
          if (precision === "unknown") return true;
          return (value as { year?: number } | undefined)?.year === undefined
            ? "Enter at least a year, or choose Unknown precision."
            : true;
        }),
    }),
    defineField({
      name: "precision",
      title: "Precision",
      type: "string",
      initialValue: "day",
      options: {
        layout: "radio",
        list: [
          { title: "Exact day", value: "day" },
          { title: "Month", value: "month" },
          { title: "Year", value: "year" },
          { title: "Date range", value: "range" },
          { title: "Unknown", value: "unknown" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "end",
      title: "End date",
      type: "datePart",
      hidden: ({ parent }) => parent?.precision !== "range",
    }),
    defineField({
      name: "qualifier",
      title: "Qualifier",
      type: "string",
      initialValue: "exact",
      options: {
        list: [
          { title: "Exact", value: "exact" },
          { title: "Circa", value: "circa" },
          { title: "Before", value: "before" },
          { title: "After", value: "after" },
          { title: "Traditional date", value: "traditional" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "calendarSystem",
      title: "Calendar system",
      type: "string",
      initialValue: "gregorian",
      options: {
        list: [
          { title: "Gregorian", value: "gregorian" },
          { title: "Julian", value: "julian" },
          { title: "Hebrew", value: "hebrew" },
          { title: "Other or uncertain", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "displayText",
      title: "Custom display text",
      type: "string",
      description:
        "Use only when the structured fields cannot safely express the date.",
    }),
    defineField({
      name: "sourceValue",
      title: "Original source value",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "conversionNote",
      title: "Conversion or interpretation note",
      type: "text",
      rows: 3,
    }),
  ],
});

export const hebrewDate = defineType({
  name: "hebrewDate",
  title: "Hebrew date context",
  type: "object",
  fields: [
    defineField({ name: "day", title: "Day", type: "number" }),
    defineField({ name: "month", title: "Month", type: "string" }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({
      name: "precision",
      title: "Precision",
      type: "string",
      options: {
        list: [
          { title: "Day", value: "day" },
          { title: "Month", value: "month" },
          { title: "Year", value: "year" },
          { title: "Unknown", value: "unknown" },
        ],
      },
    }),
    defineField({ name: "displayText", title: "Display text", type: "string" }),
    defineField({
      name: "basis",
      title: "Basis",
      type: "string",
      options: {
        list: [
          { title: "Original source", value: "original" },
          { title: "Traditional association", value: "traditional" },
          { title: "Verified conversion", value: "verifiedConversion" },
        ],
      },
    }),
  ],
});

export const observanceRule = defineType({
  name: "observanceRule",
  title: "Recurring observance",
  type: "object",
  fields: [
    defineField({
      name: "observanceKey",
      title: "Stable observance key",
      type: "string",
      description:
        "Stable editorial identifier used to match a future calendar provider, for example yom-hazikaron.",
    }),
    defineField({
      name: "calendarSystem",
      title: "Calendar",
      type: "string",
      options: {
        list: [
          { title: "Hebrew", value: "hebrew" },
          { title: "Gregorian", value: "gregorian" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "nominalHebrewMonth",
      title: "Nominal Hebrew month",
      type: "string",
      hidden: ({ parent }) => parent?.calendarSystem !== "hebrew",
      options: {
        list: [
          { title: "Nisan", value: "Nisan" },
          { title: "Iyyar", value: "Iyyar" },
          { title: "Sivan", value: "Sivan" },
          { title: "Tammuz", value: "Tammuz" },
          { title: "Av", value: "Av" },
          { title: "Elul", value: "Elul" },
          { title: "Tishrei", value: "Tishrei" },
          { title: "Cheshvan", value: "Cheshvan" },
          { title: "Kislev", value: "Kislev" },
          { title: "Tevet", value: "Tevet" },
          { title: "Shevat", value: "Shevat" },
          { title: "Adar", value: "Adar" },
          { title: "Adar I", value: "Adar1" },
          { title: "Adar II", value: "Adar2" },
        ],
      },
    }),
    defineField({
      name: "nominalHebrewDay",
      title: "Nominal Hebrew day",
      type: "number",
      hidden: ({ parent }) => parent?.calendarSystem !== "hebrew",
      validation: (Rule) => Rule.integer().min(1).max(30),
    }),
    defineField({
      name: "adjustmentPolicy",
      title: "Observed-date adjustments",
      type: "string",
      options: {
        list: [
          { title: "No adjustment", value: "none" },
          {
            title: "Use a verified calendar provider",
            value: "externalProvider",
          },
          { title: "Editorially maintained", value: "editorial" },
        ],
      },
      description:
        "Use a provider for observances whose legal or calendar rules can move the observed date.",
    }),
    defineField({
      name: "calculationProvider",
      title: "Future calculation provider",
      type: "string",
      hidden: ({ parent }) => parent?.adjustmentPolicy !== "externalProvider",
      options: {
        list: [
          { title: "Hebcal", value: "hebcal" },
          { title: "Other verified provider", value: "other" },
        ],
      },
      description:
        "Configuration only. No provider integration is active in this milestone.",
    }),
    defineField({
      name: "providerEventId",
      title: "Provider event identifier",
      type: "string",
      hidden: ({ parent }) => parent?.adjustmentPolicy !== "externalProvider",
    }),
    defineField({
      name: "beginsAtSunset",
      title: "Begins at sunset",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "rule",
      title: "Human-readable rule",
      type: "string",
      description:
        "Editorial explanation only; code must not parse this text to calculate dates.",
    }),
    defineField({
      name: "note",
      title: "Editorial note",
      type: "text",
      rows: 3,
    }),
  ],
});

export const citation = defineType({
  name: "citation",
  title: "Citation",
  type: "object",
  fields: [
    defineField({
      name: "source",
      title: "Reusable source",
      type: "reference",
      to: [{ type: "source" }],
    }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "author",
      title: "Author or organization",
      type: "string",
    }),
    defineField({
      name: "publication",
      title: "Publication or collection",
      type: "string",
    }),
    defineField({
      name: "kind",
      title: "Source type",
      type: "string",
      options: { list: sourceKinds },
    }),
    defineField({
      name: "url",
      title: "Source URL",
      type: "url",
      validation: (Rule) =>
        Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "bibliographicDetail",
      title: "Bibliographic detail",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "locator",
      title: "Page, chapter, or locator",
      type: "string",
    }),
    defineField({
      name: "publicationDate",
      title: "Publication date",
      type: "date",
    }),
    defineField({ name: "accessedAt", title: "Accessed", type: "date" }),
    defineField({ name: "note", title: "Use note", type: "text", rows: 2 }),
    defineField({
      name: "quotation",
      title: "Relevant quotation",
      type: "text",
    }),
    defineField({
      name: "verificationStatus",
      title: "Verification",
      type: "string",
      initialValue: "unreviewed",
      options: {
        list: [
          { title: "Unreviewed", value: "unreviewed" },
          { title: "Needs verification", value: "needsVerification" },
          { title: "Verified", value: "verified" },
          { title: "Rejected", value: "rejected" },
        ],
      },
    }),
  ],
  preview: {
    select: { sourceTitle: "source.name", title: "title", url: "url" },
    prepare: ({ sourceTitle, title, url }) => ({
      title: sourceTitle || title || "Untitled citation",
      subtitle: url,
    }),
  },
});

export const editorialImage = defineType({
  name: "editorialImage",
  title: "Editorial image",
  type: "object",
  fields: [
    defineField({
      name: "asset",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      description: "Describe the image’s content and purpose.",
    }),
    defineField({ name: "caption", title: "Caption", type: "text", rows: 2 }),
    defineField({ name: "creator", title: "Creator", type: "string" }),
    defineField({
      name: "creditLine",
      title: "Required credit",
      type: "string",
    }),
    defineField({ name: "sourcePageUrl", title: "Source page", type: "url" }),
    defineField({
      name: "originalFileName",
      title: "Original file name",
      type: "string",
    }),
    defineField({
      name: "sourceArchiveId",
      title: "Source archive ID",
      type: "string",
    }),
    defineField({
      name: "rightsHolder",
      title: "Rights holder",
      type: "string",
    }),
    defineField({ name: "license", title: "License", type: "string" }),
    defineField({ name: "licenseUrl", title: "License URL", type: "url" }),
    defineField({
      name: "rightsExpiration",
      title: "Rights expiration",
      type: "date",
    }),
    defineField({
      name: "permittedUses",
      title: "Permitted uses",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Website", value: "website" },
          { title: "Social media", value: "social" },
          { title: "Email", value: "email" },
          { title: "Print", value: "print" },
        ],
      },
    }),
    defineField({
      name: "cropRestrictions",
      title: "Crop restrictions",
      type: "string",
    }),
    defineField({
      name: "sensitivityNote",
      title: "Sensitivity note",
      type: "text",
    }),
    defineField({
      name: "rightsStatus",
      title: "Rights status",
      type: "string",
      initialValue: "unknown",
      options: {
        list: [
          { title: "Unknown", value: "unknown" },
          { title: "Researching", value: "researching" },
          { title: "Permission required", value: "permissionRequired" },
          { title: "Cleared", value: "cleared" },
          { title: "Public domain", value: "publicDomain" },
          { title: "Licensed", value: "licensed" },
          { title: "Rejected", value: "rejected" },
        ],
      },
    }),
    defineField({ name: "reviewedBy", title: "Reviewed by", type: "string" }),
    defineField({ name: "reviewedAt", title: "Reviewed on", type: "date" }),
    defineField({
      name: "evidenceNote",
      title: "Rights evidence",
      type: "text",
    }),
  ],
});

export const seo = defineType({
  name: "seo",
  title: "Search and social",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "SEO title",
      type: "string",
      validation: (Rule) =>
        Rule.max(60).warning("Aim for 60 characters or fewer."),
    }),
    defineField({
      name: "description",
      title: "Meta description",
      type: "text",
      rows: 3,
      validation: (Rule) =>
        Rule.max(160).warning("Aim for 160 characters or fewer."),
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical override",
      type: "url",
    }),
    defineField({
      name: "noIndex",
      title: "Prevent indexing",
      type: "boolean",
    }),
    defineField({
      name: "openGraphTitle",
      title: "Social title",
      type: "string",
    }),
    defineField({
      name: "openGraphDescription",
      title: "Social description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "socialImage",
      title: "Social image",
      type: "editorialImage",
    }),
  ],
});

export const reviewFlag = defineType({
  name: "reviewFlag",
  title: "Review flag",
  type: "object",
  fields: [
    defineField({
      name: "code",
      title: "Code",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "field", title: "Affected field", type: "string" }),
    defineField({
      name: "severity",
      title: "Severity",
      type: "string",
      initialValue: "warning",
      options: {
        list: [
          { title: "Information", value: "info" },
          { title: "Warning", value: "warning" },
          { title: "Blocking", value: "blocking" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "evidence",
      title: "Evidence",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "detector",
      title: "Raised by",
      type: "string",
      options: {
        list: [
          { title: "Importer", value: "importer" },
          { title: "Automated review", value: "automation" },
          { title: "Editor", value: "editor" },
        ],
      },
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "open",
      options: {
        list: [
          { title: "Open", value: "open" },
          { title: "Resolved", value: "resolved" },
          { title: "Dismissed with reason", value: "dismissed" },
        ],
      },
    }),
    defineField({
      name: "resolution",
      title: "Resolution",
      type: "text",
      rows: 3,
    }),
    defineField({ name: "reviewedBy", title: "Reviewed by", type: "string" }),
    defineField({ name: "reviewedAt", title: "Reviewed on", type: "datetime" }),
  ],
  preview: {
    select: { code: "code", severity: "severity", status: "status" },
    prepare: ({ code, severity, status }) => ({
      title: code || "Review flag",
      subtitle: `${severity || "warning"} · ${status || "open"}`,
    }),
  },
});

export const correction = defineType({
  name: "correction",
  title: "Correction",
  type: "object",
  fields: [
    defineField({
      name: "recordedAt",
      title: "Recorded at",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "What changed",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "reason", title: "Reason", type: "text" }),
    defineField({ name: "recordedBy", title: "Recorded by", type: "string" }),
    defineField({
      name: "publicNote",
      title: "Public correction note",
      type: "text",
    }),
  ],
});

export const provenance = defineType({
  name: "provenance",
  title: "Import provenance",
  type: "object",
  fields: [
    defineField({
      name: "originalImportIdentifier",
      title: "Import identifier",
      type: "string",
    }),
    defineField({
      name: "identifierKind",
      title: "Identifier kind",
      type: "string",
    }),
    defineField({
      name: "sourceArchiveId",
      title: "Source archive",
      type: "string",
    }),
    defineField({
      name: "sourceFileChecksum",
      title: "Source file checksum",
      type: "string",
    }),
    defineField({ name: "sourceSheet", title: "Source sheet", type: "string" }),
    defineField({ name: "sourceRow", title: "Source row", type: "number" }),
    defineField({
      name: "legacyItemId",
      title: "Legacy item ID",
      type: "string",
    }),
    defineField({
      name: "legacyCollectionId",
      title: "Legacy collection ID",
      type: "string",
    }),
    defineField({
      name: "originalSlug",
      title: "Original slug",
      type: "string",
    }),
    defineField({
      name: "duplicateClusterId",
      title: "Duplicate cluster",
      type: "string",
    }),
    defineField({
      name: "duplicateClusterMembers",
      title: "Duplicate cluster source IDs",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "sourceTopicValues",
      title: "Original topic values",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "sourceRegionValues",
      title: "Original region values",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "sourceBody",
      title: "Original body",
      type: "text",
      description:
        "Read-only source wording retained for import reconciliation. Never place contributor PII here.",
    }),
    defineField({
      name: "sourceCreatedAt",
      title: "Source created",
      type: "datetime",
    }),
    defineField({
      name: "sourceUpdatedAt",
      title: "Source updated",
      type: "datetime",
    }),
    defineField({
      name: "sourcePublishedAt",
      title: "Source published",
      type: "datetime",
    }),
    defineField({ name: "importRunId", title: "Import run", type: "string" }),
    defineField({
      name: "importerVersion",
      title: "Importer version",
      type: "string",
    }),
    defineField({
      name: "rawRecordChecksum",
      title: "Raw record checksum",
      type: "string",
    }),
    defineField({
      name: "importDocumentChecksum",
      title: "Imported document checksum",
      type: "string",
    }),
    defineField({
      name: "sourceBodyChecksum",
      title: "Source body checksum",
      type: "string",
    }),
    defineField({
      name: "bodyConversionVersion",
      title: "Body conversion version",
      type: "string",
    }),
    defineField({
      name: "bodyConversionSeparators",
      title: "Original paragraph separators",
      type: "array",
      of: [defineArrayMember({ type: "text" })],
    }),
    defineField({
      name: "initialEditorialBodyChecksum",
      title: "Initial editorial body checksum",
      type: "string",
    }),
    defineField({
      name: "sourceBodyParagraphCount",
      title: "Imported paragraph count",
      type: "number",
    }),
    defineField({ name: "importedAt", title: "Imported at", type: "datetime" }),
  ],
});

export const relatedHistoryItem = defineType({
  name: "relatedHistoryItem",
  title: "Related history entry",
  type: "object",
  fields: [
    defineField({
      name: "entry",
      title: "Entry",
      type: "reference",
      to: [{ type: "historyEntry" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "relationType",
      title: "Relationship",
      type: "string",
      options: {
        list: [
          { title: "Related", value: "related" },
          { title: "Earlier event", value: "earlier" },
          { title: "Later event", value: "later" },
          { title: "Part of the same story", value: "sameStory" },
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

export const objectTypes = [
  datePart,
  historicalDate,
  hebrewDate,
  observanceRule,
  citation,
  editorialImage,
  seo,
  reviewFlag,
  correction,
  provenance,
  relatedHistoryItem,
];
