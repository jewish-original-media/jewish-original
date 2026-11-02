import { defineArrayMember, defineField, defineType } from "sanity";

function isVerifiedCitation(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    "verificationStatus" in value &&
    value.verificationStatus === "verified" &&
    "url" in value &&
    typeof value.url === "string" &&
    value.url.startsWith("https://")
  );
}

export const torahPortionBrief = defineType({
  name: "torahPortionBrief",
  title: "Torah portion brief",
  type: "document",
  fields: [
    defineField({
      name: "canonicalTitle",
      title: "Canonical portion title",
      type: "string",
      description:
        "Use Hebcal's English portion title so the site can match this brief reliably.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "observedOn",
      title: "Observed on",
      type: "date",
      description: "The civil date on which this reading is observed.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "hebcalSourceHref",
      title: "Hebcal source URL",
      type: "url",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["https"],
        }),
    }),
    defineField({
      name: "status",
      title: "Editorial status",
      type: "string",
      initialValue: "draft",
      options: {
        layout: "radio",
        list: [
          { title: "Draft", value: "draft" },
          { title: "In review", value: "review" },
          { title: "Published", value: "published" },
        ],
      },
      validation: (rule) =>
        rule.required().custom((status, context) => {
          if (status !== "published") return true;

          const document = context.document;
          const synopsisCitations = Array.isArray(document?.synopsisCitations)
            ? document.synopsisCitations
            : [];
          const teaching =
            typeof document?.teaching === "object" && document.teaching !== null
              ? document.teaching
              : undefined;

          if (!synopsisCitations.some(isVerifiedCitation)) {
            return "Published briefs require at least one verified synopsis citation with an HTTPS source link.";
          }

          if (
            teaching &&
            "quotation" in teaching &&
            teaching.quotation &&
            (!("citation" in teaching) ||
              !isVerifiedCitation(teaching.citation))
          ) {
            return "A published teaching quotation requires a verified citation with an HTTPS source link.";
          }

          return true;
        }),
    }),
    defineField({
      name: "synopsis",
      title: "Synopsis",
      type: "text",
      rows: 5,
      description:
        "A concise, original synopsis. Do not paste copyrighted commentary.",
      validation: (rule) => rule.required().min(80).max(900),
    }),
    defineField({
      name: "synopsisCitations",
      title: "Synopsis citations",
      type: "array",
      of: [defineArrayMember({ type: "citation" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "teaching",
      title: "Optional teaching",
      type: "object",
      fields: [
        defineField({
          name: "tradition",
          title: "Tradition or source type",
          type: "string",
          description:
            "For example: Torah, Mishnah, Midrash, or later commentary.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "quotation",
          title: "Exact quotation",
          type: "text",
          rows: 4,
          validation: (rule) => rule.required().max(700),
        }),
        defineField({
          name: "reflection",
          title: "Jewish Original reflection",
          type: "text",
          rows: 4,
          description:
            "Optional original teaching that clearly remains distinct from the source quotation.",
          validation: (rule) => rule.max(900),
        }),
        defineField({
          name: "citation",
          title: "Quotation citation",
          type: "citation",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Observed date, newest",
      name: "observedOnDesc",
      by: [{ field: "observedOn", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "canonicalTitle",
      observedOn: "observedOn",
      status: "status",
    },
    prepare({ title, observedOn, status }) {
      return {
        title: title || "Untitled Torah portion",
        subtitle: [observedOn, status].filter(Boolean).join(" · "),
      };
    },
  },
});
