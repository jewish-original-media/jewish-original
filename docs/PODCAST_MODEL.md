# Podcast Content Model

## Purpose

Podcasts are a first-class Jewish Original content type. An episode is a
durable editorial page, not an embed wrapper. The Two Tall Jews Show is the
first show.

## Documents

### `podcastShow`

Title, slug, tagline, description, host person references, rights-aware
artwork, platform URLs (RSS, Apple, Spotify, YouTube), SEO, workflow, and
read-only source title / provenance.

The public editorial title is **The Two Tall Jews Show**. The official RSS
collection title is **Jewish Original Media**. That source title is stored
and must not silently replace the show identity.

### `podcastEpisode`

Editor groups:

- Episode
- Media
- Guests
- Summary
- Transcript
- Topics
- Related Content
- SEO
- Review
- Advanced

Public-facing fields stay simple. Raw transcripts, source guest strings,
import provenance, and AI suggestions live under Advanced.

## Reused entities

Episodes reference existing `person`, `place`, `topic`, `source`, and
`historyEntry` documents. Do not create a second guest or topic system.

History entries may point back through `relatedPodcastEpisodes`. That field
is editor-approved only. The History article template does not render it in
this milestone.

## Transcripts

| Field | Status | Public |
| ----- | ------ | ------ |
| `rawTranscript` | Unreviewed capture | Never |
| `reviewedTranscript` | Human-reviewed | Yes, when present |
| `summary` | Human-reviewed | Yes, when present |
| `aiSuggestions` | Assist only | Never |

AI may later suggest cleanup, summaries, chapters, topics, or History
links. It must not fabricate quotations or silently alter meaning. Editors
approve every public change.

## Media

Prefer the existing YouTube host. Store a YouTube URL, derive the ID, and
lazy-load a privacy-friendly facade. Do not rehost video. Audio remains the
official enclosure URL. No new paid media service.

## Publication

Sanity draft/published state is the publication authority.
`workflowStatus: ready` is required before publish. Import never publishes.
This milestone does not write Sanity documents.
