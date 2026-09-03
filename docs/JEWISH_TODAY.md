# Jewish Today

Status: checkpointed and frozen on `feature/jewish-today`. Standalone `/today`
exists. The homepage is not composed from this module. Do not merge
automatically. See `docs/JEWISH_TODAY_CONVERGENCE.md`.

Jewish Today is a calculated daily experience, not an editorial document type.
It combines:

- calculated Jewish calendar data from Hebcal
- published JOM History entries whose reviewed Gregorian month/day match today

Those two sources stay separate.

## Route

Durable public route: `/today`.

`?date=YYYY-MM-DD` is a review and test affordance. It is not a public archive
and is `noindex`. The canonical URL remains `/today`.

`?preview=calendar-unavailable` is a local review affordance for the Hebcal
failure state. It is honored only when `JEWISH_TODAY_ALLOW_PREVIEWS=1` and is
ignored in ordinary production.

Global navigation and footer were not changed in this milestone.

## V1 definition of “today”

**Technical rule:** the civil Gregorian date in `America/New_York`.

**User-facing language:** “Shown for Eastern Time. Jewish days begin at sunset.”

This version does not use the visitor’s timezone, Jerusalem time, sunset
rollover, candle-lighting, or location consent. Diaspora Torah readings
(`i=off`) match the Eastern Time civil date.

## Information hierarchy

A daily visit should answer, in this order:

1. What Jewish day is it?
2. What is happening in the Jewish calendar?
3. What Torah portion belongs to this week?
4. What happened on this date in Jewish history?

Empty sections are omitted. An ordinary weekday may show only the date, the
weekly portion, and a quiet Hebcal credit.

## Data contract

`getJewishToday()` in `src/features/jewish-today` returns one `JewishTodayDay`.
Calculated calendar days are not stored in Sanity.

### Full `/today` experience

Uses `JewishTodayPage`. Shows the compact date hero, then only the sections
that have real content: calendar observances, this week’s parashah, and
published History matches. History uses `TodayHistoryCard`, a temporary
adapter for the History archive card.

### Compact homepage module

Uses the same `getJewishToday()` result plus `JewishTodayModule`. The module
should show:

- the Hebrew date
- one calendar highlight or, if none, the parashah
- one History title when a published match exists
- a link to `/today`

Do not call Hebcal or Sanity a second time from the homepage.

## History matching

A match requires all of:

- Sanity published (not `drafts.**`)
- `workflowStatus == "ready"`
- not `duplicateCandidate`
- `entryKind != "recurringObservance"`
- `historicalDate.precision == "day"`
- `historicalDate.calendarSystem == "gregorian"`
- `historicalDate.start.month` and `.day` equal today’s civil month/day

Related History is not queried, so unpublished related documents cannot leak.
Featured images are not rendered in this isolated worktree; the Dachau
no-image state is a gold rule and typography, matching History’s no-image
intent.

The development dataset is private. Published reads need
`SANITY_API_READ_TOKEN`. Without the token, the query returns empty rather
than failing the page.

## History card adapter

`TodayHistoryCard` follows the History archive card: date kicker, serif title
link, gold title underline, excerpt, topics, optional place, and a quiet rule
instead of an empty image box. It does not copy History CSS or the
`HistoryEntryCard` component. In this isolated worktree the card link 404s
until History’s `/history/[slug]` routes are merged.

On merge, replace:

- `fetchOnThisDayHistory` with `getOnThisDayHistory`
- `TodayHistoryCard` with `HistoryEntryCard` `variant="archive"`
- local date formatting with `formatHistoricalDate`

## Provider decision

Hebcal REST calendar API is the provider. `@hebcal/core` is not installed
because it is GPL-2.0; linking that library into this application would
require GPL terms that the project has not adopted. Hebcal’s hosted JSON is
CC BY 4.0 and may be used commercially with attribution.

One cached request covers today through the next Saturday. Credit appears as
“Calendar by Hebcal.”

## Caching and failure

`fetch` revalidates hourly with tags `jewish-today` and `jewish-today:{date}`.
If Hebcal is unavailable, the page still shows the Gregorian date, a quiet
status line, and any published History matches. Raw errors are not shown.

## Convergence with History

History is checkpointed on `milestone-1-sanity-history` at `e9bfd59`. This
branch stays isolated. Needed at controlled merge review:

- History’s published `historyEntry` schema (already compatible)
- `SANITY_API_READ_TOKEN` for the private dataset
- `HistoryEntryCard` and its CSS
- `/history/[slug]` routes for card links
- optional Sanity image `remotePatterns` when a rights-cleared image exists

Do not rebase this worktree onto uncommitted or in-progress History work.

## Cost

$0 / month. No new paid service. Native `fetch` only.

One development-only dependency: `tsx`.
