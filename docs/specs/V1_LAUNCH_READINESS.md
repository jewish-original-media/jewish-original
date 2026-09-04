# V1 Launch Readiness Specification

Status: research complete on `research/v1-launch-readiness`. No application
code, Sanity schemas, homepage, Vercel, DNS, analytics accounts, payment
systems, or deploys were changed.

This workstream owns only this specification. Integration owns shared
application surfaces. History, Jewish Today, Podcasts, News + Events, and
History QA remain on their own branches.

Research date: 2026-09-04. Recheck official provider pricing, terms, and
live-site behavior before any later implementation.

This document is product and launch research, not legal advice.

## 1. Why this exists

Jewish Original can now prove History, Jewish Today, and a composed Preview
homepage in isolation. That is not the same as a public launch of
`jewishoriginal.com`.

A public launch must feel premium, editorial, modern, Jewish, human,
trustworthy, fast, beautiful, and intentional. It must not feel like generic
SaaS, a generic nonprofit template, a WordPress blog, an unfinished MVP, or
an AI content farm.

This spec defines the minimum complete V1, the SEO and measurement baseline,
the restrained Support model, and the controlled cutover. It assigns later
work. It does not implement it.

Working positioning, unchanged:

> A modern home for Jewish history, culture, education, connection, and
> identity.

Supporting principle, unchanged:

> History is the foundation. Education transmits it. Identity is the
> product. Connection is the outcome.

## 2. Current state across workstreams

Observed 2026-09-04. Do not treat this as a license to merge or deploy.

| Stream | Branch | Public reality |
| --- | --- | --- |
| History | `milestone-1-sanity-history` | `/history` and 5 published articles. Support placeholder. Sitemap includes `/`, `/history`, `/support`, and published slugs. |
| Jewish Today | `feature/jewish-today` | `/today` with `?date=` noindex. Sitemap includes `/` and `/today`. Frozen. |
| Podcasts | `feature/podcasts` | Routes, metadata, and PodcastSeries / PodcastEpisode JSON-LD exist. Four pilot episodes are unpublished drafts. Official RSS has 66 items. |
| Integration | `feature/integration-homepage` | Homepage composition + Jewish Today. History and Podcasts are reserved slots. Sitemap is still Today-only. |
| News + Events | `research/news-events` | Product spec only. No routes. |
| History QA | `research/history-qa` | Editorial queue support. |
| GitHub default | `milestone-1-sanity-history` | Not `main`. Local `main` exists at foundation commit `7b0ed78` and is not on GitHub. |
| Current public host | `jewishoriginal.com` | Responded `500` during this research. An older marketing page exists; it is not the new app. Do not attach the domain from this workstream. |

Shared navigation already lists Home, History, Podcasts, News, Events, About,
and Support. It does **not** list Today. A search icon links to `/search`.
The footer lists Contact, Privacy, and Terms.

On the History branch, `/podcasts`, `/news`, `/events`, `/about`, `/search`,
`/contact`, `/privacy`, and `/terms` 404. Shipping that nav publicly would
make the site feel unfinished.

## 3. V1 launch scope

### Launch rule

Do not put a primary-nav or footer link on a 404. Hide the item, or ship an
honest page. Empty reserved homepage slots are acceptable in Preview. They
are not acceptable on `jewishoriginal.com`.

### MUST HAVE FOR LAUNCH

The public site may launch when all of the following are true.

| Surface | Why it is required | Owner |
| --- | --- | --- |
| `/` composed homepage | The site must be useful today, not a construction page. Live Jewish Today. Live History if published matches exist. Omit empty desks. | Integration |
| `/today` | Daily Jewish utility. Primary product pillar. | Jewish Today, already built; Integration merge |
| `/history` and published `/history/[slug]` | Foundation of the product. Five reviewed articles are enough if the archive looks intentional. | History, already built; Integration merge |
| `/about` | Trust. Mission, people, contact, Israel / Jewish commitment, source method. | Integration + founder copy |
| `/support` | Honest support destination. Stripe may be hosted links. Do not invent a campaign. | Integration + founder |
| `/privacy` | Required once analytics, email, or payments exist. Footer already promises it. | Integration + founder |
| Working 404 | Current copy says the page is “not available yet.” Public 404s should help people back to Home, History, and Today. | Integration |
| Live-route navigation | Today belongs in the primary nav. Hide Search, News, Events, and Podcasts until those routes exist and have real content. | Integration |
| Production SEO baseline | Canonical host, titles, descriptions, sitemap of live routes only, robots, default social image. | Integration |
| Production hosting | Vercel Production on `main`, Pro plan, production env vars, no draft-preview leakage. | Integration / founder ops |
| Search Console | Property, sitemap, first-index check. | Founder ops, after domain |

Five published History articles are enough for an honest first launch. Do not
hold the domain for the rest of the first-20 set.

### SHOULD HAVE SOON AFTER

Ship in the first 30 days if the launch itself is already trustworthy.

| Surface | Condition | Owner |
| --- | --- | --- |
| `/podcasts`, show page, a small published episode set | The Two Tall Jews Show is a core brand. Publish a reviewed subset, not a 66-episode dump. | Podcasts + founder publish |
| `/news` index with 3–5 real cards | Follow `docs/specs/NEWS_EVENTS_PRODUCT_SPEC.md`. No permalinks. | Future News implementation |
| `/events` index with a few upcoming items | Same spec. Index page only. | Future Events implementation |
| Homepage News / Events / Podcast modules | Only when those indexes have real items. Omit if empty. | Integration |
| `/terms` | Short, especially if Stripe is live. | Integration + founder |
| Contact on About | Email is enough. A separate `/contact` page is optional. | Integration |
| Stripe Payment Links | One-time and a few recurring amounts. | Founder + Integration |
| Organization and BreadcrumbList JSON-LD | Completes the SEO baseline. | Integration / History |
| Production favicon, app icons, default OG image | Current favicon is a placeholder-scale asset. Vector / transparent masters are still missing. | Founder assets + Integration |
| Bing Webmaster Tools | Optional, five-minute setup after Google. | Founder ops |

### DEFER

Do not build these to “complete” V1.

- Site search and the header search icon
- Newsletter / email capture
- Membership, accounts, comments, reactions
- Dedications as a product
- Full 66-episode podcast import
- Transcripts
- `/news/[slug]` and `/events/[slug]`
- Public event submissions
- Taxonomy URL pages (`/history/topic/[slug]`, and similar)
- Daily archive URLs (`/today/2026-09-04`, `/on-this-day/april-29`)
- Culture desk
- Sentry, CDPs, GA4
- Custom Stripe checkout
- Hard CSP that blocks first-party needs
- Native apps
- Ask Jewish Original
- Production Sanity dataset split, unless confidential-data or role needs appear

### Nav recommendation for launch day

Primary: Home, Today, History, About, Support.

Show Podcasts, News, or Events only after that route has real published
content. Hide Search until a real search experience exists.

Footer: Explore (live routes only), Organization (About, Support, Two Tall
Jews Show if Podcasts are live, otherwise an outbound Apple / Spotify link
if the founder confirms those URLs), Legal (Privacy; Terms if written).

## 4. Technical SEO checklist

Integration verifies and implements. This workstream does not change
`sitemap.ts`, `robots.ts`, layouts, or shared SEO helpers.

### Already appears to exist

| Item | Where | Notes |
| --- | --- | --- |
| `metadataBase` and title template | Root layout | `%s \| Jewish Original` |
| Default description | `siteConfig` | Official positioning sentence |
| Canonical `/` | Root layout | Must be overridden per route |
| Open Graph + Twitter defaults | Root layout | No default image |
| History titles, descriptions, canonicals | `src/lib/seo/history.ts` | Absolute SEO titles when supplied |
| History `noindex` on preview and browse queries | History metadata | Canonical stays `/history` |
| History Article + CollectionPage JSON-LD | History pages | Nested Organization publisher only |
| History visual breadcrumbs | Article and archive | No BreadcrumbList JSON-LD |
| Jewish Today canonical `/today` | Today `generateMetadata` | `?date=` and preview are `noindex` |
| Podcast metadata + PodcastSeries / PodcastEpisode JSON-LD | `src/lib/seo/podcasts.ts` on Podcasts branch | Only after merge and publish |
| `robots.ts` | All major branches | Allows `/`, disallows `/admin/` and `/api/`, points at sitemap |
| `sitemap.ts` | Split by branch | Not yet a single live-route sitemap |
| Draft Mode gate | `/api/draft-mode/enable` | Timing-safe secret, slug check |
| `poweredByHeader: false` | `next.config.ts` | |
| Skip link | Site layout / Integration layout | |
| Vercel Preview `X-Robots-Tag: noindex` | Platform default | Lost if a custom domain is attached to a non-production branch |

### Integration must verify or add

1. **Canonical host.** One production origin, no trailing slash, from
   `NEXT_PUBLIC_SITE_URL`. Apex or `www`, not both as indexed hosts.
2. **Per-route titles and descriptions.** Home, Today, History, About,
   Support, Privacy, and any later Podcasts / News / Events indexes.
3. **Default Open Graph image.** One approved 1200×630 JOM image for pages
   without a rights-cleared story image. Twitter `summary_large_image` only
   when that image exists.
4. **Unified sitemap.** After convergence, include only live indexable
   routes: `/`, `/today`, `/history`, published History slugs, `/about`,
   `/support`, `/privacy`, and later `/podcasts`, show, published episodes,
   `/news`, `/events`. Never include query variants, Draft Mode, `/admin`,
   `/api`, `/search`, `/podcasts/dev`, or unpublished slugs.
5. **robots.txt.** Keep `/admin/` and `/api/` disallowed. Add
   `/podcasts/dev/` if that fixture ships. Do not disallow `/today` or
   `/history`. Host and sitemap must match the canonical production origin.
6. **Organization JSON-LD** on the root layout or Home: name, url, logo,
   sameAs (only confirmed profiles).
7. **WebSite JSON-LD** on Home, with `potentialSearchAction` omitted until
   search exists.
8. **BreadcrumbList JSON-LD** on History articles and later episode pages.
   Visual breadcrumbs already exist on History.
9. **Article JSON-LD gaps.** Add `datePublished` when Sanity publish time
   is available; keep `dateModified`. Publisher is Jewish Original, not an
   invented journalist byline. Do not add fake authors.
10. **Image metadata.** Alt required. Credit on-page when an image exists.
    Social images only from rights-cleared assets.
11. **Noindex rules.** Draft Mode, `?date=`, History browse queries,
    `?preview=`, unpublished documents, `/admin`, `/api`, `/podcasts/dev`.
12. **Pagination.** None in V1. If later added, use rel next/prev or
    `rel=canonical` to the index; do not index empty pages.
13. **Duplicate-content prevention.** One slug per story. Duplicate archive
    records stay unpublished. Query views canonicalize to the index. Preview
    hosts must not be indexed.
14. **Redirects.** Inventory the old `jewishoriginal.com` URLs before
    cutover. Map any surviving public paths. Apex ↔ www. Trailing-slash
    policy. Do not invent a large redirect spreadsheet without a crawl.
15. **404.** Honest, branded, with links to Home, Today, and History.
    Unpublished History slugs already 404. Keep that.
16. **Preview protection.** Confirm `X-Robots-Tag: noindex` on `*.vercel.app`.
    Never attach `jewishoriginal.com` to a Preview branch.

## 5. History SEO

History is the durable indexed corpus. Follow ADR-022 and
`docs/HISTORY_ARCHIVE.md`.

### Indexable in V1

| URL | Index |
| --- | --- |
| `/history` | Yes |
| `/history/us-liberates-dachau` | Yes |
| `/history/joop-westerweel-murdered` | Yes |
| `/history/bialystok-ghetto-established` | Yes |
| `/history/samuel-willenberg-dies` | Yes |
| `/history/anti-jewish-riots-tripoli` | Yes |
| Later published, ready, non-duplicate slugs | Yes |
| `/history?month=&day=` | No. Canonical `/history` |
| `/history?topic=` and other facets | No. Canonical `/history` |
| Draft preview URLs | No |
| Duplicate-candidate documents | Not public |
| Unpublished first-20 drafts | 404 |

Do not create `/history/topic/[slug]`, `/history/era/[slug]`,
`/history/place/[slug]`, or 365 On This Day archive URLs. Query parameters
are enough until a facet has a meaningful published body.

### Launch requirements

- SEO title and description on every published article. Fall back to title
  + excerpt, never to a generic “A Jewish Original history entry about…”
  line in production if an editor can still fill the field.
- Canonical is the public slug URL unless an editor sets a validated
  override.
- Historical date is visible text and `temporalCoverage`. It is not a
  separate indexed date URL.
- People, places, topics, and organizations are on-page relationships and
  `about` in JSON-LD. They are not thin landing pages.
- Related History is editor-approved internal links only. Similarity
  clusters are not public relations.
- Images appear in HTML, Open Graph, and JSON-LD only when rights-cleared.
  No-image articles stay typographic. Do not substitute a stock photo for
  social cards.
- On This Day discovery lives on `/history` and is reused by `/today`.
  Matching remains Gregorian month/day in `America/New_York`.

Assigned later work: History should add `datePublished` and BreadcrumbList
JSON-LD. Integration should merge History into the unified sitemap.

## 6. Jewish Today SEO

Jewish Today is date-sensitive and must not become a calendar farm.

### Recommendation

**`/today` should be indexable.** It is one durable daily utility, not a
dated article. The contents change; the URL does not.

| URL / state | Index | Canonical |
| --- | --- | --- |
| `/today` | Yes | `/today` |
| `/today?date=YYYY-MM-DD` | No | `/today` |
| `/today?preview=calendar-unavailable` | No | `/today` |
| `/today/2026-09-04` or `/on-this-day/april-29` | Do not create | — |

This already matches the Jewish Today implementation. Keep it.

### Launch requirements

- Title can stay `Jewish Today`. Description may include today’s Gregorian
  and Hebrew dates. That is metadata for the living page, not a reason to
  mint a new URL at midnight.
- Add Open Graph to `/today` (currently inherits weak defaults). Use the
  default site image, not a new image every day.
- Optional `WebPage` JSON-LD for `/today`. Do not emit 365 dated ItemList
  URLs.
- Hebrew date is display + description metadata. It is not a Hebrew-date
  permalink.
- History matches link to `/history/[slug]`. Those article URLs carry the
  historical SEO. `/today` should not copy article bodies.
- Hourly revalidation is correct. Crawlers should see a stable URL with
  fresh daily content.
- `JEWISH_TODAY_ALLOW_PREVIEWS` must never be set in production.

Do not create thousands of thin daily URLs to “help SEO.” They would dilute
History articles and create stale date pages.

Assigned later work: Integration / Jewish Today add OG on `/today` and
include `/today` in the merged sitemap.

## 7. Podcast SEO

Follow `docs/PODCAST_MODEL.md` and the existing `src/lib/seo/podcasts.ts`
helpers. Do not require transcripts for launch.

### Indexable when Podcasts launch

| URL | Index |
| --- | --- |
| `/podcasts` | Yes |
| `/podcasts/the-two-tall-jews-show` | Yes, when the show is published |
| `/podcasts/[showSlug]/[slug]` | Yes, when the episode is published and ready |
| `/podcasts/dev/youtube-facade` | No. Disallow in robots if the route ships |
| Unpublished pilots | 404 |

### Launch strategy

- Publish a small reviewed set, not the raw 66-item RSS catalog.
- Episode canonical is the JOM episode URL, not Apple, Spotify, or Anchor.
- Titles are the public episode titles. Prefer editorial SEO titles when
  the RSS title is noisy (`SEASON 3 FINALE`, `PREMIER:`).
- Descriptions should be JOM excerpts or reviewed summaries, not raw RSS
  HTML and never emails or payment details from the feed.
- Guests are `person` references when structured. Do not invent guests
  from prose.
- Apple and Spotify links are Listen alternatives and `sameAs` / listen
  actions. Do not stack three live players.
- Audio enclosure belongs in JSON-LD `associatedMedia` when an official
  RSS audio URL exists. YouTube, when verified, is `VideoObject`.
- `PodcastSeries` on the show page and `PodcastEpisode` on episode pages
  already exist in the Podcasts workstream. Keep them.
- Episode dates use the official RSS / CMS publish date.
- Transcripts later, only when human-reviewed.

Assigned later work: Podcasts publish a reviewed subset. Integration adds
podcast URLs to the sitemap and disallows `/podcasts/dev/`.

## 8. News + Events SEO

This section follows `docs/specs/NEWS_EVENTS_PRODUCT_SPEC.md`. No
contradiction.

### News

V1 News is outbound curated cards. There is no `/news/[slug]`.

| URL | Index | Notes |
| --- | --- | --- |
| `/news` | Yes, when the page exists and has real cards | CollectionPage. Source URLs are outbound |
| `/news/[slug]` | Do not create in V1 | Thin permalinks would compete with the source |
| Expired items | Leave the homepage; recede on `/news` | Do not mint archive permalinks |
| Empty `/news` | Do not index an empty desk | Hide from nav and sitemap until 3+ items exist |

Metadata: title `What We’re Following` or `News`; description that this is
JOM’s short curated record of current reporting, not a newsroom. No item
JSON-LD that republishes source text.

### Events

V1 Events is an index first.

| URL | Index | Notes |
| --- | --- | --- |
| `/events` | Yes, when real upcoming items exist | CollectionPage |
| `/events/[slug]` | Later, and only for JOM-owned events that need a permalink | |
| Past / cancelled | Drop from upcoming lists | Keep the document; do not keep a growing thin archive of expired URLs |
| Empty `/events` | Hide from nav and sitemap | |

Metadata: title `Events` or `Curated Jewish Events`; description that JOM
lists a few gatherings it is willing to put its name near. Times stay in
the event’s IANA zone.

Assigned later work: a future News + Events implementation stream, then
Integration sitemap and homepage modules. Not this workstream.

## 9. Organization and trust signals

The site will be judged as a Jewish cultural institution, not a startup
landing page. Trust pages can be short. They cannot be missing, fake, or
lawyer-cosplay.

### Minimum public policy set

| Page | V1 | What it must contain | What it must not do |
| --- | --- | --- | --- |
| `/about` | MUST | Mission, product principle, who is building it, Israel / Jewish people commitment, how History is sourced, how to contact | Invent bios, board, or institutional partners |
| Contact | MUST, may live on About | One real email | A ticket system |
| `/privacy` | MUST | What is collected (likely: hosting logs, cookieless analytics, later Stripe / email), no sale of data, contact | Copy a generic SaaS policy |
| `/terms` | SHOULD, MUST if Stripe is live | Acceptable use, no warranty of completeness, link to corrections | A 4,000-word terms of service |
| Corrections | SHOULD, on About or History | History is corrected in public; News cards are updated or archived with a note | A separate CMS product |
| Source / methodology | SHOULD, on About | History is reviewed and cited. Today uses Hebcal with credit. News links out. Podcasts use the official feed | A methods journal |
| Sponsorship disclosure | SHOULD, on Support and any sponsored module | Paid support is labeled. Editorial control stays with JOM | A rate card on the homepage |
| AI usage | SHOULD, one About sentence if AI assists drafts | Editors own every public word. Nothing is published as “AI” | A separate AI policy page |
| Copyright | Footer line + About / Terms | © year, legal name the founder confirms | Invented entity names |
| Cookie notice | Not needed for V1 if analytics stay cookieless and there is no marketing pixel | — | A cookie banner for no cookies |

Do not write the legal prose in this workstream. Founder supplies names,
email, and entity status. Integration implements short pages from that
input.

Israel / Jewish mission language already exists in `docs/PRODUCT.md` and
should be used, not softened or turned into a political program.

## 10. Analytics

### Recommendation

**Vercel Web Analytics plus the free Speed Insights tier are enough for
V1.** Do not add Google Analytics, PostHog, Segment, Mixpanel, or a CDP.

Reasons:

- The site will already be on Vercel Pro for commercial hosting (ADR-013).
- Web Analytics is cookieless and first-party enough for pageviews, paths,
  referrers, devices, and a small set of custom events.
- Architecture already forbids a paid analytics stack before a defined
  question exists. The launch questions are simple: what is visited, what
  is clicked, and whether Support converts.
- A cookie banner for measurement would make a small editorial site feel
  like SaaS.

### What to measure

| Question | Method | Notes |
| --- | --- | --- |
| Pageviews | Automatic | Home, Today, History, articles, later Podcasts / News / Events |
| Referrers | Automatic | Especially Instagram |
| History article engagement | Pageviews + scroll is optional later | Do not add a heat-map product |
| Jewish Today use | `/today` pageviews and homepage module clicks to `/today` | Custom event: `today_open` |
| Podcast outbound / audio | Custom events | `podcast_listen` with platform property |
| News outbound | Custom event | `news_outbound` |
| Events outbound | Custom event | `event_outbound` |
| Support conversion | Custom event on Payment Link click; Stripe dashboard for completed gifts | Do not wait for a warehouse |
| Returning visitors | Not a V1 KPI | Cookieless tools cannot honestly identify a returning person. Do not add cookies to chase this number |

Custom events on Pro currently allow 2 properties. Use `path` or
`platform` only. Recheck the official limit at install time.

### What not to do

- No marketing pixels.
- No session replay.
- No third-party script for “just in case.”
- No Web Analytics Plus ($10/month) until UTM or 24-month retention is a
  real need.
- No Speed Insights Plus ($10/project) until a Core Web Vital is failing
  and the free Real Experience Score is not enough.
- No Sentry until production errors cannot be triaged from Vercel logs.

### Cost

Recheck [Vercel Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing)
at provision. Official pages currently disagree on whether Pro includes a
bundle of events or bills `$0.03` per 1,000 events against the $20 Pro
usage credit. At early traffic, either reading is a few dollars or $0
beyond Pro.

Assigned later work: Integration adds `@vercel/analytics` and
`@vercel/speed-insights` only after the Vercel project is on Pro and the
founder has enabled Web Analytics in the dashboard. That is a shared
`package.json` change and belongs to Integration, not this branch.

## 11. Search Console and discovery

### Launch-day setup

1. After `jewishoriginal.com` points at Vercel Production, create a Google
   Search Console URL-prefix property for the canonical host.
2. Also add a Domain property if DNS can hold the verification TXT record.
   Domain coverage catches www / apex mistakes.
3. Verify with DNS or the HTML file / meta tag. Prefer DNS.
4. Submit `https://jewishoriginal.com/sitemap.xml` (or www, if that is
   canonical).
5. Fetch `/`, `/today`, `/history`, one History article, `/about`,
   `/support`.
6. Confirm `robots.txt` is reachable and lists that sitemap.
7. Confirm Preview URLs are not in the property.
8. Bing Webmaster Tools is optional. Import from Search Console if it is
   still offered. Do not make Bing a launch blocker.

### First 30 days

| Day | Check |
| --- | --- |
| 1–3 | Sitemap processed. No “Submitted URL not found” for unpublished slugs. |
| 7 | Home, Today, History, and the 5 articles requested or indexed. |
| 14 | Inspect a History article rich result. Fix JSON-LD errors only if Search Console reports them. |
| 30 | Coverage report: exclude query URLs if they appeared. Compare top queries to Instagram language, not to invented keywords. |

Do not use a third-party rank tracker.

## 12. Social distribution

JOM already has an Instagram audience, especially On This Day in Jewish
History. The website should receive that audience, not replace Instagram
with a social-media department.

The official TTJS Instagram / YouTube handle observed in the podcast feed
is `@two.tall.jews`. The On This Day Instagram handle is not recorded in
the repo. Founder must confirm every public profile before `sameAs` or
footer icons ship.

### Website launch support, not a social strategy

1. **Instagram → History.** Every On This Day post that has a published
   article links to `/history/[slug]`. If there is no published match, link
   to `/history` or `/today`, never to a 404.
2. **Instagram → Today.** A quiet standing bio or weekly story can point
   at `/today`.
3. **Share cards.** History articles already expose a share URL. Default
   OG image is required so Instagram / iMessage unfurls do not look empty.
4. **On This Day loop.** Instagram remains the daily surface. The site is
   the permanent record. Do not auto-post from the CMS in V1.
5. **Podcast.** When episode pages exist, captions can use the JOM URL
   plus Apple / Spotify. Until then, outbound platform links are honest.
6. **Recurring prompts.** Three only: daily OTD (existing), weekly Today
   reminder, and a new-article post when something is published. No
   content calendar product.
7. **Newsletter.** Not part of this loop in V1. See §13.

Do not build a social CMS, a link-in-bio product, or UTM sprawl. If a
parameter is used at all, `?utm_source=instagram` is enough, and it must
stay `noindex` via the existing query-handling habit (canonical without
UTM is automatic if canonical tags ignore search params).

## 13. Email / newsletter

### Recommendation: A — no newsletter capture at launch

Instagram already reaches the audience that would receive a daily note.
There is no sending cadence, no provider, and no editorial bandwidth
committed to a letter. A capture form without a letter is an empty promise.

Do not add Resend, Mailchimp, Buttondown, or Beehiiv for V1.

Revisit **B — simple email capture** after launch if:

- Instagram cannot carry article-length History,
- the founder will send at least a weekly note,
- and a provider is provisioned before the SDK is installed.

If that happens later, the minimum is Buttondown or Resend plus one
homepage / Today field, double opt-in, and a one-line privacy sentence.
That is a later Integration + founder decision. Full newsletter design,
sponsorship, and automation stay deferred.

## 14. Support and revenue

Roadmap Milestone 5 already places Stripe after the editorial product.
Product V1 only requires that monetization be **modeled** without harming
trust. This spec recommends a restrained live Support page, not a
membership business.

### Support page

`/support` already exists as an honest placeholder. For launch it should
become:

1. Short mission line: this history should stay in the world.
2. What support pays for, in one sentence the founder approves. Do not
   invent program budgets.
3. **One-time gift** — Stripe Payment Link, customer-chooses amount,
   `submit_type=donate` so the host is `donate.stripe.com`.
4. **Monthly support** — separate Payment Links with a few fixed amounts
   the founder chooses. Stripe’s “customer chooses” mode does not support
   recurring gifts. Do not build a custom amount + subscribe form in V1.
5. **Sponsor or partner inquiry** — `mailto:` to the founder-supplied
   address. One sentence each. No CRM.
6. Disclosure: gifts do not buy editorial control. Sponsored modules, when
   they exist, will be labeled.

No impact thermometer, no fake donor wall, no dedication product, no
membership tier table.

### Placement

- Homepage: a quiet text link in the later Support desk, or omit the desk
  and let the gold Support nav item remain. Do not put a donate button in
  the masthead.
- Footer: Support stays in Organization.
- History: the existing quiet archive line may remain. Do not add a sticky
  donate bar.

### Checkout

**Stripe-hosted Payment Links, not a custom checkout, not an embedded
Stripe.js form.** No `package.json` Stripe SDK is required for V1. The
Support page links out. Receipts and tax-id collection, if needed, are
configured in the Stripe Dashboard.

Membership is later. Dedications are later. PostgreSQL is not required to
take a gift.

### Legal caution

Do not claim tax deductibility unless the founder confirms a qualifying
entity. Stripe’s nonprofit rate, if applicable, is a founder application,
not an engineering task.

Assigned later work: founder creates the Stripe account and Payment Links.
Integration replaces the placeholder copy and adds the links plus a
`support_click` analytics event.

## 15. Sponsorship model

Positioning: **mission-aligned support for a Jewish editorial home**, not
an ad network and not a synagogue gala program.

### Inventory, early and small

| Slot | What the sponsor receives | What they do not receive |
| --- | --- | --- |
| Jewish Today sponsor | A short labeled line on `/today` and the homepage Today module | Control of calendar data or History matches |
| History sponsor | A labeled “Supported by” line on `/history` or one article series | Edits to citations or conclusions |
| Podcast sponsor | A labeled line on the show page and a spoken mid-roll the hosts control | A second audio player or banner ads |
| Site-wide supporter | Name on Support and About | Homepage takeover |
| Newsletter sponsor | Later, if a letter exists | — |

One sponsor per slot. Empty slots stay empty.

### Rules

- Disclosure is always visible. “Supported by” / “Sponsored by,” never a
  native-looking news card.
- JOM keeps editorial control. A sponsor may not pick History conclusions
  or News framing.
- Rates are **not public** in V1. Price in conversation. A public rate
  card makes a five-page site look like a media kit with no inventory.
- Workflow: email → founder conversation → invoice / Stripe → Integration
  or Studio places a labeled name + optional logo with rights clearance.
- No Google AdSense, no taboola, no house-ad clutter.

Assigned later work: founder writes the one-paragraph sponsor note.
Integration or a later Support stream adds the labeled slot. Do not add a
sponsor CMS in V1.

## 16. Performance targets

Existing architecture already sets LCP < 2.5s, INP < 200ms, CLS < 0.1 at
the 75th percentile. Keep those as launch targets, not lab trophies.

| Area | V1 target | Notes |
| --- | --- | --- |
| LCP | < 2.5s on `/`, `/today`, `/history`, a typical article, mobile | Self-hosted fonts via `next/font` already help |
| INP | < 200ms | Keep client JavaScript rare |
| CLS | < 0.1 | Fixed 16:9 image frames; YouTube facade, not a live embed |
| Images | `next/image`, AVIF/WebP, Sanity + later Cloudfront/YouTube patterns | No unsized images |
| Fonts | Jost + Libre Baskerville, `display: swap` | Do not block launch on licensed Futura / Baskerville |
| Third parties | Hebcal + Sanity + Stripe hosted page + optional Vercel Analytics | No extra pixels |
| YouTube | Facade already exists on Podcasts | Do not autoplay |
| Audio | Native or platform links, not three stacked players | |
| Sanity | Published perspective + read token; no preview client in production HTML | |
| Cache | Today and Home `revalidate = 3600` | History articles can stay longer |
| Mobile | Compose independently; 44px targets | Instagram traffic will be mobile-first |

Use the free Speed Insights tier after launch. Do not buy Plus to chase a
perfect Lighthouse screenshot.

Assigned later work: Integration keeps the YouTube facade and image
`remotePatterns` when Podcasts merge. Performance regressions are an
Integration QA item, not a new service.

## 17. Accessibility

V1 bar is WCAG 2.2 AA for the launched routes, not a formal certification.

### Requirements

- Keyboard: all nav, Today date controls, History date browse, Support
  links, and later forms.
- Headings: one `h1` per page; no skipped levels for style.
- Focus: visible, not gold-on-gold.
- Contrast: existing token rule. Gold is not small text on white or sand.
- Alt text: required on every published image. Decorative motifs stay
  `aria-hidden`.
- Reduced motion: already required in the History language. Keep it.
- Forms: labels, errors in text, no placeholder-only fields.
- Skip link: already present. Verify it works after Integration layout
  consolidation.
- Search icon: if it remains, it already has an accessible name. Prefer
  hiding it until `/search` exists.
- Tap targets: 44×44.
- Language: `lang="en"` is set. Hebrew date strings can stay in English
  pages without flipping `lang` unless a full Hebrew locale ships.

### Audit process

1. Keyboard pass on Home, Today, History, one article, About, Support, 404.
2. axe or Lighthouse accessibility on those routes, desktop and 390.
3. VoiceOver on iPhone for Today and one History article.
4. Contrast check of gold-on-night and navy-on-sand.
5. Reduced-motion reload of History and Home.
6. Fix P0/P1 before launch. Do not block launch on a perfect audit of
   unpublished routes.

Assigned later work: Integration + History QA. No new a11y vendor.

## 18. Security and privacy

Lean launch checklist. Do not build a security program.

| Item | V1 action |
| --- | --- |
| Secrets | `SANITY_API_WRITE_TOKEN`, `SANITY_API_READ_TOKEN`, and `DRAFT_MODE_SECRET` stay server-only. Never `NEXT_PUBLIC_`. |
| Write token | Not on Vercel Production unless a server-only editorial job needs it. Public reads use the read token. |
| Read token | Required while the dataset is private. Rotate if it appears in a client bundle or Preview log. |
| Draft preview | Secret + slug check already exist. Production must set `DRAFT_MODE_SECRET`. Confirm unpublished drafts 404 without the cookie. |
| `JEWISH_TODAY_ALLOW_PREVIEWS` | Unset in Production. |
| Env scopes | Preview and Production both need site URL, project id, dataset, and read token. Production site URL must be the canonical host. |
| Source maps | Do not publish browser source maps on Production. |
| Logs | No tokens, no emails from podcast RSS, no raw Hebcal failures on the page. |
| Forms | None in V1 except Stripe-hosted checkout. `mailto:` for sponsors. |
| Spam | No public form, so no captcha product. |
| Dependencies | `npm audit` before cutover. Do not add packages for this spec. |
| Headers | `poweredByHeader` is already false. Optional later: `referrer-policy`, `X-Content-Type-Options`, frame ancestors for `/admin`. Do not ship a blocking CSP on launch day. |
| Cookies | Draft Mode cookie is editorial-only. Analytics should stay cookieless. No marketing cookies. |
| `/admin` | Robots disallow. Do not link it from the public footer. MFA on Sanity before more editors join. |
| Dataset | Development dataset is currently private and in use. A second production dataset is reserved, not required, for V1 if the same project stays founder-only. Revisit before hiring editors. |

Assigned later work: Integration verifies Production env and Preview
noindex. Founder enables Sanity MFA.

## 19. Domain and production cutover

Do not perform any of this in this workstream.

Expected model:

```text
main                  → Vercel Production  → jewishoriginal.com
feature branches / PRs → Vercel Preview    → *.vercel.app (noindex)
```

### Sequence

1. Freeze feature work that must be in V1.
2. Merge History and needed Podcasts work into Integration. Homepage slots
   become live or are omitted. Nav lists live routes only.
3. Promote the known-good integrated commit to `main` (see §20).
4. Set Vercel Production branch to `main`. Confirm a Production deployment
   on the `*.vercel.app` production URL first.
5. Verify Production env: `NEXT_PUBLIC_SITE_URL`, Sanity ids, read token,
   `DRAFT_MODE_SECRET`. Confirm `JEWISH_TODAY_ALLOW_PREVIEWS` is unset.
6. Smoke-test the production URL, not the domain.
7. Decide canonical host: `https://jewishoriginal.com` (recommended) or
   `www`. The app already defaults to the apex.
8. Attach the canonical host to Production. Attach the other host only as
   a redirect.
9. DNS at the registrar / DNS host. Do not change DNS until step 4 is
   green. Expect the current `500` on `jewishoriginal.com` to be replaced
   only at this step.
10. Wait for SSL. Confirm HTTPS and the redirect.
11. Confirm `metadataBase`, canonical tags, robots `host`, and sitemap
    URLs all use the canonical origin.
12. Inventory old marketing URLs. Add redirects for any path that still
    receives traffic. Unknown old paths may 404 with the new branded 404.
13. Search Console verify. Submit sitemap.
14. Final smoke on the public host. Watch Vercel logs for token or Hebcal
    failures.

Rollback: keep the previous Production deployment. Do not debug by
pointing the domain at a Preview branch.

## 20. Git and main cleanup

Desired end state:

- Remote `main` = known-good integrated application
- GitHub default branch = `main`
- Vercel Production branch = `main`
- Feature branches = Preview only

GitHub’s default is currently `milestone-1-sanity-history`. Local `main`
is the foundation commit and is not on GitHub. Integration started from
that local `main` and merged Jewish Today only.

### Safest sequence

1. Do not rename defaults while History, Podcasts, and Integration are
   still diverging.
2. Finish a known-good Integration commit that includes History and any
   launch-required Podcasts / About / Support work.
3. Create or reset remote `main` to that commit by an explicit fast-forward
   or a reviewed PR. Do not force-push `main` if anyone else has based work
   on a published `main`.
4. Open a GitHub setting change: default branch `milestone-1-sanity-history`
   → `main`. Keep the old branch as a historical pointer.
5. In Vercel, set Production Branch to `main`. Confirm the next Production
   deployment is from `main`.
6. Protect `main`: PR required, no direct Production experiments on
   feature branches.
7. Tell every workstream to rebase or merge from `main` after that point.

Do not change branches, defaults, or Vercel from this workstream.

## 21. Launch QA matrix

Test the Production URL first, then the public host after cutover.

### Viewports

| Class | Widths |
| --- | --- |
| Desktop | 1440, 1280 |
| Tablet | 1024, 768 |
| Mobile | 390, 375 |

### Browsers

Chrome (desktop + Android if available), Safari (desktop + iOS), and one
Firefox desktop pass for Home, Today, History, and a History article.

### Routes

| Route | Visual | Functional | Metadata | A11y | Perf | Content | Mobile |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Composed, no empty fake desks | Today module, History link, no donate wall | Title, description, canonical `/`, OG | Skip, keyboard nav | LCP | No fabricated news / events / episodes | Instagram-sized |
| `/today` | Calendar hierarchy | `?date=` still works and is noindex | Canonical `/today` | Date text readable | Hourly cache, no layout jump | Hebcal credit; no invented History | Thumb reach |
| `/history` | Archive looks intentional with 5 stories | Date browse, taxonomy query, noindex when browsing | Canonical `/history` | Date form | | On This Day omitted if no match | |
| `/history/us-liberates-dachau` | Template | Citations, related, share | Article OG + JSON-LD | Headings | | Reviewed copy only | |
| `/history/joop-westerweel-murdered` | Same | Same | Same | Same | | Same | |
| `/history/bialystok-ghetto-established` | Same | Same | Title/SEO uses “Sealed” public layer | | | | |
| `/history/samuel-willenberg-dies` | Same | Same | Same | | | | |
| `/history/anti-jewish-riots-tripoli` | Same | Same | “about 120” wording | | | | |
| `/podcasts` and one episode | Only if launched | Listen links, facade | Podcast JSON-LD | | No live YT cost on load | No unpublished pilots | |
| `/news` | Only if launched | Outbound cards | Index only | | | JOM context, named source | |
| `/events` | Only if launched | Outbound official URL | Index only | | | Timezone honest | |
| `/about` | Editorial, not a deck | Contact works | Canonical `/about` | | | Founder-approved only | |
| `/support` | Quiet, not a funnel | Payment Link opens Stripe | Canonical `/support` | | | No fake totals | |
| `/privacy` | Short | | Canonical | | | Matches actual tools | |
| 404 | Branded | Links home | `noindex` | | | Not “coming soon” | |
| `/admin` | Not in public nav | | robots disallow | | | | |

Also check: unpublished History slugs 404; Draft Mode does not leak;
`/search` is absent from the header; footer has no 404s; reduced motion;
gold Support nav does not fail contrast.

## 22. Founder-input checklist

Do not invent the missing items. These are the inputs launch still needs.

### Copy and identity

- [ ] Final About copy (mission, who this is for, Israel / Jewish people
      sentence)
- [ ] Founder / host names and short bios (Meyer Grunberg and Isaac Simon
      appear in the podcast feed; confirm public spelling and whether both
      appear on About)
- [ ] Public contact email
- [ ] Sponsor / partner inquiry email, if different
- [ ] Support page sentence: what gifts sustain
- [ ] Suggested monthly amounts, if recurring links are used
- [ ] Whether gifts are tax-deductible (yes / no / do not say)
- [ ] Legal name for the copyright line
- [ ] Privacy inputs: legal name, contact, whether a Stripe account and
      Vercel Analytics will be live on day one
- [ ] One-sentence AI disclosure, or confirmation that none is needed
- [ ] Confirmation that PRODUCT.md Israel / Jewish language may appear
      publicly as written

### Social and distribution

- [ ] Official Instagram URLs for On This Day and Two Tall Jews
- [ ] YouTube, Apple Podcasts, Spotify, and any other profiles that may
      appear in `sameAs` or Listen links
- [ ] Whether Instagram bios should change to `jewishoriginal.com` on
      cutover day

### Assets

- [ ] Production logo: SVG or true transparent PNG masters (see
      `docs/ASSET_INVENTORY.md`)
- [ ] Favicon and app icons from those masters
- [ ] Default Open Graph image (1200×630), rights-cleared
- [ ] Any founder / host photos that may appear on About, with rights and
      credit
- [ ] Confirmation that current History articles remain image-less unless
      a rights-cleared image is supplied

### Operations

- [ ] Stripe account (or “Support stays informational until Stripe exists”)
- [ ] Vercel Pro team for the commercial launch
- [ ] Google account for Search Console
- [ ] DNS access for `jewishoriginal.com`
- [ ] Whether News and Events should be hidden at launch or wait for a
      first curated set
- [ ] Whether Podcasts launch with a small published set or stay hidden
- [ ] Who can publish History after launch, and that they have Sanity MFA

## 23. Launch blockers

### P0 — blocks launch

- Feature branches not converged onto a known-good Production app
- Primary nav or footer links that 404
- `/about` missing or filled with invented bios
- Canonical host / DNS / SSL not verified
- Production env missing read token, site URL, or draft secret
- Preview or `?date=` URLs indexable, or `jewishoriginal.com` attached to
  a Preview branch
- Unpublished or duplicate History documents becoming public
- Fabricated News, Events, podcast episodes, sponsors, or testimonials
- Support page that claims payments, deductibility, or a campaign that
  does not exist
- Current `jewishoriginal.com` 500 replaced by an unfinished reserved-slot
  homepage

### P1 — should fix before launch

- No default OG image
- Raster logo on the wrong background
- `/today` missing from primary nav
- Search icon pointing at `/search`
- History JSON-LD missing `datePublished` / BreadcrumbList
- Sitemap missing live routes or listing unfinished ones
- 404 copy still written as a pre-launch apology
- Privacy page missing when Analytics or Stripe is live
- YouTube live embed without the facade
- Contrast failures on gold / night / sand
- Old marketing URLs with no redirect plan

### P2 — can ship after launch

- Podcasts full catalog
- Transcripts
- News and Events indexes
- Newsletter
- Membership and dedications
- Taxonomy URL pages
- Bing
- Web Analytics Plus / Speed Insights Plus
- Sentry
- Production Sanity dataset split
- Licensed Futura / Baskerville
- Public sponsor rate card
- Returning-visitor identity
- Site search

## 24. First 30 days

Keep this lightweight. One weekly glance is enough.

| Watch | Where | Cadence |
| --- | --- | --- |
| Errors / 5xx | Vercel runtime logs | First 72 hours daily, then weekly |
| Indexing | Search Console coverage | Days 3, 7, 30 |
| Traffic | Vercel Web Analytics | Weekly |
| Top History | Article paths | Weekly |
| Jewish Today | `/today` and homepage module clicks | Weekly |
| Podcast | Listen events, if live | Weekly |
| News / event clicks | Custom events, if live | Weekly |
| Support | Stripe + `support_click` | Weekly |
| Performance | Speed Insights RES; LCP on Home / article | Weekly |
| Broken links | Click every nav and footer item | Once a week |
| Editorial load | Hours spent reviewing the next History article | Weekly, honest |

Do not add a dashboard product. If nothing is on fire at day 30, continue
the History publication queue and decide whether Podcasts or News is next.

## 25. Incremental cost

Recheck official pages at provision. These are planning figures, not
quotes.

| Item | Monthly incremental | Notes |
| --- | --- | --- |
| Vercel Pro | $20 | Already required for commercial launch (ADR-013). Includes $20 usage credit. |
| Vercel Web Analytics | $0–few dollars | Likely inside the Pro credit at early volume. Recheck included-event rules. |
| Speed Insights | $0 | Free tier. Do not buy Plus. |
| Sanity Free | $0 | Upgrade only for roles, private needs, or quotas. |
| Search Console / Bing | $0 | |
| Domain | Already owned | DNS only |
| Stripe | $0 + processing | Standard card ~2.9% + $0.30; possible nonprofit 2.2% + $0.30 if the founder applies and qualifies. No monthly Stripe fee for Payment Links. |
| Email | $0 | Not in V1 |
| GA / CDP / Sentry | $0 | Not in V1 |
| News / events APIs | $0 | Manual V1 |

**Expected incremental cost to adopt this spec:** $0 beyond the already
accepted Vercel Pro launch cost, plus Stripe processing on actual gifts.

Do not let launch readiness become the reason to buy Web Analytics Plus,
Speed Insights Plus, a newsletter tool, or a news API.

## 26. Assigned later work

| Need | Owner | Not this branch |
| --- | --- | --- |
| Merge History + Today + Home; hide unfinished nav | Integration | |
| About, Privacy, Terms, 404 copy | Integration + founder | |
| Unified sitemap / robots / Organization JSON-LD / default OG | Integration | |
| `/today` Open Graph | Integration / Jewish Today | |
| History `datePublished` + BreadcrumbList | History | |
| Publish a small podcast set | Podcasts + founder | |
| News / Events indexes | Future News + Events implementation | |
| Analytics packages | Integration, after Pro + dashboard enable | |
| Stripe Payment Links on Support | Founder + Integration | |
| Domain, DNS, default branch, Vercel Production | Founder ops + Integration | |
| Search Console | Founder ops | |

## 27. What this workstream did not do

- No application code
- No Sanity schema or content writes
- No homepage, nav, sitemap, robots, or shared-doc edits
- No Vercel, DNS, or domain changes
- No analytics or Stripe accounts
- No deploy and no merge

## 28. Defaults a founder may override

Implementation may proceed on these defaults. Override them in writing.

1. Launch with Home, Today, History, About, Support, Privacy. Hide
   Podcasts, News, Events, and Search until they have real content.
2. Five published History articles are enough.
3. `/today` is indexable; dated Today URLs are never created.
4. No newsletter at launch.
5. Vercel Web Analytics only.
6. Stripe Payment Links, not custom checkout.
7. Membership later.
8. Sponsor rates stay private.
9. GitHub default and Vercel Production become `main` only after a
   known-good integrated commit exists.

---

NEEDS FOUNDER DECISIONS
