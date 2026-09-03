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

## ADR-021 — Jewish Today uses Hebcal REST, not the GPL library

**Status:** Accepted, 2026-09-01

Jewish Today is a calculated daily utility. It does not store each calendar day
in Sanity. Calendar data comes from the Hebcal REST calendar API through a
typed adapter in `src/integrations/hebcal`. History matches are queried from
existing published `historyEntry` documents.

`@hebcal/core` is not installed. That package is GPL-2.0; using it here would
require this application to be distributed under GPL terms the project has not
adopted. The hosted API is CC BY 4.0 with required Hebcal.com attribution.

V1 “today” is the civil Gregorian date in `America/New_York`. Sunset, visitor
timezone, Israel schedule, and candle-lighting are deferred.

ADR numbers 014–020 are reserved for the in-progress History workstream so this
decision does not collide on merge. See `docs/JEWISH_TODAY.md`.
