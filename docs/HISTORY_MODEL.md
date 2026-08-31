# Production History Model and Migration Plan

Status: approved foundation proposal; implementation begins in Milestone 1.

## Modeling decision

Sanity will hold editorial history documents and reusable editorial entities.
The source workbook will not be recreated field-for-field. Repeated concepts
become references, uncertain dates retain uncertainty, image rights are
first-class data, and import provenance remains separate from edited content.

## `historyEntry` document

### Identity and editorial content

- `title`: required string
- `slug`: required stable slug with uniqueness validation
- `excerpt`: reviewed plain-text summary; never silently generated into a
  published document
- `body`: Portable Text preserving the supplied article wording during import
- `contentWarnings`: optional controlled labels plus an editorial note

### Historical date

Use one `historicalDate` object rather than independently editable month, day,
year, and century fields:

- `calendarSystem`: `gregorian`, `julian`, `hebrew`, or `other`
- `start`: signed astronomical year, month, and day as separately nullable
  integers
- `end`: optional structured end date for ranges
- `precision`: `day`, `month`, `year`, `range`, or `unknown`
- `qualifier`: `exact`, `circa`, `before`, `after`, or `traditional`
- `displayText`: editorial display for dates that cannot be represented safely
- `sourceValue`: original date string from the archive
- `conversionNote`: explanation when a reviewed conversion is supplied

There is no independently editable century string. Year and century filters are
derived from the reviewed start year; eras remain editorial references. This
prevents the drift already present in the workbook. A Gregorian ISO date may be
generated only for verified exact CE dates. The archive’s slash date must not
automatically be described as Gregorian.

An optional `hebrewDate` object stores Hebrew day, month, year, precision,
display text, and whether it is original, traditional, or a verified calendar
conversion. Recurring observances also require an `observanceRule` rather than
pretending they occurred on one fixed Gregorian date.

### Referenced entities

- `people`: references to `person`
- `places`: references to `place`
- `geographicRegions`: references to hierarchical `geographicRegion`
- `topics`: references to hierarchical `topic`
- `eras`: references to `historicalEra`
- `organizations`: references to `organization` where materially relevant

These are dedicated documents because names, aliases, boundaries, biographies,
and relationships recur across entries. Importing arbitrary strings directly
would preserve the archive’s inconsistency and make filtering unreliable.

### Sources and citations

`citations` is an ordered array of entry-specific citation objects:

- optional reference to a reusable `source` document
- title, author or organization, publication, publisher
- URL or bibliographic detail
- page, chapter, timestamp, archive call number, or locator
- publication date and access date where applicable
- note, quotation, and verification status

Reusable publications, archives, books, and institutions may be `source`
documents. The citation remains embedded because its page, URL, quotation, and
use are specific to one history entry.

### Media

`primaryImage` and optional `gallery` use a shared `editorialImage` object:

- Sanity asset reference
- alt text, caption, creator, and credit line
- source page URL, original file name, and source archive ID
- rights holder, license, license URL, and expiration if applicable
- permitted uses, crop restrictions, and sensitivity note
- rights status: `unknown`, `researching`, `permissionRequired`,
  `cleared`, `publicDomain`, `licensed`, or `rejected`
- reviewer, review date, and evidence note

An image cannot be published unless rights status is `cleared`,
`publicDomain`, or `licensed`. A missing image does not justify a fabricated or
unlicensed placeholder.

### Relationships

- `relatedHistory`: ordered objects containing a history reference, relation
  type, optional note, and origin (`editorial`, `imported`, or `suggested`)
- `relatedPodcastEpisodes`: added when the real podcast schema exists; no
  placeholder podcast type is introduced now

Suggested relationships never become published curation without editor
approval.

### SEO and social

The shared `seo` object contains SEO title, description, canonical override,
no-index control, Open Graph title/description overrides, and social image.
Defaults derive from reviewed public fields at render time. Overrides remain
optional and validated for practical lengths.

### Workflow and publication

Sanity’s native draft/published state is the publication authority. A separate
`workflowStatus` must not duplicate “published”:

- `imported`
- `needsReview`
- `duplicateCandidate`
- `factCheck`
- `rightsReview`
- `ready`
- `rejected`
- `archived`

Expected flow:

`imported → needsReview → factCheck → rightsReview → ready → native publish`

`duplicateCandidate` returns to `needsReview` after resolution or moves to
`rejected`. A correction to published work creates a new draft and a correction
record; it never overwrites history without an audit trail.

`reviewFlags` stores machine- or human-raised issues with code, affected field,
severity, evidence, detector, resolution, and reviewer. `editorialNotes` may
contain only non-sensitive operational notes. Field hiding in Studio is not
access control.

### Provenance

The document stores non-sensitive traceability:

- `originalImportIdentifier`
- `sourceArchiveId`, source sheet, source row or legacy item ID
- original slug and legacy collection ID
- source creation/update/publication timestamps
- import run ID and importer version
- raw-record checksum and source-body checksum
- import timestamp

Contributor email and unrestricted raw rows do not enter a public Sanity
dataset. The immutable raw files and row payloads remain in an access-controlled
source archive outside Git. Sanity Free permits public datasets only, so truly
confidential notes or raw PII would require a private dataset on a paid plan or
a separate secure system.

## Reusable document types

### `person`

Preferred display name, aliases and transliterations, birth/death dates with
precision, short biography, external authority IDs, portrait with rights, and
merge history.

### `place`

Preferred name, historical names, aliases, place type, coordinates where safe,
modern jurisdiction, geographic-region references, historical context, and
external authority IDs.

### `geographicRegion`

Name, slug, region type, parent region, aliases, description, and display order.
This replaces mixed values such as `USA`, `North America`, `British`, and
`French` with an explicit hierarchy.

### `topic`

Name, slug, aliases, description, parent topic, related topics, scope note, and
status. Case-only and synonymous source tags map through a reviewed crosswalk.

### `historicalEra`

Name, slug, optional date bounds, boundary note, description, and display order.
Era boundaries are editorial context, not an automatic claim derived from one
year.

### `organization` and `source`

Canonical name, aliases, organization/source type, canonical URL, identifiers,
and editorial trust or scope notes where appropriate.

## Normalization and migration rules

1. Snapshot every original file read-only, calculate SHA-256 checksums, and
   record archive receipt metadata.
2. Export each original workbook tab to UTF-8 CSV. Reject the PDF as parser
   input.
3. Assign an idempotent source key such as
   `jom-history:<archive>:<sheet>:<row-or-item-id>`.
4. Store the complete raw row unchanged in restricted staging. Sanity receives
   only non-sensitive provenance and candidate editorial fields.
5. Trim structural cell padding, normalize line endings, parse valid machine
   dates, and split comma-delimited source tags. These are objective transforms.
6. Preserve the original body and separately create a deterministic Portable
   Text candidate. HTML parsing may remove tags but may not rewrite prose.
7. Map taxonomy through a versioned crosswalk. Unknown values create review
   tasks, not silently invented entities.
8. Detect duplicate candidates using source IDs, normalized title, reviewed
   date, body similarity, legacy slug, and entity overlap. Never auto-merge.
9. Run a dry import that reports creates, updates, skips, failures, missing
   references, date warnings, duplicate clusters, and checksum changes.
10. Import drafts only. Re-running the same import must be idempotent.
11. Reconcile every selected source key to exactly one staging result and record
    all rejected or deferred rows with reasons.
12. Require human fact, citation, taxonomy, and rights review before native
    publication.

AI may propose flags, candidate aliases, or duplicate scores. It may not correct
dates, merge articles, rewrite historical prose, or publish.

## Exact Sanity implementation plan

1. Obtain the original tabular archive before creating import code.
2. At the start of Milestone 1, provision one Sanity Free project and one public
   development dataset. Reserve the second included public dataset for
   production rather than creating it prematurely.
3. Add the Sanity Studio and `next-sanity` packages at current stable versions,
   embed Studio at `/admin`, and keep public reads server-rendered.
4. Configure project ID and dataset through ignored local environment files;
   import and preview tokens remain server-only.
5. Implement shared objects first: historical date, Hebrew date, citation,
   editorial image, SEO, workflow flag, correction, and provenance.
6. Implement referenced documents next: person, place, geographic region,
   topic, historical era, organization, and source.
7. Implement `historyEntry` with field groups, desk structure, previews,
   validation, reference filters, and publish-blocking review checks.
8. Add deterministic CSV-to-staging conversion, taxonomy crosswalks, duplicate
   scoring, dry-run output, and idempotent draft import scripts.
9. Add fixture-based tests for BCE/CE years, partial dates, ranges, malformed
   HTML, duplicate clusters, missing rights, and repeat imports.
10. Import only the approved 20-record test set into development as drafts.
11. Complete editorial reconciliation and revise the schema before creating the
    production dataset or building the public History experience.

No Neon database, member authentication, Blob storage, Sentry, or hosted search
is required for this milestone.

## Exact first-20 selection plan

The first 20 are a migration test set, not the first 20 publishable articles.
Selection occurs only after CSV row IDs are available.

Twelve records are reserved to exercise known failure modes:

- both Romanian yellow-star near-duplicate rows
- both `Arik Einstein is Born` duplicate rows
- `Będzin Ghetto Uprising` with merged unrelated body content
- `Buchenwald Concentration Camp Begins Operations` with its date appended to
  body content
- `Eli Cohen is executed by Syrian authorities` with missing body/date
- the form and legacy versions of `Menachem Begin Passes Away`
- the legacy-only `Operation Moses is Completed`
- both conflicting Balfour Declaration ratification rows (`1922` and `1924`)

The remaining eight are selected reproducibly from structurally complete,
non-duplicate form rows:

- two event dates from each calendar quarter
- across the eight, at least two pre-1900, four 20th-century, and two
  21st-century records
- at least four approved topic groups and three geographic-region groups
- required title, body, source date, source region, and source topic
- no overlap with the twelve reserved rows
- within each stratum, choose the lowest stable import identifier

Import procedure:

1. Freeze a manifest containing the 20 source keys, source checksums, selection
   reason, and expected workflow status.
2. Convert the 20 raw rows to staging records without altering body text.
3. Review only the taxonomy entities needed by this manifest and create those
   references first.
4. Dry-run until the report shows 20 inputs, 20 deterministic outcomes, no
   unaccounted failures, and no unexpected updates.
5. Import all 20 into the development dataset as drafts. Duplicate and malformed
   cases receive review flags; they are not merged or corrected.
6. Compare every draft against the source row and checksum.
7. Conduct fact, citation, date, taxonomy, and rights review.
8. Publish none by default. Any later publication is an explicit per-entry
   editorial decision after all blocking checks pass.
