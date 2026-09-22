# Next News and Events work

Four published News items remain in Sanity. They are older than the
homepage 7-day freshness window, so homepage News is hidden until at
least three reviewed items with current `sourcePublishedAt` exist. `/news`
still shows the four cards until 2026-09-24 (14-day index / `expiresAt`).

News stays out of primary nav until at least 5 strong items and 3
publishers. Do not lower that gate. Events stay off Home, nav, and sitemap.

Do not expand the source allowlist in this stream. Do not add manual Event
filler for launch symmetry. Do not enable cron or ingest writes from
Integration.

See `docs/NEWS_EVENTS.md` and `docs/launch-readiness/V1.md`.
