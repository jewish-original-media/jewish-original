# History Archive Audit

Audit date: 2026-08-30  
Source: `JOM On This Day Content.pdf`  
Scope: schema and migration planning only; no content was imported or published.

## Executive finding

The 438-page PDF is a print export of a workbook, not one canonical table. It
contains multiple representations of overlapping records. It is useful for
designing the model and locating risks, but it must not be the production import
source. Before migration, obtain the original Google Sheet, XLSX, or per-tab CSV
exports so cell boundaries, formulas, IDs, URLs, and blank values remain intact.

The audit combined full-document text extraction, field-position analysis,
duplicate comparison, and visual inspection of representative pages. Counts are
therefore strong planning evidence but remain provisional until reconciled with
the original tabular source.

## Workbook structure

- 1 instruction page describing a Google Form feeding a `Form` sheet and a
  pivot-based `Content` sheet
- 19 `Form` pages containing 208 submissions
- 152 `Content` pivot pages containing 207 represented rows
- 21 legacy CMS-export pages
- 9 blank print-range pages
- 56 legacy plain-content pages
- 5 formula-error pages containing `#VALUE!` and `#NUM!`
- 96 legacy HTML-content pages
- 74 additional sorted or filtered legacy views
- 4 title/slug index pages
- 1 responder-update footnote page

These sections are not additive datasets. The pivot, plain, HTML, sorted, and
slug views repeat substantial portions of the form and legacy CMS records.

## Source fields and disposition

### Form submissions

- `Timestamp` → retain as `sourceSubmittedAt` in restricted provenance; it is
  not a historical date or public editorial field.
- `Email Address` → do not copy into the production CMS. It is contributor PII
  and must remain only in the access-controlled raw archive.
- `Content Name` → rename to `title`.
- `Post Body` → stage verbatim as `sourceBody`; convert formatting
  deterministically into Portable Text without rewriting the prose.
- `Region Tag` → map through an editor-approved crosswalk to referenced
  `geographicRegion` documents.
- `Main Image` → do not carry forward as-is. The field is blank in all 208 form
  submissions examined. Use a rights-aware production media object.
- `Topic` → map through an editor-approved crosswalk to referenced `topic`
  documents.
- `Date of event` → preserve as the original date string and parse into the
  structured historical-date object only when structurally valid.
- `Month`, `Day`, `Year`, `Century` → do not retain as independent authorable
  fields. They are incomplete and redundant; derive browse and display values
  from the reviewed historical date.

### Content pivot

The pivot exposes `Date of event`, `Content Name`, `Post Body`, `Topic`,
`Region Tag`, `Day`, `Month`, and `Year`. It is a derived sorting view, not a
second source of truth. The one-row difference from the form sheet is itself a
reconciliation flag.

### Legacy CMS export

Observed fields include `Name`, `Month (Select)`, `Year (Ref. Field)`,
`Century`, `Slug`, `Collection ID`, `Item ID`, `Created On`, `Updated On`,
`Published On`, `Post Body`, `Post Summary`, `Region Tag and Image`,
`Main Image`, `Topic`, `Resources`, `Day (Select)`, and `Imported?`.

- `Name`, `Post Body`, `Post Summary`, `Slug`, and historical date parts become
  candidates for the corresponding production fields.
- `Resources` must be parsed into citation candidates, never treated as one
  trusted free-text citation.
- Legacy collection/item IDs, slug, and lifecycle timestamps belong in
  provenance.
- `Imported?` and legacy collection IDs must not become editorial taxonomy.
- `Created On`, `Updated On`, and `Published On` describe the legacy system,
  not the new Sanity document lifecycle.
- The export yielded 124 slug rows, 123 unique slugs, and a duplicate
  `second-zionist-congress` slug.

### Repeated legacy sheets

The plain, HTML, sorted, and slug-index sections are alternate transformations
of the legacy CMS material. HTML bodies contain raw image URLs, source URLs,
line-break tags, editorial instructions, and malformed markup. They should be
used only to reconcile missing values against the canonical legacy export.

## Data-quality findings

### Missing and malformed structure

- All 208 form `Main Image` cells are blank.
- 4 form event dates are absent from the date column. Three date strings appear
  appended to the body instead: `3/16/1942`, `7/15/1937`, and `11/9/1938`.
- The separate month, day, and year fields are missing in 26 form submissions;
  century is missing in 48.
- At least one row, `Eli Cohen is executed by Syrian authorities`, has no body
  or event date in the extracted form record and overlaps another Eli Cohen
  entry.
- Two records have no region, and `Tel Aviv is Founded` has no topic in the
  form view.
- `Będzin Ghetto Uprising` contains unrelated Regina Jonas and Romanian yellow
  star material inside the same body, indicating merged or shifted source cells.
- Footnote markers such as `[1]`–`[7]` leak into date, region, or topic values.
- Legacy sections contain malformed HTML, bare URLs, image-search URLs,
  hot-linked third-party images, and instructions such as “Insert this video.”
- Formula-only pages contain `#VALUE!` and `#NUM!` and have no production value.

### Duplicate and near-duplicate candidates

Four exact title/date groups occur more than once:

- `Abba Kovner is Born` — 2 records; bodies are materially different
- `Hitler Discusses Takeover of Sudetenland` — 2 records; bodies are materially
  different
- `Arik Einstein is Born` — 2 records; bodies are highly similar
- `Gilad Shalit is Taken Hostage by Hamas` — 2 records; bodies are highly
  similar

Additional review clusters include:

- `Romanian Jews were Forced to Wear the Yellow Stars` and `Romanian Jews
Forced to Wear Yellow Stars` on `8/8/1941`
- `Adolph Eichmann is Sentenced to Death.` on `5/31/1962` and `Adolf Eichmann
is Sentenced to Death` on `12/15/1961`; the dates may represent execution and
  sentencing, but the titles do not distinguish them
- Balfour Declaration ratification entries dated `7/24/1922` and `7/24/1924`
- multiple Eli Cohen execution records across the form and legacy collections
- at least 15 strong title-to-slug overlaps between the form and legacy CMS

String similarity alone is not a duplicate decision. For example, Minsk and
Vilna ghetto titles score as textually similar but describe different events.

### Taxonomy inconsistency

The form sheet contains 12 observed region labels and 24 topic labels, but the
lists mix different concepts:

- `USA` and `North America` overlap in granularity.
- `British` and `French` are national/cultural adjectives used as regions.
- `Israel` appears as both a region and a topic.
- `Middle East`, `MENA`, `North Africa`, `Africa`, and `Iberia` mix nested
  geographies without hierarchy.
- `Resistance` and `Jewish Resistance` overlap.
- `Jews in politics` and `Jews in Politics` differ only by capitalization.
- `Wars`, `WWII`, and event-specific subjects mix broad and narrow levels.
- footnoted labels such as `French [3]` and `European Jews [4]` are polluted
  values.

The imported strings must remain visible in provenance while approved
references are assigned separately.

### Date and chronology risks

- The archive assumes slash dates without recording whether they are Gregorian,
  Julian, converted, approximate, or only month/day commemorations.
- Year `1900` is labeled `20th Century` in at least one record even though the
  conventional ordinal century is the 19th; this must be reviewed rather than
  silently changed.
- The Balfour entries conflict by two years.
- Hebrew dates, BCE dates, ranges, uncertain dates, and recurring observances
  are not represented safely.
- Separate date components drift from the full event date and should not remain
  independently editable.

### Sources, images, and rights

The form schema has no citation field. Legacy `Resources` values and URLs mixed
into body HTML are not structured citations. Image records generally lack
creator, rights holder, license, required credit, allowed use, and source-page
context. Hot-linked URLs are unstable and do not establish permission.

No archive image may be published until the asset is obtained lawfully and its
rights record is cleared. Missing imagery should not block importing a text
draft, but it must block image publication.

## Canonical-source requirement

Before the first import, request:

1. An XLSX export of the complete workbook with every tab and formula result.
2. A UTF-8 CSV export of each non-empty tab.
3. The original legacy CMS CSV export, if available.
4. An image folder or asset manifest keyed to legacy item ID.
5. Any citation/source ledger and image-rights ledger maintained separately.

The files should be checksummed and retained read-only outside the public Git
repository. The PDF remains a comparison artifact, not the row parser input.
