# History Archive QA and Publication Queue

Status: non-production research handoff for the History workstream.
Generated: 2026-09-04 from committed History checkpoint `39d5859`
(`milestone-1-sanity-history`). Isolated branch: `research/history-qa`.

No Sanity writes. No source-text rewrites. No schema, UI, or import-manifest
changes. No publish, merge, or deploy.

Canonical workbook SHA-256:
`f163dbda3fd82eb13ee82aab3be78f67750144dc934fd0af1affa8a84c0e837f`

Counts below come from the existing deterministic audit outputs in
`artifacts/history-workbook/` plus a read-only structural classifier. They are
not guesses.

---

## 1. Archive universe / counts

Canonical source families remain **Form (208)** + **Import (124)** =
**332 source records**. Official unresolved clusters remain **31 / 65
records**, so the planning unique-article ceiling is still **298 groups**
if every official cluster later collapses to one article. That is not an
editorial merge decision.

| Bucket | Count | Evidence |
| --- | ---: | --- |
| A. Already published | **1** | `US Liberates Dachau` (`Form` row 2). Confirmed by `docs/HISTORY_ARCHIVE.md`, `docs/HISTORY_WESTERWEEL_SECOND_ARTICLE.md`, and `artifacts/history-batch-1/drafts.json`. |
| B. Existing Sanity drafts | **19** remaining first-20 drafts if only Dachau is published | First-20 imported 2026-08-31. No project artifact shows later archive imports. This workstream did not run a live full Sanity census. |
| C. Known official duplicate candidates | **65 records / 31 clusters** | `duplicate-clusters.json` |
| C2. Additional QA overlap not in the official 31 | **65 more records / 34 supplemental clusters** | Date-normalized and birth-title matching. See §5. |
| D. Not-yet-imported archive candidates | **312** | 332 − 20 first-20 source IDs |
| E. Missing / blank body | **28** | All `Import`. Zero Form blanks. |
| F. Known malformed / contaminated | **2 primary** plus the 28 blanks | `Będzin Ghetto Uprising` (`MERGED_UNRELATED_BODY`); `PM Ehud Barak Resigns` (1949 date field on a 2000 event). |
| G. Recurring observances (primary tier) | **2** | `Yom HaZikaron`, `Yom Ha'atzmaut` (no fixed Gregorian date). `Yom Yerushalayim` is blank-bodied and therefore Tier E, with a recurring flag. |
| H. Legacy Import records | **124** | **84** carry an elevated `LEGACY_RISK` flag |

History already owns, and this queue does **not** re-assign:

- Published: Dachau
- Ready unpublished: Joop Westerweel
- Next reviews named by History: Bialystok, Willenberg, Tripoli
- Deferred: Isaac Rulf
- Also already imported: Herzl birthday, Rehavam Ze'evi, and the reserved
  first-20 problem set

Remaining structurally usable A/B records **not** owned by History: **156**
(87 A, 69 B). Of those, **100** still carry Holocaust/WWII source topics.
The archive can support diversity, but only if the next imports are chosen
rather than taken in workbook order.

Era of the full 332, from normalized dates:

| Era | Records |
| --- | ---: |
| Ancient (before 500) | 0 |
| Medieval (500–1499) | 3 |
| Early modern (1500–1799) | 9 |
| Nineteenth | 30 |
| 1900–1939 | 90 |
| 1940–1945 | 71 |
| 1946–1999 | 98 |
| 2000+ | 29 |
| Undated | 2 |

There is **no ancient stratum** in the canonical archive. Do not invent one.

---

## 2. Readiness-tier definitions

One primary tier per record.

**TIER A — FAST REVIEW.** Parseable date, usable body, no official or
supplemental cluster, no malformed URL/rights contamination, no date-field
conflict. May still need ordinary copy-edit.

**TIER B — LIGHT CORRECTION.** Publishable event, but slash-date conversion,
legacy topic/region blanks, embedded URLs, moderate length, or ordinary
factual tightening.

**TIER C — DEEP REVIEW.** Date-field vs body conflict, liberated-ghetto
conceptual problems, title-level casualty assertions, or combined
statistical + sweeping-claim signals.

**TIER D — DUPLICATE / CONFLICT CLUSTER.** Official `dup-*` cluster and/or
a supplemental `qa-*` overlap. Do not enter the publication queue as an
independent article except to resolve the cluster.

**TIER E — HOLD / UNSUITABLE.** Blank body, merged unrelated body, stub
legacy debris, or an impossible/contaminated identity (Barak 1949).

**RECURRING.** Holiday/observance rows with no honest fixed Gregorian date.
They belong in the recurring-observance model, not On This Day publication.

Tiers are structural readiness, not fact-check grades. A Tier A Holocaust
article can still be wrong. A Tier B medieval article can still be the
better next publish.

---

## 3. Tier counts

| Primary tier | Records |
| --- | ---: |
| A Fast review | 89 |
| B Light correction | 72 |
| C Deep review | 6 |
| D Duplicate / conflict | 130 |
| E Hold / unsuitable | 33 |
| Recurring | 2 |
| **Total** | **332** |

Tier D is large on purpose. The official detector already held 65 records.
Normalizing the 25 slash-format Form dates and matching “is Born” /
“Birthday” titles added **34 supplemental clusters** and **65 additional**
clustered records. Many important Zionist and biographical events were
hiding as independent rows.

The 6 unclustered Tier C rows are the ones that need founder attention
without already sitting in a duplicate cluster: Budapest/Łódź “liberated
ghetto,” Seville 4,000, Sadat date-field conflict, UN 242 contamination,
and Hatikvah February/December conflict.

---

## 4. Structural-risk summary

Flags are additive. A record may carry several.

| Signal | Records |
| ---: | --- |
| Legacy Import source | 124 |
| Elevated legacy risk | 84 |
| Blank region | 124 |
| Extreme length (>4,000 characters) | 55 |
| Embedded URLs | 55 |
| Wikipedia / Wikimedia URL | 30 |
| Slash-format date (valid, not ISO) | 25 |
| Commercial or search-image host | 21 |
| Image URL inside prose | 21 |
| Title repeated at start of body | 9 |
| Topic missing | 8 |
| Date-field vs body lead-date conflict | 4 |
| Century conflict | 2 |
| Date missing | 2 |
| Duplicate legacy slug | 2 |
| Liberated-ghetto concept | 2 |
| Merged unrelated body | 1 |
| Email in body | 0 |

Important date finding: **25 Form dates are `M/D/YYYY` strings**, not ISO.
They are valid and parseable. The official duplicate detector compared
date strings exactly, so `5/2/1860` did not match `1860-05-02`. That is
the main reason Herzl’s birthday, Judenstaat, and several other
Form/Import pairs were missed.

No candidate body in sanitized staging contains an email address.

---

## 5. Duplicate / conflict summary

### Official clusters (do not re-open the detector)

31 clusters, 65 records, still `editorialDecision: pending`.

| Cluster | Members | Likely | Action |
| --- | --- | --- | --- |
| `dup-488e1e4e2b` | Romanian yellow star, Form 7 / 10 | Near-exact (99.8% body) | Keep one; already in first-20 |
| `dup-972d4ac96f` | Arik Einstein Form 133 / 134 + Import 5 | Exact Form pair + longer legacy | Keep one Form; founder compare legacy |
| `dup-cf922f6e3a` | Abba Kovner Form 42 / 180 | Alternate wording | Founder compare; add Import 26 (below) |
| `dup-8acada16ae` | Hitler / Sudetenland Form 99 / 100 | Alternate wording | Founder compare |
| `dup-707cd232de` | Gilad Shalit Form 140 / 204 | Likely duplicate (95.4%) | Keep one; add Import 69 (below) |
| `dup-29e8449556` | Menachem Begin death Form 176 / Import 22 | Alternate; Import is 18,940 characters with Google image URLs | Prefer Form; do not publish Import as-is |
| `dup-08e52b7d68` | Balfour 1922 Form 141 + 1924 Form 208 + Import 77 | Conflicting dates, near-identical 1922/1924 Form bodies | Founder compare; 24 July 1922 is the League ratification |
| `dup-0240e094e8` | Eichmann “sentenced” Form 71 (1962-05-31) / Form 118 (1961-12-15) | Conflicting event identity (sentence vs hanging) | Founder compare; add Import 122 (below) |
| `dup-15eec9d10c` | Yisrael Galili Form 165 (1986-02-09) / Import 10 (1986-02-08) | One-day conflict | Founder compare |
| `dup-3245a38cfc` | Second Zionist Congress Import 101 (1897-08-29) / 102 (1898-08-28) | Same slug, conflicting years | Founder compare; 1898 is the Second Congress |
| `dup-c94821606a` | Operation Moses Form 136 / Import 3 | Likely duplicate | Keep one |
| Other official pairs | Begin-era Zionist overlaps (Jewish Agency, Palmach, Law of Return, Tel Aviv founding, Deir Yassin, Egypt treaty, Golda, Jabotinsky/Jewish Legion, etc.) | Mix of likely / alternate | Keep one or merge later; never queue both |

Deir Yassin remains a sensitive alternate-version cluster. It should not
enter a public queue independently.

### Supplemental QA clusters (new in this workstream)

These are evidence, not a second official merge. The official detector
should later normalize dates and birth-title variants. Representative
additions:

| QA cluster | Why it was missed | Action |
| --- | --- | --- |
| `qa-dachau-liberation` | Form 57 “American Troops Liberate Dachau” vs published Form 2 | **Do not publish Form 57** |
| `qa-herzl-birth` | `5/2/1860` vs `1860-05-02`; Theodor/Theodore | Import 42 already imported; do not also import Form 190 as a new article |
| `qa-judenstaat` | Same 1896-02-14 event | Compare, then proceed with Form 170 |
| `qa-herzl-death` | Same 1904-07-03 | Keep one |
| `qa-idf-founded` | “IDF Formed” vs “Israel Defense Forces is Established” | Prefer Form 196 |
| `qa-israel-independence` | 14 May vs 15 May | Founder compare; Form 192 conflates Nov 1947 partition with independence |
| `qa-isaac-rulf` | 1831 field vs 1834 body/Form; Ruff/Rulf | History already deferred Import 11 |
| `qa-eichmann-legacy` | Import 122 date field 12 Dec, body 15 Dec 1961 | Attach to official Eichmann cluster |
| `qa-shalit-legacy` | Import 69 “Captured” vs Form hostage pair | Attach to official Shalit cluster |
| `qa-kovner-legacy-birthday` | Import 26 omitted from official Kovner pair | Attach to official Kovner cluster |
| `qa-yamit` | 1979 vs 1982 | Founder compare |
| `qa-knesset-building` | 1966 vs 1969 | Founder compare |
| `qa-operation-tzur` | 11 vs 21 Mar 2021 | Founder compare |
| `qa-hebron-1834` | Same 1834 massacre, not 1929 | Founder compare; sensitive |
| Plus birth pairs | Kagan-Cohen, A.D. Gordon, Sharon, Hillel, Kraus, Sukenik, Kalischer (±1 day), Bentov (±1 day), Palgi (1918 vs 1919) | Keep one / founder compare |
| Plus same-day event pairs | Altalena, Golani, Irgun executions, Lod, Dolphinarium, Columbia/Ramon, Gaza disengagement, Egypt embassy, Bar-Ilan, El Al 426, Magen David Adom | Keep one; prefer the Form row when it is shorter and URL-clean |

False same-day overlaps that are **separate events**: Chełmno vs Riga
(1941-12-08), Dachau vs Ravensbrück (1945-04-29), Budapest vs Łódź ghetto
rows (1945-01-18/19). Max Bodenheimer birthday vs death, and Menachem
Begin birthday vs death, are complementary, not duplicates.

Vietnam 1977 vs 1979 boat-people rows were **not** auto-clustered. They
may be distinct rescues.

---

## 6. Legacy-record risk summary

Not all Import rows are unusable. Several Top-20 / culture candidates are
legacy (UN Partition, Jordan treaty, Israel Philharmonic).

Elevated `LEGACY_RISK` appears on **84 / 124** Import rows. Recurring
patterns that match the known list:

- 28 blank bodies, including high-value titles (Haganah, Operation Opera,
  Sbarro, Ahad Ha'am, 18th Zionist Congress)
- Google Images / Bing / Pinterest / Gstatic / Alamy hosts in **21**
  records; **do not use those URLs**
- Extreme length (Begin death 18,940; Jewish Legion 16,597; Golda 14,881)
- Topic slash-compound `Israeli/Zionism` on most rows; 8 truly blank topics
- All 124 legacy region tags blank
- Date-field contamination (UN 242, Barak, Hatikvah, Sadat)
- Century off-by-one on 1900 Bentov and 1856 Ahad Ha'am

Prefer the Form sibling when a supplemental cluster exists. Use a legacy
row only when it is the sole survivor and the body is structurally
usable.

---

## 7. Top 20 publication queue

These are the next import/review candidates **after** the current History
queue. Published Dachau is excluded. Official and obvious conflict rows
are excluded except **#5 Judenstaat**, which is included so History can
resolve the new cluster and then publish the Form version.

Slash dates below are shown as normalized ISO. The source value remains
the slash string.

| Rank | Title | Date | Source ID | Sheet | Tier | Value | Topics | Geography | Burden | Action |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Alhambra Decree Takes Effect | 1492-07-31 | `...Form:row-0161` | Form | B | HIGH | Inquisition; Sephardic expulsion | Spain | LOW | Fast-lane after current History queue |
| 2 | Disputation of Barcelona Begins | 1263-07-20 | `...Form:row-0157` | Form | B | HIGH | Rabbinic / medieval | Aragon / Iberia | MEDIUM | Standard review; keep Nachmanides identity tight |
| 3 | Jews in New Amsterdam Request Permission to Build a Cemetery | 1655-07-27 | `...Form:row-0160` | Form | B | HIGH | Community history | New Amsterdam | LOW | Keep distinct from 1654 arrival and 1730 consecration |
| 4 | Ezekiel Hart is Sworn in to the Canadian Parliament | 1808-01-29 | `...Form:row-0125` | Form | B | HIGH | Jews in politics | Lower Canada | MEDIUM | Review the oath / seating controversy carefully |
| 5 | Theodor Herzl Publishes Der Judenstaat | 1896-02-14 | `...Form:row-0170` | Form | D | HIGH | Zionism | Vienna / Zionist thought | LOW | Resolve `qa-judenstaat`; publish Form, not Import 16 |
| 6 | The First Female Ordained Rabbi, Regina Jonas, is Born | 1902-08-03 | `...Form:row-0006` | Form | B | HIGH | Rabbinic; women | Berlin | LOW | Keep Holocaust context proportional |
| 7 | United States Law Protecting Chaplains from Army Discrimination Takes Effect | 1862-07-17 | `...Form:row-0156` | Form | B | HIGH | American Jews; chaplaincy | United States | LOW | Verify statute title and effective date |
| 8 | Solomon Schechter Starts the United Synagogue of America | 1913-02-23 | `...Form:row-0127` | Form | A | HIGH | Denominational history | United States | MEDIUM | Check later USCJ growth figures |
| 9 | Jonas Salk Announces Polio Vaccine on Radio | 1953-03-26 | `...Form:row-0131` | Form | A | HIGH | Jews in STEM | United States | MEDIUM | Source 1952 caseload numbers |
| 10 | UN Partition Approved | 1947-11-29 | `...Import:row-0118` | Import | B | HIGH | Zionism / diplomacy | UN / Mandatory Palestine | MEDIUM | Use UN 181 as the spine; topic/region blank |
| 11 | Treblinka Prisoner Revolt | 1943-08-02 | `...Form:row-0009` | Form | B | HIGH | Holocaust; resistance | Occupied Poland | MEDIUM | Resistance, not another camp opening |
| 12 | First Cuban Synagogue is Founded | 1906-08-05 | `...Form:row-0162` | Form | A | MEDIUM | Community history | Havana / Cuba | MEDIUM | Pin the congregation; drop slang if not a self-name |
| 13 | Judah Touro Passes Away | 1854-01-18 | `...Form:row-0122` | Form | B | HIGH | American philanthropy | United States | MEDIUM | Hedge “never surpassed” |
| 14 | Israel and Jordan Sign Peace Treaty | 1994-10-26 | `...Import:row-0112` | Import | B | HIGH | Diplomacy; MENA | Israel / Jordan | LOW | Treaty text is official and easy |
| 15 | Rabbi Chaim Yiztchak Carigal Gives First Sermon in America | 1773-05-28 | `...Form:row-0132` | Form | B | HIGH | Rabbinic; colonial America | Newport | MEDIUM | Name form Carigal / Karigal |
| 16 | Shearith Israel (Mill St. Synagogue) is Consecrated | 1730-04-08 | `...Form:row-0152` | Form | B | HIGH | Community history | New York | MEDIUM | Consecration 1730, not 1654 arrival |
| 17 | Florence Prag Kahn Becomes First Jewish US Congresswoman | 1925-03-04 | `...Form:row-0128` | Form | A | HIGH | Jews in politics; women | United States | LOW | Check House seating date |
| 18 | Israel Philharmonic Orchestra Founded | 1936-12-26 | `...Import:row-0125` | Import | B | HIGH | Arts / music | Tel Aviv / Yishuv | MEDIUM | Keep Palestine Symphony Orchestra name |
| 19 | Jews from Central and Eastern Europe Arrive in Shanghai, China | 1938-11-10 | `...Form:row-0107` | Form | A | HIGH | Holocaust; refuge; Asia | Shanghai | MEDIUM | Arrival window, not a single landing |
| 20 | Jews Headed for Auschwitz are Freed by Members of the Belgian Resistance Movement | 1943-04-19 | `...Form:row-0052` | Form | B | HIGH | Rescue; resistance | Belgium | MEDIUM | Hedge “first and only”; same civil day as Warsaw uprising — keep separate |

Why this mix exists: medieval Iberia, colonial and modern Americas,
Canada, Cuba, China, rabbinic history, STEM, music, diplomacy, and one
Holocaust **resistance** story — not another camp liberation. The archive
cannot supply ancient history. It can supply more than Holocaust-Europe
and Israeli biography if History starts here instead of at Form row 8.

---

## 8. Fast Lane — Next 5

Best rapid-review set after Westerweel / Bialystok / Willenberg /
Tripoli. All unclustered except none of these five. Research burden low.
Slash-date conversion is mechanical.

1. **Alhambra Decree Takes Effect** — Form row 161 — 1492-07-31
2. **Jews in New Amsterdam Request Permission to Build a Cemetery** — Form row 160 — 1655-07-27
3. **United States Law Protecting Chaplains from Army Discrimination Takes Effect** — Form row 156 — 1862-07-17
4. **The First Female Ordained Rabbi, Regina Jonas, is Born** — Form row 6 — 1902-08-03
5. **Florence Prag Kahn Becomes First Jewish US Congresswoman** — Form row 128 — 1925-03-04

If History wants one Zionist flagship immediately after those five,
resolve `qa-judenstaat` and take Form row 170.

---

## 9. Exception queue

Founder attention only. Safe to defer every item here.

| Kind | Record | Why it is risky | Decision needed |
| --- | --- | --- | --- |
| DATE CONFLICT | Isaac Rulf Import 11 | Field 1831-02-10; body 1834; Alamy URL | Which year? History already deferred |
| DATE CONFLICT | UN Resolution 242 Import 116 | Field 1979-11-25 is the Alma oil date; body is 22 Nov 1967 | Do not publish from the field |
| DATE CONFLICT | Ehud Barak Resigns Import 119 | Field 1949-12-13 (Mossad’s date); body is 2000 | Spreadsheet debris; hold |
| DATE CONFLICT | Hatikvah Import 123 | Field 1878-02-22; body 22 December 1878 | Fix identity before any culture use |
| DATE CONFLICT | Sadat Knesset speech Import 115 | Field 22 Nov 1977; body 20 Nov 1977 | Choose speech date |
| IDENTITY | Isaac Ruff Form 166 | Ruff/Rulf plus the 1831/1834 pair | Confirm Isaak Rülf before substituting |
| DUPLICATE | American Troops Liberate Dachau Form 57 | Alternate of the published article | Never publish as a second Dachau |
| STATISTICAL | Seville 4,000 Form 153 | Title casualty + 10k-character sweeping essay | Deep review or defer |
| MALFORMED | Będzin Form 4 | Merged unrelated body | Already `needsReview` |
| RIGHTS | Import 11 and 20 other legacy rows | Alamy / Google / Bing / Pinterest hosts | Do not use those image URLs |
| RECURRING | Yom HaZikaron Import 33; Yom Ha'atzmaut Import 35 | No fixed Gregorian date | Observance model only |
| RECURRING + BLANK | Yom Yerushalayim Import 61 | Holiday + missing body | Source recovery first |
| LEGACY DEBRIS | 28 blank Import rows; 88–105 character stubs | No recoverable prose in derived sheets | Do not promote |
| SENSITIVE | Independence Form 192 / Import 44 | Date split plus contested framing | Founder framing review |
| SENSITIVE | Deir Yassin official cluster | Alternate versions of a contested massacre | Do not queue independently |
| CONCEPTUAL | Budapest / Łódź “liberated ghetto” Form 24 / 25 | Soviet arrival ≠ ghetto liberation in the Dachau sense | Deep review if ever used |

Official date-conflict clusters (Balfour, Eichmann, Galili, Second
Zionist Congress, Yamit, Knesset building, Operation Tzur) stay in Tier D
and can wait.

---

## 10. Source-research readiness (Top 20)

This is path-finding, not publication research.

| Rank | Likely path | Strength |
| ---: | --- | --- |
| 1 Alhambra | Spanish decree texts; EJ; NLI Sephardic collections | Strong |
| 2 Barcelona | Nachmanides *Vikuach*; James I context; EJ; NLI | Strong |
| 3 New Amsterdam cemetery | AJHS; municipal New Amsterdam records | Strong |
| 4 Ezekiel Hart | Assembly of Lower Canada; LAC | Strong |
| 5 Judenstaat | Primary pamphlet; NLI Herzl; CZA | Strong |
| 6 Regina Jonas | Leo Baeck Institute; Centrum Judaicum; USHMM / Yad Vashem person files | Strong |
| 7 Chaplain law | US Statutes at Large; Congressional Globe; AJA | Strong |
| 8 Schechter / United Synagogue | JTS / Schechter papers; USCJ; AJHS | Strong |
| 9 Salk | Pitt / Salk archives; CDC historical; contemporary CBS | Strong |
| 10 UN Partition | UN 181 text and roll call; CZA / NLI Yishuv reaction | Strong |
| 11 Treblinka revolt | USHMM; Yad Vashem; IPN | Strong |
| 12 Cuban synagogue | Cuban / Latin American Jewish studies; AJHS | Medium — identity must be pinned |
| 13 Judah Touro | Touro Synagogue / Newport; AJHS; will | Strong |
| 14 Jordan treaty | Treaty text; MFA / Jordan / Knesset | Strong |
| 15 Carigal | Touro / Newport; 1773 sermon text; AJHS | Strong |
| 16 Shearith Israel | Congregation archives; AJHS | Strong if date identity is held |
| 17 Florence Kahn | US House Biographical Directory | Strong |
| 18 Israel Philharmonic | Huberman / IPO archives; NLI music | Strong |
| 19 Shanghai | USHMM Shanghai; YIVO | Strong |
| 20 Mechelen Transport XX | Kazerne Dossin; USHMM Transport XX | Strong |

Wikipedia appears in 30 archive bodies. It is a finding aid only.

---

## 11. Image-rights triage

Audit fact, unchanged: **all 208 Form image cells and all legacy image
fields are blank.** This queue is not a media production pass.

| Flag | Meaning in this queue |
| --- | --- |
| NO IMAGE NEEDED | Default for most On This Day articles, including Fast Lane 1–3 and 20 |
| RIGHTS CHECK NEEDED | A portrait or building photo would help (Hart, Jonas, Schechter, Salk, Touro, Carigal, Shearith Israel, Kahn, IPO, Shanghai) but nothing is cleared |
| COMMERCIAL / DO NOT USE | 21 records with Getty-class, Alamy, Google Images, Bing, Gstatic, or Pinterest hosts in the body |
| UNKNOWN | Cuban synagogue; no obvious public-domain path identified |

Do not ingest Google `imgres`, Alamy, or Pinterest URLs from legacy
bodies.

---

## 12. Automation opportunities

Safe to automate later (read-only script, no Sanity writes):

- Blank body, extreme length, paragraph count
- ISO vs slash vs unparseable vs impossible dates
- Date-field vs first-sentence date
- Exact title/date and normalized-date + birth-synonym clustering
- URL / email / commercial-host detection
- Source-sheet classification and blank topic/region
- Checksum equality (already used for the Einstein exact pair)
- Title repeated in body

Human-only:

- Factual correctness and casualty figures
- Political framing (independence, Deir Yassin, 242, partition)
- Identity resolution (Rülf, Carigal, Herzl spelling)
- Merge decisions
- Sensitive language
- Whether a “liberated ghetto” sentence is conceptually honest

Recommended future script, not built here: extend
`scripts/history/audit-xlsx.py` date comparison to normalized ISO and add
a birth-title synonym. Report that to History; do not modify the
production extractor from this workstream.

---

## 13. Scalable archive-review workflow

Do not run 300 Dachau-style founder reviews.

```
structural QA (this layer)
  → readiness tier
  → AI-assisted source/research packet for A/B only
  → exception review (C/D/E/RECURRING)
  → founder lane
  → ready
  → publish
```

Founder lanes:

| Lane | Use for | Volume implied by this archive |
| --- | --- | --- |
| QUICK APPROVE | Fast Lane and similar clean Form A/B with an official source path | ~5–8 at a time |
| STANDARD REVIEW | Other Tier B; first use of a legacy-only row; ordinary Holocaust resistance | most of the 156 remaining A/B |
| DEEP REVIEW | Tier C, all clusters, recurring model, blank-body recovery | 130 D + 6 C + 33 E + 2 recurring |

A sustainable cadence: one Fast Lane five, then one balanced ten from
the Top 20 remainder, then stop for a short diversity check so the
public archive does not fill with 1941–1945 Europe.

Blank-body Import titles should be a **source-recovery project**, not a
publication queue.

---

## 14. Founder-review workload recommendation

After the current History articles:

1. Fast Lane 5 — quick approve
2. Resolve Judenstaat (`qa-judenstaat`) — one comparison, then Form 170
3. Standard-review the rest of the Top 20
4. Ignore the 28 blank bodies and all official clusters until a later
   reconciliation week
5. Never deep-review Seville, Deir Yassin, Barak-1949, or UN-242-on-1979
   in order to “clear the backlog”

That sequence yields a public archive with medieval, colonial American,
Canadian, Cuban, Chinese, rabbinic, STEM, musical, diplomatic, and
resistance stories before another camp liberation.

---

## 15. History workstream changes / recommendations

Do **not** implement these here.

1. Normalize dates to ISO before duplicate detection; keep the raw
   slash/ISO string in `sourceDateValue`.
2. Treat “Birthday” / “is Born” / “'s Birthday” as title synonyms.
3. Attach Import 26 → Kovner, Import 69 → Shalit, Import 122 → Eichmann.
4. Block Form 57 from publication (second Dachau).
5. Suggested review-flag names only, if History wants them later:
   `qaTier`, `legacyRisk`, `dateFormatSlash`, `commercialImageUrl`,
   `dateFieldBodyConflict`, `supplementalDuplicateCluster`. Do not add
   them without a schema decision.
6. Import the Fast Lane 5 as drafts only after the current first-20
   clean lane, using the existing approved-manifest importer pattern.
7. Prefer Form over Import inside a supplemental cluster unless the Form
   row is the defective one.
8. Recurring observances stay out of Gregorian On This Day.

Workflow mapping, using the **existing** statuses — no second workflow:

| QA tier | Existing `workflowStatus` when imported |
| --- | --- |
| A | `imported` → `needsReview` |
| B | `imported` or `needsReview` |
| C | `needsReview` or `factCheck` |
| D | `duplicateCandidate` |
| E | `needsReview` or `rejected` / `archived` if unrecoverable |
| Recurring | `needsReview` with `entryKind: recurringObservance` |

---

## 16. Integration changes required

None.

This workstream does not need `package.json`, global CSS, navigation,
sitemap, Playwright, shared docs, or shared Sanity schema changes.

---

## 17. Sanitized artifacts created

All under `research/history-qa/` on branch `research/history-qa`:

- `README.md`
- `classify-publication-queue.py`
- `history-publication-queue.json` (no bodies, no emails, no raw
  workbook cells)
- `HISTORY_QA_PUBLICATION_QUEUE.md` (this file)

Not created: production import manifests, Sanity patches, or copies of
`restricted/raw-records.jsonl`.

---

## 18. Branch / commit / push status

See the end of the chat for the git result. Intended state:

- Worktree: `/Users/andy.katz/Desktop/Jewish Original Dev-history-qa`
- Branch: `research/history-qa`
- Base: `39d5859` on `milestone-1-sanity-history`
- No merge into History
- Push only `research/history-qa` if the commit lands

---

## 19. Current cost

**$0.** Local Python against already-extracted JSONL. No new services,
APIs, or paid research.

---

## 20. Major blind spots

- No live full Sanity census. Draft count 19 assumes no unrecorded
  imports after the first 20.
- No article-level fact-check. Tiers are structural.
- Hebrew-calendar truth was not computed.
- Supplemental clusters are QA evidence, not official detector output.
- Vietnam 1977 vs 1979 may be one event or two.
- Image availability was not researched beyond URL-host triage.
- Restricted raw staging (contributor timestamps/emails) was not reread.
- Ancient history cannot be queued because the archive does not contain
  it.
- Public archive balance will still skew 20th-century unless History
  follows the Fast Lane / Top 20 instead of remaining Form order, which
  is heavily 1933–1945 Europe.

---

ARCHIVE QUEUE READY FOR HISTORY WORKSTREAM
