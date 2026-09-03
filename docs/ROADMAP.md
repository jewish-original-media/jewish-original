# Product Roadmap

## Milestone 0 — Foundation (current)

- Audit brand assets and document constraints
- Establish architecture, product, content, design, and decision records
- Create the production framework, tokens, global shell, and SEO baseline
- Verify build, lint, type safety, accessibility basics, and responsive shell

Exit: a clean, deployable shell with no fabricated editorial content.

## Milestone 1 — Structured history vertical

- Obtain canonical XLSX/CSV archive exports and freeze source checksums
- Provision Sanity and embed a protected Studio at `/admin`
- Define people, places, regions, topics, eras, sources, rights-aware media, and
  history schemas
- Build spreadsheet staging, validation, dry-run, and reconciliation tooling
- Import the approved 20-record migration test set as drafts and conduct
  editorial QA
- Build history detail, index, today view, filters, related content, and JSON-LD
- Establish preview, correction, and publishing workflows

Exit: editors can safely publish real history entries and readers can discover them.

## Milestone 2 — Daily Jewish utility

- Integrate Hebcal through a typed, cached adapter
- Add Hebrew date, parashah, holiday, Omer, and location-aware candle context
- Define timezone and geolocation consent behavior
- Compose the useful daily homepage from verified data and original history

Checkpointed and frozen on `feature/jewish-today`: Hebcal REST adapter,
`JewishTodayDay` contract, standalone `/today`, and live matching against the
published Dachau History entry. Homepage composition, sunset/local timezone,
Israel schedule, candle-lighting, and branch convergence remain later
controlled work. See `docs/JEWISH_TODAY.md` and
`docs/JEWISH_TODAY_CONVERGENCE.md`.

Exit: the homepage has trustworthy daily value with graceful failure behavior.

## Milestone 3 — Podcast and original editorial

- Model shows, guests, episodes, articles, authors, and transcripts
- Import the podcast archive and build durable episode pages
- Add transcription review, timestamps, media embeds, and related history
- Build editorial story templates and social-to-site publishing workflows

## Milestone 4 — Curation and distribution

- Approved-feed ingestion with source policy, deduplication, and editor approval
- Curated news, culture, and event modules with rights-safe media handling
- Newsletter capture and transactional email infrastructure
- Search, analytics, editorial dashboards, and distribution automation

## Milestone 5 — Sustainable revenue

- Provision Stripe and model donation, sponsorship, and dedication workflows
- Build sponsor/dedication inventory, moderation, receipts, and placement controls
- Add tasteful support prompts and transparent sponsored-content labeling
- Measure conversion without degrading editorial trust

## Later, only after evidence

- Member accounts, saved content, reactions, comments, and submissions
- Interactive history experiences and education products
- Institutional licensing and Jewish Original+
- Source-grounded Ask Jewish Original
- Native apps when web retention and mobile use cases justify them
