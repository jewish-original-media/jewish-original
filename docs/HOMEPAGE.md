# Homepage foundation

Status: V1 public shell on `feature/integration-homepage`. Composition uses
live History, Jewish Today, and Podcasts. This is the first launch-quality
homepage architecture, not a later visual brand restyle.

The homepage is a Server Component composition. It is not a CMS document.

## Product direction

The page must communicate a premium editorial publication, a daily Jewish
utility, a historical archive, and a modern Jewish media brand.

Approved positioning remains:

> A modern home for Jewish history, culture, education, connection, and identity.

History is the foundation. Education transmits it. Identity is the product.
Connection is the outcome. Those lines shape hierarchy. They are not stacked
as a homepage slogan.

## Route and data composition

- Route: `/`
- Server entry: `src/app/(site)/(home)/page.tsx`
- Composition: `getHomePageData()` in `src/features/homepage`
- View: `HomePageView` in `src/components/home/home-page.tsx`

`getHomePageData()` calls `getJewishToday()` once, `getHistoryIndex()` once,
and the published Podcast show/episode reads once.

Hourly revalidation matches Jewish Today (`revalidate = 3600`).

## Section order

1. **Masthead** — “Remember, rebuild, and create.” Live.
2. **Jewish Today** — homepage presentation of the same `JewishTodayDay`. Live.
3. **History** — On This Day lead when a match exists, otherwise archive lead,
   plus supporting `HistoryEntryCard` items. Live.
4. **Podcasts** — canonical published read. Live show title, tagline, and
   latest `EpisodeCard`. Remaining episodes live on `/podcasts`.
5. **Support** — short invitation into `/support`. Live.

Hidden until published documents exist:

- Originals
- What We’re Following (News)
- Upcoming Events

## Jewish Today

Uses `getJewishToday()` and `HomeJewishToday`. Calendar logic stays in Hebcal.
On-this-day matches stay in History `getOnThisDayHistory`.

## History

Uses the canonical History system only:

- `getHistoryIndex(false)`
- `composeHomeHistory()`
- `HistoryEntryCard`

## Podcasts

Published `getPodcastShow` / `getPodcastEpisodes` and `EpisodeCard` only.
The homepage uses the latest published episode as the lead. It does not
invent episodes or use draft data.

## Originals, News, and Events

See `docs/ORIGINALS.md`. Homepage slots stay hidden while empty. Do not invent
articles, headlines, or events.
