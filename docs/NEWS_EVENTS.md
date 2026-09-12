# News and Events

Status: first live News publish on `feature/integration-homepage`. Four
outward-linking News items are published. Homepage News is on; News stays
out of primary nav. Footer includes News. No Events qualified. Visual
baseline `3c69d40` stays frozen except the News desk presentation.

## Operating rule

Ordinary high-confidence items may auto-publish after gates. Humans handle
exceptions. Jewish Original does not republish publisher bodies, RSS excerpts,
or publisher images.

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

## Homepage

Frozen empty order remains:

Masthead → Today → History → Manifesto → Podcasts → Support

When real items exist:

Masthead → Today → History → What We’re Following → Podcasts → Upcoming
Events → Manifesto → Support

Homepage News hides at 0 items. Homepage Events hides below 2 upcoming items.
Homepage News shows when at least 3 published items exist, preferring 3
and capping 5 with at most 2 per publisher. News stays out of primary nav
until at least 5 items and 3 publishers. Events stay off Home and nav
until more than one organizer and geo exist.

## Writes

Cron and `npm run ingest:dry-run` default to no Sanity writes. Publication
requires `CRON_SECRET`, a Gateway credential, `SANITY_API_WRITE_TOKEN`, and
`INGEST_WRITES_ENABLED=1`. Writes are scoped to `curatedNewsItem`, `event`,
`ingestSource`, `ingestRun`, `ingestException`, and `ingestReceipt` only.
Do not enable that on Production in this milestone.
