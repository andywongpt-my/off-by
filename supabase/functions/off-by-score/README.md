# OFF BY score function

Public anonymous endpoint for the OFF BY global leaderboard.

Deployment requirements:
- Deploy with JWT verification disabled (`verify_jwt = false`).
- The function performs its own Origin checks, validation, server-side sprint score calculation, and IP-HMAC rate limiting.
- It uses Supabase's built-in `SUPABASE_SECRET_KEYS` (with legacy fallback) inside the Edge Function. No service/secret key is exposed to the browser.

Built-in Supabase environment values used:
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEYS` (preferred)
- `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (fallback only)

Public endpoint:
`https://<project-ref>.supabase.co/functions/v1/off-by-score`
