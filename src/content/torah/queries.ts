import { defineQuery } from "next-sanity";

const citationProjection = `{
  title,
  author,
  publication,
  kind,
  url,
  locator,
  quotation
}`;

export const torahPortionBriefQuery = defineQuery(`*[
  _type == "torahPortionBrief" &&
  !(_id in path("drafts.**")) &&
  status == "published" &&
  canonicalTitle == $canonicalTitle &&
  observedOn == $observedOn &&
  (!defined($hebcalSourceHref) || hebcalSourceHref == $hebcalSourceHref)
] | order(_updatedAt desc)[0]{
  canonicalTitle,
  observedOn,
  hebcalSourceHref,
  synopsis,
  "synopsisCitations": coalesce(
    synopsisCitations[verificationStatus == "verified" && defined(url)]${citationProjection},
    []
  ),
  "teaching": select(
    defined(teaching.quotation) &&
    teaching.citation.verificationStatus == "verified" &&
    defined(teaching.citation.url) => {
      "tradition": teaching.tradition,
      "quotation": teaching.quotation,
      "reflection": teaching.reflection,
      "citation": teaching.citation${citationProjection}
    }
  )
}`);
