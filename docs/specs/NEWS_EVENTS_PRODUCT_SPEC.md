# News + Events Product Specification

Status: research complete on `research/news-events`. No application code,
Sanity writes, homepage changes, schema changes, or deploys were made.

This workstream owns only this specification. Integration owns shared
application surfaces. History, Jewish Today, and Podcasts remain on their
own branches.

Research date: 2026-09-03. Feed probes and public terms were checked that
day. Recheck official URLs and terms before any later implementation.

This document is editorial and product research, not legal advice.

## 1. Why this exists

Jewish Original already names Discovery as “restrained curation of news,
culture, and events” (`docs/PRODUCT.md`). A full newsroom and indiscriminate
feed aggregation are out of scope. Roadmap Milestone 4 later calls for
approved-feed ingestion with editor approval.

This spec defines the products before code so Integration can implement them
without inventing a news aggregator, an event directory, or a second CMS.

Working names:

- **News:** What We’re Following
- **Events:** Curated Jewish Events

Design rule, unchanged: machines handle repetition; humans handle judgment,
meaning, and voice.

The public feel should be premium, editorial, Jewish, current, trustworthy,
useful, curated, and human. It must not feel like a generic aggregator, RSS
firehose, Google News clone, Eventbrite dump, AI news site, or partisan
outrage feed.

## 2. Relationship to existing source of truth

Do not treat this file as a replacement for `docs/PRODUCT.md`,
`docs/CONTENT_MODEL.md`, `docs/ARCHITECTURE.md`, or `docs/ROADMAP.md`.

Those shared documents already sketch:

- curated news items that link out and are not copied
- events with timezone, organizer, review, and expiration
- approved-feed adapters and editor approval
- existing `source`, `organization`, `topic`, `person`, `place`, and
  rights-aware media documents

This spec refines those sketches into a V1 that can be implemented. Integration
should later fold the accepted decisions into the shared docs. Until then, this
file is the News + Events planning record.

Foundation navigation already lists `/news` and `/events`. Those routes have
no pages yet. Do not add them in this workstream.

## 3. News product definition

News on Jewish Original is **not a breaking-news newsroom**.

It is a small, editor-chosen record of current reporting and institutional
developments that a Jewish reader should be able to follow without living
inside a firehose.

A story belongs if it is:

1. **Jewishly relevant** — it concerns Jewish people, communities, Israel,
   Jewish culture, Jewish learning, antisemitism, or Jewish heritage in a
   way that is not incidental.
2. **Current** — it is happening now or has been newly reported, not an
   historical anniversary (that is History / Jewish Today).
3. **Sourceable** — a named, reputable publisher or institution published it.
4. **Useful** — a reader gains orientation, not just stimulation.

A story does not belong if it is:

- generic world news with no Jewish bearing
- partisan campaign coverage as a standing beat
- sports, markets, or celebrity gossip unless the Jewish relevance is the
  story
- an unverified social post
- a press release with no independent or institutional significance
- a History archive entry, On This Day match, or calendar observance
- a podcast episode
- opinion presented as reporting
- a story JOM cannot attribute

### What News is, operationally

V1 News is mostly **links to outside reporting**, each wrapped in a short
JOM-written context line.

| JOM action | When |
| --- | --- |
| Headline + source + link only | Almost never. Too thin; feels like an aggregator. |
| Headline + source + link + 1–2 sentence JOM context | Default V1. |
| Original JOM summary / briefing | When several outlets cover one event and JOM can add orientation without copying. Still links out. Still editor-written. |
| Full original JOM article | Rare. Use the existing `article` type, not a news card. Only when JOM has reporting, a distinct synthesis, or a durable explainer. Not in the first News milestone. |

JOM context is JOM-authored prose. It is not a rewritten lede, not an AI
paraphrase published as original reporting, and not a pasted RSS description.

### Distinguishing nearby products

| Product | Time | JOM voice | Destination |
| --- | --- | --- | --- |
| **News** | Current reporting | Short orientation | Usually the source |
| **JOM Originals / articles** | Durable editorial work | Full JOM voice | `/` story pages, later |
| **History** | Past, structured, cited | Permanent archive | `/history/[slug]` |
| **Culture item** | A book, work, or discovery as an object | Commentary on the object | Later culture desk |
| **Jewish Today** | Today’s Jewish calendar | Calculated + History match | `/today` |
| **Podcasts** | Episodes | Show and episode pages | `/podcasts` |

History does not become News because a date is today. A podcast does not
become News because it mentions a current event. A culture object is not News
because a prize was announced; the announcement may be News, the object may
later be a culture item.

## 4. V1 News taxonomy

Do not launch nine desks. Comprehensive-looking taxonomies become empty
filters and invite filler.

V1 uses four **desks**. Finer meaning uses existing CMS `topic` documents.

| Desk | Includes | Excludes |
| --- | --- | --- |
| **Jewish world** | Diaspora communities, institutions, people, communal life, and antisemitism when it is actual news | Daily grievance roundups; US politics as such |
| **Israel** | Civic, cultural, scientific, and nationally significant Israeli developments a global Jewish reader needs | A war/politics ticker; every coalition rumor |
| **Culture** | Books, arts, media, food, and music with Jewish relevance | Generic entertainment |
| **Heritage** | Archaeology, museums, archives, restorations, newly reported historical findings | History archive essays; On This Day |

Antisemitism is a **topic**, not a fifth desk. A dedicated antisemitism rail
would turn News into an outrage feed.

Torah and tradition current events (a new translation, a denominational
decision, a major beit din story) sit under Jewish world or Heritage. Daily
parashah, holiday, and candle times belong to Jewish Today, not News.

Innovation and science appear only when the Jewish or Israeli relevance is
the reason for selection. They do not get their own desk.

Desks are editor-managed values on the news document. They must not be
hard-coded into application enums beyond the initial Studio list
(ADR-006). Topics remain references.

## 5. Editorial positioning and safeguards

Jewish Original is supportive of the Jewish people and Israel, broadly
Jewish, not partisan, and not denominationally exclusive. News inherits that
mission. It does not add an ideological rulebook.

Safeguards:

1. **Factual framing.** JOM context states what was reported and by whom.
   It does not launder allegation into fact.
2. **Strong sources.** Prefer named newsrooms and institutions over blogs,
   anonymous accounts, and aggregators of aggregators.
3. **Clear attribution.** Every public news card names the source and links
   to the canonical URL.
4. **Restraint on breaking claims.** JOM is not first. Wait for a trusted
   source, and prefer a second independent source for casualty figures,
   arrests, and “officials say” claims that have not been confirmed.
5. **No clickbait.** JOM may tighten a headline for house style. It may not
   heighten it.
6. **No rage farming.** Do not feature a story because it will inflame.
7. **No silent AI publication.** AI may help an editor draft context. The
   editor owns the words. The byline is never “AI.” The card is never
   published without a human.
8. **Opinion is labeled.** If JOM points to commentary, the card says
   Commentary, not News.
9. **Corrections are visible.** If JOM context was wrong, update it. If the
   underlying story collapses, archive the item with a short note rather
   than pretending it never ran.

### Politically sensitive stories

Handle them as current events, not as a side. Practical rules:

- Report what happened and who reported it.
- Do not pick a party, coalition, or US ticket.
- Do not hide Israel-related news to appear neutral, and do not flood the
  module with security items to appear loyal.
- Prefer institutional and newsroom sources over advocacy press releases.
- When the same event is covered from sharply different angles, one JOM
  item with a primary source is enough. Optional related links may show
  that other reputable outlets also reported it. JOM does not stage a
  debate card.
- Casualties, hostages, terror, and antisemitic attacks require extra
  restraint: no graphic images, no unsourced counts, no speculative motive.

JNS and Haaretz may both appear in the source mix. Neither is the house
voice. Source diversity is an editorial duty, not a quota algorithm.

## 6. Copyright-safe reuse model

V1 public unit:

```text
JOM headline treatment
source name
source date
1–2 sentence JOM-written context
link to the original
optional JOM rights-cleared image
```

Never republish external article text. Never scrape full pages. Never store
RSS descriptions or ledes in Sanity. Never hotlink publisher images or Open
Graph thumbnails.

| Material | Store in Sanity? | Publish? |
| --- | --- | --- |
| Canonical URL | Yes | Yes, as the outbound link |
| Publisher / source reference | Yes | Yes |
| Original headline, as identification of the linked work | Yes | Yes, or a JOM treatment of it |
| Source published time | Yes, if the feed or page provides it | Yes |
| Normalized URL / duplicate key | Yes | No |
| JOM context / summary | Yes, editor-written | Yes |
| RSS or page excerpt | No | No |
| Full article body | No | No |
| Publisher photo / OG image | No, unless a separate license exists | No |
| JOM-owned or rights-cleared image | Yes, as existing media | Yes, with credit |
| Raw feed snapshot | No. If later needed for audit, keep it outside Git and outside public CMS datasets (ADR-012) | No |

An RSS feed is a delivery method, not a license. Credit is not a license.
Fair use is case-by-case and is not a product strategy.

JOM-authored context is JOM copyright. It must be written from understanding
of the story, not stitched from the source lede.

Recommended public attribution:

> The Jerusalem Post reports that …
> Read the original at jpost.com

or, when JOM has synthesized more than one source:

> Reporting: Times of Israel; also covered by JTA.

Do not buy syndication in V1. Buying JTA or Times of Israel reprint rights
would tempt the product to become a reprint site and would add cost before
the curation habit exists.

The Forward currently allows free republication of *original Forward*
stories under strict conditions (credit, tracking pixel, canonical, noindex,
no image scrape, no substantive edits). That is a later option for a rare
JOM-hosted reprint, not the V1 model. V1 still links out. If a reprint is
ever used, it is an `article` with partner provenance, not a news card, and
it must follow the Forward checklist exactly.

## 7. News source research

Probed 2026-09-03 unless noted. “Works” means the URL returned RSS/XML to a
simple authenticated-as-research fetch. Terms are summarized from public
pages and must be reread before implementation.

### V1 monitor set (editorial reading now; candidate ingest later)

| Source | Character | RSS / API | Reuse | Cost | Automation later |
| --- | --- | --- | --- | --- | --- |
| **Jewish Telegraphic Agency** | Mission-driven Jewish wire; broad, nonpartisan self-description; 70 Faces Media | `https://www.jta.org/feed` works | Headline + link + JOM context only. Full-text needs paid syndication (price not public) | $0 to link; syndication is a later paid decision | Good candidate feed. Do not republish body |
| **Times of Israel** | Jerusalem English newsroom; high volume | `https://www.timesofisrael.com/feed/` works | Terms restrict republication and “rewriting for publication.” Treat as outbound link + JOM-original context only. Paid syndication starts at $500/month for print packages | $0 to link; do not buy syndication in V1 | Usable as a candidate feed if ingest stores URL/title/date only. Recheck terms first |
| **Jerusalem Post** | High-volume Israeli English daily | Official RSS index at `/rss`. Frontpage, headlines, all-news, diaspora, antisemitism, archaeology, culture, Israel news all 200 XML | Unique among major Israeli papers: ToS expressly allows using the RSS feed to build a site **if you do not crawl beyond the feed**. Feed images only with their attached text | $0 for feed use within those terms | Best-documented V1 ingest candidate. Still do not copy body from the site |
| **Haaretz English** | Israeli paper of record with a distinct critical editorial voice | `https://www.haaretz.com/srv/haaretz-latest-headlines` works. Other listed section feeds were not all verified | Site terms claim content ownership; no explicit commercial RSS-republication license found | $0 to link. Do not scrape the paywall | Monitor and link. Ingest only identifiers if used |
| **The Forward** | US Jewish nonprofit newsroom | `https://forward.com/feed` and `/news/feed/` work | Free reprint of *original* Forward stories under their republish rules; JTA/Haaretz items on their site are excluded | $0 | Excellent monitor. V1 still links out |
| **JNS** | Israel / Jewish news agency with an explicit counter-narrative mission | `https://www.jns.org/feed/` → `index.rss` works | No blanket reprint right found. Headline + link + JOM context | $0 | Usable candidate feed. Do not let it dominate Israel coverage |
| **eJewishPhilanthropy** | Communal / institutional Jewish sector | `https://ejewishphilanthropy.com/feed/` works | Standard WordPress feed; assume no reprint right | $0 | Good for community and institutional news |
| **Biblical Archaeology Society** | Heritage / archaeology | `https://www.biblicalarchaeology.org/feed/` works | Link + JOM context. Do not copy features | $0 | Good Heritage desk candidate |
| **My Jewish Learning** | 70 Faces education, not a newsroom | `https://www.myjewishlearning.com/feed/` works | Better as education/culture context than News | $0 | Do not ingest as news |
| **Unpacked / ISRAEL21c** | Israel culture and explainers; ISRAEL21c redirected into Unpacked | `https://unpacked.media/feed/` works | Link + JOM context | $0 | Occasional Culture / Israel feature, not a wire |

### Useful secondary monitors (manual; not V1 ingest)

| Source | Notes |
| --- | --- |
| **Ynetnews / ynet English RSS** | `StoryRss3082.xml` (News) and `StoryRss3443.xml` (Jewish Scene) work. High volume, more tabloid than JTA. Manual only |
| **Moment Magazine** | `https://momentmag.com/feed/` works. Magazine pace; Culture / ideas |
| **Jewish Insider** | Feed works; often paywalled. Link if the story matters; do not make it a house source |
| **Canadian Jewish News** | `https://thecjn.ca/feed/` works. Use for Canadian community stories, not as a global wire |
| **Jewish News (UK)** | `https://www.jewishnews.co.uk/feed/` works. Same: local when relevant |
| **Tablet** | Common `/feed` URL returned 403 to this research fetch. Treat as manual |
| **i24NEWS** | `/en/rss` returned HTML, not a feed. Manual |
| **Israel MFA / gov.il** | No reliable public English MFA RSS found in this research. Official pages are citable as primary sources when an editor opens them. Do not scrape |
| **Israel Antiquities Authority** | Publications portal offers RSS for scholarly series, not a general news wire. Good Heritage alerts; still editor-selected |
| **USHMM / Yad Vashem** | Public calendars and press pages exist; probed RSS URLs 404/403. Manual institutional monitoring |
| **Associated Press / Reuters** | Public RSS, where offered, is generally personal/non-commercial or enterprise-licensed. AP historically required unmodified headlines and a direct link and reserved the right to revoke. Reuters content is a paid media product. **Do not ingest AP or Reuters feeds.** An editor may read them and link a specific story |

### Do not use in V1

- NewsAPI.org and similar commercial news APIs. NewsAPI Business is
  **$449/month** and still does not supply licensed full text.
- Google News RSS as a source of record.
- Social scrapes (X, Facebook, Instagram).
- Advocacy inboxes as if they were newsrooms (ADL, AJC, party spokespeople).
  Those organizations may *be* the story; they are not the desk.
- Al Jazeera, random world wires, or outrage accounts “for balance.”

V1 source practice: editors read a short allowlist. The public module should
usually show at least two publications across a week. No automated source
quota.

## 8. News workflow and lifecycle

### V1 (manual)

```text
editor finds a story
  → create Sanity draft
  → write JOM context
  → set desk, source, URL, times
  → mark ready
  → human publish
  → appears on /news and, if featured, homepage
  → expires or is archived
```

No feed ingest. No AI publish. No homepage auto-fill.

### Later (candidate ingest)

```text
allowlisted feed/API
  → fetch
  → normalize URL
  → deduplicate
  → store candidate identifiers only
  → optional preliminary desk/rank
  → editor queue
  → human relevance + context + publish
```

### What may be automated later

- Feed retrieval
- URL normalization
- Duplicate detection
- Preliminary desk suggestion
- Preliminary ranking
- Source metadata
- Expiration of dated items
- Candidate queue

### What stays human

- Whether the story belongs
- Headline treatment
- JOM context
- Political or sensitive framing
- Publication
- Featured / homepage placement
- Corrections and takedowns

AI may draft a context sentence inside Studio. It cannot publish, feature,
or silently overwrite approved copy.

### Lifecycle

| State | Meaning |
| --- | --- |
| `candidate` | Ingest only. Never public |
| `draft` | Editor started it |
| `review` | Waiting on a second pair of eyes when the team has one |
| `ready` | Eligible for Sanity publish |
| `published` | Public while unexpired |
| `updated` | Same item, revised after source correction or story movement |
| `expired` | Off homepage and receding on `/news` |
| `archived` | Kept for provenance; not listed as current |
| `rejected` | Candidate declined; keep URL so it is not re-queued |

Sanity draft/published remains the publication authority (ADR-011).
`workflowStatus` does not publish by itself.

V1 rules:

- **Homepage:** 3 items typical, 5 maximum, all unexpired and featured or
  most recent.
- **Default expiration:** 14 days after `sourcePublishedAt` or JOM
  `publishedAt`, whichever the editor sets. Heritage items may be longer.
- **Same event, many outlets:** one JOM item, one primary source, optional
  related source links. Do not publish four cards for one bombing or one
  prize.
- **Source corrects a headline:** editor updates JOM headline/context if the
  public card would otherwise mislead.
- **Story was wrong:** archive with a one-line note. Do not vanish it if it
  was on the homepage.
- **Story evolves for days:** update the same item until the event has a
  new phase that a reader would recognize as a new story.
- **JOM is not breaking news.** If only one source has it and the claim is
  extraordinary, wait.

## 9. Conceptual News content model

Do not implement this now. When Integration implements it, add a
`curatedNewsItem` document and reuse existing entities.

Proposed V1 fields:

| Field | Keep? | Why |
| --- | --- | --- |
| `title` | Yes | JOM headline treatment. Required |
| `sourceHeadline` | Yes | Original headline if different. Internal + optional display |
| `source` | Yes | Reference to existing `source` |
| `sourceUrl` | Yes | Canonical outbound URL. Required. Unique |
| `relatedSourceUrls` | Optional | Max 3. Same story, other outlets |
| `sourcePublishedAt` | Yes | When the source published, if known |
| `jomPublishedAt` | Derived | Sanity published time is enough; do not duplicate unless needed |
| `desk` | Yes | One of the four V1 desks |
| `topics` | Yes | Existing `topic` refs. Sparse |
| `people` / `places` / `organizations` | Later | Useful, not required to ship. Add when editors actually use them |
| `context` | Yes | 1–2 sentences, JOM-authored. Required to publish |
| `image` | Optional | Existing rights-aware media only |
| `featured` | Yes | Homepage eligibility |
| `expiresAt` | Yes | Required. Default +14 days |
| `workflowStatus` | Yes | Align with existing editorial workflow values plus `candidate` |
| `reviewedAt` / `reviewedBy` | Yes | Matches current History habit |
| `selectionNote` | Yes | Internal. Why this was chosen. Never public |
| `correctionNote` | Optional | Public only when needed |
| `normalizedUrl` | Yes if ingest exists | Internal dedupe key |
| `slug` | No in V1 | No public item page |
| `seo` | No in V1 | Index the `/news` index, not thin permalinks |
| `body` | No | That is an `article` |

Recommended V1 public shape: **outbound cards on `/news`**. No
`/news/[slug]` until JOM is writing original briefings worth a permalink.

If a permalink is later required for social sharing, add it as a thin JOM
page that still sends readers to the source and never hosts the source text.

## 10. News homepage contract

Integration owns the homepage. News supplies data, not layout.

Proposed accessor: `getWhatWereFollowing()` in a future
`src/features/news` module.

```ts
type WhatWereFollowingItem = {
  id: string;
  headline: string;
  sourceName: string;
  sourceUrl: string;
  sourcePublishedAt: string; // ISO
  context: string; // JOM-authored, 1–2 sentences
  desk: "jewish-world" | "israel" | "culture" | "heritage";
  image?: {
    src: string;
    alt: string;
    credit: string;
  };
};

type WhatWereFollowingModule = {
  items: WhatWereFollowingItem[]; // 0–5, prefer 3
};
```

Rules for Integration:

- Query published, ready, unexpired items, featured first, then newest.
- Cap at 5. If zero, omit the module. Do not fabricate items.
- Image only when the news document has rights-cleared media.
- The module is a named later desk on the current Integration homepage. Do
  not implement it until `/news` can serve real items.
- Do not call feeds from the homepage. Read Sanity only.

## 11. Events product definition

Events on Jewish Original is **not a Jewish Eventbrite**.

V1 is **Curated Jewish Events**: a short list of gatherings JOM is willing
to put its name near.

Belongs:

- JOM’s own events, when they exist
- Partner events JOM has a relationship with
- Museum, archive, and historical programs
- Serious public Jewish learning, lectures, book talks, festivals,
  conferences
- Livestreams and virtual learning of the same quality
- Community gatherings that are public, identifiable, and mission-aligned

Does not belong:

- Every synagogue bulletin item
- Happy hours and unaudited socials
- Duplicate ticket-page spam
- Political rallies as a directory category
- Events whose only source is an unverified Facebook post
- Recurring services (Shabbat times belong to Jewish Today / local
  institutions, not this list)

V1 success is ten excellent upcoming items, not a thousand mediocre ones.

## 12. Event source and provider research

The useful finding: **public event-discovery APIs are mostly gone.**
Automation that depends on scraping Eventbrite or Meetup would violate this
project’s lean-stack and legal rules.

| Provider | Availability | Cost | Fit |
| --- | --- | --- | --- |
| **Manual editorial entry** | Immediate | $0 | V1 default |
| **Partner submission to editors** | Email / later form | $0 | V1 process, not a public form |
| **Official ICS / Google Calendar** from a named institution | Common when the institution publishes one | $0 | Best later ingest. Allowlist only |
| **Luma** | Official API is organization-scoped (`public-api.luma.com`). Public calendars can expose iCal (`api.lu.ma/ics/get?...`). Discover feeds are undocumented internals | $0 for ICS of calendars JOM is invited to follow | Good for partners who already use Luma. Not a global search engine |
| **Eventbrite** | Public event *search* API shut down 2019. Remaining API is org-scoped OAuth for *your* events. Distribution partner program is a later business conversation | API free for own org; no licensed firehose | Use only if JOM or a partner authorizes org-scoped access. Do not scrape |
| **Meetup** | Open REST API retired. Current GraphQL API requires Meetup Pro and approval. Access changed Feb 2025 | Paid Pro + approval | Do not scrape the site GraphQL. Revisit only for a specific partner group |
| **Museum / JCC / 92NY / university calendars** | Public HTML calendars; ICS sometimes on a per-event or per-calendar basis. No universal Jewish events feed | $0 | V1: editor copies from the official page. Later: allowlisted ICS |
| **Facebook / Instagram events** | No supported public API for this use | n/a | Out |

Priority V1 organizers to watch manually, not integrate:

- JOM itself
- USHMM, Yad Vashem, Museum of Jewish Heritage, Israel Museum, ANU,
  Skirball, CJM
- 92NY Bronfman Center and comparable Jewish cultural venues
- Jewish Book Council / book-talk series
- Limmud and similar learning festivals
- Selected JCCs, Hillels, and universities when the program is public and
  distinctive
- Sefaria, museums, and archives when they announce public programs

Do not ingest Chabad.org or federation calendars as a dump. Individual
events may be chosen like any other.

## 13. Events V1 geography

JOM will eventually serve Jews globally. There is not enough curated volume
to justify city search, maps, or geolocation consent.

V1 geography is four values plus optional city text:

| Value | Use |
| --- | --- |
| `online` | Virtual-only |
| `israel` | In Israel, including hybrid with an Israeli venue |
| `united-states` | In the United States |
| `international` | Everywhere else |

Optional `city` and `country` strings help the card (“Jerusalem”,
“London”) without becoming a directory.

No geo IP. No “events near me.” No map. Revisit city discovery after a
steady backlog of events exists in more than one region.

Display times in the event’s IANA timezone with an abbreviation. Do not
silently use Jewish Today’s `America/New_York` rule for a Tel Aviv lecture
or a London book launch. A later “your time” toggle is optional and not V1.

## 14. Conceptual Events content model

Do not implement this now. Proposed document: `event`.

V1 fields:

| Field | Keep? | Why |
| --- | --- | --- |
| `title` | Yes | Required |
| `eventUrl` | Yes | Required until JOM hosts RSVP |
| `startAt` | Yes | Datetime |
| `endAt` | Yes if known | Optional only when the source omits it |
| `timezone` | Yes | IANA string. Required. Do not infer |
| `mode` | Yes | `in-person` \| `online` \| `hybrid` |
| `venueName` | If in-person or hybrid | |
| `city` | If in-person or hybrid | Free text |
| `country` | If in-person or hybrid | Free text |
| `geoBucket` | Yes | The four V1 values |
| `organizer` | Yes | Existing `organization` |
| `jomContext` | Yes | Short JOM why-this-matters. Required to publish |
| `description` | No as imported source text | If needed later, JOM-written only |
| `topics` | Optional | Existing `topic` refs |
| `people` | Later | Speakers as `person` when worth it |
| `image` | Optional | Rights-aware media only |
| `source` | Yes | Where JOM learned of it |
| `featured` | Yes | Homepage / Today eligibility |
| `eventStatus` | Yes | `scheduled` \| `postponed` \| `cancelled` |
| `workflowStatus` | Yes | Same family as other editorial types |
| `expiresAt` | Derived | End datetime, or start + 1 day |
| `recurrence` | No in V1 | Enter the next occurrence only |
| `coordinates` / structured address | No in V1 | City + venue is enough |
| `slug` / SEO | Optional | `/events` index is enough to start. Add `/events/[slug]` only if JOM needs a permalink for its own events |

Hard cases:

- **Recurring:** publish the next instance. When it ends, archive or roll
  to the following date by hand.
- **Cancelled / postponed:** keep the document, set `eventStatus`, drop it
  from upcoming lists, and say so if it was featured.
- **Hybrid:** require venue *and* URL.
- **Timezone mistakes:** reject publish without an IANA zone. Store UTC
  instants derived from zone + local time, and also keep the zone.

## 15. Events workflow and automation boundary

V1 is manual, like News.

Later:

```text
allowlisted ICS / partner calendar / submission
  → normalize times and URLs
  → suggest duplicates
  → editor approves
  → publish
  → auto-archive after endAt
```

Machines may later:

- parse ICS
- normalize timezones
- clean URLs
- suggest duplicates
- expire past events
- suggest a topic

Humans always:

- decide the event belongs on JOM
- write context
- feature it
- handle communal or political sensitivity
- confirm cancellations that a feed missed

Do not scrape Eventbrite, Meetup, or Facebook to fill the calendar.

## 16. Community submissions

A public “Submit an event” form is **later**, not V1 and not V1.5.

Reasons:

- V1 does not yet have enough published events to teach the standard.
- Submissions are operational data (spam, identity, rate limits). The
  shared architecture reserves PostgreSQL for that class of problem.
  Putting raw public submissions into Sanity would mix untrusted input with
  editorial content.
- Roadmap already places community submissions after evidence.

When it happens:

```text
form → validated payload → candidate (not public) → human review → event
```

Moderation minimum: rate limit, honeypot, authenticated or emailed
organizer, required URL, no image upload in the first form, and no
publish-on-submit.

Until then, editors may accept partner emails and enter events themselves.

## 17. Relationships with existing products

| Surface | News | Events |
| --- | --- | --- |
| **History** | No automatic promotion. A new archaeological find may be News; the 1945 article stays History | Museum programs may be Events; they do not rewrite History entries |
| **Jewish Today** | Do not inject news into the calendar. A later Today module may optionally show one featured News item; that is a Today/Integration decision | A later Today module may show one timely event. Calendar observances remain Hebcal, not Events |
| **Podcasts** | An episode is not a news item. A guest’s book-tour date may be an Event | Do not auto-create events from episode release dates |
| **Homepage** | “What We’re Following,” 3–5 items | “Upcoming Events,” 2–3 items |
| **Culture desk** | News-about-culture vs durable culture objects stay separate | Festivals may be Events; reviews are not |
| **Newsletters / social** | Same approved items. Do not invent a second queue | Same |

Jewish Today’s V1 contract stays Hebcal + History matches. News and Events
are additive later modules, not inputs to `getJewishToday()`.

## 18. Infrastructure recommendation

Leanest future stack, in order:

1. Existing Sanity documents, entered by hand.
2. Existing Next.js Server Components reading those documents.
3. Native `fetch` of allowlisted RSS/ICS, later, behind an adapter in
   `src/integrations`.
4. Vercel cron only when scheduled ingest exists and a human still
   publishes.
5. Existing Sanity image pipeline for rights-cleared media.

Do not add:

- scraping infrastructure
- a second database for editorial news/events
- NewsAPI, GDELT-as-product, or other paid news APIs
- a queue service
- Elasticsearch / Algolia
- Zapier / Make / n8n
- `@hebcal/core` or any GPL library
- a generic RSS-to-site plugin

If an XML helper is later required, Integration should prefer the platform
or a small already-justified parser. Do not add a package in this
workstream.

Reuse, do not duplicate: `source`, `organization`, `topic`, `person`,
`place`, media/rights objects, publication workflow, Studio desks.

## 19. Cost

| Phase | Incremental monthly cost |
| --- | --- |
| **This research** | $0 |
| **V1 manual News + Events** | $0 beyond services already planned. Sanity Free remains the CMS. No new paid API |
| **Commercial site launch** | Vercel Pro is already an accepted hosting decision for commercial use (~$20/month entry, recheck at provision). Not caused by News |
| **Candidate ingest** | $0 if native fetch + cron on the existing host. Watch Sanity API request and document quotas |

Scale-up cost triggers (do not pre-buy):

- Sanity upgrade: private roles, scheduled drafts, or quota pressure.
- JTA syndication: only if JOM later wants to host JTA full text.
- Times of Israel syndication: published from $500/month. Not justified for
  outbound curation.
- NewsAPI Business: $449/month. Reject.
- Meetup Pro + API approval: only for a named partner integration.
- Eventbrite distribution partnership: only if JOM becomes a real
  distributor.
- PostgreSQL / Neon: community submissions or other operational features.
- Hosted search: only after `/news` and `/events` volume plus measured
  query need (ADR-007).

V1 News + Events must not be the reason a paid news or events API appears
on the bill.

## 20. Implementation roadmap

| Phase | Name | What ships | Owner |
| --- | --- | --- | --- |
| **0** | Research / specification | This file | This workstream. Done |
| **1** | Minimal schemas | `curatedNewsItem` and `event` in shared Sanity schema; Studio desks; reuse existing entities | Integration / future News-Events implementation. Shared schema files |
| **2** | Manual curated pages | `/news` and `/events` Server Component indexes from published documents. No ingest. No item pages required | Implementation workstream |
| **3** | Homepage modules | `getWhatWereFollowing()` and `getUpcomingEvents()` consumed by Integration homepage. Omit when empty | Integration |
| **4** | Allowlisted candidate ingest | RSS (News) and ICS (Events) → candidate drafts, identifiers only | Implementation, after pages exist |
| **5** | Editor queue | Studio list of candidates, duplicates, expirations. Still no auto-publish | Implementation |
| **6** | Submissions / richer discovery | Public event form, optional news permalinks, city discovery if volume exists | Later, after evidence |

Do not invert this. Homepage modules before real documents produce empty or
fabricated desks. Ingest before manual pages produces a firehose with
nowhere honest to put it.

Jewish Today may consume one event or one news item only after Phase 3,
and only through a published-document query, not through Hebcal.

## 21. Success metrics

Measure whether curation is trusted and used, not whether the firehose is
large.

News:

- Outbound clicks from `/news` and the homepage module
- Homepage module visibility vs click-through
- Return visits to `/news`
- Source diversity over a rolling month (publications used, not a quota)
- Editor minutes per published item
- Items expired vs still current (staleness)
- Correction / archive rate

Events:

- Clicks through to official event URLs
- Share of listed events that were not already cancelled
- Geographic mix (online / Israel / US / international) over a month
- Return visits to `/events`
- Editor minutes per event
- Later: submissions accepted vs rejected; calendar-add if that feature
  exists

Do not optimize for item count, feed coverage, or social outrage
engagement.

## 22. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Copyright / ToS | Outbound model. No body, excerpt, or image scrape. Identifiers only if ingesting. Recheck terms before any feed job |
| Misinformation | Not first. Prefer trusted sources. Archive wrong items. No AI publish |
| Political-bias perception | Mixed reputable sources. JOM context stays factual. Neither JNS nor Haaretz is the house voice |
| Stale content | Required `expiresAt`. Homepage reads unexpired only |
| Feed / provider breakage | Allowlist, isolated adapters, pages still work from Sanity if a feed dies |
| Duplicate stories | One JOM item per event. URL normalization later |
| Event cancellations | `eventStatus`. Manual check before featuring. ICS later helps; it does not replace judgment |
| Timezone mistakes | Required IANA zone. No default to Eastern Time |
| Spam submissions | No public form in V1 |
| Over-automation | Publish remains human through Phase 5 |
| Editor workload | Tiny public caps (3–5 news, 2–3 homepage events). Quality over volume |
| Source concentration | Weekly editorial glance at the source mix |
| Cost creep | No paid news API, no syndication, no scrape vendor |

## 23. Integration changes required later

Do **not** make these in this workstream. Smallest later changes:

1. **Shared Sanity schemas** — add `curatedNewsItem` and `event`. Reuse
   `source`, `organization`, `topic`, media, and workflow objects. Do not
   create a second publisher system.
2. **Routes** — `/news` and `/events` index pages. Optional later slugs.
3. **Queries** — `getWhatWereFollowing()`, `getUpcomingEvents()`.
4. **Homepage** — fill the reserved News and Events desks from those
   accessors. Omit if empty. Do not fabricate.
5. **Sitemap** — add the two index routes when they exist.
6. **Shared docs** — fold accepted decisions into `CONTENT_MODEL.md`,
   `ROADMAP.md`, `ARCHITECTURE.md`, and an ADR. This spec is not that
   fold-in.
7. **Playwright** — page-level tests once routes exist.
8. **`.env.example` / `package.json`** — not required for V1 manual
   pages. Only if a later ingest adapter needs a documented fetch timeout
   or parser.

Global navigation already contains News and Events labels. Integration
should not invent a second nav.

Jewish Today and Podcasts should not be modified to “support” this
workstream.

## 24. What this workstream did not do

- No News or Events application
- No homepage edits
- No Sanity schema or content writes
- No shared architecture doc edits
- No packages, paid services, or deploys
- No secrets
- No publication of news or events

## 25. Defaults a founder may override

Implementation can proceed on these defaults. Override them in writing if
needed; they are not blockers:

1. Four desks, antisemitism as a topic.
2. Outbound cards; no `/news/[slug]` in V1.
3. No paid syndication or news API.
4. Manual V1; ingest only after public pages exist.
5. Events are curated, not a directory.
6. Geography is four buckets, not a map.
7. Public event submissions are later.

READY FOR IMPLEMENTATION PLANNING
