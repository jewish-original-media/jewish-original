# History Archive and Discovery

Status: V1 public archive on `milestone-1-sanity-history`. Five History
articles are published: `US Liberates Dachau`, `Joop Westerweel Is
Murdered at Vught`, `Bialystok Ghetto Is Sealed`, `Samuel Willenberg Dies`,
and `Anti-Jewish Riots Break Out in Tripoli, Libya`. Remaining first-20
drafts stay unpublished. This page
is the public home of **On This Day in Jewish History** and the broader
Jewish Original historical archive.

## Information architecture

Public routes in this milestone:

| Route                                                                      | Purpose                            | Indexed                  |
| -------------------------------------------------------------------------- | ---------------------------------- | ------------------------ |
| `/history`                                                                 | Archive landing and discovery home | Yes                      |
| `/history/[slug]`                                                          | Reviewed History article           | Yes, when published      |
| `/history?month=&day=`                                                     | Civil-date browse                  | No; canonical `/history` |
| `/history?topic=` / `era` / `place` / `region` / `person` / `organization` | Taxonomy browse                    | No; canonical `/history` |

No `/history/topic/[slug]`, `/history/era/[slug]`, or `/history/place/[slug]`
routes yet. Query parameters are enough while the public collection is small.
Dedicated taxonomy URLs can be added when a facet has a meaningful body of
reviewed stories.

Sitemap includes `/history` and published article slugs only.

## Progressive disclosure

The landing is designed for one published story and for hundreds later.

- The hero names the product even when today has no matching story.
- **Today in Jewish History** appears only when a published Gregorian
  month/day match exists. It is omitted rather than filled with invented copy.
- **From the archive** features the newest published story. That story is not
  repeated in a second list until more published entries exist.
- **Browse the archive** offers date lookup plus taxonomy links derived from
  published entries only.
- People and Organizations stay hidden until a published story actually
  references them.

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

“Today” is the civil Gregorian date in `America/New_York`, the same V1
definition used by Jewish Today. History does not compute Hebrew dates,
parashah, holidays, sunset, or location.

When no story matches today, the archive does not invent one.

## Browse by date

V1 is a month and day selector, not a 365-day calendar wall. Users submit a
GET form to `/history?month=4&day=29`. February 29 is browseable. Impossible
dates such as February 30 return an honest empty state.

Date browse uses the same Gregorian day-precision rules as Today in Jewish
History. Recurring observances are excluded from fixed-date matching.

Year browsing is deferred until the published collection is large enough to
make a year axis meaningful.

## Taxonomy discovery

Facets are collected from published History summaries, not from the full
Sanity taxonomy catalog. Empty groups do not render. The reusable pattern is
`HistoryTaxonomyNav` plus query-parameter filters.

## Cards and images

`HistoryEntryCard` is the shared History card:

- `featured` for the archive landing
- `archive` for lists and date/taxonomy results
- `related` for the approved article template

Cards show date, title, excerpt, topics, and a place when present. A 16:9
image appears only when `primaryImage` is rights-cleared. No-image cards are
typographic. There is no generic photograph and no empty image well.

## Search

No Algolia or other paid search. Keyword search is deferred. Date and
taxonomy query parameters are the V1 filter foundation and can later accept
`q=` without changing the route.

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
