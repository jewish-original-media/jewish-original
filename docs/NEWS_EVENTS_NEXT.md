# Next milestone: News and Events ingestion

Status: architecture implemented on Integration. No live News/Event records.

The founder wants both desks in V1 if the automation can stay sufficiently
hands-off. `/news` and `/events` exist. Homepage slots still hide while empty.
Ingest writes are blocked until AI Gateway and founder write authorization.

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

Current empty sequence remains frozen:

Masthead → Today → History → Manifesto → Podcasts → Support

When real News and Events exist:

Masthead → Today → History → What We’re Following → Podcast → Upcoming Events
→ Manifesto / Support

Originals stay hidden.

See `docs/NEWS_EVENTS.md` and `docs/specs/NEWS_EVENTS_AUTOMATION_PLAN.md`.
