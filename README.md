# WM 2026 — World Cup Live

Mobile-first web app for following the FIFA World Cup 2026: live scores, results, group standings and the knockout bracket.

Data: free [World Cup 2026 API](https://github.com/rezarahiminia/worldcup2026) (`worldcup26.ir`) — fetched directly from the browser, no backend needed.

## Features

- **Matches** — all 104 games grouped by day, auto-scrolled to today; live games with pulsing minute indicator; tap a match for goal scorers and stadium
- **Groups** — all 12 group tables, sorted by points / goal difference / goals
- **Bracket** — knockout tree from Round of 32 to the Final, with placeholder slots until rounds resolve
- **EN / DE** language toggle (team names localized via `Intl.DisplayNames`)
- Smart polling: refetches every 30 s only while a match is live and the tab is visible

## Development

```sh
npm install
npm run dev        # dev server
npx vitest run     # unit tests (API response normalization)
npm run build      # production build to dist/
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which tests, builds and deploys to GitHub Pages. One-time setup in the repo: **Settings → Pages → Source: GitHub Actions**.

The Vite `base` is set to `/wm2026/` — adjust in `vite.config.ts` if the repository name differs.

## Notes on the upstream API

- All field values arrive as strings; `src/api/normalize.ts` converts and sanitizes them (including the inconsistently quoted scorer lists)
- The API sometimes leaves `mp` (matches played) at 0 while updating W/D/L — the app derives played from W+D+L as a fallback
