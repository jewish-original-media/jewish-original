# History Archive Audit

Audit dates: 2026-08-30–2026-08-31
Canonical source: `JOM On This Day Content.xlsx`
Canonical workbook SHA-256:
`f163dbda3fd82eb13ee82aab3be78f67750144dc934fd0af1affa8a84c0e837f`
Scope: extraction, source lineage, staging, duplicate analysis, first-20
selection, and pilot import verification. Twenty drafts were imported; no
record was published.

## Executive finding

The canonical XLSX was read successfully without modification. It contains ten
visible worksheets, 208 original Form submissions, 124 legacy Import records,
two unmaterialized 207-row pivot views, and several transformed or calculated
legacy views.

The production migration has two canonical record families:

1. `Form`, containing the original 208 submitted articles.
2. `Import`, containing 124 legacy CMS records.

The other worksheets are instructions, pivots, calculations, HTML
transformations, sorted copies, or indexes. They are reconciliation evidence,
not additive article sources.

Across the two canonical families there are 332 source records. Conservative
duplicate analysis produced 31 unresolved clusters containing 65 records. If
each cluster eventually resolves to one article, the archive would contain 298
candidate record groups. This is a planning count, not an editorial merge
decision or a final unique-article claim.

## Source authority

Evidence now ranks as follows:

1. The XLSX workbook is the canonical migration source.
2. The Apple Numbers file is an archival predecessor and may be consulted only
   if a workbook-level discrepancy later requires it.
3. The PDF remains visual comparison evidence.
4. The previously delivered per-sheet CSV files are derived exports and do not
   override workbook cells.

The XLSX supersedes PDF and CSV assumptions wherever it provides stronger cell
evidence.

## Safe extraction method

The original workbook remains outside Git at:

`/Users/andy.katz/Desktop/JOM On This Day Content.xlsx`

It was opened read-only at the process level by local Python tooling. No Office,
Numbers, conversion SaaS, or paid service was required.

The reproducible extractor is:

`scripts/history/audit-xlsx.py`

Its pinned local dependencies are:

`scripts/history/requirements.txt`

Reproduction:

```shell
python3 -m venv .analysis-venv
.analysis-venv/bin/pip install -r scripts/history/requirements.txt
.analysis-venv/bin/python scripts/history/audit-xlsx.py \
  --source "/Users/andy.katz/Desktop/JOM On This Day Content.xlsx" \
  --output artifacts/history-workbook \
  --manifest-doc docs/HISTORY_FIRST_20_MANIFEST.md
```

The extractor loads the workbook twice with `openpyxl` 3.1.5:

- formula mode preserves formula expressions;
- data-only mode preserves cached formula results.

It also reads the XLSX ZIP/XML metadata directly to inventory pivot definitions
and locations that are not materialized as worksheet cells.

All 1,683 formula cells have cached results. Formula expressions and cached
results are kept separately in restricted raw staging.

## Workbook inventory

All ten worksheets are visible. The workbook contains no hidden sheets, hidden
rows, or hidden columns.

### `Cover Page`

- Classification: instructions
- Declared range: `A1:H12`
- Actual populated extent: 12 rows, 4 columns, 10 nonempty cells
- Formula cells: 0
- History records: 0
- Content: explains that a Google Form feeds `Form` and that `Content` is a
  pivot-based sorting view

### `Form`

- Classification: canonical source
- Declared range: `A1:M431`
- Actual source submissions: 208, in workbook rows 2–209
- Columns used: 13, with column A blank and headers in B–M
- Headers: `Timestamp`, `Email Address`, `Content Name`, `Post Body`,
  `Region Tag`, `Main Image`, `Topic`, `Date of event`, `Month`, `Day`,
  `Year`, `Century`
- Formula cells: 1,135 across 405 formula-bearing rows
- Cached formula results: 1,135
- Original non-formula submission rows: 208
- `Main Image`: blank in all 208 submissions

Rows below the 208 submissions contain copied formula ranges and cached results;
they are not additional submissions.

`Timestamp` and `Email Address` remain restricted contributor metadata. Email
does not enter candidate staging, the manifest, Git, or Sanity.

### `Content`

- Classification: derived pivot
- Declared worksheet range: `A1:J1000`
- Excel table: `Table_1`, range `B1:J1000`
- Pivot definition: `Content`
- Pivot output location: `B1:J208`
- Represented data rows: 207
- Materialized worksheet cells: 0
- Pivot cache: invalid, marked to refresh on load, with no embedded records part

This verifies the PDF audit's 207 represented rows, but the pivot values cannot
be recovered directly from this XLSX. The 208-row `Form` source remains intact,
so this does not remove an original submission from migration.

### `Import Content`

- Classification: second derived pivot
- Declared worksheet range: `A1:K1000`
- Excel table: `Table_2`, range `B1:J1000`
- Pivot definition: `Import Content`
- Pivot output location: `B1:J208`
- Represented data rows: 207
- Materialized worksheet cells: 0
- Pivot cache: the same invalid external cache used by `Content`

This is a duplicate derived view, not a second source table.

### `Import`

- Classification: canonical legacy CMS source
- Declared range: `A1:Z999`
- Actual populated extent: 125 rows, 19 columns
- Legacy records: 124, in rows 2–125
- Formula cells: 0
- Headers: `Name`, `Month (Select)`, `Year (Ref. Field)`, `Century`, `Slug`,
  `Collection ID`, `Item ID`, `Created On`, `Updated On`, `Published On`,
  `Post Body`, `Post Summary`, `Region Tag and Image`, `Main Image`, `Topic`,
  `Resources`, `Day (Select)`, and `Imported?`; column R is blank
- Populated bodies: 96
- Blank bodies: 28
- Populated topics: 116
- Blank topics: 8
- Populated date components: 122
- Records without fixed date components: 2
- Populated item IDs and lifecycle timestamps: 0
- Slugs: 124 rows, 123 unique values

All records share one legacy collection ID. The `Item ID`, `Created On`,
`Updated On`, and `Published On` columns are blank throughout, so the workbook
does not provide a stable legacy row ID.

### `Sheet1`

- Classification: transformed legacy view
- Declared range: `A1:J992`
- Actual populated extent: 125 rows, 10 columns
- Non-formula rows: 124
- Formula cells: 124, all with cached results
- Relationship: plain projection of `Import` with a computed century column

This is not an additive source.

### `Sheet2`

- Classification: derived calculation
- Declared and populated extent: 151 rows, 2 columns
- Headers: `Full Date`, `Years since`
- Formula cells: 300, all with cached results
- Original records: 0

Rows calculate dates and elapsed years from `Sheet1`. They have no independent
editorial authority.

### `Import2`

- Classification: transformed legacy view
- Declared range: `A1:J992`
- Actual populated extent: 125 rows, 10 columns
- Non-formula rows: 124
- Formula cells: 124, all with cached results
- Relationship: converts the plain legacy body into generated HTML

This transformation must not replace the original plain source body.

### `Import 3`

- Classification: transformed and sorted legacy copy
- Declared range: `A1:Z1000`
- Actual populated extent: 125 rows, 9 columns
- Materialized rows: 124
- Formula cells: 0
- Relationship: materialized HTML/sorted copy of legacy records

For legacy records with blank source bodies, this sheet contains only empty
markup such as `<p></p>`; it does not recover missing prose.

### `Sheet4`

- Classification: derived title/slug index
- Populated extent: 124 rows, 2 columns
- Data rows: 123
- Headers: `Title`, `Slug`
- Relationship: index of the 123 unique legacy slug values

This view collapses the duplicated `second-zionist-congress` slug and is not an
article source.

## Source lineage

- Google Form → `Form`: original submissions
- `Form` → `Content`: derived 207-row pivot
- `Form` → `Import Content`: second pivot using the same cache
- `Import` → `Sheet1`: plain legacy projection
- `Sheet1` → `Sheet2`: date and elapsed-time calculations
- `Import` → `Import2`: generated HTML transformation
- `Import2` → `Import 3`: materialized and sorted HTML copy
- `Import` → `Sheet4`: unique title/slug index
- `Form` + `Import` → migration candidates: two canonical source families,
  reconciled through reviewable overlap clusters

No row from a derived view is counted as a new article merely because it appears
on another sheet.

## Deterministic staging

The extractor produces two separate staging layers under ignored `artifacts/`:

- `restricted/raw-records.jsonl`: original cell payloads, formulas, cached
  results, row coordinates, timestamps, and contributor metadata
- `candidates.jsonl`: migration candidates with contributor email removed

Each source record receives a generated ID:

`jom-history:xlsx-<checksum-prefix>:<sheet>:row-<zero-padded-row>`

Example:

`jom-history:xlsx-f163dbda3fd82eb1:Form:row-0007`

The full workbook checksum is stored with the staging run. The ID is stable
whenever the same unchanged workbook is processed again and is explicitly
labeled `generatedWorkbookCoordinate`.

Raw and candidate record checksums are calculated independently. No source
title, body, date, URL, slug, or cell value is rewritten by staging.

## Reconciled data-quality findings

Canonical XLSX evidence corrects several provisional PDF/CSV findings:

- All 208 Form submissions contain title, body, region, topic, and event-date
  values. The PDF's apparent missing Form dates were extraction artifacts.
- `Buchenwald Concentration Camp Begins Operations` contains a complete source
  date and body.
- `Eli Cohen is executed by Syrian authorities` contains a complete source date
  and body.
- The `JanMay` and `FebFeb` month values seen in the flattened CSV are not
  present in the XLSX; the workbook has valid month values for those rows.
- The PDF's blank pages and formula-error pages are print-layout artifacts, not
  separate workbook sheets. The XLSX has no cell error values.

Verified source issues that remain:

- `Będzin Ghetto Uprising` contains unrelated content within its source body and
  is flagged `MERGED_UNRELATED_BODY`.
- 28 legacy records have blank source bodies. The transformed sheets contain
  only empty HTML for those rows.
- 8 legacy records have blank topics.
- `Yom HaZikaron` and `Yom Ha'atzmaut` have no fixed Gregorian date components;
  they require recurring-observance modeling rather than invented dates.
- 2 legacy rows have source century values that conflict with conventional
  ordinal-century calculation.
- The two `Second Zionist Congress` legacy rows share a title/slug but have
  different event dates.
- Legacy item IDs, lifecycle timestamps, resources, image references, and image
  rights data are absent.
- All 208 Form image cells and all legacy image fields are blank.

## Duplicate and overlap analysis

The deterministic candidate detector compares normalized title, source date,
title-token similarity, body similarity, and legacy slug where available. It
creates evidence clusters only; it never merges records.

Verified output:

- 332 source records
- 31 duplicate/overlap clusters
- 65 clustered records
- 298 candidate groups before editorial resolution
- 1 exact-duplicate pair
- 24 likely-duplicate pair relationships
- 7 alternate-version pair relationships
- 5 conflicting-version pair relationships

Representative clusters:

- Romanian yellow-star Form rows 7 and 10: same date, 100% title-token
  similarity, and 99.8% body similarity
- Arik Einstein: two exact Form duplicates plus a longer/different legacy
  version
- Abba Kovner: same title/date, materially different bodies
- Hitler/Sudetenland: same title/date, materially different bodies
- Gilad Shalit: same title/date and 95.4% body similarity
- Menachem Begin death: Form and legacy versions with the same title/date but
  materially different bodies
- Balfour ratification: 1922 Form and legacy versions plus a 1924 Form version
  whose body is 99.3% similar
- Eichmann sentencing: highly similar titles with conflicting 1961 and 1962
  dates
- Yisrael Galili: matching subject with one-day date conflict
- Second Zionist Congress: duplicate legacy slug with 1897 and 1898 dates

Full evidence is retained locally in:

`artifacts/history-workbook/duplicate-clusters.json`

Every cluster remains pending human editorial review.

## Content at risk

The following material cannot be recovered from another workbook table:

- prose for the 28 body-empty legacy records;
- original legacy item IDs and CMS lifecycle timestamps;
- structured citation ledgers;
- original image files, image IDs, credits, and rights evidence.

The two unmaterialized pivots cannot be refreshed from their missing external
cache, but their underlying 208 Form submissions are preserved. No original
Form prose is currently known to be lost.

URLs embedded in article bodies remain preserved as source text and citation
candidates. They are not silently removed or treated as verified citations.

## Canonical migration strategy

1. Freeze the XLSX checksum and retain the file untouched outside Git.
2. Treat only `Form` and `Import` as canonical record families.
3. Preserve restricted Form contributor metadata only in ignored raw staging.
4. Preserve every source title, body, date value, URL, slug, collection ID,
   formula, cached result, sheet, and row coordinate.
5. Generate checksum/sheet/row identifiers where no true source ID exists.
6. Stage normalized candidates separately without rewriting source prose.
7. Attach duplicate and anomaly evidence as review flags.
8. Create no automatic merges or factual corrections.
9. Import only a founder-approved manifest as Sanity drafts.
10. Publish nothing during migration.

## First-20 status

The canonical workbook resolved the previous source gate. The approved
manifest is in:

`docs/HISTORY_FIRST_20_MANIFEST.md`

The selection includes verified clean records, exact and near duplicates,
alternate versions, a conflicting-date cluster, a Form/legacy overlap, a merged
body, a blank body, a recurring observance, multiple source families, multiple
eras, calendar quarters, source topics, and geographies.

The founder approved the manifest on 2026-08-31. The importer created 20
deterministic Sanity drafts: 8 with `imported` status, 9
`duplicateCandidate`, and 3 `needsReview`. Every draft reconciled its generated
source ID, raw-record checksum, source-body checksum, exact staged source body,
workflow status, and review flags.

Duplicate-cluster IDs and member source IDs are retained in collapsed import
provenance and in blocking review evidence. No semantic `relatedHistory`
relationship was created because duplicate similarity is not editorial
related-content curation.

The first post-write verifier incorrectly compared Sanity's `null` projection
for the intentionally absent body against staging's `undefined`. The stored
blank-body record was correct. Normalizing that representation fixed the
verifier; the required second apply run then reported 20 skips, 0 creates, 0
updates, 0 published records, 0 probable email values, and 0 verification
failures.
