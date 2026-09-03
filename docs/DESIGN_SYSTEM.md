# Digital Design System

## Brand source of truth

The supplied Jewish Original Media guidebook and approved logo library govern
the visual identity. The interface may extend the system for digital use but
must not redraw, recolor, distort, rotate, outline, shadow, or apply effects to
the marks.

## Visual direction

The experience is modern editorial, warm, historically grounded, and alive.
It favors strong hierarchy, deliberate whitespace, restrained asymmetry,
photographic storytelling, and subtle archival texture over generic card grids,
glassmorphism, gradients, or SaaS dashboard conventions.

## Color tokens

| Token    | Value     | Intended use                             |
| -------- | --------- | ---------------------------------------- |
| Navy     | `#2E3460` | Primary brand, dark text, key surfaces   |
| Gold     | `#D29046` | Accent, rules, selected calls to action  |
| Cerulean | `#768FB5` | Supporting information and quiet accents |
| Sky      | `#E0E5EB` | Cool surface and borders                 |
| Sand     | `#EEE0CB` | Warm editorial surface                   |
| Olive    | `#505A2A` | Sparse cultural/seasonal support         |

Digital neutrals are derived for accessible text and surfaces. Gold is not used
for small text on white. Every pairing must meet WCAG 2.2 AA contrast.

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

## Spatial system

- Base rhythm: 4px
- Common spacing: 8, 12, 16, 24, 32, 48, 64, 96, 128px
- Content width: 720px
- Editorial width: 1120px
- Site width: 1440px
- Page gutters: 20px mobile, 32px tablet, 48–64px desktop

## Shape, depth, and borders

- Small radius: 4px; medium: 10px; large: 18px; pill only for true pills
- Cards use borders and tonal contrast before shadows
- Shadows are low-opacity and reserved for elevated navigation or overlays
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

## Asset handling

Current JOM raster logo exports have baked black backgrounds despite `.png`
extensions. Approved variants may only be placed on a matching black surface
until transparent PNG or SVG masters are supplied. OTD circular logos are the
only supplied transparent marks. See `ASSET_INVENTORY.md`.
