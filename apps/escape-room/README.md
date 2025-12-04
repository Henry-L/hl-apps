# 🔐 Escape Room

A 2-player cooperative escape room game where communication is key!

## How to Play

1. **Create a Room** - One player creates a room and gets a 6-character code
2. **Share the Code** - Give the code to your partner
3. **Pick Roles** - Player 1 (Investigator) and Player 2 (Operator)
4. **Communicate!** - Each player sees different information
5. **Solve Together** - Share clues verbally to solve puzzles

## The Rules

- **Don't show your screen** to the other player!
- Player 1 sees clues and documents
- Player 2 operates locks and inputs answers
- You must describe what you see to each other

## Puzzles

1. **The Locked Safe** - Decode symbols to unlock a combination
2. **The Color Wires** - Cut wires in the correct order
3. **The Map Coordinates** - Calculate the right position
4. **The Clock Puzzle** - Set the correct time

## Tech Stack

- TypeScript + Express
- Ant Design-inspired UI
- In-memory game state

## Local Development

```bash
npm install
npm run dev
```

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

