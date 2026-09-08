# Integration branch

Status: V1 public shell on History + Jewish Today + Podcast convergence. Do
not merge to the GitHub default branch. Do not deploy production. Do not
publish Sanity content.

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
- `feature/podcasts` (`0d939d3bd45463b79994028487a867b9979792aa`)

## Not merged

- Research branches, including `research/v1-launch-readiness`

Do not rebase this branch onto uncommitted research work.

## Shared-file reconciliation

Integration owns shared surfaces. The Podcast merge kept:

- History’s root layout (no public chrome) so `/admin` stays a Studio shell
- History’s `(site)` chrome for `/`, `/today`, `/history`, `/podcasts`,
  `/about`, `/support`, and `/privacy`
- History + Podcast schema, unified Studio desks, and one draft-mode route
- sitemap Home, Today, History, published History slugs, Support, and
  published Podcast indexes only
- Jewish Today `/today`, Hebcal, homepage composition, and Playwright port
  `3020` / `PLAYWRIGHT_BASE_URL`

Podcast’s old public homepage was not retained. Integration’s homepage
remains the composed page.

## History adapters

Removed. Jewish Today and the homepage use:

- `getOnThisDayHistory`
- `getHistoryIndex`
- `HistoryEntryCard`
- `formatHistoricalDate`

## Podcast public contract

- `/podcasts` degrades to “Podcasts are being prepared.” while no show is
  published
- After founder approval on 2026-09-04, The Two Tall Jews Show and the four
  pilot episodes are published. Integration did not write those documents.
- unpublished show and episode slugs 404
- sitemap includes only published show and episode slugs
- homepage uses the same published-only read, one `EpisodeCard` lead, a
  title rail of additional published episodes, and a route into `/podcasts`
- Selective runtime/test follow-up from Podcast `00fc9b9` only: catalog copy,
  shared `getPublishedPodcastHome()`, and unpublished-slug coverage.
  Publication scripts were not imported.

## Environment variable names

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- `DRAFT_MODE_SECRET` — required to enable History and Podcast draft
  preview; public pages do not use it
- `SANITY_API_WRITE_TOKEN` — local History/Podcast scripts only

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
