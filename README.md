# Cozy Sudoku

One classic sudoku a day, with themes you can switch between: Cocoa, Pastel, Christmas, Thanksgiving, Halloween, Winter, Valentine, Garden, Seaside, Midnight and Newsprint. The Seasonal option changes the theme with the calendar.

- Everyone gets the same puzzle on the same date, and a new one arrives at midnight.
- Puzzles are generated from the date on the phone itself, so they never run out and there is no server to keep running.
- Monday and Tuesday are gentle, midweek and Sunday are classic, Friday and Saturday are tricky. Every puzzle has one solution and can be solved by logic alone.
- Notes, undo, hints, optional mistake marking, a timer, streaks and a shareable result.
- Installs to the home screen and works offline.

## Put it online

The app is plain files with no build step, so GitHub Pages can host it for free:

1. Open the repository on GitHub and go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Pick the branch that holds these files, keep the folder as **/ (root)**, and press **Save**.

A minute or two later the game is live at `https://sheetghostdev.github.io/Sudoku/`. Send that link to friends.

## Add it to a phone

- **iPhone:** open the link in Safari, tap Share, then **Add to Home Screen**.
- **Android:** open the link in Chrome, tap the menu, then **Add to Home screen** or **Install app**.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole game: layout, themes, puzzle generator and play logic |
| `sw.js` | Offline caching |
| `manifest.webmanifest`, `icons/` | Home screen name and icons |
| `test/engine.test.js` | Checks the generator: `node test/engine.test.js` |

The puzzle generator is deterministic. Editing it changes every future puzzle, and `test/pinned.txt` exists to catch that by accident.
