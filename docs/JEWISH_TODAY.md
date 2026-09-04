# Jewish Today

Status: checkpointed and frozen on `feature/jewish-today`, then merged into
`feature/integration-homepage`. Standalone `/today` exists. The Integration
homepage now composes `JewishTodayModule`. Temporary History adapters remain
pending History merge. See `docs/JEWISH_TODAY_CONVERGENCE.md` and
`docs/HOMEPAGE.md`.

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
published History matches. History uses `HistoryEntryCard` `variant="archive"`.

### Compact homepage module

The Integration homepage now calls `getJewishToday()` once and passes that
result to `JewishTodayModule`. The module shows:

- the Hebrew date
- one calendar highlight or, if none, the parashah
- one History title when a published match exists
- a link to `/today`

Do not call Hebcal or write a second on-this-day query from the homepage
module. The homepage History section uses `getHistoryIndex`, not another
Jewish Today fetch. See `docs/HOMEPAGE.md`.

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
Cards use History’s `HistoryEntryCard`, including a rights-cleared image only
when History supplies one. Dachau remains a no-image article.

The development dataset is private. Published reads need
`SANITY_API_READ_TOKEN`. Without the token, matching returns empty rather
than failing the page.

## History card

`/today` and the homepage History module render `HistoryEntryCard`
`variant="archive"`. Date labels use `formatHistoricalDate`. Matching uses
`getOnThisDayHistory`. There is no second Jewish Today History system.

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

Frozen History `3539211` is merged on Integration. Jewish Today consumes
History’s matcher, card, date formatter, and `/history/[slug]` routes.
Podcasts remain unmerged.

## Cost

$0 / month. No new paid service. Native `fetch` only.

One development-only dependency: `tsx`.
