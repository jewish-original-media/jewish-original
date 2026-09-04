# Homepage foundation

Status: History + Jewish Today + Podcast convergence on
`feature/integration-homepage`. This is still composition, not the finished
homepage visual design.

The homepage is a Server Component composition. It is not a CMS document.

## Product direction

The page must communicate:

> A modern home for Jewish history, culture, education, connection, and identity.

History is the foundation. Education transmits it. Identity is the product.
Connection is the outcome.

The intended feel is a premium editorial publication, a daily Jewish dashboard,
and a cultural discovery product. It is not a SaaS marketing page, a generic
nonprofit layout, a synagogue template, or a card grid of invented content.

## Route and data composition

- Route: `/`
- Server entry: `src/app/(site)/(home)/page.tsx`
- Composition: `getHomePageData()` in `src/features/homepage`
- View: `HomePageView` in `src/components/home/home-page.tsx`
- The `(home)` route group stays inside `(site)` so homepage `loading.tsx`
  and `error.tsx` do not wrap `/today`, `/history`, or `/podcasts`, while
  Studio at `/admin` stays outside the public chrome.

`getHomePageData()` calls `getJewishToday()` once, `getHistoryIndex()` once,
and the published Podcast show/episode reads once. The homepage must not
call Hebcal or write a second on-this-day query.

Hourly revalidation matches Jewish Today (`revalidate = 3600`).

## Section order

1. **Masthead** — official positioning and product principle. Live.
2. **Jewish Today** — compact `JewishTodayModule`. Live.
3. **History** — published `HistoryEntryCard` archive cards. Live.
4. **Podcasts** — canonical published Podcast module. Preparing while
   published count is 0.
5. **Later desks** — News, Events, Culture, Support. Named only.

## Jewish Today module

Uses the existing reusable contract:

- `getJewishToday()`
- `JewishTodayModule`

On-this-day matches come from History `getOnThisDayHistory`. The module omits
the History line when none exist. It does not hard-code Dachau or any other
article.

## History module

Uses the canonical History system only:

- `getHistoryIndex(false)` for published archive entries
- `HistoryEntryCard` `variant="archive"`
- `formatHistoricalDate` inside that card

The homepage does not copy `/history` filters, On This Day browse, taxonomy
navigation, or featured-layout treatment. It shows published cards and a link
to the archive. If the read fails, the section says the archive is briefly
unavailable and still links to `/history`.

## Podcast module

Uses the canonical Podcast system only:

- `getPodcastShow(TTJS_SHOW_SLUG, false)`
- `getPodcastEpisodes(show.slug, false)` when a published show exists
- `EpisodeCard` for published episodes
- the existing “Podcasts are being prepared.” copy while the show is unpublished

Do not read draft documents on the public homepage. Do not invent episode
titles, guests, or media. Do not create a second card system. History ↔
Podcast relationships remain editor-approved fields only.

## Later desks

News, Events, Culture, and Support are reserved names only. They have no live
modules and no fabricated items on this branch.

## Loading and errors

- `src/app/(site)/(home)/loading.tsx` keeps the masthead and a quiet reserved
  rhythm.
- `src/app/(site)/(home)/error.tsx` is a Client Component using Next.js
  `retry()`. It does not print stack traces. Jewish Today remains available at
  `/today`.

## Responsive rhythm

The foundation is composed for mobile first, then 768, 1024, 1280, and 1440.
Section spacing uses the existing 4px token scale. Extra-large display type is
limited to the masthead.
