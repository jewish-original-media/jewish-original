# Next milestone: News and Events ingestion

Status: specified, not implemented.

The founder wants both desks in V1 if the automation can stay sufficiently
hands-off. This milestone records the decision. It does not ingest feeds, add
homepage placeholders, or invent items.

## News

Almost entirely automated.

1. Trusted Jewish RSS/API sources
2. Normalize
3. Dedupe
4. Relevance filter
5. Topic / desk classification
6. Short AI-written JOM context
7. Outbound link to the original publisher

Jewish Original does **not** republish publisher articles.

The content model is the curated news item in `docs/CONTENT_MODEL.md`:
publisher reference, original headline, canonical source URL, publication date,
editorial summary, category/topics, legally usable media, selection note,
expiration, and status.

## Events

Similar low-maintenance ingestion from trustworthy structured sources:

- ICS
- official calendars
- partner feeds
- appropriate APIs

Manual override and entry remain available. Automation does the daily work.
Human intervention is exception-based.

The content model is the Event document in `docs/CONTENT_MODEL.md`.

## Homepage

Do not add News or Events sections until real items exist.

Current sequence:

Masthead → Today → History → Manifesto → Podcasts → Support

Likely later sequence, judged only after real content exists:

Masthead → Today → History → Originals → What We’re Following → Podcast →
Upcoming Events → Manifesto / Support

## Out of scope until this next milestone

- News ingestion
- Events ingestion
- homepage News/Event placeholders
- publisher article republication
