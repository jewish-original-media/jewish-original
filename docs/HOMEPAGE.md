# Homepage

Status: Design Director pass on `feature/integration-homepage`. Composition
still uses live History, Jewish Today, and Podcasts. The visual system is an
editorial restyle of the working V1 shell, not a second architecture.

The homepage is a Server Component composition. It is not a CMS document.

## Product direction

The page should feel like a living Jewish cultural object: history, memory,
Torah, culture, current Jewish life, conversation, identity, and storytelling
in one world.

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
and `getPublishedPodcastHome()` once. `getJewishToday()` is wrapped in React
`cache()` so the site header can share the same day.

Hourly revalidation matches Jewish Today (`revalidate = 3600`).

## Section order

1. **Masthead** — stacked “Remember, rebuild, and create.” Positioning lives
   in the lede. Live.
2. **Jewish Today** — signature daily object from the same `JewishTodayDay`.
   Live.
3. **History** — one lead plus up to three supporting archive items. Live.
4. **Manifesto** — one founder pause. Live.
5. **Podcasts** — published show, latest `EpisodeCard`, remaining titles as a
   rail. Live.
6. **Support** — invitation into `/support`. Live.

Hidden until published documents exist:

- Originals
- What We’re Following (News)
- Upcoming Events

## Jewish Today

Uses `getJewishToday()` and `HomeJewishToday`. Calendar logic stays in Hebcal.
On-this-day matches stay in History `getOnThisDayHistory`. The Hebrew date is
the visual object. Do not fetch Hebcal again on the homepage.

## History

Uses the canonical History system only:

- `getHistoryIndex(false)`
- `composeHomeHistory()`
- `HomeHistoryFeature` as layout
- `HistoryEntryCard` for supporting items

The first collection has no public imagery. Typography and dates carry the
lead. Do not insert empty image boxes.

## Podcasts

Published `getPublishedPodcastHome()` and `EpisodeCard` for the latest
episode. Additional published episodes appear as a title rail, not a second
card system. Do not invent artwork or autoplay media.

## Originals, News, and Events

See `docs/ORIGINALS.md`. Homepage slots stay hidden while empty. Do not invent
articles, headlines, or events.

Future visual languages, when data exists:

- Originals: magazine feature plus quiet secondary stories
- News: tighter newswire density, rules, source + JOM context
- Events: date as the visual object
