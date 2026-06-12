# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mobile-first React SPA showing FIFA World Cup 2026 live scores, group standings and the knockout bracket. Client-only — data comes straight from the free `https://worldcup26.ir` API (CORS open, no auth, no backend). Lives for the tournament (June 11 – July 19, 2026); keep changes lean accordingly.

## Commands

- `npx vitest run` — unit tests (cover the API normalization layer; UI is verified by running the app)
- `npm run dev` / `npm run build` / `npx eslint src`

## Upstream API quirks (do not "fix" these by trusting the API)

All handling lives in `src/api/normalize.ts` and `src/api/timezone.ts` — keep defensive parsing there, never in components:

- Every field value is a string, including scores and booleans (`finished: "TRUE"`)
- Scorer lists arrive with inconsistent quoting (curly `“”` vs straight `"` vs literal `"null"`)
- `/get/groups` sometimes leaves `mp` at 0 while w/d/l/pts update → played is derived as `max(mp, w+d+l)`
- `local_date` is **stadium-local wall time** with no timezone info; `timezone.ts` maps the 16 stadium ids to IANA zones and converts to UTC instants. UI renders in the browser's timezone.
- Unresolved KO matches have `home_team_id: "0"` plus a `home_team_label` placeholder ("Winner Group E")

Changes to the data layer follow TDD — tests in `src/api/*.test.ts` use real captured API samples.

## Conventions

- **i18n**: every user-visible string goes in `src/i18n/strings.ts` (EN + DE). Team names are localized via `Intl.DisplayNames` with the team's `iso2` (falls back to `name_en`, e.g. Scotland's "SCO" never resolves). No hardcoded UI text in components.
- **No service worker** — deliberate. Stale-bundle risk outweighs offline benefit for this app's lifespan. Don't add one; the PWA install support (manifest + `InstallBanner`) works without it.
- **Routing**: HashRouter, required for GitHub Pages. Vite `base` is `/wm2026/` — must match the repo name.
- Polling cadence lives in `src/hooks/useWorldCupData.ts` (30 s while a match is live, otherwise 5 min) — keep the API load-friendly.

## Deploy

Push to `main` → GitHub Actions tests, builds, and deploys to GitHub Pages (https://benharten.github.io/wm2026/). No manual deploy step.
