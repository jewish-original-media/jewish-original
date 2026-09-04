# Architecture Decision Log

## ADR-001 — Next.js App Router on Vercel

**Status:** Accepted, 2026-08-30

Use Next.js 16 with Server Components on Vercel Fluid Compute. This provides
strong rendering and metadata primitives, image/font optimization, preview
deployments, and a low-operations path for a solo builder. Default to static or
cached server rendering and Node.js; add client JavaScript only for interaction.

## ADR-002 — Separate editorial and operational systems

**Status:** Accepted

Use Sanity for structured editorial content and consider PostgreSQL for
operational data only if operational features begin, with Neon and current
alternatives evaluated at that milestone. A mature hosted editorial workflow is
more valuable than forcing editors into a custom CRUD application. PostgreSQL is
the likely fit for payments, users, submissions, and audit-heavy workflows, but
no database is provisioned now.

## ADR-003 — Defer service provisioning until its milestone

**Status:** Accepted

The foundation has no database, CMS, auth, analytics, or payment dependency.
Provision each real integration before installing its SDK or writing code
against it. This avoids mock backends, unused dependencies, exposed credentials,
and premature recurring cost. Sanity is first in Milestone 1.

## ADR-004 — Use open web font alternatives until licenses are verified

**Status:** Accepted

The brand guide specifies Futura and Baskerville but no licensed webfont files
were supplied. Use Jost and Libre Baskerville through `next/font` as documented
alternatives. Do not use Bortolotto until corrected web-ready glyphs and a
license are available.

## ADR-005 — Preserve source brand files; request production masters

**Status:** Accepted

Originals remain byte-for-byte unchanged. The current JOM `.png` files are
JPEG-encoded and have baked black backgrounds, so the shell uses an approved
light/gold variant on a matching black surface. Before final visual QA, obtain
SVG or truly transparent PNG exports and logo clear-space guidance. A second
search found no JOM SVG, EPS, AI, or other vector master; the available SVGs are
unrelated third-party/legacy marks and must not be substituted.

## ADR-006 — Taxonomy is content, not application code

**Status:** Accepted

Eras, topics, people, and places are referenced CMS documents. Suggested
taxonomies seed editorial discussion but are not hard-coded into navigation,
filters, or database enums.

## ADR-007 — Search grows with demonstrated need

**Status:** Accepted

Use CMS querying for initial collections and PostgreSQL full-text capabilities
for unified search. Add a hosted search service only when corpus size, typo
tolerance, ranking controls, or latency data justify another system.

## ADR-008 — No generic UI kit dependency

**Status:** Accepted

Build a small set of semantic primitives from brand tokens. Add accessible
headless components individually when a complex interaction requires them.
Avoid importing a visual system that makes the product resemble generic SaaS.

## ADR-009 — Treat the PDF as audit evidence, not migration input

**Status:** Accepted

The 438-page archive is a print export containing repeated views, malformed
cells, formula errors, HTML copies, and legacy CMS data. Obtain XLSX/CSV source
files, preserve checksums, and import from deterministic rows. The PDF remains a
reconciliation artifact only.

## ADR-010 — Model historical dates explicitly

**Status:** Accepted

Use one structured date object with calendar system, precision, qualifier,
range support, source value, and optional Hebrew context. Derive year and
century; do not retain independently editable date fragments.

## ADR-011 — Separate editorial workflow from publication state

**Status:** Accepted

Sanity draft/published state controls publication. A separate workflow tracks
import, review, duplicate, fact-check, rights, ready, rejected, and archived
states. No import publishes automatically.

## ADR-012 — Keep restricted source data out of public CMS datasets

**Status:** Accepted

Sanity Free datasets are public. Preserve contributor emails and immutable raw
rows in a restricted source archive outside Git and Sanity. CMS provenance uses
stable IDs and checksums without PII. Upgrade to a private dataset only when a
real confidential-data or role requirement justifies the cost.

## ADR-013 — Budget for commercial hosting at launch

**Status:** Accepted

Continue with Vercel for the lowest-operations Next.js deployment path, but do
not classify Hobby as a production free tier for this business. Hobby is
personal and non-commercial; public commercial deployment triggers Vercel Pro
or a deliberate hosting re-evaluation.

## ADR-014 — Provision one Sanity development environment

**Status:** Accepted, 2026-08-31

Provision one Sanity Free project under the Jewish Original Media organization
with one public `development` dataset and embed Studio at `/admin`. Reserve the
second Free dataset; do not create production infrastructure before the
development import and editorial workflow are proven. Sanity is the only active
external service and current monthly infrastructure cost remains $0.

The Free plan's Administrator and Viewer roles are acceptable for the
founder-only development milestone. Add team members only after evaluating the
least-privilege role requirement and paid upgrade trigger.

## ADR-015 — Do not mislabel generated import keys as source IDs

**Status:** Accepted, 2026-08-31

The delivered 124-row legacy CSV has a blank `Item ID` column in every row and
one duplicate slug. Its row-scoped deterministic keys are therefore generated
identifiers for the frozen export, not source-provided stable IDs. Preserve that
distinction in provenance and reports.

This decision described the earlier CSV-only evidence. ADR-016 supersedes its
source gate now that the original XLSX is available; the rule against
misrepresenting generated IDs remains in force.

## ADR-016 — Use the original XLSX as canonical migration input

**Status:** Accepted, 2026-08-31

The original `JOM On This Day Content.xlsx` is now the canonical archive. Its
checksum, worksheet names, source rows, formula expressions, and cached formula
results define migration provenance. The Numbers workbook, PDF, and CSV exports
remain reconciliation evidence but cannot override stronger XLSX cell evidence.

Treat `Form` and `Import` as the two canonical record families. Other worksheets
are instructions, unmaterialized pivots, calculations, transformed copies, or
indexes. Generate stable IDs from the frozen workbook checksum, worksheet, and
source row when no source ID exists, and label them as generated.

Restricted raw staging may retain contributor metadata locally under ignored
`artifacts/`. Sanitized candidate staging, duplicate reports, and the proposed
manifest must contain no contributor email.

## ADR-017 — Preserve duplicate evidence without creating editorial relations

**Status:** Accepted, 2026-08-31

The founder-approved first-20 pilot is imported as deterministic Sanity drafts.
Duplicate and conflicting source versions remain separate documents. Store the
cluster ID and all cluster member source IDs in read-only import provenance,
and expose the evidence through an open blocking review flag.

Do not create `relatedHistory` references from duplicate detection. That field
represents editorially meaningful related content, while similarity evidence
only signals a possible merge, alternate version, or conflict requiring human
judgment. The pilot remains at 20 drafts, zero published documents, and $0
monthly infrastructure cost.

## ADR-018 — Preview the public History experience without publishing

**Status:** Accepted, 2026-08-31

Public History URLs use durable editorial slugs such as
`/history/us-liberates-dachau`. Migration identifiers never appear in public
paths. The public site renders only documents that are both Sanity-published
and `workflowStatus: ready`.

A small set of structurally clean drafts may be marked
`publicTestCandidate` for authenticated Draft Mode only. That flag is a design
preview gate, not factual approval, image-rights clearance, or publication.

Reusable reference documents (topics, regions, people, places, eras,
organizations, and sources) may be published so relationships resolve. History
entries remain drafts until an editor marks them ready and publishes them.

Recurring Jewish observances are a distinct `entryKind`. The source historical
date remains empty or unknown; a Hebrew `observanceRule` stores the nominal
date and a future provider key. No current-year Gregorian date is stored or
displayed as canonical. Hebcal is reserved until daily/calendar features need
it.

Safe topic and geography mappings may be applied from the reviewed crosswalk.
Ambiguous values such as `Israeli/Zionism`, `British`, and `French` remain
unmapped.

## ADR-019 — First History article review does not publish

**Status:** Accepted, 2026-09-01

`US Liberates Dachau` is the first article taken through the publication
standard. Review may analyze claims, propose wording, recommend sources and
SEO, and refine the shared History template. It may not rewrite the stored
source body, attach unverified URLs as verified, or publish.

The stored Form record remains the immutable source version until the founder
approves a specific editorial patch. See
`docs/HISTORY_DACHAU_FIRST_ARTICLE_REVIEW.md`.

On 2026-09-01 the founder approved an editorial patch for the unpublished
Dachau draft: reviewed public body, excerpt, SEO, Gregorian calendar,
Tegernsee place, and verified USHMM / Yad Vashem / Dachau Memorial citations.
The original `provenance.sourceBody` was left unchanged. The history entry
was not published. U.S. Army was not added as an organization. No image was
attached.

Final visual QA uses one production `next start` process so History
Playwright and screenshots do not reopen `next dev` file-watchers. The
shared entry rail label is “From the archive,” not “Historical record.”

## ADR-020 — History template polish uses motifs, not a new identity

**Status:** Accepted, 2026-09-01

The shared History article template may add restrained JOM signatures from
approved OTD motifs: a luminance-masked lion watermark in the desktop hero
and a small Magen David section mark between gold rules. Those files are
copied unedited. They are not logos, are not recolored on disk, and must stay
low-contrast enough to leave type readable. The lion is the hero signature.
The star is the no-image transition. Do not use both in the same cluster, and
do not put a second JOM wordmark in the hero.

`mix-blend-mode: screen` on the gold lion PNG fails on sand: either the
opaque black field prints as a panel, or the gold flattens into the field.
Use `mask-mode: luminance` on the white lion with a brand-gold fill.

Featured imagery is a 16:9 editorial frame that appears only when a
rights-cleared `primaryImage` exists. Cards and social metadata reuse that
image. No-image articles collapse to typography plus a gold rule. Optional
rhythm blocks (pull quote, fact, timeline marker, artifact) render only when
supplied with real editorial content.

This polish does not publish History, import records, or change Dachau
prose, citations, taxonomy, SEO, or provenance.

## ADR-021 — Founder published the first History article

**Status:** Accepted, 2026-09-01

The founder said PUBLISH for `US Liberates Dachau` only. The published
document is `historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc`,
`workflowStatus: ready`. Related unpublished History drafts stay drafts;
their references remain weak so they are not published by association.
Source body, editorial body, citations, taxonomy, and SEO were not rewritten
for publication. No additional archive records were imported.

The development dataset is private, so public History pages use the
server-only read token with the published perspective. Without that token,
published documents are invisible and the public slug 404s.

## ADR-022 — History owns On This Day matching; Jewish Today owns the calendar

**Status:** Accepted, 2026-09-02

`/history` is the public home of On This Day in Jewish History and the
reviewed archive. History matches published, ready, non-duplicate historical
events to a civil Gregorian month and day. Recurring observances are excluded
from that fixed-date match. “Today” uses `America/New_York`, matching Jewish
Today’s V1 civil-date definition.

Jewish Today remains responsible for Hebcal and Jewish calendar calculation.
History does not import Hebcal, compute Hebrew dates, or duplicate `/today`.
Jewish Today should later consume History’s matcher rather than maintaining a
second GROQ copy.

Archive discovery uses query parameters on `/history` (`month`, `day`,
`topic`, `era`, `place`, `region`, `person`, `organization`). Nested taxonomy
routes are deferred until a facet has a meaningful published body. Filtered
and date views are `noindex` and canonicalize to `/history`. Keyword search
and paid search providers are deferred.

The approved History article template is unchanged. No additional History
drafts were published. The public archive may contain a single story and
must still look intentional.

## ADR-023 — Westerweel is History publication #2

**Status:** Accepted, 2026-09-03

The founder approved `Joop Westerweel Is Murdered at Vught` as History
publication #2. The reviewed public title, body, excerpt, SEO, Gregorian
calendar, verified Yad Vashem and Nationaal Monument Kamp Vught citations,
and removal of Yad Vashem as an organization on the 1944 event were applied
before publication. The immutable source body was not rewritten. No rescue
total or birth date was added. No image was attached.

Draft preview uses a dedicated Sanity `drafts` client and the Next.js
`redirect()` helper after `draftMode().enable()`, so remaining unpublished
`publicTestCandidate` drafts can be opened without publishing them.

On 2026-09-03 the founder said PUBLISH for this article only. The published
document is `historyEntry.jom-513f6a739543db8be9034576144811f9`,
`workflowStatus: ready`. Editorial copy, sources, taxonomy, SEO, provenance,
and image state were not rewritten for publication. Bialystok, Willenberg,
Rülf, and Tripoli remain unpublished. Published History count is 2.

Batch queue after this candidate: Bialystok, then Willenberg. Isaak Rülf is
deferred. Anti-Jewish Riots Break Out in Tripoli, Libya replaces Rülf in
the next review batch.

## ADR-024 — Publication Batch 2 prepared, unpublished

**Status:** Accepted, 2026-09-04

The founder authorized editorial preparation of Bialystok, Willenberg, and
Tripoli. All three remain unpublished `ready` drafts. Immutable source
bodies and checksums were not rewritten. Dachau and Joop were not modified.
Published History count remains 2. Isaak Rülf was not begun.

New entities created only as required: place `Bialystok ghetto`, place
`Tripoli`, region `Africa`, sources Associated Press and Jewish Telegraphic
Agency. No MENA topic was invented. No History template redesign.

## ADR-025 — Publication Batch 2 published

**Status:** Accepted, 2026-09-04

The founder approved publication of Bialystok, Willenberg, and Tripoli after
three small public-layer edits: Bialystok title/SEO to `Bialystok Ghetto Is
Sealed` with the existing slug; Willenberg sculpture wording; Tripoli
approximate “about 120” death toll. Immutable source bodies and checksums
were not rewritten. Dachau and Joop were not modified. Isaak Rülf, Herzl,
and Ze’evi remain unpublished. Published History count is 5.

## ADR-026 — Jewish Today uses Hebcal REST, not the GPL library

**Status:** Accepted, 2026-09-01

Jewish Today is a calculated daily utility. It does not store each calendar day
in Sanity. Calendar data comes from the Hebcal REST calendar API through a
typed adapter in `src/integrations/hebcal`. History matches come from
History’s `getOnThisDayHistory`.

`@hebcal/core` is not installed. That package is GPL-2.0; using it here would
require this application to be distributed under GPL terms the project has not
adopted. The hosted API is CC BY 4.0 with required Hebcal.com attribution.

V1 “today” is the civil Gregorian date in `America/New_York`. Sunset, visitor
timezone, Israel schedule, and candle-lighting are deferred.

See `docs/JEWISH_TODAY.md`.

## ADR-027 — Integration bases on local main, not the GitHub default

**Status:** Accepted, 2026-09-03

GitHub’s default branch is `milestone-1-sanity-history`. That default was not
changed. The Integration branch still starts from local `main` at `7b0ed78`
because that commit is the last shared stable ancestor of History, Jewish
Today, and Podcasts. Remote `main` has not been created. Podcasts remain
isolated.

## ADR-028 — Homepage composes live modules and reserved slots

**Status:** Accepted, 2026-09-03

The homepage is server-composed, not a CMS document. It calls
`getJewishToday()` once and renders `JewishTodayModule`. After History merge
it also reads published archive entries through `getHistoryIndex` and renders
`HistoryEntryCard`. Podcasts, News, Events, Culture, and Support remain
reserved. See `docs/HOMEPAGE.md` and `docs/INTEGRATION.md`.

## ADR-029 — Frozen History merges into Integration

**Status:** Accepted, 2026-09-04

`milestone-1-sanity-history` at `3539211` is merged into
`feature/integration-homepage`. Temporary Jewish Today adapters
`fetchOnThisDayHistory`, `TodayHistoryCard`, and `formatOnThisDayDate` are
removed. Jewish Today and the homepage consume History’s
`getOnThisDayHistory`, `HistoryEntryCard`, and `formatHistoricalDate`.
Podcasts are not merged. Production, DNS, and the GitHub default branch are
unchanged.

## ADR-030 — Podcast foundation uses the official RSS feed and nested URLs

**Status:** Accepted, 2026-09-02

Authored as ADR-023 on `feature/podcasts`. Renumbered here so History
ADR-023 (Westerweel) and later History/Integration ADRs stay stable.

The Two Tall Jews Show archive is imported from the official public RSS
feed `https://anchor.fm/s/29786d14/podcast/rss`, not from guessed YouTube
scrapes or the marketing homepage. The feed contains 66 items. Season and
episode numbers are preserved as source metadata even when implausible.

Durable public URLs are:

- `/podcasts` — Podcasts home
- `/podcasts/the-two-tall-jews-show` — show archive
- `/podcasts/the-two-tall-jews-show/[slug]` — episode

The editorial show title is The Two Tall Jews Show. The RSS collection
title Jewish Original Media is stored as source metadata.

Video stays on YouTube with a privacy-friendly lazy facade when an editor
confirms a watch URL. Audio uses the official enclosure. Transcripts are
split into raw (Advanced) and reviewed (public). AI may suggest and must
not publish.

The public catalog reads published Sanity documents only. Unpublished
pilot drafts stay out of `/podcasts`, show pages, episode pages, and the
sitemap.

## ADR-031 — Four-pilot drafts use verified multi-platform links

**Status:** Accepted, 2026-09-04

Authored as ADR-024 on `feature/podcasts`. Renumbered here so History
ADR-024 remains Publication Batch 2 preparation.

Episode media may include official RSS audio plus verified YouTube, Spotify,
and Apple episode URLs. Primary media is YouTube when a verified official
episode video exists, otherwise native RSS audio. Spotify and Apple are
Listen alternatives, not stacked players.

Apple episode URLs were verified through the official iTunes lookup, matched
by RSS GUID. Spotify episode pages were taken from the official RSS link.
No official TTJS YouTube episode IDs were verified. Description YouTube
links remain guest-channel evidence only.

The four-pilot import writes `drafts.*` documents only and is idempotent by
RSS GUID. It does not publish and does not import the remaining catalog.

## ADR-032 — Frozen Podcasts merge into Integration

**Status:** Accepted, 2026-09-04

`feature/podcasts` at `0d939d3` is merged into `feature/integration-homepage`.
History desks remain. Podcast shows, episodes, and workflow join the same
Studio. One draft-mode enable route serves History, podcast shows, and
podcast episodes. The homepage Podcast slot uses the canonical published
Podcast read and the existing “Podcasts are being prepared.” state while
published count is 0. Research branches, Production, DNS, and the GitHub
default branch are unchanged.
