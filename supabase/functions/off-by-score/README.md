# OFF BY score function

Deploy with JWT verification disabled because this is a public anonymous game endpoint.
The function itself enforces origin checks, validation, range checks, and an IP-hash rate limit.

Required secret:
- `OFFBY_HASH_SALT`: a long random value.

Built-in Supabase function secrets used:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

After deployment, put the public function URL in `/config.js` and set `leaderboardEnabled: true`.
