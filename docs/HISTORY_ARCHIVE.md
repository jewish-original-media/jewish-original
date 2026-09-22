# History Archive and Discovery

Status: V1 public discovery interface on `feature/integration-homepage`.
Coordinate counts and unique-story scope through
`docs/HISTORY_V1_COMPLETION_LEDGER.md`. The workbook has 332 source rows and
**298 unique usable stories**. That is the V1 public archive after editorial
review. It is not 332 public stories, and it is not a permanent nine-story
subset.

Current live Sanity publications are **95** (the first packet plus the
approved r2 set). The sitemap revalidates hourly with that published-ready
set so newly released slugs are not frozen at deploy time.
Public queries still require a published document with
`workflowStatus == "ready"`. Drafts stay out of search, filters, counts,
related payloads, and Today matching. Discovery, pagination, and Today
matching are built and verified for the complete eligible unique set. The
homepage stays curated. This page is the public home of **On This Day in
Jewish History** and the broader Jewish Original historical archive.

## Information architecture

Public routes in this milestone:

| Route                                                           | Purpose                            | Indexed                  |
| --------------------------------------------------------------- | ---------------------------------- | ------------------------ |
| `/history`                                                      | Archive landing and discovery home | Yes                      |
| `/history/[slug]`                                               | Reviewed History article           | Yes, when published      |
| `/history?month=&day=`                                          | Civil-date browse                  | No; canonical `/history` |
| `/history?q=&topic=&place=&sort=&page=`                         | Search, filter, sort, pagination   | No; canonical `/history` |
| Legacy `era` / `region` / `person` / `organization` query links | Backward-compatible taxonomy view  | No; canonical `/history` |

No `/history/topic/[slug]`, `/history/era/[slug]`, or `/history/place/[slug]`
routes yet. Query parameters are enough while the public collection is small.
Dedicated taxonomy URLs can be added when a facet has a meaningful body of
reviewed stories.

Sitemap includes `/history` and published article slugs only.

Keyword search, autocomplete, filters, sort, and pagination are on
Integration Preview. Production `jewish-original.vercel.app` is still the
older History-only milestone (`milestone-1-sanity-history` @ `3539211`)
and does not include this discovery interface.

## Progressive disclosure

The landing is designed for the complete unique archive, including the
current 48 published stories and the remaining reviewed stories as they
are released.

- The hero gives search priority and offers a direct link to today’s civil
  month/day.
- Search, filtering, and sorting run against the full eligible collection
  before pagination.
- Search covers titles, excerpts, people, places, topics, eras, regions, and
  organizations already present on public summaries.
- Topic, place, and region appear only when two or more distinct published
  options exist, or when that filter is already active. Empty or single-value
  controls are not presented as useful. Geographic regions stay separate from
  specific places.
- Date, topic, place, sort, and page state live in the URL. Native GET
  navigation preserves browser Back and works without client JavaScript.
- Twelve results appear per page so a larger unique archive stays readable.
  Empty states never substitute unrelated stories.

## Today in Jewish History

History owns historical content matching. Jewish Today owns Jewish calendar
calculation. Do not duplicate Hebcal here.

Canonical matcher: `src/lib/history/on-this-day.ts`.

A public match requires all of the following:

- published Sanity document, not a draft
- `workflowStatus == "ready"`
- not `duplicateCandidate`
- `entryKind != "recurringObservance"`
- `historicalDate.precision == "day"`
- `historicalDate.calendarSystem == "gregorian"`
- start month and day equal the requested civil month and day

Until editorial review confirms a civil date, unpublished drafts retain
`calendarSystem: other` and must not match Today or date browse. After review
and publication, every unique eligible Gregorian day-precision story is part
of public matching. Recurring observances without a verified civil date stay
out of fixed-date matching.

“Today” is the civil Gregorian date in `America/New_York`, the same V1
definition used by Jewish Today. History does not compute Hebrew dates,
parashah, holidays, sunset, or location.

When no story matches today, that empty state is valid. Jewish Today links to
the archive instead of inventing a substitute.

## Browse by date

V1 is a month and day selector, not a 365-day calendar wall. Users submit a
GET form to `/history?month=4&day=29`. February 29 is browseable. Impossible
dates such as February 30 return an honest empty state.

Date browse uses the same Gregorian day-precision rules as Today in Jewish
History. Recurring observances are excluded from fixed-date matching.

Year browsing is deferred. Month/day browse and Today matching already
operate over the complete eligible unique set.

## Taxonomy discovery

Facets and counts are collected from eligible published History summaries,
not from duplicate source rows or unpublished drafts. Published records with
missing topic or place metadata remain discoverable in unfiltered results and
search. Topic, Place, and Region appear only when those published facets are
useful. Legacy taxonomy query parameters continue to resolve so old links do
not break. The same controls cover the complete unique archive as reviewed
records are published.

## Cards and images

`HistoryEntryCard` is the shared History card:

- `featured` for the archive landing
- `archive` for lists and date/taxonomy results
- `related` for the approved article template

Cards show date, title, excerpt, topics, and a geographic region when present.
Related places stay in the article sidebar. The date line uses a specific
event-location field only when that field is present. The first related place
is never treated as the event location. Dates with `calendarSystem: other` display as under review unless
an editor supplied `displayText`. A 16:9 image appears only when
`primaryImage` is rights-cleared. No-image cards are typographic. There is no
generic photograph and no empty image well.

## Search and sort

No Algolia or other paid search is needed for V1. Server-side in-memory search
operates on the complete published summary query, then combines exact facet
and Gregorian date filters. Lightweight autocomplete suggests up to six
published topics, people, places, or regions. Selecting a suggestion applies
that filter. Enter still submits the keyword search. The GET form works
without JavaScript. Historical newest/oldest sort uses
`historicalDate.start`. Recurring stories without a start year stay in the
unfiltered list and are not given a civil year; they sort before dated
stories. In the 48-story packet, unfiltered oldest-first therefore starts
with Yom HaAtzmaut and Yom HaZikaron, then the Alhambra Decree (1492).
`Janusz Korczak Is Born` (1878) is first only on
`/history?topic=holocaust&sort=historical-oldest`. **Recently updated** uses
Sanity `_updatedAt`, falling back to `_createdAt` only when no update
exists, so bulk import time is not presented as a new publication. It is
never confused with historical time. Year-only, Julian, and recurring
records remain in unfiltered results with honest labels. Only verified
Gregorian day-precision records match Today or date browse. Uncertain,
Julian, recurring, and partial records are also checked at their own
candidate month/day values, not only on an unrelated empty day.

## Motion

CSS-only entrance, underline, rule, and image-hover motion from the approved
History language. `prefers-reduced-motion` is respected. No motion library.

## Shared-file note

This milestone edits files that also exist on `feature/jewish-today`,
especially `docs/DECISIONS.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`,
`docs/DESIGN_SYSTEM.md`, `docs/HISTORY_MODEL.md`, `src/app/globals.css`,
`src/app/sitemap.ts`, and `package.json`. Convergence should be reviewed
carefully. Do not merge the branches in this milestone.

Jewish Today currently has its own On This Day GROQ copy. After merge, it
should import `matchesOnThisDayHistory` from `src/lib/history/on-this-day.ts`
and query through the History published client. The private development
dataset requires the server read token; a public CDN query without a token
will not see published History.
