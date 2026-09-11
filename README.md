# OFF BY.

**One second. No clock. Just vibes.**

OFF BY. is a tiny browser timing game: hold the button for the target duration without seeing a timer, then find out how many milliseconds you were off.

## Live site

https://andywongpt-my.github.io/off-by/

GitHub Pages is deployed through `.github/workflows/pages.yml`.

## Modes

- **One second** — one attempt at exactly 1,000 ms. This is the default first-run experience.
- **Daily five** — five deterministic daily targets, scored out of 100.

The game includes local personal bests, Daily streaks, X challenge links, head-to-head challenge comparison, Copy Result, Rematch, native sharing, and downloadable score cards.

## v4 global leaderboard

The repository now contains the complete v4 leaderboard implementation, but the production leaderboard is intentionally feature-flagged off until the Supabase backend is deployed.

Frontend:
- `config.js` — runtime feature flag and public Edge Function URL.
- `leaderboard.js` — anonymous device identity, score submit/read, player tags, board rendering.
- `leaderboard.css` — leaderboard UI.

Backend:
- `supabase/migrations/202609120001_off_by_leaderboard.sql` — table, indexes, RLS and leaderboard RPC.
- `supabase/functions/off-by-score/index.ts` — public score API with Origin checks, validation, rate limiting and hashed request fingerprints.
- `supabase/config.toml` — explicitly sets `verify_jwt = false` for the public score function.
- `.github/workflows/deploy-supabase-v4.yml` — manual CI deployment path for migrations + Edge Function + automatic frontend enablement.

The leaderboard is described as **browser-measured, not tamper-proof**. The Edge Function recomputes One Second scores from the submitted timing instead of trusting the submitted score value.

## Backend deployment

The preferred deployment path is the connected Supabase integration. A GitHub Actions fallback is also included.

For the fallback workflow, add these repository secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

Then run **Actions → Deploy OFF BY v4 Backend → Run workflow**. The workflow will:

1. Link the Supabase project.
2. Apply database migrations.
3. Generate and set a fresh `OFFBY_HASH_SALT`.
4. Deploy `off-by-score`.
5. Update `config.js` with the public function URL and enable the leaderboard.
6. Push that config change, which triggers the normal GitHub Pages deployment.

Never place a Supabase secret/service-role key in browser code or `config.js`.

## Current production state

The game is live and functional. `config.js` currently keeps `leaderboardEnabled: false` until the backend deployment succeeds, so the unfinished global board never appears to players.
