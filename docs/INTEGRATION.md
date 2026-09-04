# Integration branch

Status: first Integration milestone. Do not merge to the GitHub default branch.
Do not deploy production. Do not publish Sanity content.

## Branch and worktree

- Branch: `feature/integration-homepage`
- Worktree: `/Users/andy.katz/Desktop/Jewish Original Dev-integration`
- Base branch: local `main`
- Base commit: `7b0ed788c80f50f18f768dbc91e6c93a6107bf0e`
  (`Establish trusted editorial foundation`)

GitHub’s default branch is currently `milestone-1-sanity-history`. That was
verified and was not changed. Local `main` is not on GitHub.

## Why this base

All three feature streams share `7b0ed78`.

- Jewish Today branched from `main` and is frozen at `1ec3c87`.
- History has two later commits plus uncommitted work.
- Podcasts branched from History’s first-article checkpoint `e9bfd59` and has
  uncommitted work.

Using History or Podcasts as the Integration base would pull unfinished work.
Using `main` lets Jewish Today merge cleanly and keeps History and Podcasts
isolated until they are frozen.

## Merged in this milestone

`feature/jewish-today` (`1ec3c87`), including checkpoint `242945f`.

There were no merge conflicts. Shared files took Jewish Today’s additive
changes on top of the foundation. History and Podcast planning already present
on `main` remains in `docs/ROADMAP.md`, `docs/CONTENT_MODEL.md`, and
`docs/ARCHITECTURE.md`.

## Not merged

- `milestone-1-sanity-history`
- `feature/podcasts`

Do not rebase this branch onto uncommitted History or Podcast worktrees.

## Temporary History adapters

Still pending History merge, marked in source:

- `fetchOnThisDayHistory`
- `TodayHistoryCard`
- `formatOnThisDayDate`
- `HISTORY_ADAPTER_STATUS = "pending-history-merge"`

## Environment variable names

Used or documented on this branch:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`

Optional local review only, never production:

- `JEWISH_TODAY_ALLOW_PREVIEWS`

Required when History preview is later merged, not wired here:

- `DRAFT_MODE_SECRET`

Do not commit values.

Playwright defaults to port 3020. Set `PLAYWRIGHT_BASE_URL` when another
worktree already occupies that port. Local runs may reuse an existing
Integration server; CI always starts its own.

## Vercel

Vercel Git integration is configured for
`jewish-original-media/jewish-original`. This branch should create a Preview
Deployment only. Production and `jewishoriginal.com` must not be changed from
this workstream.
