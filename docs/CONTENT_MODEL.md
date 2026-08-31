# Content Model

## Modeling principles

- Use explicit document types, not one polymorphic posts collection.
- Prefer references to repeated strings for people, places, topics, eras, and authors.
- Preserve editorial provenance, sources, image rights, revisions, and publication state.
- Keep Gregorian occurrence dates separate from the year represented by an event.
- Allow uncertain, approximate, BCE/CE, and multi-day dates without inventing precision.
- Generate but permit editorial override of slugs, excerpts, and SEO descriptions.
- Keep taxonomies editor-managed and additive; never encode the proposed lists in UI logic.

## Shared objects

**SEO**

Title override, description, canonical override, social image, indexing directive,
and structured-data controls.

**Media asset**

Asset, alt text, caption, credit, creator, source URL, rights holder, license,
usage restrictions, focal point, and rights-review status.

**Source citation**

Title, author/organization, publication, URL or bibliographic detail, access
date, page/location, archival identifier, and editorial note.

**Publication**

Status (`draft`, `review`, `scheduled`, `published`, `archived`), publish date,
revision notes, reviewer, embargo, and correction history.

## Editorial documents

### History entry

Core fields: title, slug, excerpt, body, one structured historical date, Hebrew
date when supported, era references, people, places, geographic regions, topics,
citations, rights-aware media, related entries, SEO, workflow, corrections, and
non-sensitive import provenance.

The model must support BCE years, ranges, approximate dates, recurring
commemorations, and events where the Hebrew date is context rather than an exact
conversion. Year and century are derived from the reviewed date rather than
stored as drifting free-text values. See `docs/HISTORY_MODEL.md` for the
production field model and `docs/HISTORY_ARCHIVE_AUDIT.md` for source evidence.

### Podcast episode

Title, slug, show, episode and season numbers, guest references, release date,
YouTube and audio identifiers, description, transcript with timestamps and
speaker labels, topics, related history, media, SEO, and publication data.

### Article

Title, slug, author references, editorial desk/category, excerpt, body, sources,
featured media, topics, related content, SEO, and publication data.

### Curated news item

Publisher reference, original headline, canonical source URL, publication date,
editorial summary, category/topics, legally usable media reference, selection
note, expiration date, and status. The source article is linked, not copied.

### Event

Name, organizer reference, event mode, venue, structured address, coordinates,
timezone, start/end, recurrence information, external URL, description, source,
media, geographic reach, review status, and expiration.

### Culture item

A typed editorial object for books, music, food, humor, art, and discoveries.
It stores creator, format, commentary, source/commerce links, rights, related
content, and publication data without pretending all culture items are articles.

## Entity documents

- **Person:** preferred name, variants, lifespan, biography, identifiers
- **Place:** name, variants, coordinates, modern jurisdiction, historical context
- **Topic:** label, slug, description, parent/related topics
- **Era:** label, date bounds where meaningful, description, display order
- **Organization/publisher:** identity, canonical site, trust/editorial notes
- **Author/contributor:** biography, role, portrait, social links
- **Show:** title, description, feeds, artwork, platform links

## Operational PostgreSQL entities

These do not belong in the editorial CMS:

- User/profile, role, consent, and account state
- Saved content, follows, reactions, submissions, and correction reports
- Sponsor, campaign, placement, contract dates, and reporting
- Dedication, occasion, message, associated content, moderation, and payment state
- Payment/customer references and webhook event ledger
- Import jobs, automation runs, approval tasks, and failure logs

Payment card data is never stored. Payment state is reconciled from signed
provider webhooks with idempotency.

## Relationships and IDs

CMS documents use immutable internal IDs and stable slugs. Operational records
store a `content_type` plus `content_id` only where a cross-system reference is
necessary. A reference resolver validates targets and handles archived content.

Related content can be curated manually, suggested automatically, or derived
from shared entities. The API must preserve which method produced the relation.

## Import requirements

The history spreadsheet import will be staged, not published directly:

1. Preserve every source cell in an immutable, access-controlled raw record
   outside the public CMS and Git repository.
2. Normalize dates, names, and topics into candidate structured fields.
3. Flag ambiguity, duplicate slugs, missing sources, and missing rights.
4. Let an editor approve mappings and records in batches.
5. Produce a reconciliation report with imported, skipped, and failed rows.

Only objectively structural normalization is automatic. Historical corrections,
prose changes, duplicate merges, and publication always require human review.
