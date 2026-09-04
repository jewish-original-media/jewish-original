# Homepage foundation

Status: Integration milestone on `feature/integration-homepage`. This is
architecture and composition, not the finished homepage.

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
- Server entry: `src/app/(home)/page.tsx`
- Composition: `getHomePageData()` in `src/features/homepage`
- View: `HomePageView` in `src/components/home/home-page.tsx`
- The `(home)` route group keeps homepage `loading.tsx` and `error.tsx`
  from wrapping `/today` or later feature routes.

`getHomePageData()` calls `getJewishToday()` once. The homepage must not call
Hebcal or write a second on-this-day query.

Hourly revalidation matches Jewish Today (`revalidate = 3600`).

## Section order

1. **Masthead** — official positioning and product principle. Live.
2. **Jewish Today** — compact `JewishTodayModule`. Live.
3. **History** — reserved slot. Pending History merge.
4. **Podcasts** — reserved slot. Pending Podcasts merge.
5. **Later desks** — News, Events, Culture, Support. Named only.

## Jewish Today module

Uses the existing reusable contract:

- `getJewishToday()`
- `JewishTodayModule`

If History matching cannot resolve yet, the module omits the History line. It
does not hard-code Dachau or any other article.

## History convergence slot

Do not invent a second History card on this branch.

Until `milestone-1-sanity-history` is frozen and merged, the homepage renders a
restrained reserved section only.

On History merge, replace these temporary adapters and keep one History system:

1. `fetchOnThisDayHistory` → History `getOnThisDayHistory`
2. `TodayHistoryCard` → `HistoryEntryCard` `variant="archive"`
3. `formatOnThisDayDate` → `formatHistoricalDate`

Also required for a real History card on `/` and `/today`:

- `/history` and `/history/[slug]` routes
- published `historyEntry` reads with `SANITY_API_READ_TOKEN`
- History card CSS and optional image `remotePatterns`

See `docs/JEWISH_TODAY_CONVERGENCE.md`.

## Podcast convergence slot

Do not merge `feature/podcasts` yet. Do not duplicate Podcast media logic. Do
not invent episode titles, guests, or media.

Expected future inputs to this slot:

- featured or recent episodes
- show metadata
- episode cards
- media links (YouTube, audio, platform URLs)

## Later desks

News, Events, Culture, and Support are reserved names only. They have no live
modules and no fabricated items on this branch.

## Loading and errors

- `src/app/(home)/loading.tsx` keeps the masthead and a quiet reserved rhythm.
- `src/app/(home)/error.tsx` is a Client Component using Next.js `retry()`. It
  does not print stack traces. Jewish Today remains available at `/today`.

## Responsive rhythm

The foundation is composed for mobile first, then 768, 1024, 1280, and 1440.
Section spacing uses the existing 4px token scale. Extra-large display type is
limited to the masthead.
