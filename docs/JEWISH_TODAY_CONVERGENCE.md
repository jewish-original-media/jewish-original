# Jewish Today convergence handoff

Status: frozen Jewish Today and frozen History are merged on
`feature/integration-homepage`. Temporary History adapters are removed.

## 1. Jewish Today commit hash

`242945fa6b6d1757aa433517511c2c8b1f009b57`

## 2. History commit hash

`35392110091b2de0a15ea6a3695ad24bd92f0170`

## 3. Canonical replacements completed

1. `fetchOnThisDayHistory` → History `getOnThisDayHistory`
2. `TodayHistoryCard` → `HistoryEntryCard` `variant="archive"`
3. `formatOnThisDayDate` → `formatHistoricalDate`

Deleted:

- `src/components/today/today-history-card.tsx`
- `src/content/jewish-today/on-this-day.ts`

## 4. Required environment variable names

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- `DRAFT_MODE_SECRET` for authenticated History draft preview only

Optional local review only, never production:

- `JEWISH_TODAY_ALLOW_PREVIEWS`

## 5. Tests that must keep passing

- `npm run test:jewish-today`
- `npm run test:homepage`
- `npm run test:history-body`
- `npx playwright test tests/today.spec.ts`
- `npx playwright test tests/home.spec.ts`
- `npx playwright test tests/history.spec.ts`
- `npx playwright test tests/shell.spec.ts`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`

Confirm:

- `/today?date=2026-04-29` retrieves published Dachau
- unmatched dates do not fabricate History
- unpublished related History cannot leak
- Hebcal failure still degrades without raw errors
- Dachau card opens `/history/us-liberates-dachau`
- homepage uses one `getJewishToday()` result plus one `getHistoryIndex()`
  read
