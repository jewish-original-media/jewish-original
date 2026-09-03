# Application Architecture

## Chosen stack

- **Web:** Next.js 16 App Router, React 19, TypeScript 6
- **Styling:** Tailwind CSS 4 backed by semantic CSS design tokens
- **Hosting:** Vercel on Node.js 24 / Fluid Compute at public launch
- **Editorial CMS:** Sanity next, embedded at `/admin`
- **Operational data:** PostgreSQL only when an operational feature requires it;
  evaluate Neon and current alternatives at that milestone
- **Authentication:** Sanity identity for editors; choose member authentication
  only when member accounts are approved
- **Media:** Sanity Assets for editorial media; no second media service now
- **Search:** Sanity queries initially; PostgreSQL full-text/`pg_trgm` when unified
  cross-content search requires it; a hosted search engine only after measured need
- **Analytics:** none during foundation; enable the minimum first-party measurement
  only after a public product creates a defined question and consent requirement
- **Monitoring:** framework and hosting diagnostics first; add Sentry only after a
  concrete error-triage or alerting gap is demonstrated

No external service is wired in this foundation milestone. Each will be
provisioned before its SDK or schema is added.

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

- **Sanity — needed next.** The current Free plan includes 20 seats, 2 public
  datasets, 10,000 documents, 250,000 API requests/month, 1 million API CDN
  requests/month, 100 GB assets, and 100 GB bandwidth. Use one development
  dataset initially and reserve the second for production. Upgrade when a
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
- `sanity`: studio configuration and content schemas

Features import integrations through adapters rather than calling third-party
SDKs directly. This keeps legal provenance, caching, failure handling, and tests
consistent.

## Data and publishing flow

1. An editor creates or imports a draft in Sanity.
2. Validation enforces required dates, sources, rights metadata, and SEO fields.
3. Editorial review moves the item to published status.
4. A webhook revalidates affected pages and related collections.
5. Next.js generates semantic metadata, JSON-LD, canonical URLs, and sitemap entries.
6. Automation may suggest tags, summaries, or relationships but cannot publish
   sensitive editorial content without approval.

## Security baseline

- Managed identity, MFA, least-privilege editor roles, and protected `/admin`
- Secrets remain server-only and are synchronized through Vercel environments
- Input validation at every write boundary; sanitized portable rich text rendering
- Signed webhook verification, rate limiting for public writes, and audit trails
- Database row-level authorization through repositories and explicit role checks
- Backups, restore tests, dependency updates, CSP, and security headers before beta

## SEO and performance

- Canonical metadata through the Next.js metadata API
- Generated `robots.txt`, XML sitemaps, Open Graph images, and schema.org JSON-LD
- Stable routes such as `/history/[slug]` and `/podcasts/[slug]`
- Responsive `next/image`, self-hosted fonts, minimal client JavaScript
- Internal links driven by structured relationships, not brittle keyword matching
- Web-vitals budgets: LCP <2.5s, INP <200ms, CLS <0.1 at the 75th percentile

## Deployment environments

- Local development with `.env.local`
- Vercel Preview per branch with isolated draft-safe configuration
- Vercel Production on `jewishoriginal.com`
- CMS datasets separated for production and nonproduction when production is created
- Database environments added only if an operational database is provisioned

The project targets Node.js 24 LTS. The current local Node 23 installation is
non-LTS and should be replaced before dependency or deployment debugging.
Next.js 16 technically supports Node 20.9+, but Node 24 LTS is the project
standard and Vercel default. `.nvmrc` and `package.json` pin the 24.x line.

## Jewish Today

The daily utility lives at `/today` and is assembled by `getJewishToday()`.
Calendar calculation stays in `src/integrations/hebcal`. Editorial History
matching stays in `src/content/jewish-today`. The homepage must import those
modules later rather than calling Hebcal or writing a second on-this-day query.

See `docs/JEWISH_TODAY.md` and ADR-021. This section is additive and should
merge beside the History workstream’s Sanity notes.
