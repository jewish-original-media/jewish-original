# History Taxonomy Evidence and Proposed Crosswalk

Status: closed public vocabulary, 2026-10-05. The published archive uses
one document per concept. Source spellings that differ only by case,
spacing, or abbreviation are aliases of that document. They are not new tags.

## Closed vocabulary

The workbook sheets (`Cover Page`, `Form`, `Content`, `Import`, and the
other tabs) repeat the same idea under more than one label. Public History
keeps a single document for each concept.

Topics, and the only source spellings that alias them:

- **Antisemitism**
- **Ghettos**
- **Holocaust**
- **Inquisition**
- **Israel** — not an alias of `Israeli` or `Israeli/Zionism`
- **Jews in Entertainment** — alias `Jews in entertainment`
- **Jews in Politics** — alias `Jews in politics`
- **Jews in Sport** — alias `Jews in sport`
- **Jews in STEM**
- **Rabbinic Judaism**
- **World War II** — alias `WWII`
- **Zionism** — not an alias of `Israeli/Zionism`

Geographic regions:

- **Africa**, **Asia**, **Europe**, **North America**, **South America**
- **Middle East**
- **Israel**
- **United States** — alias `USA`. Its parent region is North America.

Content warnings are a separate list, not topics: Antisemitic violence,
Genocide or mass death, Terrorism, Graphic violence, and Death. The source
token `Terrorism` stays a warning. It does not become a topic.

Do not create another topic or region for these source tokens: `European Jews`,
`American Jews`, `Israeli`, `Israeli/Zionism`, `Wars`, `Antizionism`,
`Resistance`, `Jewish Resistance`, `MENA`, `North Africa`, `Middle Ages`,
`British`, `French`, or `Iberia`. They remain in provenance until a reviewed
decision gives each one a single name. Do not invent a near-synonym, a
plural, or a second capitalization of a name already in the list above.

## Applied to the published archive

On 2026-10-05 the closed vocabulary was applied to the 266 published stories.
A story received a topic or region only when its provenance already contained
that exact source token, or a case, spacing, or abbreviation alias of it.
`Israeli/Zionism` was not split. No new topic or region document was created.
Editorial tags already on a story were left in place.

Published coverage after that pass:

- Topics: Antisemitism 144, Holocaust 118, Israel 114, World War II 108,
  Zionism 82, Jews in Politics 34, Jews in Entertainment 11, Inquisition 10,
  Jews in STEM 8, Ghettos 4, Rabbinic Judaism 3, Jews in Sport 1.
- Regions: Europe 176, Israel 124, Middle East 75, United States 30,
  North America 21, Africa 16, South America 5, Asia 3.

Three stories still have no public topic. `Germany Organizes the Killing of
Disabled Children` keeps the workbook tokens `Holocaust`, `Antisemitism`, and
`European Jews` in provenance only. `Havana Jews Found a Congregation` has
`European Jews, American Jews`. `The Triangle Shirtwaist Factory Fire` has
`American Jews`.

Four stories still have no public region. `Green Ticket Roundup Arrests
Foreign Jews in Paris` has only `French`. `First Zionist Congress Opens`,
`Second Zionist Congress Opens`, and `San Remo Conference Ends` have no source
region.

United States is the child of North America. The public North America browse
includes a story tagged only United States, and a story tagged with both is
counted once. That raises the North America browse count from 21 direct tags
to 34 stories.

## Evidence boundary

The canonical XLSX contains 332 candidate records: 208 `Form` records and 124
legacy `Import` records. The source supplies:

- 105 distinct non-normalized topic values: 104 populated composites plus blank
- 24 distinct topic tokens after delimiter parsing
- 8 blank legacy topic values
- 41 distinct geographic values: 40 populated composites plus blank
- 11 distinct nonblank geographic tokens
- 124 blank legacy geographic values

Every original composite string remains unchanged in
`provenance.sourceTopicValues` or `provenance.sourceRegionValues`. A normalized
reference supplements that evidence; it never replaces it.

`Form` uses comma-separated multi-topic labels. `Import` uses
`Israeli/Zionism` on 112 records, `Israeli / Zionism` on 3, `Holocaust` on 1,
and a blank value on 8. Splitting the slash compound into two editorial topics
is **not** treated as mechanical normalization.

## Observed topic tokens

Counts are token occurrences across all 332 candidates.

- `Zionism`: 185
- `Antisemitism`: 150
- `European Jews`: 141
- `Holocaust`: 119
- `Israeli`: 115
- `WWII`: 111
- `Israel`: 74
- `Wars`: 43
- `American Jews`: 19
- `Antizionism`: 18
- `Jews in politics`: 17
- `Resistance`: 11
- `Inquisition`: 8
- `Jews in STEM`: 7
- `Jews in entertainment`: 6
- `MENA`: 5
- `Terrorism`: 4
- `Rabbinic Judaism`: 3
- `Jews in Politics`: 3
- `Ghettos`: 2
- `Jews in sport`: 1
- `Jewish Resistance`: 1
- `North Africa`: 1
- `Middle Ages`: 1

The strongest `Form` co-occurrences are Antisemitism + European Jews (127),
Antisemitism + Holocaust (116), European Jews + Holocaust (110),
Antisemitism + WWII (109), Holocaust + WWII (107), and Israel + Zionism (62).
Co-occurrence is evidence for related concepts, not proof of synonymy or a
parent-child relationship.

## Proposed topic crosswalk

### Safe now

These preserve the source concept and change only presentation, abbreviation,
capitalization, or spacing.

- `WWII` → **World War II**
- `Holocaust` → **Holocaust**
- `Antisemitism` → **Antisemitism**
- `Israel` → **Israel**
- `Zionism` → **Zionism**
- `Inquisition` → **Inquisition**
- `Ghettos` → **Ghettos**
- `Rabbinic Judaism` → **Rabbinic Judaism**
- `Jews in politics` and `Jews in Politics` → **Jews in Politics**
- `Jews in STEM` → **Jews in STEM**
- `Jews in entertainment` → **Jews in Entertainment**
- `Jews in sport` → **Jews in Sport**

The safe list authorizes exact source-token links only. It does not authorize
splitting a compound source value, inferring a topic from prose, or assigning a
parent.

### Founder review required

- `Israeli/Zionism` and `Israeli / Zionism`: decide whether these legacy values
  mean two topics, one legacy collection, or a broad Israel/Zionism channel.
- `Israeli`: nationality/adjective, not automatically a synonym for the topic
  **Israel**.
- `European Jews` and `American Jews`: decide whether these are public topics,
  diaspora-community facets, or both.
- `Resistance` and `Jewish Resistance`: decide whether the shorter source value
  always means Jewish resistance and whether one should be an alias or child.
- `Wars`: decide between **War and Conflict**, individual war topics, or an era
  relationship.
- `Antizionism`: define scope and preferred label (**Anti-Zionism** or another
  editorial style) before activation.
- `Terrorism`: define scope carefully before use on politically sensitive
  records.
- `MENA` and `North Africa`: geographic concepts placed in a topic field; decide
  whether to migrate them to geography, retain them as discovery topics, or
  support both.
- `Middle Ages`: decide whether the public label should be **Middle Ages** or
  **Medieval Jewish History**.
- `Ghettos`: exact-token mapping is safe, but any automatic parent under
  Holocaust is not; ghettos predate and extend beyond the Holocaust.
- `Holocaust`, `World War II`, and `Antisemitism`: keep as separate top-level
  topics. They are strongly related but none is a synonym or complete parent of
  the others.
- `Israel` and `Zionism`: keep separate. The state/place and political movement
  are related but not interchangeable.

## Initial topic shape

Use a shallow model. Do not create artificial root documents merely to make a
tree look complete.

### Active top-level topics

- Holocaust
- World War II
- Antisemitism
- Israel
- Zionism
- Inquisition
- Rabbinic Judaism

### Proposed editorial groupings

These are navigation concepts pending review, not active parent references:

- **Jewish communities:** European Jews, American Jews
- **Jewish life and contribution:** Jews in Politics, Jews in STEM, Jews in
  Entertainment, Jews in Sport
- **Resistance and conflict:** Resistance, Jewish Resistance, Wars, Terrorism
- **Historical periods and settings:** Middle Ages, Ghettos

Prefer `relatedTopics` for Holocaust ↔ World War II and Israel ↔ Zionism.
Parent-child relationships should be reserved for true narrower concepts, not
mere co-occurrence.

## Observed geographic tokens

Counts are token occurrences. The 124 `Import` records have no source geography.

- `Europe`: 152
- `Israel`: 73
- `Middle East`: 62
- `USA`: 23
- `British`: 21
- `North America`: 21
- `French`: 11
- `Africa`: 9
- `South America`: 5
- `Asia`: 2
- `Iberia`: 1
- blank legacy geography: 124

## Proposed geography crosswalk

### Safe now

- `Europe` and trailing-comma variants → **Europe**, type `continent`
- `Africa` → **Africa**, type `continent`
- `Asia` → **Asia**, type `continent`
- `North America` → **North America**, type `continent`
- `South America` → **South America**, type `continent`
- `USA` → **United States**, type `country`, alias `USA`
- `Israel` → **Israel**, type `country`
- `Middle East` → **Middle East**, type `subregion`

### Founder review required

- `British` and `French` are nationality, colonial-power, or political-context
  labels. They must not become geographic-region references.
- `Iberia` may be a modern subregion or a historical region depending on the
  article.
- `Israel` → `Middle East` is a reasonable discovery hierarchy but remains
  unapplied until the intended geographic navigation and terminology are
  approved.
- `Middle East` → `Asia` is too reductive for a cross-regional public taxonomy;
  keep the subregion independent initially.
- `MENA` occurs in the source topic field, not the geographic field. If adopted,
  use **Middle East and North Africa** as a cross-regional discovery concept,
  not as a parent that forces countries into one continent.
- `European Jews` and `American Jews` describe communities, not places.
- Missing legacy geography must remain missing until an editor reviews the
  article. Do not infer it automatically from prose.

## Proposed geography shape

- **Continents:** Africa, Asia, Europe, North America, South America
- **Subregions:** Middle East; proposed Iberia; proposed North Africa
- **Countries:** Israel, United States
- **Historical regions:** created only when a specific reviewed article needs
  one
- **Diaspora areas:** supported as an explicit region type, but created only
  after editorial scope is defined
- **Places:** cities, towns, camps, ghettos, buildings, and sites remain `place`
  documents rather than geographic-region categories

## Pilot application boundary

For the first public-history evaluation, safe exact mappings may be applied to
the following structurally clean drafts:

1. `US Liberates Dachau`
2. `Joop Westerweel is Murdered by Nazis for helping Jews`
3. `Samuel Willenberg Dies`
4. `Theodore Herzl's Birthday`

The fourth record is useful for testing a legacy source, embedded URLs,
structured citations, and a pre-1900 date. Its compound `Israeli/Zionism`
topic remains unmapped pending founder review. None of these records is
fact-checked or approved for publication merely because it is structurally
clean.

Applied to those four drafts only:

- exact-token topics `Holocaust`, `Antisemitism`, `Israel`, and `WWII` →
  **World War II**
- exact-token geography `Europe` and `Israel`
- no `Israeli/Zionism` mapping
- no `British` or `French` geography
- no related-history links generated from duplicate detection
- three Holocaust-era records received explicit editorial related-content
  links so the public template can be tested

## Publication gate discovered during review

“Clean” in the migration manifest means structurally importable, not
historically verified. The sample prose contains claims, figures, terminology,
embedded image URLs, and possible inconsistencies that require factual,
citation, sensitivity, and rights review. The public frontend may be built and
tested in authenticated draft preview, but anonymous publication remains
blocked until a founder/editor explicitly completes that review.
