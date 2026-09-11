# Next milestone: News and Events first live inventory

Status: persistence is implemented on Integration. First live publication
runs only when Preview Gateway, write token, and `INGEST_WRITES_ENABLED=1`
are present.

Homepage News appears only with at least 3 published items. Homepage Events
appear only when upcoming inventory has at least two organizers and two
geography buckets. News nav requires 5 items and 3 publishers.

See `docs/NEWS_EVENTS.md` and `docs/specs/NEWS_EVENTS_AUTOMATION_PLAN.md`.
