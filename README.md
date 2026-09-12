# OFF BY.

**One second. No clock. Just vibes.**

OFF BY. is a tiny browser timing game. Hold for exactly the target duration without seeing a timer, release when your internal clock says “now,” then see how many milliseconds you were off.

## Live site

https://andywongpt-my.github.io/off-by/

GitHub Pages is deployed from `main` by `.github/workflows/pages.yml`.

## Modes

- **One second** — one attempt at exactly 1,000 ms. This is the default first-run experience.
- **Daily five** — five deterministic daily targets, scored out of 100.

## Current features

- Mobile-first game flow: the game appears before the marketing hero on phones.
- Large touch targets, press-and-hold timing, haptic feedback when supported, iPhone safe-area handling, landscape layout, and reduced-motion support.
- Mobile leaderboard appears directly after the game.
- Local personal bests and Daily streaks.
- X/Twitter challenge links and head-to-head score comparison.
- Copy Result, native share, Rematch, and downloadable score cards.
- Live global leaderboard backed by Supabase.

## Global leaderboard

The production leaderboard is live.

- Region: Singapore (`ap-southeast-1`)
- Edge Function: `off-by-score`
- Public API endpoint: `https://wfjcscoymbqujecenscq.supabase.co/functions/v1/off-by-score`
- `config.js` contains only the public function URL and the leaderboard feature flag.

Leaderboard behavior:

- A random UUID stored in the browser identifies a device.
- Players can choose a 3–16 character public board name.
- Only the best score per device/date/mode is ranked.
- One Second ranks lower millisecond error first.
- Daily Five ranks higher score first.
- One Second score is recomputed server-side from `actual_ms` rather than trusting the submitted score.
- Scores are still **browser-measured and not tamper-proof**; this is a community leaderboard, not an anti-cheat system.

## Security and credentials

No Supabase secret/service-role key, database password, GitHub token, `.env`, or private key is stored in this repository.

- GitHub Actions uses `${{ secrets.SUPABASE_ACCESS_TOKEN }}` and `${{ secrets.SUPABASE_DB_PASSWORD }}` references; the values stay in GitHub Secrets.
- The Supabase project ref and Edge Function URL are public identifiers, not credentials.
- Browser code never receives a Supabase secret/service-role key.
- `anon` and `authenticated` have no direct privileges on `off_by_attempts`.
- `service_role` is restricted to the database privileges required by the Edge Function.
- RLS is enabled as defense in depth.
- The Edge Function validates origins, calendar dates, payload ranges, UUIDs, player tags, and request rate.
- Raw IP addresses are not stored; the backend derives an HMAC-SHA-256 request fingerprint for rate limiting.
- `.gitignore` blocks `.env*`, Supabase local secret files, private-key formats, and common local tooling files.

If a real credential is ever accidentally committed, deleting the file is **not** sufficient: revoke/rotate the credential and rewrite Git history if necessary.

## Repository layout

- `index.html` — main page and game UI.
- `style.css` — base desktop/responsive styling.
- `mobile.css` — v5 mobile-first overrides.
- `app.js` — game logic, Daily Five, sharing, local stats.
- `mobile.js` — touch/haptic/mobile flow enhancements.
- `leaderboard.js` / `leaderboard.css` — global leaderboard client/UI.
- `config.js` — public runtime configuration only.
- `supabase/functions/off-by-score/index.ts` — leaderboard Edge Function.
- `supabase/config.toml` — Edge Function configuration.
- `supabase/migrations/202609120001_off_by_leaderboard.sql` — leaderboard table, indexes, RLS and RPC.
- `supabase/migrations/202609120002_off_by_security_hardening.sql` — leaderboard RPC security hardening.
- `supabase/migrations/202609120003_tighten_off_by_service_role.sql` — least-privilege backend grants.
- `.github/workflows/pages.yml` — GitHub Pages deployment.
- `.github/workflows/deploy-supabase-v4.yml` — manual fallback Supabase deployment workflow.

## Backend deployment

The normal production backend is already deployed. The fallback GitHub Actions workflow expects these repository secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`

Run **Actions → Deploy OFF BY v4 Backend → Run workflow** only when you intentionally want to re-apply migrations/redeploy the Edge Function.

Never place secret/service-role keys, passwords, access tokens, or `.env` files in browser code or commit them to Git.