# Integration branch

Status: History + Jewish Today convergence. Do not merge to the GitHub default
branch. Do not deploy production. Do not publish Sanity content.

## Branch and worktree

- Branch: `feature/integration-homepage`
- Worktree: `/Users/andy.katz/Desktop/Jewish Original Dev-integration`
- Base branch: local `main`
- Base commit: `7b0ed788c80f50f18f768dbc91e6c93a6107bf0e`
  (`Establish trusted editorial foundation`)

GitHub’s default branch is currently `milestone-1-sanity-history`. That was
verified and was not changed. Local `main` is not on GitHub.

## Merged in this stream

- `feature/jewish-today` (`1ec3c87`), including checkpoint `242945f`
- `milestone-1-sanity-history` (`35392110091b2de0a15ea6a3695ad24bd92f0170`)

## Not merged

- `feature/podcasts`

Do not rebase this branch onto uncommitted Podcast work.

## Shared-file reconciliation

Integration owns shared surfaces. The History merge kept:

- History’s root layout (no public chrome) so `/admin` stays a Studio shell
- History’s `(site)` chrome for `/`, `/today`, `/history`, and `/support`
- History Sanity, draft-mode, sitemap History slugs, and published archive
- Jewish Today `/today`, Hebcal, homepage composition, and Playwright port
  `3020` / `PLAYWRIGHT_BASE_URL`

History’s old `(site)/page.tsx` homepage was not retained. Integration’s
homepage remains the composed page.

## History adapters

Removed. Jewish Today and the homepage use:

- `getOnThisDayHistory`
- `getHistoryIndex`
- `HistoryEntryCard`
- `formatHistoricalDate`

## Environment variable names

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- `DRAFT_MODE_SECRET` — required to enable History draft preview; public
  pages do not use it
- `SANITY_API_WRITE_TOKEN` — local History scripts only

Optional local review only, never production:

- `JEWISH_TODAY_ALLOW_PREVIEWS`

Do not commit values.

Playwright defaults to port 3020. Set `PLAYWRIGHT_BASE_URL` when another
worktree already occupies that port. Local runs may reuse an existing
Integration server; CI always starts its own.

## Vercel

Vercel Git integration is configured for
`jewish-original-media/jewish-original` on the Jewish Original team. This
branch should create a Preview Deployment only. Production and
`jewishoriginal.com` must not be changed from this workstream.
