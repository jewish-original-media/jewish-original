import { defineQuery } from "next-sanity";

const publicVisibility =
  '!(_id in path("drafts.**")) && workflowStatus == "ready"';
const previewVisibility =
  'publicTestCandidate == true && workflowStatus != "duplicateCandidate"';

const referenceProjection = `{
  "name": name,
  "slug": slug.current
}`;

const dateProjection = `{
  start,
  end,
  precision,
  qualifier,
  calendarSystem,
  displayText
}`;

const imageProjection = `"primaryImage": select(
  primaryImage.rightsStatus in ["cleared", "publicDomain", "licensed"] &&
  defined(primaryImage.asset) &&
  defined(primaryImage.alt) => {
    alt,
    caption,
    visualKind,
    creator,
    creditLine,
    rightsStatus,
    sourcePageUrl,
    "asset": primaryImage.asset->{
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
  entryKind,
  "historicalDate": historicalDate ${dateProjection},
  observanceRule,
  "topics": coalesce(topics[]->${referenceProjection}, []),
  "people": coalesce(people[]->${referenceProjection}, []),
  "places": coalesce(places[]->${referenceProjection}, []),
  "eras": coalesce(eras[]->${referenceProjection}, []),
  "organizations": coalesce(organizations[]->${referenceProjection}, []),
  "geographicRegions": coalesce(geographicRegions[]->${referenceProjection}, []),
  ${imageProjection}
}`;

const filterExpression = `(
  !defined($filterType) ||
  ($filterType == "topic" && $filterSlug in topics[]->slug.current) ||
  ($filterType == "era" && $filterSlug in eras[]->slug.current) ||
  ($filterType == "place" && $filterSlug in places[]->slug.current) ||
  ($filterType == "region" && $filterSlug in geographicRegions[]->slug.current) ||
  ($filterType == "person" && $filterSlug in people[]->slug.current) ||
  ($filterType == "organization" && $filterSlug in organizations[]->slug.current)
)`;

const gregorianDayMatch = `(
  entryKind != "recurringObservance" &&
  historicalDate.precision == "day" &&
  historicalDate.calendarSystem == "gregorian"
)`;

const dateFilterExpression = `(
  !defined($month) || (
    ${gregorianDayMatch} &&
    historicalDate.start.month == $month &&
    (!defined($day) || historicalDate.start.day == $day)
  )
)`;

export const historyIndexQuery = defineQuery(`*[
  _type == "historyEntry" &&
  defined(slug.current) &&
  select($preview => ${previewVisibility}, ${publicVisibility}) &&
  ${filterExpression} &&
  ${dateFilterExpression}
] | order(historicalDate.start.year desc, historicalDate.start.month desc, historicalDate.start.day desc) ${summaryProjection}`);

export const historyOnThisDayQuery = defineQuery(`*[
  _type == "historyEntry" &&
  defined(slug.current) &&
  select($preview => ${previewVisibility}, ${publicVisibility}) &&
  ${gregorianDayMatch} &&
  historicalDate.start.month == $month &&
  historicalDate.start.day == $day
] | order(historicalDate.start.year desc) ${summaryProjection}`);

export const historySlugsQuery = defineQuery(`*[
  _type == "historyEntry" &&
  ${publicVisibility} &&
  defined(slug.current)
]{"slug": slug.current}`);

export const historyEntryQuery = defineQuery(`*[
  _type == "historyEntry" &&
  slug.current == $slug &&
  select($preview => ${previewVisibility}, ${publicVisibility})
][0]{
  ${summaryProjection.slice(1, -1)},
  "body": coalesce(body[], []),
  hebrewDate,
  "contentWarnings": coalesce(contentWarnings, []),
  contentWarningNote,
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
    "entry": entry->${summaryProjection}
  }, []),
  seo,
  "workflowStatus": select($preview => workflowStatus),
  _updatedAt
}`);

export const draftCandidateSlugQuery = defineQuery(`*[
  _type == "historyEntry" &&
  publicTestCandidate == true &&
  slug.current == $slug
][0]{"slug": slug.current}`);

export const historyFilterLabelQuery = defineQuery(`*[
  _type in ["topic", "historicalEra", "place", "geographicRegion", "person", "organization"] &&
  slug.current == $slug &&
  (
    $filterType == "topic" && _type == "topic" ||
    $filterType == "era" && _type == "historicalEra" ||
    $filterType == "place" && _type == "place" ||
    $filterType == "region" && _type == "geographicRegion" ||
    $filterType == "person" && _type == "person" ||
    $filterType == "organization" && _type == "organization"
  )
][0]{"name": name, "slug": slug.current}`);
