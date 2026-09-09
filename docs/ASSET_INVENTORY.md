# Supplied Asset Inventory

Audit date: 2026-08-30

## Brand guide

`JOM Brand Guidebook copy.pdf` — 14 pages.

Confirmed guidance:

- Jewish Original Media is the umbrella for On This Day in Jewish History and
  The Two Tall Jews Show.
- Universal palette: gold, sky, olive, navy; JOM adds cerulean and emphasizes
  blues and gold; OTD adds sand.
- Universal type: Futura and Baskerville. Bortolotto is JOM-only and must be
  corrected by a designer before legible use.
- JOM may use isolated Magen David, thick rules, and circles. The OTD repeating
  star pattern and JOM wheat pattern must remain distinct.
- Photography should favor blue, gold, brown, tan, and white tonal families.
- Logos may not be altered, recolored, stretched, rotated, shadowed, or placed
  without sufficient contrast.

## Jewish Original Media marks

Supplied raster variants include:

- Five vertical JOM marks: full color, gold, light blue, navy, white
- Four primary horizontal logos: full color, white/gold, white
- Three secondary/circular logos: full color, navy/white, white

Important: all inspected JOM files are JPEG-encoded raster images despite their
`.png` names, report no alpha channel, and include baked black backgrounds.
Dimensions are 350×1024 for vertical marks, 1024×831 for primary logos, and
1024×1023 for secondary logos. Their quality is suitable for the foundation
shell on black, but not for flexible production placement.

A second search of the supplied logo locations and project sources found no JOM
SVG, EPS, AI, PDF vector master, or transparent JOM raster. Two SVG files found
elsewhere are a `770` building icon and a World Jewish Congress logo; neither is
a Jewish Original mark and neither may be substituted.

Required later, from a designer: `JOM_Primary_Horizontal_White_Gold_Transparent.svg`
or another approved transparent/vector master. Until then, do not remove
backgrounds, recolor, redraw, or enlarge the existing rasters for monumental
use.

Do not invent decorative icon families to fill empty space. Global JOM
surfaces use approved brand assets, typography, Hebrew, material treatment,
or nothing.

## On This Day in Jewish History

Fifteen supplied brand graphics:

- Primary horizontal full-color logo — 1024×577
- Four secondary circular logo variants — 1000×1000, genuine transparent PNG
- Four star icon variants — 1024×1024, opaque raster
- Beige, gold, and white lion marks — 1024×1024, opaque raster
- Lion and Magen David repeating pattern — 1024×1024, opaque raster
- Reversed wordmark — 1024×354, opaque raster

The transparent secondary logo variants are currently the most production-ready
sub-brand marks. Other files need true transparent or vector exports.

History template delivery copies two unedited OTD motif rasters into
`public/brand/motifs/` for CSS masks only:

- `otd-lion-white.png` — white rampant lion on black; desktop hero luminance
  mask, filled with brand gold at low opacity
- `otd-lion-gold.png` — gold rampant lion on black; color reference only. Do
  not composite it with `mix-blend-mode: screen` on sand (the black field
  remains, or gold washes out)
- `otd-star-white.png` — archival Magen David stamp on black; luminance mask
  for the no-image section mark

They are not JOM wordmarks. Do not place the OTD circular “On This Day”
logo on History articles.

## The Two Tall Jews Show and legacy marks

- The Two Tall Jews Show logo — founder pack file
  `Copy of The two tall jewas-Sin fondo- oscuro (1).png`, 1080×960 RGBA with
  a black field around a white circular badge. Copied unedited to
  `public/brand/ttjs-mark.png` for Podcast pages. Place only on black/night.
- WebP derivative of the same mark in the founder asset folder
- `Podcast.png.webp` (1920×1080) website banner — not used on public pages
- Jewish History Timeline circular logo — 500×500, transparent PNG
- Jewish History Timeline circular artwork — 1024×1024, opaque raster

The timeline mark appears to be a legacy/adjacent identity and should not be
used as the JOM or OTD primary identity without explicit approval.

## Public-site rights classes (2026-09-09 art-direction pass)

Only classes **A** (JOM-owned / founder-approved) and **B** (known brand asset)
may appear on the public site. Class **C** requires a verified Commons/source
page, license, and a non-thumbnail local or Sanity asset. **D/E** stay private.

| Asset                                           | Class    | Public use                                                       |
| ----------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `/brand/ttjs-mark.png`                          | B        | Night-only TTJS mark                                             |
| `/brand/motifs/otd-lion-white.png`              | B        | CSS luminance mask                                               |
| `/brand/motifs/otd-lion-gold.png`               | B        | Color reference only                                             |
| `/brand/motifs/otd-star-white.png`              | B        | No-image History mark                                            |
| JOM primary white/gold JPEG used by `BrandLogo` | B        | Header plaque on night only; do not enlarge in the footer        |
| `/media/founder/meyer-isaac-street.webp`        | A        | Homepage Podcast + TTJS show page                                |
| `/media/founder/meyer-isaac-steps.webp`         | A        | About                                                            |
| `/media/founder/morning-tefillin.webp`          | A        | Support                                                          |
| Host photos cited in `docs/PODCAST_ARCHIVE.md`  | C        | Missing rights ledger                                            |
| Israeli-flag photographs in the founder pack    | D        | Held. Flag fields.                                               |
| Unsplash `photo-1697054821057`                  | E        | Held. Stock, not founder-owned.                                  |
| `ak2` portrait                                  | A / hold | Not a public founder subject.                                    |
| `meyer.jpg`, `isaac.jpg` headshots              | A / hold | Too small; would become team cards.                              |
| Re-uploaded JOM / OTD logo rasters              | B / hold | Already in `/public/brand`.                                      |
| `Dachau_execution_coalyard_1945-04-29`          | C / hold | US Army / NARA, PD-US. Graphic; thumbnail only; no Sanity write. |
| `Samuel_Willenberg_Treblinka_2_sierpnia_2013`   | C / hold | Adrian Grycuk, CC BY-SA 3.0 PL. Thumbnail only.                  |
| `Benghazi_Synagogue_Classroom_before_WWII`      | D        | Commons Libya-PD tag; US PD tag missing.                         |

### Public photography ledger

| Filename                  | Usage                            | Owner                 | Rights  | Credit                |
| ------------------------- | -------------------------------- | --------------------- | ------- | --------------------- |
| `meyer-isaac-street.webp` | Homepage Podcast, TTJS show page | Jewish Original Media | Class A | Jewish Original Media |
| `meyer-isaac-steps.webp`  | `/about`                         | Jewish Original Media | Class A | Jewish Original Media |
| `morning-tefillin.webp`   | `/support`                       | Jewish Original Media | Class A | Jewish Original Media |

Do not hotlink Wikimedia thumbnails. Do not attach History featured media until
a founder-approved Sanity write uses a verified high-resolution file.

## Photography

Founder-uploaded photographs now in the Cursor asset pack (2026-09-09):

Used (class A):

- Meyer and Isaac at a Jerusalem street corner — 1024×1024, `/media/founder/meyer-isaac-street.webp`
- Meyer and Isaac on Jerusalem limestone steps — 1024×1024, `/media/founder/meyer-isaac-steps.webp`
- Morning tefillin / Hebrew book — 1024×1024, `/media/founder/morning-tefillin.webp`

Held:

- Israeli flag bunting, Israeli flags against sky or stone
- Unsplash Western Wall and flag (`photo-1697054821057`)
- Low-resolution individual headshots (`meyer.jpg`, `isaac.jpg`)
- `ak2` portrait (not a public JOM founder page subject)
- Three Wikimedia historical files until high-resolution, rights-cleared History attach is approved

The used files are 1024px WebP derivatives, served through `next/image`. Original
high-resolution masters are still needed for print and large crops.

## Non-brand graphical source

- Gold lion silhouette on black — 721×1024

Its relationship to the approved OTD lion system should be confirmed before use.

## Required follow-up assets

1. Preferred web master:
   `JOM_Primary_Horizontal_White_Gold_Transparent.svg`, exported from the
   approved source artwork with no background rectangle, all logo elements as
   vectors, text converted to outlines if licensing requires it, an SVG
   `viewBox`, sRGB colors, no embedded bitmap, and designer-prescribed clear
   space in the artboard.
2. Approved full-color horizontal and secondary/icon SVG variants for light
   surfaces, social images, favicon, and app-icon production.
3. If SVG cannot be supplied, true 32-bit RGBA PNG exports at 1× and 2× for
   each approved placement, with transparency verified and a master at least
   2400 px on the longest edge.
4. Webfont licenses and WOFF2 files for Futura/Baskerville, if owned.
5. Logo clear-space, minimum-size, and favicon/app-icon guidance.
6. A rights/credit ledger for all photography and historical imagery.
7. Original high-resolution photography where 1024px files are derivatives.

All copied source files remain unedited. Web delivery derivatives may later be
generated separately with documented crops and optimization settings.
