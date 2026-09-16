# 🔐 Escape Room

A 2-player cooperative puzzle game where communication is the whole game.

Designed for couch co-op: two people, two devices, same room. There are no room
codes and no accounts — each player just opens their own page.

## How to Play

1. **Open the app** — one player goes to `/play/1`, the other to `/play/2`
2. **Don't show your screen** to the other player
3. **Talk** — each player holds clues that unlock the *other* player's puzzles
4. **Solve all your puzzles** to escape

## Game Design

Each player sees a shuffled mix of three kinds of items:

- **Puzzles** — have an input box and an answer. 2 per player.
- **Clues** — no input; they contain the information needed to solve a puzzle,
  usually the *other* player's.
- **Red herrings** — plausible-looking items that lead nowhere.

Nothing is labeled, so working out which clue belongs to which puzzle is part of
the challenge.

### Progression

Solving a puzzle unlocks new items for that player — more clues, a second puzzle,
and more herrings. Newly unlocked items are highlighted and animated on arrival.

| Player | Puzzles | Unlocks |
|--------|---------|---------|
| Player 1 | 🔐 Heavy Safe → 🕰️ Ornate Clock | Safe unlocks the map clue, the clock, and a herring |
| Player 2 | ✂️ Tangled Wires → 📍 Coordinate Lock | Wires unlock the diary clue, the coordinate lock, and a herring |

A player wins when both of their own puzzles are solved.

## Architecture

The server is **completely stateless** — it only renders HTML. All game state
(which puzzles are solved, which items have been seen) lives in each player's
`localStorage`, so the two players never share a backend session.

```
src/
├── index.ts              # Express routes only
├── data/items.ts         # Puzzles, clues, herrings and answers
└── templates/
    ├── landing.ts        # Player select screen
    ├── player.ts         # Game board + client-side game logic
    └── styles.ts         # Shared CSS
```

Puzzle content and answers live entirely in `src/data/items.ts` — edit that file to
change the game. Note that answers are shipped to the client in the page, so this
is built on the honor system.

## Tech Stack

- TypeScript + Express
- Ant Design-inspired UI (see [../../docs/design-guide.md](../../docs/design-guide.md))
- No database, no server state

## Routes

- `GET /` — player select
- `GET /play/1`, `GET /play/2` — game boards
- `GET /health` — health check

Each is also registered under `/apps/escape-room/…` for the Firebase Hosting proxy.

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:8080.

To reset progress, clear the `escapeRoom_solved_p1` / `escapeRoom_solved_p2` keys
from `localStorage` (or just use a private window).

## Deploy

```bash
gcloud run deploy escape-room \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

## Design

- Grayscale palette with blue accent
- Clean, minimal UI
- Emoji icons for visual interest
- Mobile responsive
