# Jewish Today convergence handoff

Status: frozen Jewish Today is merged on `feature/integration-homepage`.
Temporary History adapters are still pending History merge. Do not rebase onto
uncommitted History or Podcasts work.

## 1. Jewish Today commit hash

`242945fa6b6d1757aa433517511c2c8b1f009b57`

## 2. Branch name

`feature/jewish-today`

## 3. New Jewish Today-only files

- `docs/JEWISH_TODAY.md`
- `docs/JEWISH_TODAY_CONVERGENCE.md`
- `src/app/today/page.tsx`
- `src/app/today/today.module.css`
- `src/components/today/jewish-today-page.tsx`
- `src/components/today/jewish-today-module.tsx`
- `src/components/today/today-history-card.tsx`
- `src/content/jewish-today/on-this-day.ts`
- `src/features/jewish-today/get-day.ts`
- `src/features/jewish-today/index.ts`
- `src/features/jewish-today/timezone.ts`
- `src/features/jewish-today/types.ts`
- `src/integrations/hebcal/client.ts`
- `src/integrations/hebcal/map-day.ts`
- `src/integrations/hebcal/types.ts`
- `src/lib/jewish-today/display.ts`
- `tests/fixtures/hebcal/*.json`
- `tests/jewish-today-*.test.ts`
- `tests/today.spec.ts`

## 4. Shared files modified

- `.env.example`
- `docs/ARCHITECTURE.md`
- `docs/CONTENT_MODEL.md`
- `docs/DECISIONS.md`
- `docs/ROADMAP.md`
- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `src/app/sitemap.ts`

Jewish Today did not change History article templates, `globals.css` History
classes, Sanity schemas, or `/history` routes.

## 5. Likely merge conflicts

History and Podcasts also edit several of the shared files above, especially
`.env.example`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`,
`package.json` / lockfile, `playwright.config.ts`, and `src/app/sitemap.ts`.

## 6. Temporary History adapters to replace

On controlled merge review, replace:

1. `fetchOnThisDayHistory` with History’s `getOnThisDayHistory`
2. `TodayHistoryCard` with `HistoryEntryCard` `variant="archive"`
3. `formatOnThisDayDate` with `formatHistoricalDate`

## 7. Required environment variable names

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`

Optional local review only, never production:

- `JEWISH_TODAY_ALLOW_PREVIEWS`

## 8. Sanity private-dataset read requirement

The development dataset is private. Published History reads need
`SANITY_API_READ_TOKEN`. Jewish Today only reads published `historyEntry`
documents. It does not write to Sanity. Without the token, on-this-day
matching returns empty rather than failing the page.

## 9. History route dependency

Cards link to `/history/[slug]`. That route does not exist in this isolated
worktree, so the Dachau card 404s until History routes are merged.

## 10. Tests that must pass after convergence

- `npm run test:jewish-today`
- `npx playwright test tests/today.spec.ts`
- `npx playwright test tests/shell.spec.ts`
- History’s existing History/Studio Playwright suite
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`

Confirm after History merge:

- `/today?date=2026-04-29` still retrieves published Dachau
- unmatched dates do not fabricate History
- unpublished related History cannot leak
- Hebcal failure still degrades without raw errors
- Dachau card opens the real History article
- homepage continues to use one `getJewishToday()` result and does not grow a
  second History card system

The Integration homepage is now composed. History and Podcasts remain reserved
slots until those branches are frozen. See `docs/HOMEPAGE.md`.
