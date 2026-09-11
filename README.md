# OFF BY.

**One second. No clock. Just vibes.**

OFF BY. is a tiny browser timing game: hold the button for the target duration without seeing a timer, then find out how many milliseconds you were off.

## Live site

https://andywongpt-my.github.io/off-by/

GitHub Pages is deployed through `.github/workflows/pages.yml`.

## Modes

- **One second** — one attempt at exactly 1,000 ms. This is the default first-run experience.
- **Daily five** — five deterministic daily targets, scored out of 100.

The game includes local personal bests, Daily streaks, X challenge links, head-to-head challenge comparison, Copy Result, Rematch, native sharing, downloadable score cards, and a global leaderboard.

## v4 global leaderboard — LIVE

Production backend:

- Supabase project: `wfjcscoymbqujecenscq`
- Region: `ap-southeast-1` (Singapore)
- Public Edge Function: `https://wfjcscoymbqujecenscq.supabase.co/functions/v1/off-by-score`
- `config.js`: `leaderboardEnabled: true`

Frontend:
- `config.js` — runtime feature flag and public Edge Function URL.
- `leaderboard.js` — anonymous device identity, score submit/read, player tags, board rendering.
- `leaderboard.css` — leaderboard UI.

Backend:
- `supabase/migrations/202609120001_off_by_leaderboard.sql` — table, indexes, RLS and leaderboard RPC.
- `supabase/migrations/202609120002_tighten_off_by_service_role.sql` — least-privilege Data API grants for the backend role.
- `supabase/functions/off-by-score/index.ts` — public score API with Origin checks, validation, rate limiting and HMAC request fingerprints.
- `supabase/config.toml` — explicitly sets `verify_jwt = false` for this intentionally public anonymous endpoint.
- `.github/workflows/deploy-supabase-v4.yml` — manual fallback deployment path bound to the production project.

The leaderboard is explicitly described as **browser-measured, not tamper-proof**. One Second scores are recomputed server-side from `actual_ms` instead of trusting the submitted score value.

## Security model

- No Supabase secret/service-role key is exposed to browser code.
- `anon` and `authenticated` have no direct privileges on `off_by_attempts`.
- `service_role` is restricted to `SELECT` and `INSERT` on the leaderboard table.
- RLS is enabled as defense in depth.
- The Edge Function is the only public read/write gateway.
- Payload ranges, dates, UUIDs, tags, origins, and request rate are validated.
- Request fingerprints are HMAC-SHA-256 values derived from request IPs using the backend secret key; raw IPs are not stored.
- `@supabase/supabase-js` is pinned to `2.116.0` in the Edge Function.

## Verification

Production database verification completed:

- Migration applied successfully.
- Security advisor shows no blocking findings.
- ACL verified: only `service_role` has `SELECT`/`INSERT` among application roles.
- Smoke-test score entered the leaderboard correctly and was removed afterward.
- Edge Function is deployed and ACTIVE with `verify_jwt=false`.

## Fallback backend deployment

The connected Supabase integration is the preferred deployment path.

For the GitHub Actions fallback, add these repository secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`

Then run **Actions → Deploy OFF BY v4 Backend → Run workflow**. The workflow is pinned to the production project ref and will apply migrations, deploy the Edge Function, and keep `config.js` pointed at the live backend.

Never place a Supabase secret/service-role key in browser code or `config.js`.
