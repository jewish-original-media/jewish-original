# Homepage

Status: Jerusalem + museum art-direction pass on `feature/integration-homepage`.
Composition still uses live History, Jewish Today, and Podcasts. Photography is
limited to three founder-owned images. It is not a second architecture.

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
3. **History** — one lead plus two supporting archive stories. Live.
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
the visual object. Torah uses Hebcal labels: **This week in Torah**, **Most
recent Torah portion**, or a separate **Festival** line when the coming
Saturday is yom tov. The module names Eastern Time. It does not imply
Jerusalem time. Observance and History blocks appear only when they have data.
Do not fetch Hebcal again on the homepage.

## History

Uses the canonical History system only:

- `getHistoryIndex(false)`
- `composeHomeHistory()` (lead plus two supporting stories)
- `HomeHistoryFeature` as layout around canonical History data
- optional `next/image` only when a rights-cleared `primaryImage` exists

The first collection has no public imagery. Typography and dates carry the
lead. Supporting stories are stronger archive pieces, not a third equal card
column. Do not insert empty image boxes.

## Podcasts

Published `getPublishedPodcastHome()` and `EpisodeCard` for the latest
episode. The navy field now includes the founder-owned Meyer + Isaac street
photograph with a museum caption. Additional published episodes appear as a
title rail, not a second card system. Do not invent artwork or autoplay media.

## Originals, News, and Events

See `docs/ORIGINALS.md` and `docs/NEWS_EVENTS_NEXT.md`. Homepage slots stay
hidden while empty. Do not invent articles, headlines, or events. Do not
implement News or Events ingestion in this milestone.

Future visual languages, when data exists:

- Originals: magazine feature plus quiet secondary stories
- News: tighter newswire density, rules, source + JOM context
- Events: date as the visual object
