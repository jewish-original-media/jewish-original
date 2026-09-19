# History V1 Completion Ledger

Status: in progress. This is the cumulative V1 ledger for the full On This Day
archive. A smaller published selection plus an unreviewed draft backlog does
**not** satisfy V1.

Canonical workbook: `JOM On This Day Content.xlsx`  
SHA-256: `f163dbda3fd82eb13ee82aab3be78f67750144dc934fd0af1affa8a84c0e837f`

Machine-readable companion: `docs/history/v1-completion-ledger.json`  
Documented cluster resolutions: `docs/history/v1-duplicate-resolutions.json`

Integration coordinates public History discovery from this report. It does
not publish drafts. Current live public History remains **9**. The V1 launch
archive is the **298 unique usable stories** after editorial review.

No Production, DNS, or default-branch changes are made from this ledger.

## Founder scope

V1 requires every unique, usable workbook story, edited and prepared for the
existing publication-approval process. The 20-candidate batch is the first
working batch, not the final scope.

Usable does not mean already polished. Research, editing, taxonomy, calendar confirmation, and duplicate resolution are raequired work, not exclusion grounds. Facts are not invented. Unsupported material is not forced to `ready`.

## Workbook review

All ten tabs were reviewed. `Form` (208) and `Import` (124) remain the only
canonical record families. The other eight tabs are pivots, HTML transforms,
sorted copies, or calculated views. They contain recoverable date/century
evidence and no unique additive articles.

Recoverable alternate-sheet evidence retained on the canonical rows:

- Yoel Palgi date/century conflict
- Egypt embassy date/century conflict
- Mordechai Bentov date/century conflict
- Ahad Ha'am date/century conflict
- Eichmann sentenced day conflict (Import 2 / Import 3 day 15 vs Import day 12;
Form 118 already holds the 15 December 1961 sentence as a unique story)



## Current V1 counts

These counts are source-row dispositions after documented cluster resolution.
They are not a claim that editorial prose is finished.


| Bucket                                            | Count | Meaning                                                           |
| ------------------------------------------------- | ----- | ----------------------------------------------------------------- |
| Unique stories published                          | 9     | Live published History. Unchanged.                                |
| Unique stories ready for publication              | 13    | Batch-20 drafts marked `ready`, unpublished.                      |
| Unique stories with a canonical selection, queued | 35    | Resolved cluster/editorial-pair canons now in `needsReview`.      |
| Unique stories still unreviewed                   | 203   | Next editorial batches.                                           |
| Unique stories in fact-check                      | 8     | Recoverable holds that still need a supported public text.        |
| Unique stories needing research                   | 28    | Import rows with blank bodies. Still in scope.                    |
| Unique recurring or undated                       | 2     | Yom HaZikaron and Yom Ha'atzmaut. Unique, no invented civil date. |
| Duplicate source rows linked to a canonical story | 34    | Archived drafts, provenance intact, `relatedHistory.sameStory`.   |


These 332 source-row dispositions produce **298 unique stories**. Exact
generated numbers live in `docs/history/v1-completion-ledger.json`. The
row-level ledger there must continue to sum to **332**.

## Duplicate resolution

31 detector clusters (65 rows) plus two missed editorial pairs (Judenstaat;
Vietnam boat people) are resolved in
`docs/history/v1-duplicate-resolutions.json`.

Policy:

- Prefer `Form` over `Import` when the event and date match.
- Prefer the earlier Form row when bodies are exact duplicates.
- When dates conflict, select the historically supported date and keep the
other row as a linked variant.
- Do not merge documents or rewrite immutable provenance.
- After human resolution, link non-canonical rows with editorial
`relatedHistory` `sameStory`.

Splits (two unique stories, not one):

- **Eichmann.** Form 118 is the 15 December 1961 sentence. Form 71 is the
31 May 1962 hanging and must be retitled.
- **Zionist Congress.** Import 101 is the First Congress, 29 August 1897, and
must be retitled. Import 102 is the Second Congress, 28 August 1898.

Escalated selections with a concrete recommendation:

- **Galili death date.** Canonical: Import 10, 8 February 1986 (Library of
Congress). Linked: Form 165, 9 February 1986, matching JTA’s 10 February
“died yesterday.”
- **Mandate / Balfour ratification.** Canonical: Form 141, 24 July 1922
(“Done at London”). Linked: Form 208 1924 error and Import 77 shorter copy.
- **Vietnam boat people.** Canonical: Import 63, 10 June 1977 *Yuvali* rescue
of 66. Linked: Form 201, which applied that date to the later 366
cumulative total.



## Batch-20 holds still in scope

These are not exclusions. The next editorial pass should finish the supported
public text rather than leaving them as a permanent backlog.


| Story                         | Recommendation                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Peru Inquisition, Form 151    | Prepare as the 25 January 1569 El Pardo cédula, Julian calendar. Do not use 7 February.                           |
| Shearith Israel, Form 152     | Prepare 8 April 1730 as Julian New York. Separate the 1654 arrival from the 1730 consecration.                    |
| Henryk Ross, Form 60          | Prepare birth as Warsaw, 1910, year precision. Do not invent 1 May.                                               |
| Tosia Altman, Form 16         | Prepare 24 August 1919 with the 1918 variant in notes.                                                            |
| Luxembourg Agreement, Form 88 | Prepare signing as 10 September 1952 (UNTS 2137). Drop the Begin assassination claim.                             |
| Shanghai, Form 107            | Prepare as the post-Kristallnacht flight, not a single 10 November 1938 landing. Form 36 remains the 1943 ghetto. |
| Florence Prag Kahn, Form 128  | Keep in fact-check until the seating date is individually confirmed.                                              |
| Będzin, Form 4                | Split or rewrite the merged unrelated body before `ready`.                                                        |




## Proposed exclusions

These are the only proposed exclusions. They are not unique stories being
dropped from V1.

1. **Derived workbook tabs** (`Content`, `Import Content`, `Sheet1`–`Sheet4`,
  `Import2`, `Import 3`): no unique additive articles.
2. **Invented civil dates** for Yom HaZikaron and Yom Ha'atzmaut: the
  observances remain unique stories; a fabricated Gregorian On This Day date
   is excluded.

No unique Form or Import story is proposed for exclusion merely because it
needs research, editing, taxonomy, or duplicate resolution.

## Unresolved blockers

Specific blockers, not a vague backlog:

- 28 Import rows have no source body and need research before a public text
can be written without invention.
- Yom HaZikaron and Yom Ha'atzmaut have no fixed source Gregorian date.
- Florence Prag Kahn’s seating date remains unconfirmed.
- Form 4 Będzin contains a merged unrelated body.
- 299 rows still carry at least one ambiguous taxonomy token. Approved exact
mappings may be applied; founder-review tokens may not be invented.
- All unpublished drafts except the 13 `ready` batch-20 entries still have
`calendarSystem: other` until individually confirmed.
- The 35 newly selected canonical cluster stories still need title, excerpt,
body, citations, taxonomy, places, slug, SEO, and Gregorian confirmation.



## Next manageable batch

Continue with unique unreviewed Form rows first, then remaining Import-only
stories, then blank-body research, then the recoverable holds. The generated
next-20 list is in `docs/history/v1-completion-ledger.json` under
`nextUniqueQueue`.

Canonical cluster stories may be prepared in the same batches. They are unique
stories, not a leftover duplicate pile.

## Publication rule

Ready drafts wait for the existing publication-approval process. This ledger
does not publish. It does not change Production, DNS, application code, or
git branches.