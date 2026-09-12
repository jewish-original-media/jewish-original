# Application Architecture

## Chosen stack

- **Web:** Next.js 16 App Router, React 19, TypeScript 6
- **Styling:** Tailwind CSS 4 backed by semantic CSS design tokens
- **Hosting:** Vercel on Node.js 24 / Fluid Compute at public launch
- **Editorial CMS:** Sanity Free, embedded at `/admin`, with one public
  `development` dataset
- **Operational data:** PostgreSQL only when an operational feature requires it;
  evaluate Neon and current alternatives at that milestone
- **Authentication:** Sanity identity for editors; choose member authentication
  only when member accounts are approved
- **Media:** Sanity Assets for editorial media; no second media service now
- **Search:** Sanity queries initially; PostgreSQL full-text/`pg_trgm` when unified
  cross-content search requires it; a hosted search engine only after measured need
- **Analytics:** Vercel Web Analytics and Speed Insights on the public site;
  cookieless; no advertising pixels or cookie banner
- **Monitoring:** framework and hosting diagnostics first; add Sentry only after a
  concrete error-triage or alerting gap is demonstrated

Sanity is the only provisioned external service. No public deployment,
operational database, member authentication, monitoring, second media service,
hosted search, or paid analytics service is provisioned.

## Why this separation

Sanity gives a nontechnical editor a mature structured-content interface,
revisions, media management, and real-time preview without making the team
maintain a CMS. A future PostgreSQL service would become the system of record
only for operational entities such as users, payments, submissions,
dedications, and saved content. Content references must use stable IDs and avoid
duplicating full documents between systems.

## Lean stack audit

The proposed core remains the smallest maintainable architecture for the next
milestone: Next.js, React, TypeScript, Tailwind, Sanity, and later Vercel
deployment. The application and Studio remain in one repository. There is no
custom CMS, API server, database, member-auth provider, upload service, hosted
search engine, or duplicate analytics stack.

Current service gates:

- **Sanity — active at $0/month.** The current Free plan includes 20 seats, 2 public
  datasets, 10,000 documents, 250,000 API requests/month, 1 million API CDN
  requests/month, 100 GB assets, and 100 GB bandwidth. Use one development
  dataset initially and reserve the second for production. One of two datasets
  is now in use. The development dataset holds the History corpus and
  unpublished Podcast pilot drafts. Five reviewed History entries are
  published. Remaining imported History records stay drafts. One
  podcastShow and four podcastEpisode documents remain unpublished.
  Public podcast pages stay empty until founder-approved publication.
  The Free plan exposes Administrator and Viewer roles but not an Editor role,
  so it is suitable for the founder-only development milestone, not a
  least-privilege editorial team. Upgrade when a
  private dataset, non-admin editor roles, comments/tasks, scheduled drafts, or
  materially higher quotas become necessary. Free-plan caps block usage rather
  than create surprise overages.
- **Vercel — not needed until deployment.** Local development remains free.
  Vercel Hobby is restricted to personal, non-commercial use, so Jewish
  Original should budget for Pro at public commercial launch rather than assume
  a permanent free production tier. The current Pro entry price is $20/month
  and includes a $20 usage credit. No deployment is part of this refinement.
- **PostgreSQL/Neon — not needed.** Add a relational store only for real
  operational state such as accounts, payments, saves, submissions, or job
  ledgers. Re-evaluate provider pricing and Vercel integration support then.
- **Clerk or another member-auth service — not needed.** Sanity manages editorial
  identity. Member authentication begins only with an approved account feature.
- **Vercel Blob — not needed.** Sanity Assets covers editorial uploads. Revisit
  object storage only for direct user uploads or non-editorial files.
- **Sentry — not needed.** Use local errors and Vercel runtime/build diagnostics
  first. Add dedicated monitoring when release volume or unresolved production
  failures require alerting, traces, and issue ownership.
- **Hosted search — not needed.** Sanity queries cover the initial history
  corpus. Add search infrastructure only after measured relevance or latency
  limits.

Pricing and quotas must be rechecked against official service documentation at
the moment of provisioning; they are decision thresholds, not contractual
guarantees.

## Runtime architecture

```text
Browser / crawler
      |
Next.js App Router on Vercel
      |-- Server Components -> Sanity Content Lake
      |-- Server Actions / Route Handlers -> future operational adapter
      |-- External adapters -> Hebcal, Sefaria, approved feeds
      |-- Webhooks -> revalidation and automation queue
      `-- Editorial media -> Sanity CDN
```

Public pages should default to Server Components and static or cached rendering.
Client Components are limited to true interaction. Node.js is the default
runtime; Edge runtime is not required for streaming or middleware.

## Application boundaries

- `src/app`: routes, layouts, metadata, error boundaries
- `src/components`: reusable UI and composed editorial modules
- `src/lib`: framework-agnostic utilities, site config, validation
- `src/features`: feature-specific application logic once features exist
- `src/integrations`: typed adapters for external systems
- `src/content`: CMS queries, projections, and content mapping
- `src/db`: operational schema, migrations, and repositories
- `sanity.config.ts` and `sanity.cli.ts`: Studio and CLI configuration
- `src/sanity`: schema types, editor structure, and public environment config
- `scripts/history`: deterministic source adapters, reconciliation, and draft imports
- `scripts/podcasts`: RSS dry-run reporting and draft-only four-pilot import

Features import integrations through adapters rather than calling third-party
SDKs directly. This keeps legal provenance, caching, failure handling, and tests
consistent.

## Data and publishing flow

1. An editor creates or imports a draft in Sanity.
2. Drafts may remain incomplete. Studio validation blocks publication until the
   workflow is `ready`, critical story/date/source fields are complete, image
   rights are cleared when an image is present, and blocking flags are resolved.
3. Editorial review explicitly invokes Sanity's native publish action.
4. A webhook revalidates affected pages and related collections.
5. Next.js generates semantic metadata, JSON-LD, canonical URLs, and sitemap entries.
6. Automation may suggest tags, summaries, or relationships but cannot publish
   sensitive editorial content without approval.

## Security baseline

- Sanity-managed identity and protected `/admin`; require MFA and
  least-privilege roles before adding an editorial team
- Secrets remain server-only in ignored local environment files; synchronize
  through the chosen host only when deployment is approved
- Input validation at every write boundary; sanitized portable rich text rendering
- Signed webhook verification, rate limiting for public writes, and audit trails
- Database row-level authorization through repositories and explicit role checks
- Backups, restore tests, dependency updates, CSP, and security headers before beta

## SEO and performance

- Canonical metadata through the Next.js metadata API
- Generated `robots.txt`, XML sitemaps, Open Graph images, and schema.org JSON-LD
- Stable routes such as `/`, `/today`, `/history`, `/history/[slug]`,
  `/podcasts`, `/podcasts/[showSlug]`, and `/podcasts/[showSlug]/[slug]`
- History owns Gregorian On This Day matching; Jewish Today owns Hebcal
- Archive filters stay on `/history` query parameters until taxonomy routes
  have a meaningful published body
- Unpublished Podcast drafts never enter the sitemap or public catalog
- Responsive `next/image`, self-hosted fonts, minimal client JavaScript
- Internal links driven by structured relationships, not brittle keyword matching
- Web-vitals budgets: LCP <2.5s, INP <200ms, CLS <0.1 at the 75th percentile

## Deployment environments

- Local development with ignored `.env.local`
- One public Sanity `development` dataset; no production dataset yet
- Vercel Preview is configured for the Jewish Original project; custom
  production domains remain unassigned from this workstream
- CMS datasets will be separated only when production is approved
- Database environments added only if an operational database is provisioned

The project targets Node.js 24 LTS. The current local Node 23 installation is
non-LTS and should be replaced before dependency or deployment debugging.
Next.js 16 technically supports Node 20.9+, but Node 24 LTS is the project
standard and Vercel default. `.nvmrc` and `package.json` pin the 24.x line.

## Jewish Today

The daily utility lives at `/today` and is assembled by `getJewishToday()`.
Calendar calculation stays in `src/integrations/hebcal`. Editorial History
matching stays in History `getOnThisDayHistory`. The Integration homepage
imports Jewish Today through `getHomePageData()`. It does not call Hebcal or
write a second on-this-day query.

See `docs/JEWISH_TODAY.md`, `docs/HOMEPAGE.md`, and ADR-026.

## Homepage composition

`/` is assembled by `getHomePageData()` in `src/features/homepage`. Jewish
Today, published History, Support, and published Podcasts are live modules.
Podcasts use the canonical published show/episode read. The homepage shows
one latest `EpisodeCard` and routes into `/podcasts`. Published Originals
appear as a journal band. News appears when the desk has enough published
items. Events stay hidden until published documents exist. Do not invent
editorial items to fill empty slots.

Loading and unexpected homepage errors live in `src/app/(site)/(home)/` so
they do not wrap `/today` or `/history`. Expected Jewish Today failures stay
inside `getJewishToday()` and degrade without raw errors.
