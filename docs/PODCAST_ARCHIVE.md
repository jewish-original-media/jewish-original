# Podcast Archive Audit

Audit date: 2026-09-02

## Authoritative source found

The official public podcast feed is:

`https://anchor.fm/s/29786d14/podcast/rss`

Cross-checked against:

- Apple Podcasts collection `id1521741221` (66 episodes, titled Jewish Original Media)
- Spotify show `4zOBjBbKwHzWrwtWKIGC5N`
- Support URL `https://podcasters.spotify.com/pod/show/jewishoriginalmedia/support`
- jewishoriginal.com marketing page (no episode archive)

The feed last-build date observed during this audit was 2026-08-26.

## What the feed contains

- 66 items (user estimate was ~40; the public catalog is larger)
- Original titles, HTML descriptions, publish dates, and enclosure audio URLs
- itunes season / episode numbers where present
- Episode artwork URLs on some items
- Show artwork
- Host names: Meyer Grunberg & Isaac Simon
- Official copy pointing to Instagram and YouTube `@two.tall.jews`

## Source-data quality

- Season and episode numbers are inconsistent. Examples include a season
  value of 63 and repeated “episode 1” labels in season 4.
- The collection title is Jewish Original Media, not The Two Tall Jews Show.
- Some descriptions contain emails and payment details. Those are redacted
  from public/CMS-bound text and retained only in ignored
  `artifacts/podcasts/restricted/`.
- YouTube links inside descriptions are usually guest channels, not TTJS
  episode videos.
- No confirmed TTJS episode YouTube IDs are in the feed.
- No transcripts.
- No reviewed summaries.
- Guest names are prose, not structured records.
- Chapters appear only when the original description includes timestamps.

## Assets in the project / founder files

Found and usable:

- TTJS mark: `JOM Logo Pack/Copy of The two tall jewas-Sin fondo- oscuro (1).png`
  (1080×960, RGBA, black field around a white circular badge). Copied
  unedited to `public/brand/ttjs-mark.png`. Place only on black/night.
- WebP derivative of the same mark.
- `Podcast.png.webp` (1920×1080 website banner). Not used on public pages
  until rights and intended use are confirmed.
- Host photographs in `web photos 2/profile pictures/` (`meyer.jpg`,
  `isaac.jpg`, and others). Rights ledger is missing; not used on public
  pages.

Not found in the repo or founder asset folders:

- Complete private episode spreadsheet or CMS export
- Official YouTube ID list
- Transcripts or caption files
- Per-episode artwork files stored locally
- Audio masters
- Guest headshots with rights

## Import path

1. Fetch the official RSS feed.
2. Preserve the raw XML outside Git in `artifacts/podcasts/restricted/`.
3. Normalize titles, dates, audio URLs, slugs, and source guest names.
4. Redact emails from public descriptions.
5. Flag dirty season numbers, missing episode numbers, description YouTube
   links, trailers, and PII redactions.
6. Dry-run only. Sanity writes stay blocked until founder approval.

Do not treat the old marketing site, ChatGPT images, Getty files, or
unrelated logo pack marks as episode source material.
