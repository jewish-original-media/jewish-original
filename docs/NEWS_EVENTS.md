# News and Events

Status: four outward-linking News items remain published in Sanity
`development`. They aged past the homepage 7-day freshness window on
2026-09-17, so the homepage News desk is hidden. `/news` still lists them
inside the 14-day index window. News stays out of primary nav because the
desk is two publishers and below five current items. Footer includes News.
No Events qualified. Ingest writes and cron stay off.

## Operating rule

Ordinary high-confidence items may auto-publish after gates once writes are
explicitly enabled. Humans handle exceptions. Jewish Original does not
republish publisher bodies, RSS excerpts, or publisher images.

Public News card: publisher, original headline, source datetime, JOM context,
optional desk, outbound URL.

Public Event card: title, organizer, date object, place or Online, time in the
event’s own timezone, JOM context, outbound URL.

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

## Homepage versus primary nav

These are different gates.

| Surface | Show when |
| --- | --- |
| Homepage “What We’re Following” | At least **3** items whose `sourcePublishedAt` is within **7 days**, after publisher diversity (prefer 3, cap 5, at most 2 per publisher). Hide at 0–2. Never render an empty News band. |
| `/news` | Published, unexpired items whose `sourcePublishedAt` is within **14 days**. Successful empty is not a fetch failure. |
| Primary nav | At least **5** current `/news` items and **3** publishers. Footer News stays on. |

Do not backdate `sourcePublishedAt`, extend the windows, disable the gates,
or publish filler to force the homepage band.

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
