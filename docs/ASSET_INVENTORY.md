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

## Public-site rights classes (2026-09-09)

Only classes **A** (JOM-owned / founder-approved) and **B** (known brand asset)
may appear on the public site.

| Asset                                                                | Class          | Public use                                                                         |
| -------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- |
| `/brand/ttjs-mark.png`                                               | B              | Night-only TTJS mark                                                               |
| `/brand/motifs/otd-lion-white.png`                                   | B              | CSS luminance mask                                                                 |
| `/brand/motifs/otd-lion-gold.png`                                    | B              | Color reference only                                                               |
| `/brand/motifs/otd-star-white.png`                                   | B              | No-image History mark                                                              |
| JOM primary white/gold JPEG used by `BrandLogo`                      | B              | Night/black surfaces only                                                          |
| Founder pack photography (Meyer + Isaac, tefillin, Jerusalem, flags) | C              | Files are **not** in this worktree. Do not publish from memory or external copies. |
| Host photos cited in `docs/PODCAST_ARCHIVE.md`                       | C              | Missing rights ledger                                                              |
| Israeli-flag photographs in the founder pack                         | D / do not use | Founder direction forbids flag fields even if later supplied                       |

This milestone adds no public photography. Humanity on Podcast and About pages
comes from names, type, and the approved mark — not invented portraits.

## Photography

Seven supplied photographs (founder pack; not copied into this worktree):

- Israeli flag bunting in an urban setting — 1024×1024
- Man wearing tefillin and reading — 1024×1024
- Israeli flag against sky — 1024×683
- Two show hosts standing outdoors — 1024×1024
- Israeli flag at a Jerusalem stone site — 683×1024
- Two show hosts seated on Jerusalem steps — 1024×1024
- Israeli flag against blue sky — 1024×576

The imagery is cohesive with the blue, sand, stone, and gold palette. Before
publishing, record creator, copyright holder, license, allowed crops, subject
consent where relevant, and required credit for every image.

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
