# News and Events

Status: four outward-linking News items remain published in Sanity
`development`. They aged past the homepage 7-day freshness window on
2026-09-17, and are past the 14-day `/news` index window as of 2026-10-05.
For founder visual review, the homepage News band may show the latest
published outbound cards (cap 5) with their real source dates, including cards
past `expiresAt`. This is temporary. Restore `getHomepageNews` and the 7-day /
3-item homepage gate before launch. `/news` still uses the 14-day index window. News stays out of
primary nav because the desk is below five current items and three publishers.
Footer includes News. No Events qualified. Ingest writes and cron stay off.

## Operating rule

Ordinary high-confidence items may auto-publish after gates once writes are
explicitly enabled. Humans handle exceptions. Jewish Original does not
republish publisher bodies or RSS excerpts, and it does not store publisher
images.

Public News card: publisher, original headline, source datetime, JOM context,
optional desk, outbound URL. The homepage wire may also show the source
article’s featured image. That image stays on the publisher’s server. The page
reads the article’s Open Graph image URL and the browser requests the file
from there. Do not download it into `public/`, Sanity, or the image optimizer.

Public Event card: title, organizer, date object, place or Online, time in the
event’s own timezone, JOM context, outbound URL.

Homepage and desk links remain explicitly outbound. News uses
`news_outbound`; Events uses `event_outbound`. JOM context may be shortened to
its first complete sentence for compact surfaces, but source headlines, event
titles, publishers, organizers, dates, and URLs are not rewritten.

## Current discovery

`/explore?view=current` combines only eligible News and Events in a
source-honest discovery view. It explains that these are fresh outbound
records, not permanent JOM archive articles, and links directly to `/news` and
`/events`. The view remains `noindex, follow` and canonicalizes to `/explore`.
It does not change either desk’s eligibility, freshness, diversity, or
publication gates.

## Sources

News allowlist: JTA, Times of Israel, Jerusalem Post diaspora/archaeology/
culture, Forward News, JNS (capped), eJewishPhilanthropy, Biblical Archaeology
Society. Haaretz, Ynet, Moment, Unpacked, Jewish Insider, Tablet, and AP/Reuters
stay out.

Events allowlist: Hebrew Union College ICS and JOM-owned manual records.
Additional official ICS/API feeds can be added to the registry without a
redesign. Do not scrape Eventbrite or Meetup. Do not use Hebcal or Sefaria as
Events.

## AI

Provider abstraction talks to Vercel AI Gateway. Default model:
`openai/gpt-4.1-nano`. Live Preview classify currently sticks to the
working fallback `openai/gpt-4o-mini` after nano 429s. Override with
`NEWS_AI_MODEL`.

Deterministic filters run first. The model only classifies survivors. It cannot
set publication status.

## Homepage versus shared chrome

These are different gates.

| Surface                             | Show when                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage “What We’re Following”     | Temporary visual review: latest still-published outbound cards, cap 5, real dates, even after the 7-day window. Restore before launch: at least **3** items whose `sourcePublishedAt` is within **7 days**, after deterministic publisher and desk diversity (prefer 3 distinct publishers and mixed desks when the pool allows; prefer 3 items, cap 5, at most 2 per publisher). Hide at 0–2 even if fewer than three publishers are available. Never render an empty News band. |
| `/news`                             | Published, unexpired items whose `sourcePublishedAt` is within **14 days**. Successful empty is not a fetch failure.                                                                                                                                                                                                                                                                                                                                                              |
| Today submenu / daily ribbon News   | At least **5** current `/news` items and **3** publishers. Footer News stays on.                                                                                                                                                                                                                                                                                                                                                                                                  |
| Today submenu / daily ribbon Events | At least **2** upcoming events from **2** organizers and **2** geography buckets. The Events sitemap route and footer Events link use the same eligibility decision.                                                                                                                                                                                                                                                                                                              |

Do not backdate `sourcePublishedAt`, extend the `/news` or navigation windows,
or publish filler to force the submenu or ribbon. The homepage review read is
the only exception: it may show published cards after `expiresAt`, with the
publisher’s original date, and it must be removed before launch.

## Writes

Cron and `npm run ingest:dry-run` default to no Sanity writes. Publication
requires `CRON_SECRET`, a Gateway credential, `SANITY_API_WRITE_TOKEN`, and
`INGEST_WRITES_ENABLED=1`. Writes are scoped to `curatedNewsItem`, `event`,
`ingestSource`, `ingestRun`, `ingestException`, and `ingestReceipt` only.
Do not enable that on Production in this milestone. Do not enable cron or
ingest writes from Integration to refill the desk.

## Replenishment (manual, 1–2 reviewed items per day)

Required `curatedNewsItem` fields: `publisherName`, `originalHeadline`,
`sourceUrl` (https), `sourcePublishedAt` (the publisher’s datetime, not
today’s save time), `jomContext` (40–320 characters, no generic closer),
`desk`, `status: published`. Set `expiresAt` 14 days after
`sourcePublishedAt` unless Heritage needs the longer ingest window.

Use only allowlisted publishers and their hosts. Do not invent headlines,
dates, or context facts absent from the source.

After publish, `/` and `/news` revalidate every 300 seconds. There is no
on-write `revalidateTag("news")` hook yet. New items appear on cached
pages within about five minutes.
