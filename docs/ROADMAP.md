# Product Roadmap

## Milestone 0 — Foundation (current)

- Audit brand assets and document constraints
- Establish architecture, product, content, design, and decision records
- Create the production framework, tokens, global shell, and SEO baseline
- Verify build, lint, type safety, accessibility basics, and responsive shell

Exit: a clean, deployable shell with no fabricated editorial content.

## Milestone 1 — Structured history vertical (first article complete)

- Obtain canonical XLSX/CSV archive exports and freeze source checksums
- Provision Sanity and embed a protected Studio at `/admin`
- Define people, places, regions, topics, eras, sources, rights-aware media, and
  history schemas
- Build spreadsheet staging, validation, dry-run, and reconciliation tooling
- Import the approved 20-record migration test set as drafts and conduct
  editorial QA
- Build the first History entry template, index foundation, preview, and JSON-LD
- Complete the first article review for `US Liberates Dachau` without publishing
- Polish the shared History article template for hierarchy, featured media,
  and restrained JOM signatures without publishing
- Refine desktop hero spacing, lion watermark, and CSS editorial motion;
  stop for founder design review without publishing
- Apply a final pre-publish UI polish (lion quieting, excerpt measure,
  share separators, source/rail readability) without publishing
- Keep publication blocked until fact, citation, taxonomy, and rights review
- Publish only the reviewed `US Liberates Dachau` article after founder approval
- Turn `/history` into the public archive and On This Day discovery home
  without publishing additional drafts
- Prepare `Joop Westerweel Is Murdered at Vught` as publication #2 without
  publishing it
- Publish only the reviewed Westerweel article after founder approval;
  remaining History drafts stay unpublished
- Prepare unpublished Batch 2 drafts: Bialystok, Willenberg, and Tripoli
- Publish only the reviewed Batch 2 articles after founder approval;
  remaining History drafts stay unpublished

Exit: the editorial workflow, public History template, and public archive
foundation are proven. The first reviewed article is public. Remaining archive
import waits until more records can be published honestly.

## Milestone 2 — Daily Jewish utility

- Integrate Hebcal through a typed, cached adapter
- Add Hebrew date, parashah, holiday, Omer, and location-aware candle context
- Define timezone and geolocation consent behavior
- Compose the useful daily homepage from verified data and original history

Checkpointed and frozen on `feature/jewish-today`, then merged into
`feature/integration-homepage` with frozen History `3539211`. Hebcal REST
adapter, `JewishTodayDay`, standalone `/today`, canonical History matching,
published History routes, and a homepage that renders `JewishTodayModule`
plus live History cards are on Integration. Frozen Podcasts `0d939d3` are
also merged: public catalog, unified Studio, and a homepage Podcast module
that stays in the prepared state until a document is published. The V1
public shell now includes live navigation, About, Support, Privacy, and a
Design Director editorial homepage.
Sunset/local timezone, Israel schedule, and candle-lighting remain later
work. See `docs/JEWISH_TODAY.md`, `docs/JEWISH_TODAY_CONVERGENCE.md`,
`docs/HOMEPAGE.md`, and `docs/INTEGRATION.md`.

Exit: the homepage has trustworthy daily value with graceful failure behavior.

## Milestone 3 — Podcast and original editorial

- Model shows and episodes against existing people, places, topics, and History
- Build `/podcasts`, the TTJS show page, and episode templates from the official RSS feed
- Import the four approved pilot episodes as unpublished Sanity drafts with verified Apple and Spotify links
- Keep publication blocked; do not import the remaining catalog until founder review
- Merged into `feature/integration-homepage` at frozen checkpoint `0d939d3`
- Founder-approved publication of The Two Tall Jews Show and the four pilots
  on 2026-09-04; Integration re-read published documents and did not write
- Later: confirm official YouTube episode IDs, review transcripts, and import the remaining feed
- Build editorial story templates and social-to-site publishing workflows after the podcast foundation is approved

## Next milestone — Production cutover

News + Events automation and V1 launch infrastructure are on Integration
Preview. See `docs/V1_LAUNCH.md` and `docs/SOURCE_OF_TRUTH.md`.

Do not begin Originals. Do not expand History. Do not attach
`jewishoriginal.com` until the founder-approved Production checklist is
run.

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
