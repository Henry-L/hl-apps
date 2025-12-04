import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Simple in-memory game state (shared between both players on same device/session)
// In a real couch co-op, players just communicate verbally - no sync needed!

// Puzzle definitions - each has info split between players
const PUZZLES = [
  {
    id: 1,
    name: "The Locked Safe",
    description: "A heavy safe blocks your escape. The combination is hidden...",
    player1Info: {
      title: "🔍 Torn Note Fragment",
      content: "You found a torn piece of paper with symbols:\n\n▲ = 7\n● = 3\n■ = 9",
      hint: "Tell Player 2 what each symbol means!"
    },
    player2Info: {
      title: "🔐 Safe Keypad",
      content: "The safe has a 4-digit code.\n\nAbove the keypad you see:\n● ▲ ■ ▲",
      hint: "Ask Player 1 what the symbols mean, then enter the code!",
      answer: "3797"
    }
  },
  {
    id: 2,
    name: "The Color Wires",
    description: "A tangle of wires blocks the door mechanism...",
    player1Info: {
      title: "📋 Maintenance Manual",
      content: "WIRE CUTTING ORDER:\n\n1. Cut the wire that rhymes with 'bed'\n2. Cut the wire matching the sky\n3. Cut the wire of warning signs\n4. Cut the wire of fresh grass",
      hint: "Describe the order to Player 2 using colors!"
    },
    player2Info: {
      title: "✂️ Wire Panel",
      content: "You see 4 colored wires:\n\n🔴 RED\n🔵 BLUE\n🟡 YELLOW\n🟢 GREEN\n\nEnter the colors in order, separated by commas.",
      hint: "Ask Player 1 for the cutting order!",
      answer: "RED,BLUE,YELLOW,GREEN"
    }
  },
  {
    id: 3,
    name: "The Map Coordinates",
    description: "A locked cabinet contains the exit key...",
    player1Info: {
      title: "🗺️ Treasure Map",
      content: "The map shows a grid with an X at:\n\nRow C, Column 4\n\nA note says:\n'Add 2 to the row letter,\nsubtract 1 from the column'",
      hint: "Calculate the final position and tell Player 2!"
    },
    player2Info: {
      title: "📍 Coordinate Lock",
      content: "The lock has a grid selector:\n\n     1  2  3  4  5\n A   ·  ·  ·  ·  ·\n B   ·  ·  ·  ·  ·\n C   ·  ·  ·  ·  ·\n D   ·  ·  ·  ·  ·\n E   ·  ·  ·  ·  ·\n\nEnter as: E3, A1, etc.",
      hint: "Ask Player 1 for the coordinates!",
      answer: "E3"
    }
  },
  {
    id: 4,
    name: "The Clock Puzzle",
    description: "An ancient clock holds the final secret...",
    player1Info: {
      title: "📜 Old Journal",
      content: "Entry dated 1923:\n\n'The clock shows the hour when\nthe hour hand points to where\nthe sun sets (West on compass),\n\nand the minute hand points to\nthe number of seasons.'",
      hint: "West = 9 on a clock face, Seasons = 4 (so :20). Tell Player 2!"
    },
    player2Info: {
      title: "🕰️ Grandfather Clock",
      content: "The clock hands can be set to any position.\n\nEnter the time in format: H:MM\n(like 3:45 or 12:00)",
      hint: "Ask Player 1 what time to set!",
      answer: "9:20"
    }
  }
];

// CSS following design guide - grayscale with color pops
const STYLES = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  :root {
    --black: #000000;
    --gray-900: #1f1f1f;
    --gray-700: #434343;
    --gray-500: #8c8c8c;
    --gray-300: #d9d9d9;
    --gray-100: #f5f5f5;
    --white: #ffffff;
    --primary: #1677ff;
    --success: #52c41a;
    --error: #ff4d4f;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--gray-100);
    min-height: 100vh;
    color: var(--gray-900);
    line-height: 1.6;
  }
  
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 24px;
  }
  
  .card {
    background: var(--white);
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    margin-bottom: 16px;
  }
  
  h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  h2 { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
  h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--gray-700); }
  
  .subtitle { color: var(--gray-500); margin-bottom: 24px; }
  
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-family: inherit;
    text-decoration: none;
  }
  
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { background: #4096ff; }
  .btn-default { background: var(--white); border: 1px solid var(--gray-300); color: var(--gray-700); }
  .btn-default:hover { border-color: var(--primary); color: var(--primary); }
  .btn-success { background: var(--success); color: white; }
  .btn-block { width: 100%; }
  .btn-lg { padding: 16px 32px; font-size: 18px; }
  
  .player-select {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin: 24px 0;
  }
  
  .player-card {
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid var(--gray-300);
  }
  
  .player-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  .player-card .icon { font-size: 40px; margin-bottom: 12px; }
  
  .input {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    font-family: inherit;
  }
  
  .input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
  }
  
  .info-box {
    background: var(--gray-100);
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    padding: 16px;
    margin: 16px 0;
  }
  
  .info-box.blue { background: #e6f4ff; border-color: #91caff; }
  .info-box.yellow { background: #fffbe6; border-color: #ffe58f; }
  
  .content-box {
    background: var(--white);
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    padding: 20px;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    font-size: 16px;
    line-height: 1.8;
    margin: 12px 0;
  }
  
  .hint { color: var(--gray-500); font-size: 14px; margin-top: 12px; }
  
  .badge {
    display: inline-block;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
    margin-right: 8px;
  }
  
  .badge-blue { background: #e6f4ff; color: var(--primary); }
  .badge-green { background: #f6ffed; color: var(--success); }
  
  .message {
    padding: 12px 16px;
    border-radius: 6px;
    margin: 16px 0;
  }
  
  .message.success { background: #f6ffed; border: 1px solid #b7eb8f; color: #389e0d; }
  .message.error { background: #fff2f0; border: 1px solid #ffccc7; color: #cf1322; }
  
  .nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  
  .progress { display: flex; gap: 6px; margin: 16px 0; }
  .progress-dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    background: var(--gray-300);
  }
  .progress-dot.done { background: var(--success); }
  .progress-dot.current { background: var(--primary); }
  
  .victory { text-align: center; padding: 48px 24px; }
  .victory h1 { font-size: 48px; margin-bottom: 16px; }
  
  @media (max-width: 500px) {
    .player-select { grid-template-columns: 1fr; }
    .container { padding: 16px; }
  }
</style>
`;

// Landing page
const landingHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="https://hl-apps.web.app/favicon.svg">
  <title>🔐 Escape Room</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card" style="text-align: center;">
      <h1>🔐 Escape Room</h1>
      <p class="subtitle">A 2-player cooperative puzzle game</p>
      
      <div class="info-box blue" style="text-align: left;">
        <h3>📋 How to Play</h3>
        <p style="margin-top: 8px;">
          • Grab a friend and sit together<br>
          • Each player opens a different screen<br>
          • You each see <strong>different clues</strong><br>
          • <strong>Talk to each other</strong> to solve puzzles!<br>
          • Don't peek at each other's screens! 👀
        </p>
      </div>
      
      <div class="player-select">
        <a href="/play/1" class="card player-card" style="text-decoration: none; color: inherit;">
          <div class="icon">🔍</div>
          <h3 style="margin: 0;">Player 1</h3>
          <p style="color: var(--gray-500); font-size: 14px;">The Investigator</p>
        </a>
        
        <a href="/play/2" class="card player-card" style="text-decoration: none; color: inherit;">
          <div class="icon">🔧</div>
          <h3 style="margin: 0;">Player 2</h3>
          <p style="color: var(--gray-500); font-size: 14px;">The Operator</p>
        </a>
      </div>
      
      <div class="info-box yellow">
        <strong>⚠️ Important:</strong> Don't show your screen to the other player!
      </div>
    </div>
  </div>
</body>
</html>
`;

// Game page for each player
function gameHTML(player: number, puzzleNum: number, message?: { type: string; text: string }): string {
  const puzzle = PUZZLES[puzzleNum - 1];
  
  if (!puzzle) {
    return victoryHTML();
  }
  
  const info = player === 1 ? puzzle.player1Info : puzzle.player2Info;
  const isOperator = player === 2;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="https://hl-apps.web.app/favicon.svg">
  <title>🔐 Puzzle ${puzzleNum} - Player ${player}</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="nav">
        <a href="/" class="btn btn-default" style="padding: 8px 16px;">← Back</a>
        <div>
          <span class="badge badge-blue">Player ${player}</span>
          <span class="badge badge-green">Puzzle ${puzzleNum}/${PUZZLES.length}</span>
        </div>
      </div>
      
      <div class="progress">
        ${PUZZLES.map((_, i) => `
          <div class="progress-dot ${i < puzzleNum - 1 ? 'done' : i === puzzleNum - 1 ? 'current' : ''}"></div>
        `).join('')}
      </div>
      
      <h2>${puzzle.name}</h2>
      <p style="color: var(--gray-500);">${puzzle.description}</p>
    </div>
    
    <div class="card" style="border-left: 4px solid var(--primary);">
      <h3>${info.title}</h3>
      <div class="content-box">${info.content}</div>
      <p class="hint">💡 ${info.hint}</p>
    </div>
    
    ${isOperator ? `
      <div class="card">
        <h3>🎯 Enter Your Answer</h3>
        <form action="/play/${player}/answer" method="POST">
          <input type="hidden" name="puzzle" value="${puzzleNum}">
          <input type="text" name="answer" class="input" placeholder="Type your answer..." autocomplete="off" autofocus>
          <button type="submit" class="btn btn-primary btn-block" style="margin-top: 12px;">
            Submit Answer
          </button>
        </form>
        ${message ? `<div class="message ${message.type}">${message.text}</div>` : ''}
      </div>
    ` : `
      <div class="info-box" style="text-align: center;">
        <p>📢 <strong>Share this info with Player 2!</strong></p>
        <p style="font-size: 14px; color: var(--gray-500); margin-top: 8px;">
          They need your clues to solve the puzzle.
        </p>
      </div>
    `}
  </div>
</body>
</html>
`;
}

function victoryHTML(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="https://hl-apps.web.app/favicon.svg">
  <title>🎉 You Escaped!</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card victory">
      <h1>🎉</h1>
      <h1>ESCAPED!</h1>
      <p style="font-size: 18px; margin: 24px 0; color: var(--gray-500);">
        Congratulations! You solved all ${PUZZLES.length} puzzles!
      </p>
      <p style="margin-bottom: 32px;">Great teamwork! 🤝</p>
      <a href="/" class="btn btn-primary btn-lg">Play Again</a>
    </div>
  </div>
</body>
</html>
`;
}

// Simple state - just track current puzzle (resets on server restart)
let currentPuzzle = 1;

// Routes
app.get('/', (req, res) => res.send(landingHTML));
app.get('/apps/escape-room', (req, res) => res.send(landingHTML));
app.get('/apps/escape-room/', (req, res) => res.send(landingHTML));

app.get('/play/:player', (req, res) => {
  const player = parseInt(req.params.player);
  if (player !== 1 && player !== 2) {
    return res.redirect('/');
  }
  res.send(gameHTML(player, currentPuzzle));
});

app.post('/play/:player/answer', (req, res) => {
  const player = parseInt(req.params.player);
  const { answer, puzzle } = req.body;
  const puzzleNum = parseInt(puzzle);
  
  const currentPuzzleData = PUZZLES[puzzleNum - 1];
  if (!currentPuzzleData) {
    return res.redirect('/');
  }
  
  const correct = answer.trim().toUpperCase() === currentPuzzleData.player2Info.answer.toUpperCase();
  
  if (correct) {
    currentPuzzle = puzzleNum + 1;
    // Redirect to next puzzle (or victory)
    res.redirect(`/play/${player}`);
  } else {
    res.send(gameHTML(player, puzzleNum, { type: 'error', text: '❌ Incorrect! Try again.' }));
  }
});

// Reset game
app.get('/reset', (req, res) => {
  currentPuzzle = 1;
  res.redirect('/');
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));
app.get('/apps/escape-room/health', (req, res) => res.json({ status: 'healthy' }));

app.listen(port, () => {
  console.log(`🔐 Escape Room running on port ${port}`);
});
