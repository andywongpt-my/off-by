# OFF BY v4 — Global Board

## Status

**LIVE**

- Supabase project: `wfjcscoymbqujecenscq`
- Region: Singapore (`ap-southeast-1`)
- Edge Function: `off-by-score`
- Public API: `https://wfjcscoymbqujecenscq.supabase.co/functions/v1/off-by-score`
- Frontend feature flag: enabled

## Behavior

- Every completed run is submitted anonymously when the global board is enabled.
- A random per-browser UUID identifies the device.
- Players may choose a 3–16 character public tag.
- The board keeps the best score per device per date/mode.
- Sprint ranks lower milliseconds first; Daily Five ranks higher score first.
- The UI shows distinct participating devices, not raw attempt count.
- Scores are browser-measured and explicitly labelled as not tamper-proof.
- One Second scores are recomputed server-side from the submitted `actual_ms` value.

## Security

- Browser never receives a Supabase secret/service-role key.
- `anon` and `authenticated` have no direct table privileges.
- `service_role` has only `SELECT` and `INSERT` on `off_by_attempts`.
- RLS is enabled as defense in depth.
- Edge Function is the only public read/write gateway.
- Payload ranges, valid calendar dates, UUIDs, tags, origins, and request rate are validated.
- Raw IP addresses are never stored. A HMAC-SHA-256 request fingerprint is derived inside the Edge Function for rate limiting.
- Edge Function uses `verify_jwt = false` intentionally because this is a public anonymous game endpoint; authorization is enforced by the function's own validation/origin/rate-limit logic.
- `@supabase/supabase-js` is pinned to `2.116.0`.

## Production verification

- Database migrations applied.
- Leaderboard RPC smoke-tested with a temporary score.
- Test data removed after verification.
- Supabase security advisor has no blocking findings.
- Edge Function is ACTIVE.
- GitHub Pages is configured to call the production Edge Function.
