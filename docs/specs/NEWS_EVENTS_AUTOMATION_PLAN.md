# News + Events Automation Plan

Status: research only on `research/news-events`. No application code, Sanity
writes, homepage edits, schema edits, or deploys.

Research date: 2026-09-09. Recheck feed URLs, terms, and model prices before
implementation.

This file is the implementation plan for the hands-off V1 desks. It does not
replace `docs/specs/NEWS_EVENTS_PRODUCT_SPEC.md`. That document still defines
product meaning, desks, and copyright. This document changes one operating
rule:

**Ordinary high-confidence items auto-publish. Humans handle judgment,
exceptions, and meaning when the machine is unsure.**

Integration already recorded that intent in `docs/NEWS_EVENTS_NEXT.md` on
`feature/integration-homepage`. Do not edit that branch from this workstream.
Do not implement while the Jerusalem / museum art-direction pass is active.

This is editorial and product research, not legal advice.

## 1. Operating principle

Machines handle repetition: fetch, normalize, dedupe, freshness, relevance,
classification, short context, expiration.

Humans handle judgment: sensitive stories, failed gates, source policy, featured
overrides, corrections, and partner calendar decisions.

Human review is **not** required for every ordinary item.

Public labels:

- News: **What We’re Following**
- Events: **Upcoming Events**

News is not original reporting. It is an outward-linking desk. The publisher
gets the click. JOM never republishes article bodies.

Events is a low-maintenance Jewish cultural calendar. Routine operation should
not depend on hand-entering every lecture. Manual Studio entry remains as
override, not as the daily path.

## 2. What changed since the September 3 product spec

The earlier spec required a human publish for every news card. The founder has
now required exception-based review.

Still true:

- Four desks only: Jewish World, Israel, Culture, Heritage
- Antisemitism is a topic, not a desk
- Headline + publisher + date + URL + JOM context
- No article bodies, no publisher images unless separately licensed
- No AP/Reuters ingest, no NewsAPI, no scraping Eventbrite as the main path

Newly true for V1 automation:

- AI-written context may publish when gates pass
- Auto-publish is the default for ordinary items
- Failed gates go to skip or exception, not to a human inbox for every story

## 3. News source research (rechecked 2026-09-09)

An RSS feed is a delivery method, not a reprint license. Probes recorded
whether the feed returned XML, preserved article links, and carried parseable
dates. Descriptions exist in most feeds; they must be treated as untrusted
ephemeral data for scoring only and must not be stored or published.

| Source | Feed | Items / quality | Links | Dates | Excerpt in feed | Terms / reuse | Desk bias | Launch? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **JTA** | `https://www.jta.org/feed` | 20 items, clean titles (~76 chars) | Direct `jta.org/YYYY/...` article URLs | RFC-822, all parse | Yes (~500 chars). Do not publish | Paid syndication exists for full text. V1: identifiers + JOM context only | Jewish World | **Yes** |
| **Times of Israel** | `https://www.timesofisrael.com/feed/` | 15 items, clean titles | Direct article URLs | Parseable | Yes (~780 chars). Do not publish | ToS restricts republication and “rewriting for publication.” Store URL/title/date only. Paid syndication from $500/mo. Do not buy | Israel | **Yes, identifiers only** |
| **Jerusalem Post** | Official index `https://www.jpost.com/rss` | Frontpage 26; section feeds 30 | Direct `jpost.com/.../article-` URLs | Parseable | Yes (~550–690 chars) | ToS allows using **RSS content** to build a site if you do **not crawl beyond the feed**. Feed images only with attached text. Still do not publish excerpts or images in V1 | Israel / Culture / Heritage by section | **Yes — section feeds only** |
| **Forward** | `https://forward.com/news/feed/` | 20 items | Direct article URLs | Parseable | Yes (~620 chars) | Free reprint of *original* Forward stories under their pixel/canonical/noindex rules. V1 still links out | Jewish World | **Yes** |
| **JNS** | `https://www.jns.org/feed/` → `index.rss` | 30 items | Direct article URLs | Parseable | Short (~140 chars) | No reprint right found. Link + JOM context | Israel / Jewish World | **Yes, volume-capped** |
| **eJewishPhilanthropy** | `https://ejewishphilanthropy.com/feed/` | 20 items; XML had an unclosed CDATA in strict parse, still RSS | Link tags present | Present | Yes; parse leniently | Assume no reprint right | Jewish World | **Yes** |
| **Biblical Archaeology Society** | `https://www.biblicalarchaeology.org/feed/` | 10 items, shorter titles | Direct article URLs | Parseable | Yes (~450 chars) | Link + JOM context | Heritage | **Yes** |
| **Haaretz English** | `https://www.haaretz.com/srv/haaretz-latest-headlines` | 100 items, high volume, many `.premium` URLs | Direct URLs | Parseable | Short (~200 chars) | No commercial RSS-republication license found; paywall | Israel | **No auto-publish** |
| **Moment** | `https://momentmag.com/feed/` | ~19 items; strict XML parse failed on CDATA | Present | Present | Yes | Magazine pace; good Culture monitor | Culture | Later |
| **Unpacked** | `https://unpacked.media/feed/` | 10 items; strict XML parse failed | Present | Present | Yes | Explainers more than a wire | Culture | Later |
| **My Jewish Learning** | `https://www.myjewishlearning.com/feed/` | Works | Direct | Parseable | Yes | Education, not news | — | No |
| **Ynetnews** | `https://www.ynet.co.il/Integration/StoryRss3082.xml` and `...3443.xml` | Works | Direct | Parseable | Yes | High volume, more tabloid | Israel | No |
| **Jewish Insider** | `https://jewishinsider.com/feed/` | Works | Often paywalled | Parseable | Yes | Do not make it a house source | Jewish World | No |
| **Tablet** | common `/feed` | 403 to this fetch | — | — | — | Manual | Culture | No |
| **AP / Reuters** | various | — | — | — | — | Personal or enterprise licensed | — | **Never ingest** |

JPost section feeds verified 200 XML:

- Diaspora: `https://www.jpost.com/rss/rssfeedsdiaspora.aspx`
- Archaeology: `https://www.jpost.com/rss/rssarchaeology`
- Culture: `https://www.jpost.com/rss/rssfeedsculture.aspx`

Do **not** ingest JPost `rssallnews` or frontpage in V1. Those would let one
paper dominate.

## 4. Launch News allowlist (7 sources)

| # | Source | Feeds | Default desk | Cap per run |
| --- | --- | --- | --- | --- |
| 1 | JTA | site feed | Jewish World | 4 |
| 2 | Times of Israel | site feed | Israel | 3 |
| 3 | Jerusalem Post | diaspora + archaeology + culture only | mapped by feed | 2 per section, 4 total |
| 4 | Forward | `/news/feed/` | Jewish World | 3 |
| 5 | JNS | site feed | Israel | 2 |
| 6 | eJewishPhilanthropy | site feed | Jewish World | 2 |
| 7 | Biblical Archaeology Society | site feed | Heritage | 2 |

This covers all four desks without a single firehose. Homepage display should
still cap **two cards from one publisher**.

Out of auto-publish until a later review: Haaretz, Ynet, Moment, Unpacked,
Jewish Insider, Tablet, local diaspora papers.

## 5. Desk model

Use only:

- `jewish-world`
- `israel`
- `culture`
- `heritage`

Antisemitism is a topic reference, not a desk. Daily Torah, holidays, and
candle times stay on Jewish Today. History archive entries and podcast
episodes are never ingested as News.

Each allowlisted source has a **default desk**. AI may override only when
`deskConfidence` is high and the override is one of the four values.

## 6. Lean ingestion architecture

Stack: Next.js route handler + native `fetch` + Zod + Sanity write client +
Vercel Cron + Vercel AI Gateway.

No n8n, Zapier, queue, second database, scraper, or paid news API.

```text
Vercel Cron
  → GET /api/cron/news  (Bearer CRON_SECRET)
      fetch allowlisted RSS
      parse
      canonicalize URL
      dedupe against receipts + published URLs
      freshness window
      AI: relevance + desk + topics + context + flags
      validate structured output
      confidence gates
          pass → create/publish curatedNewsItem
          sensitive / invalid → exception document
          irrelevant / duplicate / stale → skip receipt
      structured log line
      revalidate /news and homepage tags
```

Events uses the same shape with `/api/cron/events` and ICS/RSS calendar
adapters.

Runtime rules:

- Node.js, not Edge (XML + Sanity + AI)
- One source at a time; isolate adapter failures
- 8–12s fetch timeout; continue the run if one source dies
- Persist only published items, exceptions, and compact ingest receipts
- Do not persist RSS descriptions or raw feed XML in Sanity
- If a raw snapshot is ever needed for audit, keep it outside Git and
  outside public CMS datasets (ADR-012)

Reuse existing entities: `source`, `organization`, `topic`, media/rights,
workflow. Do not invent a second publisher system.

Recommended new document types (implement later, in shared schema files
owned by Integration at that milestone):

- `curatedNewsItem` — public news card
- `event` — public event card
- `ingestSource` — allowlist registry
- `ingestReceipt` — URL/UID seen + outcome + expiry
- `ingestException` — human-needed item
- `ingestRun` — optional one document per cron run for Studio visibility

Rejected feed items must not become full news documents.

## 7. AI provider strategy

Task: relevance score, desk, optional topics, 1–2 sentence context, safety
flags. Structured JSON only. No tools. No browsing. No article-body fetch.

| Option | Price (paid, per 1M tokens, 2026-09-09) | Structured JSON | Notes |
| --- | --- | --- | --- |
| **OpenAI gpt-4o-mini** | $0.15 in / $0.60 out | Native structured outputs | Fast, cheap, proven schema adherence |
| OpenAI gpt-5-mini | $0.25 in / $2 out | Yes | More expensive than needed |
| **Gemini 2.5 Flash-Lite paid** | $0.10 in / $0.40 out | JSON mode | Cheapest capable model. Free tier trains on data — **do not use** |
| Gemini 2.5 Flash paid | $0.30 in / $2.50 out | Yes | Overkill |
| Claude Haiku 4.5 | $1 in / $5 out | Yes | 5–8× the cost of 4o-mini |

**Primary:** OpenAI `gpt-4o-mini` through **Vercel AI Gateway**.

Why:

- Best structured-output reliability for this job
- Fits Next.js / Vercel without a second vendor dashboard
- Gateway has zero token markup, managed fallback, and spend caps
- ADR-003 still applies: provision the Gateway when this milestone starts,
  then add the SDK. Do not add AI packages now

**Fallback:** Gemini `gemini-2.5-flash-lite` on the **paid** tier, same
Gateway, same JSON schema. Use if OpenAI 429s or fails schema validation
twice.

Do not use Gemini free tier. Google’s pricing page states free-tier prompts
may be used to improve products.

Do not send full articles to any model. Input is publisher name, headline,
URL host, date, and at most 400 characters of in-memory feed text.

Provision later (not now):

- `AI_GATEWAY_API_KEY` or Gateway project credentials
- `CRON_SECRET`
- Sanity write token scoped to ingest

## 8. Auto-publish gates

An item may auto-publish only if **all** of the following pass.

1. Source is in `ingestSource` and `enabled`
2. Canonical HTTPS URL parses, matches an allowlisted host, and is not a
   homepage/section index
3. Headline exists, 15–180 characters, not all-caps spam, not empty after
   entity decode
4. `sourcePublishedAt` parses to a real datetime
5. Item is fresh: published within the last 36 hours (Heritage: 7 days)
6. Deterministic dedupe misses (see §10)
7. `relevance` ≥ 0.78
8. `desk` is one of the four values and `deskConfidence` ≥ 0.72
9. Context validates:
   - 1 or 2 sentences
   - 40–320 characters
   - names the publisher or says “reports”
   - no first-person reporting claim (“we found”, “JOM investigated”)
   - no verbatim 12-word overlap with the feed excerpt
   - no URLs, emails, code fences, or HTML
   - no casualty counts, vote totals, or “officials say” figures that are
     not already in the headline
10. No image attachment unless a JOM rights-cleared asset already exists
11. No malformed required metadata
12. Prompt-injection / noise flags are false
13. `requiresHuman` is false
14. Daily source cap not exceeded
15. Daily global auto-publish cap not exceeded (start at 18/day)

Force exception, never auto-publish, when any flag is true:

- `sensitive` — casualties, terror, hostages, antisemitic attack, sexual
  crime, active shooting
- `opinion` — title or source section is Opinion / Editorial / Op-Ed
- `paywalledOnly` — URL or title marks premium-only and the card would
  strand readers (Haaretz is already excluded)
- `lowConfidence` — any score below threshold
- `schemaFail` / `injection` / `unparseableDate`

Skip silently (receipt only) when:

- `relevance` < 0.45
- stale
- duplicate
- sports / markets / celebrity with no Jewish bearing
- source disabled

If the AI call fails, do not publish. Write an exception or retry next run.

## 9. Prompt-injection and source safety

Feed titles and descriptions are **untrusted data**.

Rules:

1. System prompt is fixed in code. It never includes feed text.
2. User payload is a JSON object under a `SOURCE_DATA` key. The model is
   told that this block is data, not instructions.
3. Wrap the block in delimiters, e.g. `<<<SOURCE_DATA>>> ... <<<END>>>`
4. Instruct the model to ignore any text that claims to be a system update,
   publication rule, or jailbreak
5. No tools, no function calling, no URL fetch
6. Require structured output against a Zod / JSON schema
7. Post-validate every field; reject unknown keys
8. Reject context containing: `ignore previous`, `system prompt`,
   `api key`, `CRON_SECRET`, markdown code fences, `http`, `@`, or
   `javascript:`
9. Never interpolate feed text into the system prompt
10. Never echo feed description as `context`

Recommended output schema:

```ts
{
  relevance: number;          // 0–1
  desk: "jewish-world" | "israel" | "culture" | "heritage";
  deskConfidence: number;
  topics: string[];           // max 3, optional
  context: string;
  requiresHuman: boolean;
  sensitive: boolean;
  opinion: boolean;
  injection: boolean;
  reason: string;             // internal
}
```

If `injection` is true or schema validation fails, exception or skip. Never
publish the model’s raw text.

## 10. News dedupe

V1 does **not** cluster one world event across publishers. Two outlets may
both appear if both pass gates, subject to homepage source caps.

Deterministic, in order:

1. Exact `sourceUrl`
2. `normalizedUrl` — lowercase host, strip `www.`, strip tracking query
   (`utm_*`, `fbclid`, `gclid`), strip trailing slash, http→https
3. `sourceId + normalizedTitle` where title is lowercased, punctuation
   stripped, whitespace collapsed

Cautious fuzzy (same source only):

4. If publisher matches and normalized title token Jaccard ≥ 0.86 and
   published within 36 hours → treat as duplicate

Do not fuzzy-match across publishers in V1. That merges distinct stories
and hides source diversity.

## 11. News expiration

| Surface | Window | Why |
| --- | --- | --- |
| Auto-ingest freshness | 36 hours (Heritage 7 days) | Avoid reviving old wire copy |
| Homepage | 7 days, max 5 items, prefer 3 | “Following” must feel current |
| `/news` | 14 days | Weekend catch-up without a graveyard |
| Receipts | 30 days | Stop repeat AI spend |
| Exceptions | 14 days, then auto-archive | Keep Studio light |

After `expiresAt`, the item recedes: unpublished from homepage and `/news`
current lists, retained as `archived` for provenance. Do not delete
published URLs immediately; they may have been shared.

Default `expiresAt` = `sourcePublishedAt + 14 days`.

## 12. Event source research

Public Jewish event-discovery APIs are weak. Eventbrite removed public
search in 2019. Meetup’s open REST API is gone; GraphQL needs Meetup Pro
and approval. Luma’s official API is organization-scoped; some calendars
expose iCal. Sefaria’s Calendar API is **daily learning cycles**, not
public programs — do not ingest it as Events. Hebcal ICS is **Jewish
Today**, not Events.

Probed 2026-09-09:

| Source | Result | Use |
| --- | --- | --- |
| **Hebrew Union College** `https://huc.edu/?ical=1` | **Verified ICS.** `text/calendar`, VEVENT with UID, DTSTART, TZID, URL, SUMMARY, DESCRIPTION | **Launch** |
| USHMM `/online-calendar` | Timed out to this fetch; HTML calendar exists | Request ICS / partner |
| Museum of Jewish Heritage `?ical=1` | 403 | Request ICS |
| Jewish Museum NYC `/programs` | HTML only | Request ICS |
| Skirball Cultural Center `/calendar` | HTML only | Request ICS |
| 92NY `/events` | HTML only | Request ICS |
| Yad Vashem / ANU / NLI / JW3 / POLIN | 403 or HTML | Request ICS |
| JTS events | HTML, `?ical=1` did not return ICS | Request ICS |
| JCC Manhattan | Redirect maze; no public ICS found | Later |
| YU 25Live | `http://25livepub.collegenet.com/calendars/25live-all-events.rss` exists | Too noisy for V1 (campus-wide). Later with a hard Jewish-public filter |
| IAA publications RSS | Scholarly series, not events | Heritage news, not Events |
| Eventbrite / Meetup firehose | No licensed public search | Do not scrape |
| Luma org API / calendar ICS | Useful **if a partner gives JOM a calendar** | Partner path |

Honest V1 conclusion: **News automation can launch on public RSS.
Events automation can launch only on allowlisted ICS/API the founder or
partners actually provide.** One verified ICS is not a global calendar.
Do not scrape museum HTML to fake coverage.

## 13. Launch Event allowlist

| Source | Format | URL | Geo | Frequency | Terms | Quality | V1 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hebrew Union College | ICS | `https://huc.edu/?ical=1` | US / often online | Daily poll is enough | Public calendar export; link back; do not copy long description as JOM voice | UID, TZID, URL present; LOCATION sparse | **On** |
| JOM-owned events | Sanity manual | Studio | any | as created | JOM | Highest | **On** |
| Partner ICS #1–5 | ICS | *to be supplied* | mix of online / US / Israel / international | 2× daily | Written permission to poll the feed and link to the official page | Must have UID or URL, DTSTART, timezone | **Required before Events looks global** |

Founder / Integration should request public ICS or official API access from,
in this order:

1. USHMM
2. Museum of Jewish Heritage
3. 92NY Bronfman Center
4. Jewish Museum NYC
5. Skirball Cultural Center
6. Israel Museum or ANU
7. One international house (JW3, POLIN, or Jewish Museum Berlin)

Until at least three structured feeds exist, Upcoming Events can still
auto-publish from HUC + JOM + any partner feed in hand. The homepage module
hides when fewer than two upcoming items exist. Do not fabricate events.

Luma or Eventbrite **org-scoped** access is allowed only for an organization
that authorizes JOM. That is a partner integration, not a directory scrape.

## 14. Event normalization

Normalized fields:

| Field | Required to auto-publish | Source |
| --- | --- | --- |
| `title` | Yes | ICS SUMMARY / feed title. Not invented |
| `organizer` | Yes | From `ingestSource.organization`, never inferred from prose |
| `eventUrl` | Yes | ICS URL or official page. Must be HTTPS |
| `sourceUid` | Yes | ICS UID or stable hash(source + url + start) |
| `startAt` | Yes | ICS DTSTART. AI must not invent |
| `endAt` | If present | ICS DTEND |
| `timezone` | Yes | ICS TZID or UTC `Z`. If missing → exception |
| `mode` | Yes | `online` / `in-person` / `hybrid` from LOCATION + URL rules, else AI suggestion with low confidence → exception if unclear |
| `venueName` | If in-person | LOCATION text, not invented |
| `city` / `region` / `country` | If in-person and present | Parsed from LOCATION; else exception or source default city |
| `geoBucket` | Yes | `online` \| `israel` \| `united-states` \| `international` |
| `onlineUrl` | If online/hybrid | Same as eventUrl or explicit join link |
| `jomContext` | Yes | AI, 1–2 sentences, no new facts |
| `topics` | Optional | AI, max 3 |
| `provenance` | Yes | source id, feed URL, fetchedAt |
| `eventStatus` | Yes | `scheduled` / `cancelled` / `postponed` from ICS STATUS |
| `expiresAt` | Yes | `endAt` or `startAt + 1 day` |

AI may classify relevance, topic, geography, and short context.

AI must **not** invent time, place, speaker, organizer, or registration URL.
If those core facts are missing or contradictory → skip or exception.

Do not store the full ICS DESCRIPTION as public copy. Use it in-memory, max
400 characters, for context generation only.

V1 recurrence: publish the next instance only. Do not expand RRULE into a
season of cards.

## 15. Event dedupe

Conservative, in order:

1. `sourceUid`
2. Canonical `eventUrl`
3. `organizer + normalizedTitle + startAt` (to the minute, same zone)

Do not merge two sessions of the same talk at different times. Do not merge
across organizers.

## 16. Event AI gates

Auto-publish only if:

- Source enabled
- UID or URL + start + timezone present
- Event starts in the future and within 90 days
- Relevance ≥ 0.80 (campus noise is high)
- Context validates like News, and introduces **no fact** absent from
  title/location/organizer
- Not cancelled
- Not a ticketed party / happy hour / internal staff meeting
  (classifier + keyword denylist)

Otherwise skip or exception. Manual Studio entry bypasses AI but still
requires timezone, URL, and organizer.

## 17. Cron cadence

| Job | Cadence | Why |
| --- | --- | --- |
| News | Every **2 hours** | Wires move through the day; hourly doubles invocations for little V1 value |
| Events | **Twice daily** (13:00 and 21:00 UTC) | Calendars change slowly; ICS clients already poll on the order of hours |
| Expiration sweep | With each job | Cheap GROQ/status flip |

Vercel Cron is included on Pro. These volumes are negligible next to page
traffic. Do not add a queue.

Manual `GET` with `CRON_SECRET` must work in preview for validation.

## 18. Studio management (lightweight)

One desk, three lists. Not a newsroom.

1. **Sources** — `ingestSource`: name, type (rss/ics/api/manual), URL,
   enabled toggle, default desk/geo, host allowlist, per-run cap, last
   success, last error
2. **Published** — current unexpired News and Events
3. **Exceptions** — failed gates, sensitive flags, missing timezones

Show ingest timestamps on the source document. An editor can disable a
source without a deploy. Featured flags remain manual.

Do not build analytics charts, assignment workflows, or Slack bridges in V1.

## 19. Observability

One JSON log line per run. No Sentry, Datadog, or paid APM for this
milestone. Vercel runtime logs are enough.

```json
{
  "job": "news",
  "runId": "...",
  "source": "jta",
  "fetched": 20,
  "normalized": 20,
  "duplicates": 14,
  "rejected": 3,
  "autoPublished": 2,
  "exceptions": 1,
  "failures": 0,
  "durationMs": 1840
}
```

Plus a daily rollup `ingestRun` document if Studio visibility is needed.

Alert later, not now: email or Vercel notification only if a source fails
three consecutive runs.

## 20. Copyright / rights

**News public card**

- original headline
- publisher name
- publication date/time
- canonical URL
- 1–2 sentence JOM context (model-written, schema-validated, not a pasted
  excerpt)

No full article body. No publisher or Open Graph image. No verbatim RSS
excerpt as JOM copy. No scraping beyond the allowlisted feed.

Gray areas:

- Times of Israel ToS is unusually broad about “rewriting for publication.”
  V1 stores identifiers and writes original JOM context, then links out.
  Founder should accept that residual ToS risk or drop TOI from auto-publish.
- Jerusalem Post allows RSS-based sites if you stay inside the feed. V1
  still does not display feed descriptions or feed images.
- Forward reprint rights exist and are unused in V1 on purpose.
- Headlines are used as identification of the linked work, not as JOM
  reporting.

**Events public card**

- factual metadata (title, time, timezone, venue/city, organizer, official
  URL)
- short JOM context
- link to the official page

Do not republish long official blurbs. Do not hotlink flyer art.

## 21. Homepage recommendation

Do not implement on the art-direction branch.

Current live sequence:

Masthead → Today → History → Manifesto → Podcasts → Support

Integration already proposed, once real items exist:

Masthead → Today → History → Originals → **What We’re Following** →
Podcasts → **Upcoming Events** → Manifesto / Support

Keep that order.

| Module | Count | Hide when |
| --- | --- | --- |
| What We’re Following | 3 typical, 5 max | 0 items |
| Upcoming Events | 3 | fewer than 2 upcoming |

News cards: headline, publisher, time, JOM context, outbound URL. Image only
if JOM has rights-cleared media.

Event cards: date as the visual object (already noted on the Integration
homepage doc), title, place or “Online”, official URL.

Homepage reads Sanity only. Never fetch RSS/ICS from the homepage.

## 22. Navigation recommendation

Integration nav is currently Today, History, Podcasts, About, Support. News
and Events are not top-level there.

**V1 recommendation: do not add both to primary nav when the desks first
populate.**

Reasons: the homepage already has a tight Jewish object; two more top-level
items compete with Today / History / Podcasts; Events volume will be thin
until partner ICS arrives.

When to add:

- Add **News** to primary nav after 7 consecutive days with at least 3 live
  unexpired items
- Add **Events** to primary nav after 8 upcoming events across at least 2
  geo buckets

Until then, the modules and `/news` `/events` URLs are enough. Footer links
are optional and Integration-owned.

## 23. Cost model

Assumptions: 7 news feeds every 2 hours; ~80–150 new unique URLs/day; AI
only on unseen URLs; ~10–20 auto-publishes/day; events twice daily on 1–6
calendars.

| Item | Small launch | Moderate launch |
| --- | --- | --- |
| Vercel Cron + function time | ~$0 incremental on Pro | ~$0 incremental |
| AI (gpt-4o-mini, ~1k tokens/candidate) | **$1–3 / month** | **$5–12 / month** |
| Sanity documents | Fits Free if receipts expire and rejects are not full docs | Watch the 10k document cap; purge receipts |
| Source / API fees | $0 | $0 unless a partner requires Eventbrite/Meetup Pro |
| NewsAPI / syndication | $0 — rejected | $0 — rejected |

**Target: under $15/month incremental, usually under $5.** Set an AI Gateway
budget of $20 with an alert at $10.

Vercel Pro (~$20/user) remains the commercial hosting decision already on
the books, not a News surcharge.

## 24. Implementation phases

Adjusting the requested order so public pages exist before homepage/nav, and
Events follow a proven News path.

| Phase | Work | Done when |
| --- | --- | --- |
| **A** | `ingestSource` registry, conceptual models, RSS/ICS parsers, URL canonicalization, Zod schemas. No AI, no publish | Parsers return fixtures + live allowlist samples in logs |
| **B** | News fetch against the 7 live feeds. Write receipts only. Measure volume, parse failures, date quality | 48 hours of dry-run logs; eJP/JNS parse issues handled |
| **C** | AI Gateway, gates, auto-publish to Sanity, exceptions, daily caps | Ordinary JTA/Forward items publish without a human; sensitive items do not |
| **D** | Events ICS adapter, HUC live, partner feeds as they arrive, event gates | Upcoming events exist without daily manual entry |
| **E** | `/news` and `/events` index routes from published documents | Empty states omit lists; no fabricated cards |
| **F** | Homepage modules + nav rule above. Integration-owned | Slots hide when empty; current art-direction is not disturbed until this phase |
| **G** | Cron schedule, `ingestRun` logs, source disable, expiration sweep | Jobs survive a single source outage |

Do not start F while the Jerusalem / museum homepage pass is open.

Shared files Integration must change later, not now: Sanity schemas,
sitemap, homepage composition, optional nav, `.env.example`, AI/cron env
names. `package.json` only when Gateway SDK is provisioned.

## 25. Founder decisions still required

1. Accept Times of Israel in the auto-publish allowlist under the
   identifiers-only rule, or drop it.
2. Keep JNS at a cap of 2/run, or move it to later.
3. Confirm Haaretz stays out of auto-publish.
4. Obtain at least two more official ICS/API calendars before Events is
   treated as a global product.
5. Confirm AI-written context may appear as JOM voice when gates pass.
6. Confirm homepage order: Today → History → Originals → Following →
   Podcasts → Events → Manifesto/Support.
7. Confirm nav stays unchanged until the volume gates in §22.
8. Approve provisioning Vercel AI Gateway with a $20 monthly budget when
   implementation starts.

Defaults if the founder does not object: TOI in, JNS capped, Haaretz out,
Events launches on HUC + JOM + whatever ICS arrives, AI context allowed,
homepage order as above, nav delayed, Gateway budget $20.

## 26. What this workstream did not do

- No Integration or homepage edits
- No navigation edits
- No shared Sanity schema edits
- No design-file edits
- No app code
- No Sanity writes
- No deploy
- No content publication
