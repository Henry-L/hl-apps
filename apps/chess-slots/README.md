# Chess Slots ♟️🎰

A chess-themed slot machine game built with Go.

## Game Rules

- **Starting Balance**: 500 coins
- **Cost per Spin**: 5 coins
- **Winning**: Match 3 or more symbols on the middle payline

## Symbols

### High Value (Chess Pieces)
| Symbol | Name | 3-Match | 4-Match | 5-Match (Jackpot) |
|--------|------|---------|---------|-------------------|
| 👑 | Queen | x100 | x300 | x1000 |
| ♚ | King | x75 | x225 | x750 |
| 🏰 | Rook | x50 | x150 | x500 |
| ⛪ | Bishop | x30 | x90 | x300 |
| 🐴 | Knight | x20 | x60 | x200 |

### Low Value (Royals)
| Symbol | Name | 3-Match | 4-Match | 5-Match |
|--------|------|---------|---------|---------|
| 🅰️ | Ace | x10 | x30 | x100 |
| 🇰 | K | x8 | x24 | x80 |
| 🇶 | Q | x6 | x18 | x60 |
| 🇯 | J | x4 | x12 | x40 |

## Features

- 🎰 5-reel slot machine
- ♟️ Chess-themed symbols
- 💾 Progress saved in browser localStorage
- 🏆 Jackpot animations for 5-of-a-kind
- 📱 Mobile responsive design

## Tech Stack

- **Backend**: Go (Golang)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Storage**: Browser localStorage
- **Deployment**: Cloud Run

## Local Development

```bash
# Run locally
go run main.go

# Open browser
open http://localhost:8080
```

## Deploy to Cloud Run

```bash
gcloud run deploy chess-slots \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Design

- Dark royal theme with gold accents
- Cinzel font for elegant typography
- Smooth spinning animations
- Glowing effects for winning symbols
- Rainbow animation for jackpots

Enjoy the game! 🎰♟️👑

