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

- Display: `clamp(3rem, 8.4vw, 8.75rem)` — homepage masthead only
- Section display: `clamp(2.35rem, 5vw, 6.25rem)`
- Feature headline: `clamp(2rem, 3.8vw, 4.75rem)`
- Article / card headline: `1.35rem` to `2.25rem`
- Eyebrow: small sans, uppercase, tracked
- Body: editorial serif, about 17–18px mobile and 18–20px desktop

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

- Landing H1 reuses the article display scale: “On this day in Jewish history.”
- Featured card title: `clamp(1.85rem, 3.4vw, 2.75rem)`, serif, max 18ch
- Archive list title: `clamp(1.25rem, 1.8vw, 1.6rem)`, serif
- Related titles stay on the smaller article scale
- Date browse uses native month/day selects, not a 365-day grid
- Taxonomy links are compact sentence-case lists, not filter chips

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

- Prefer hairline rules and square edges over rounded rectangles
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
| Archive / gallery   | `/history`                   | Dated collection                   |
| Exhibition          | `/history/[slug]`            | One object, sources, related rooms |
| Listening room      | `/podcasts` and show/episode | Voices, night field                |
| Institutional story | `/about`                     | People and path                    |
| Patronage           | `/support`                   | Cultural support, not SaaS pricing |
| Quiet legal room    | `/privacy`                   | Current product behavior           |

Do not make every page visually identical.

## Jerusalem material

Atmosphere comes from limestone-warm paper, archival rules, brass-gold dates,
Hebrew print, faint horizontal strata, and a lightweight CSS grain. Texture
should be felt, not noticed. Metal appears as hairline rules and engraved
details, not chrome gradients. Do not use Western Wall heroes, flag fields,
skyline silhouettes, or Stars of David as wallpaper. Jewish Today may name
Eastern Time; it must not imply Jerusalem time.

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
masthead, About, or other global JOM surfaces. Empty space is intentional.

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

## Asset handling

Current JOM raster logo exports have baked black backgrounds despite `.png`
extensions. The header plaque is the approved interim placement. Do not
alter the mark. OTD circular logos are the only supplied transparent marks.
Three founder-owned photographs now live in `public/media/founder/` and are
recorded in `ASSET_INVENTORY.md`. Do not substitute stock.

## News and Events

News is a tight newswire: hairline rules, publisher labels, time, headline,
short JOM context, outbound arrow. No card grid. No publisher images.

Events is a museum calendar: the date is the graphic object. Title,
organizer, place or Online, and the event’s own timezone follow. Do not make
the two desks visually identical. Do not invent icons for either.
