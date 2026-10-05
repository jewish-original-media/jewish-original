# Digital Design System

## Brand source of truth

The supplied Jewish Original Media guidebook and approved logo library govern
the visual identity. The interface may extend the system for digital use but
must not redraw, recolor, distort, rotate, outline, shadow, or apply effects to
the marks.

## Visual direction

The experience is modern editorial, warm, historically grounded, and alive.
It should feel like Jerusalem stone, brass museum hardware, artifact fragments,
Hebrew manuscript, Temple-scale space, and a high-end cultural institution.
It favors strong hierarchy, deliberate whitespace, restrained asymmetry,
photographic storytelling, and subtle archival texture over generic card grids,
glassmorphism, gradients, or SaaS dashboard conventions.

## Color tokens

| Token    | Value     | Intended use                             |
| -------- | --------- | ---------------------------------------- |
| Navy     | `#2E3460` | Primary institutional / editorial anchor |
| Gold     | `#D29046` | Small emphasis, rules, dates, Support    |
| Cerulean | `#768FB5` | Jewish Today secondary atmosphere        |
| Sky      | `#E0E5EB` | Jewish Today cool field                  |
| Sand     | `#EEE0CB` | Primary paper-like surface               |
| Olive    | `#505A2A` | Rare cultural accent                     |

Navy and Sand carry the site. Gold is not a section color. Cerulean/Sky are
reserved for Jewish Today. Olive is rare. Do not distribute the palette
evenly across stacked bands.

Digital neutrals are derived for accessible text and surfaces. Gold is not used
for small text on Sand or white. Every pairing must meet WCAG 2.2 AA contrast.

## Typography

The guide specifies Futura and Baskerville. Licensing files were not supplied,
so the web foundation uses:

- **Jost:** open-licensed geometric sans alternative for Futura
- **Libre Baskerville:** open-licensed Baskerville interpretation for editorial voice
- **Bortolotto:** not deployed; the guide itself requires manual glyph correction

Both web fonts are self-hosted by `next/font`. If licensed WOFF2 files become
available, replace the font loaders without changing semantic tokens.

Usage:

- Display and navigation: sans, uppercase selectively, generous tracking
- Body: sans for concise interface text; serif for long-form editorial reading
- Quotes and historical accents: serif italic
- Never set long paragraphs in uppercase or wide tracking
- Never set Baskerville-style serif in uppercase

Public type scale:

- Display: `clamp(4.4rem, 10.5vw, 10.5rem)` on the immersive homepage
  masthead, with a mobile range of `clamp(3.5rem, 18vw, 6.1rem)`
- Section display: `clamp(2.35rem, 5vw, 6.25rem)`
- Feature headline: `clamp(2rem, 3.8vw, 4.75rem)`
- Article / card headline: `1.35rem` to `2.25rem`
- Eyebrow: small sans, uppercase, tracked
- Body: editorial serif, about 17–18px mobile and 18–20px desktop
- Functional UI text: at least 13px for navigation, labels, metadata, filters,
  captions, and controls; decorative counters may be 12px only when they carry
  no unique meaning

Very large type is reserved so smaller moments stay intimate.

History article scale:

- Display (H1): `clamp(2.35rem, 6.2vw, 4.85rem)` mobile/tablet; desktop
  `clamp(2.75rem, 5.2vw, 5.15rem)`, serif, max 15ch
- Lede / excerpt: `clamp(1.125rem, 1.5vw, 1.375rem)`, serif, max 38rem
  mobile/tablet and 33rem desktop
- Section titles: `clamp(1.45rem, 2vw, 1.75rem)`, serif
- Related story titles: `clamp(1.15rem, 1.35vw, 1.375rem)`, serif, max 28rem
- Body: `clamp(1.0625rem, 1.25vw, 1.1875rem)`, serif
- Kickers / metadata: 12px sans, tracked uppercase

The article H1 remains dominant. Related titles must not use the display
scale.

History archive scale:

- Landing H1 reuses the article display scale: “Explore Jewish history.”
- Archive list title: `clamp(1.25rem, 1.8vw, 1.6rem)`, serif
- Related titles stay on the smaller article scale
- Search is the first control. Date, Topic, Place, and Sort live in a native
  disclosure labeled Filters.
- Controls use square native inputs and selects, not a dashboard panel.
- Active choices use removable chips because they communicate query state;
  result cards remain typographic and unboxed.
- Date browse uses native month/day selects, not a 365-day grid.

Archive cards must work with and without a rights-cleared 16:9 image. The
no-image treatment is typographic. Do not insert a generic photograph or an
empty media well.

Featured media uses a fixed 16:9 frame, `object-fit: cover`, and caption /
credit under the image. Articles without a rights-cleared image use a gold
rule and a small Magen David index mark. They never show an empty image box.

The History hero uses the unedited white OTD lion as a luminance mask filled
with brand gold. On desktop it is an oversized, cropped, low-opacity watermark
on the right. Mobile hides it. The no-image section break keeps a small
luminance-masked Magen David between gold rules. Source PNGs stay unedited.
Do not use `mix-blend-mode: screen` for the lion on sand — it flattens gold
into the field. The OTD circular wordmark and repeating lion/star pattern are
not used on History articles.

Desktop History hero rhythm (64rem and up):

- Grid: `1.15fr` / `0.45fr` with `clamp(4rem, 7vw, 7.5rem)` column gap
- Padding: `4.75rem / 5.5rem` at 1024, `5.5rem / 6.5rem` at 1280,
  `6rem / 7rem` at 1440
- Date to title `1.25rem`; title to lede `2rem`; lede max 33rem
- Lion watermark opacity `0.16` on desktop; hidden on mobile

Podcast scale:

- Show H1: `clamp(2.4rem, 6vw, 4.6rem)`, serif, max 16ch on the night hero
- Episode H1: `clamp(2.1rem, 5vw, 3.85rem)`, serif, max 20ch
- Episode cards: `clamp(1.35rem, 2vw, 1.7rem)`, serif
- Tagline: serif italic in gold
- Featured media remains 16:9. YouTube uses a click-to-load facade.
- Archive cards are typographic rules, not artwork tiles.

TTJS may use a night hero and the approved circular show mark on black. Do
not recolor or outline the mark. Do not place it on sand or white.

## Spatial system

- Base rhythm: 4px
- Common spacing: 8, 12, 16, 24, 32, 48, 64, 96, 128px
- Content width: 720px
- Editorial width: 1120px
- Site width: 1440px
- Page gutters: 20px mobile, 32px tablet, 48–64px desktop
- Large screens use a 12-column editorial grid; tablet 8; mobile 4
- Selected sections may use 7/5 or 8/4 splits, full bleed, or offset text
- Grouping comes from rules, columns, and field changes before cards

## Shape, depth, and borders

- Living editorial rooms may use flowing bands, capsules, circular markers,
  and restrained asymmetric radii to connect sections without becoming a
  generic rounded-card interface
- History remains the museum exception: prefer hairline rules, square edges,
  accession labels, and framed reading compositions
- Cards are reserved for comprehension, not default grouping
- Shadows are low-opacity and reserved for elevated navigation or overlays
- A light paper grain may sit on the canvas as CSS only
- Rules and framed compositions echo the established identity without tracing logos

## Motion

- Fast feedback: 120–160ms
- Standard transitions: 220–280ms
- Editorial reveals: 400–600ms, used sparingly
- Ease: decelerate on entrance, standard ease on state change
- Animate opacity and transforms; avoid layout thrashing
- Respect `prefers-reduced-motion` and never hide essential information behind motion

The Living Archive may use slow image drift, a moving geographic continuum,
and CSS view-timeline reveals as progressive enhancement. Motion never controls
reading order, triggers audio/video, or replaces navigation. Unsupported and
reduced-motion environments receive the complete static composition.

## Responsive behavior

- Mobile is composed independently, not a compressed desktop layout.
- Tap targets are at least 44×44px.
- Type uses fluid `clamp()` scales with controlled line lengths.
- Navigation works without JavaScript and remains keyboard accessible.
- Images preserve focal subjects and expose meaningful alternative text.

## Rooms

One visual system. Different rooms:

| Room                | Route                        | Feeling                            |
| ------------------- | ---------------------------- | ---------------------------------- |
| Lobby               | `/`                          | Front page / museum entrance       |
| Daily ritual        | `/today`                     | Hebrew date, Torah, observance     |
| Living index        | `/explore`                   | Interconnected archive discovery   |
| Current index       | `/explore?view=current`      | Fresh outbound records             |
| Archive / gallery   | `/history`                   | Dated collection                   |
| Exhibition          | `/history/[slug]`            | One object, sources, related rooms |
| Listening room      | `/podcasts` and show/episode | Voices, night field                |
| Institutional story | `/about`                     | People and path                    |
| Patronage           | `/support`                   | Cultural support, not SaaS pricing |
| Quiet legal room    | `/privacy`                   | Current product behavior           |

Do not make every page visually identical.

The Daily ritual room uses a labeled Gregorian/Hebrew date ledger, then
observance, Torah, and History in source order. Educational depth comes from
provider memos, verified reading references, and clear source links—not
decorative religious copy. Torah, Maftir, and Haftarah groups remain keyboard
accessible and collapse when absent. On wider screens, square-edged bordered
rooms may balance those domains in an asymmetric grid. One founder-cleared
editorial photograph and a restrained OTD mask ground the room; neither
changes the source hierarchy. Gated News and Events may close the dashboard as
the Jewish present.

The Current index uses a quiet cool-field explainer and direct paths to the
News and Events desks. It must remain visually subordinate to the durable
Living Archive and must not make outbound records look like permanent JOM
articles.

An archive trail may sit between a room hero and its content. It is a
typographic, server-rendered wayfinding rail—not a recommendation engine. Today,
History, Living Archive, and Current are generic destinations; entity-filtered
paths appear only when a resolved CMS reference supplies the slug. The rail
must remain useful without motion and preserve 44px targets on mobile.

On the clean Living Archive index, “Begin with a thread” may surface a small
set of entry paths ranked from actual resolved facet counts. These links use
the normal durable query contract; they disappear on filtered, searched, and
Current views so the active state remains clear.

The homepage is a sequence of editorial scenes rather than a stack of equal
content bands. Full-viewport photography, sparse overlay type, large pauses,
and distinct Today, History, Originals, News, Listening, Events, About, and
Support rooms establish chapter pacing. Each scene retains semantic headings,
source data, and visibility gates; cinematic scale never turns absent content
into fabricated inventory.

The lobby masthead may crossfade among three founder-cleared stills. Only the
first image is eager and all motion disappears under reduced-motion. The fixed
accessible identity is “Jewish Original”; rotating media/category words are
visual emphasis, not separate announcements. Homepage video remains deferred
until a licensed film, poster, captions, controls, and a non-video LCP path
exist.

History detail is an exhibition label followed by a reading room. Its
accession rail may display the real date, reviewed place, verified citation
count, and relational-thread count. The body stays a comfortable single
column beside a relational index. Empty media remains intentional unless the
exact record has cleared or public-domain media with an item-level ledger.

## Jerusalem material

Atmosphere comes from limestone-warm paper, archival rules, brass-gold dates,
Hebrew print, faint horizontal strata, and a lightweight CSS grain. Texture
should be felt, not noticed. Metal appears as hairline rules and engraved
details, not chrome gradients. Do not use Western Wall heroes, flag fields,
skyline silhouettes, or Stars of David as wallpaper. Jewish Today may name
Eastern Time; it must not imply Jerusalem time.

## Living Archive material

The homepage may layer verified archive objects as imperfect paper artifacts:
slight rotation, visible borders, restrained tape marks, catalog numbers, and
museum captions. This “wabi-sabi” quality comes from age, repair, printing, and
human handling—not fake distress applied to logos or invented antiquity.

Diaspora representation is editorial, not decorative:

- Name the documented community, location, date, archive, and rights status.
- Preserve uncertainty instead of inferring identity from appearance.
- Never use one person or object as a stand-in for an entire community.
- Prefer a small, well-sourced collection over token geographic coverage.
- Keep provenance visible and link to the authoritative source record.
- Historical photographs may sit beside current JOM work, but their captions
  must make the time boundary unmistakable.
- An external film catalog is not a free visual texture library. JFC or other
  audiovisual material requires item-level written permission or a documented
  license before any still, excerpt, embed, or derivative treatment appears.

## Motif language

Jewish Original Media is the umbrella. On This Day and The Two Tall Jews Show
remain distinct sub-brands.

Decorative assets must be authentic or absent:

- approved JOM brand assets
- approved OTD lion / star in History rooms only
- approved TTJS marks on Podcast night surfaces only
- founder-owned photography
- typography, Hebrew, stone / paper / brass, and simple rules or circles

Do not invent icon families. Do not reuse the OTD lion on the homepage
masthead, About, Originals, or other global JOM surfaces. The homepage History
room may use the same approved lion/star masks as a non-photographic archival
index plate when a story has no rights-cleared image. Originals without media
use a separate JOM monogram-and-star graphic plate. Both treatments must
remain visibly graphic, carry no image caption, and never imply that they
depict a subject or event. Empty space is intentional.

## Logo placement

No approved transparent or vector JOM master exists. Current rasters are
JPEG-encoded with baked black fields. The header treats the unaltered
white/gold primary as a small black brand plaque with a brass edge. Do not
remove the background, recolor, crop the mark, or fake transparency.

The footer keeps the typographic “Jewish Original” lockup. Do not enlarge the
baked raster there. The required long-term asset is
`JOM_Primary_Horizontal_White_Gold_Transparent.svg` or another
designer-approved transparent/vector master.

## Imagery

Treat images as collection objects. Public founder photographs use
`MuseumFigure`: object type, title, place, and credit under a hairline gold
rule. History featured media uses the same museum language when a
rights-cleared CMS image exists. History featured media may be a photograph,
original illustration, artifact, map, or manuscript. Illustrations must be
labeled as illustrations. No empty image wells. See
`docs/HISTORY_ILLUSTRATION.md` and `docs/ASSET_INVENTORY.md`.

Approved public photographs use different crops at mobile, tablet, and
desktop through `object-position` and aspect ratio. Faces and hands stay
legible. Do not reuse one pair photograph on About and Podcast.

The homepage has one eager LCP photograph in the masthead. All story images
below it remain lazy by default. Rights-cleared History images preserve their
caption and credit; absent media uses the documented archival index plate
rather than an unrelated stock image or blank frame.

## Shared chrome

The sticky night header centers the approved unaltered logo plaque, presents
the current Gregorian and Hebrew dates where space allows, and keeps Listen
and Support close at hand. A native `details` disclosure opens the full
numbered menu without client JavaScript. At desktop widths, a second restrained
row makes Today the daily gateway while Listen and Support remain quick
actions. Today groups the Jewish calendar, Torah, On This Day, and eligible
News and Events without changing their standalone URLs. Originals, News, and
Events remain inventory-gated. The desktop row does not create a second
ungated navigation contract.

A server-rendered daily ribbon sits below the navigation. It links only real
data already available to the shell: the Gregorian and Hebrew day, an eligible
observance or Torah portion, a reviewed historical anniversary, eligible News
and Events, and Explore. Missing material is omitted. The ribbon scrolls
horizontally without autoplay and remains complete under reduced motion.

The footer closes with “Keep the story moving,” a Support invitation, and
Explore / Connect link groups. Both header and footer use square edges,
hairline rules, accessible focus states, and reduced-motion-safe transitions.

## Asset handling

Current JOM raster logo exports have baked black backgrounds despite `.png`
extensions. The header plaque is the approved interim placement. Do not
alter the mark. OTD circular logos are the only supplied transparent marks.
Three founder-owned photographs now live in `public/media/founder/` and are
recorded in `ASSET_INVENTORY.md`. Do not substitute stock.

## News and Events

News is a tight newswire: hairline rules, publisher labels, time, headline,
short JOM context, outbound arrow, and a night editorial header. No card grid.
No publisher images.

Events is a museum calendar: the date is the graphic object. Title,
organizer, place or Online, and the event’s own timezone follow on a warm,
faintly ruled calendar field. Do not make the two desks visually identical. Do
not invent icons for either.
