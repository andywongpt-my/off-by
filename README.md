# OFF BY.

**One second. No clock. Just vibes.**

OFF BY. is a tiny browser timing game: hold the button for the target duration without seeing a timer, then find out how many milliseconds you were off.

## Modes

- **One second** — one attempt at exactly 1,000 ms.
- **Daily five** — five deterministic daily targets, scored out of 100.

The game also includes local personal bests, X challenge links, challenge-result comparison, and downloadable score cards. No account, backend, database, package install, or API key is required.

## GitHub Pages

This repository is prepared to publish from the `main` branch at:

https://andywongpt-my.github.io/off-by/

In GitHub, open **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, then save.

## Files

- `index.html` — self-contained playable game.
- `.nojekyll` — tells GitHub Pages to serve the static files directly.

## Notes

Scores are stored locally in the player's browser. Challenge scores are encoded in the shared URL and are self-reported; there is no server-verified global leaderboard.
