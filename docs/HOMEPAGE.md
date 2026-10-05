# Homepage

Status: 2027 editorial homepage pass on `feature/integration-homepage`.
Composition uses live History, Jewish Today, published Originals, News, and
Podcasts. Photography is limited to founder-owned images and rights-cleared
Sanity media. It is not a second architecture.

The homepage is a Server Component composition. It is not a CMS document.

The current art direction is **Living Archive**: the page connects inherited
memory, daily Jewish practice, global Jewish communities, current editorial
work, and the next generation in one continuous native-scroll experience.
Archive objects are used as documented collection material, never as anonymous
“Jewish atmosphere.”

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

The route revalidates every five minutes (`revalidate = 300`) so publication
gates can respond promptly. `getJewishToday()` remains cached and supplies one
consistent Eastern Time day to both the homepage and header.

## Section order

1. **Masthead** — a full-viewport class A morning-tefillin photograph carries
   the stacked “Remember, rebuild, and create.” opening, live dates, primary
   paths, and a numbered chapter strip. The primary path enters `/explore`.
   The strip follows the rendered page order, includes Explore as a durable
   destination, and includes Originals, News, and Events only when their
   homepage scenes pass their existing publication gates. About remains
   discoverable. The OTD lion is not used in this global JOM surface.
2. **Jewish Today** — a near-full-screen daily scene from the shared
   `JewishTodayDay`, introduced as a living calendar.
3. **Living Archive** — a layered passage of locally stored,
   provenance-verified collection objects. Each object exposes title, place,
   date, community context, visible credit, and its authoritative source
   record. The initial local-review set comes from the Library of Congress and
   does not claim to represent the full Jewish diaspora.
4. **History** — one lead plus two supporting archive stories in a spacious
   gallery room. Rights-cleared CMS media preserves caption and credit.
   Entries without media receive a clearly non-photographic navy archival
   index plate using the OTD lion and Magen David as masks; the plate is
   interface art, not evidence from the event.
5. **Originals** — one image-forward featured house essay plus supporting
   stories. Rights-cleared editorial media is used when supplied. Otherwise,
   the surface renders a branded JOM monogram plate, never unrelated
   photography.
6. **What We’re Following** — outbound News desk. Live at three published
   items. Not a card grid of publisher stories.
7. **Podcasts** — a night listening room with the published show, latest
   `EpisodeCard`, supporting titles, and the founder-owned street photograph.
8. **Events** — date-led calendar scene when publishable inventory passes the
   existing visibility gate. `/events` remains available from shared
   navigation even while the homepage scene is withheld.
9. **About** — an institutional statement connecting history, identity, and
   the shared future.
10. **Support** — a gold closing field and invitation into `/support`.

## Living Archive objects

The typed review collection lives in
`src/content/media/living-archive.ts`; files live under
`public/media/archive/`. This is deliberately separate from History featured
media and is not a substitute for relational CMS content.

- Only authoritative records with local non-thumbnail files may render.
- Every figure keeps a descriptive alt, catalog-aligned title, place/date
  context, collection credit, source link, reproduction number, and rights
  advisory.
- Unknown creators or locations remain unknown. Do not infer them from dress,
  appearance, filenames, or surrounding collection material.
- A community object is one documented moment, not a visual proxy for an
  entire people.
- The collection remains a local editorial review set until explicitly
  approved for deployment.

The separate manifesto band is removed so the founder line is not repeated
beside the published _Our Path Forward_ essay.

Upcoming Events stay hidden on the homepage until inventory earns the slot.
The permanent navigation path does not imply inventory. Do not invent
articles, headlines, or events.

## Jewish Today

Uses `getJewishToday()` and `HomeJewishToday`. Calendar logic stays in Hebcal.
On-this-day matches stay in History `getOnThisDayHistory`. The Hebrew date is
the visual object. Torah uses Hebcal labels: **This week in Torah**, **Most
recent Torah portion**, or a separate **Festival** line when the coming
Saturday is yom tov. The module names Eastern Time. It does not imply
Jerusalem time. Observance and History blocks appear only when they have data.
When Hebcal supplies them, a concise provider memo, factual book context, and
one verified Sefaria reading path add educational depth. They are not
editorially invented commentary. Do not fetch Hebcal again on the homepage.

## History

Uses the canonical History system only:

- `getHistoryIndex(false)`
- `composeHomeHistory()` (lead plus two supporting stories)
- `HomeHistoryFeature` as layout around canonical History data
- `next/image` only when a rights-cleared `primaryImage` exists
- `HomeEditorialMedia` for shared real-image and archival-index treatments

`getHistoryIndex(false)` reads the complete published-ready archive. The
homepage still shows only one lead and two supporting stories. The full
unique set is discovered on `/history`. The branded index treatment ensures
the layout remains visual when public imagery is thin without attaching a
generic or unrelated photograph to a historical event.

## Podcasts

Published `getPublishedPodcastHome()` and `EpisodeCard` for the latest
episode. The navy field now includes the founder-owned Meyer + Isaac street
photograph with a museum caption. At most two additional published episodes
appear as a title rail, not a second card system. Do not invent artwork or
autoplay media.

## Originals, News, and Events

See `docs/ORIGINALS.md` and `docs/NEWS_EVENTS.md`.

- Originals: magazine feature plus quiet secondary stories
- News: tighter newswire density, rules, source + JOM context
- Events: date as the visual object; homepage scene stays hidden while
  inventory is thin, but `/events` is permanently discoverable
- Both scenes point to `/explore?view=current`; that view clearly identifies
  News and Events as time-bound outbound records rather than durable archive
  articles.
