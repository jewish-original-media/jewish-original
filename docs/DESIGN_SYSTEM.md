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
