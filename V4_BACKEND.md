# OFF BY v4 — Global Board

The GitHub Pages front end remains fully playable without the backend.

When the Supabase backend is enabled:
- Every completed run is submitted anonymously.
- A random per-browser UUID identifies the device.
- Players may choose a 3–16 character public tag.
- The board keeps the best score per device per date/mode.
- Sprint ranks lower milliseconds first; Daily Five ranks higher score first.
- The UI shows distinct participating devices, not raw attempt count.
- Scores are browser-measured and explicitly labelled as not tamper-proof.

Security:
- Browser never receives the Supabase service-role key.
- Table RLS is enabled with no anonymous table access.
- Edge Function is the only write/read gateway.
- Payload ranges, UUIDs, tags, origins, and request rate are validated.
- IPs are only stored as salted SHA-256 fingerprints for rate limiting.
