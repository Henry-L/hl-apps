import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Track which puzzles are solved
let solvedPuzzles: Set<string> = new Set();

// Player 1's puzzles (Player 2 has the clues for these)
const PLAYER1_PUZZLES = [
  {
    id: 'p1-safe',
    title: "🔐 The Safe",
    description: "A 4-digit combination lock. Above it are symbols: ● ▲ ■ ▲",
    placeholder: "Enter 4 digits...",
    answer: "3797"
  },
  {
    id: 'p1-clock',
    title: "🕰️ Grandfather Clock",
    description: "Set the clock hands to the correct time. Format: H:MM",
    placeholder: "e.g. 3:45",
    answer: "9:20"
  }
];

// Player 2's puzzles (Player 1 has the clues for these)
const PLAYER2_PUZZLES = [
  {
    id: 'p2-wires',
    title: "✂️ Wire Panel",
    description: "4 wires: 🔴 RED, 🔵 BLUE, 🟡 YELLOW, 🟢 GREEN. Enter cutting order.",
    placeholder: "RED,BLUE,YELLOW,GREEN",
    answer: "RED,BLUE,YELLOW,GREEN"
  },
  {
    id: 'p2-grid',
    title: "📍 Coordinate Lock",
    description: "A grid (rows A-E, columns 1-5). Enter position like: E3",
    placeholder: "Enter coordinate...",
    answer: "E3"
  }
];

// Clues Player 1 sees (these help Player 2 solve THEIR puzzles)
const PLAYER1_CLUES = [
  {
    id: 'c1-wires',
    title: "📋 Maintenance Manual",
    content: "WIRE CUTTING ORDER:\n\n1. Rhymes with 'bed'\n2. Color of the sky\n3. Warning sign color\n4. Fresh grass color",
    forPuzzle: "Player 2's Wire Panel"
  },
  {
    id: 'c1-grid',
    title: "🗺️ Treasure Map", 
    content: "X marks the spot at: Row C, Column 4\n\nNote attached:\n'Add 2 to row letter,\nsubtract 1 from column'",
    forPuzzle: "Player 2's Coordinate Lock"
  },
  {
    id: 'c1-decoy',
    title: "📝 Torn Grocery List",
    content: "...eggs\n...milk\n...bread\n...mysterious key?\n\n(smudged and unreadable)",
    forPuzzle: "???"
  }
];

// Clues Player 2 sees (these help Player 1 solve THEIR puzzles)
const PLAYER2_CLUES = [
  {
    id: 'c2-safe',
    title: "🔍 Symbol Decoder",
    content: "Found on a torn note:\n\n▲ = 7\n● = 3\n■ = 9",
    forPuzzle: "Player 1's Safe"
  },
  {
    id: 'c2-clock',
    title: "📜 Old Journal Entry",
    content: "Entry dated 1923:\n\n'Set the hour hand where\nthe sun sets (West)...\n\nSet minutes to the\nnumber of seasons.'",
    forPuzzle: "Player 1's Clock"
  },
  {
    id: 'c2-decoy',
    title: "🎭 Theater Ticket",
    content: "ADMIT ONE\nRow Z, Seat 99\nShow: 'The Red Herring'\n8:00 PM",
    forPuzzle: "???"
  }
];

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
    --purple: #722ed1;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--gray-100);
    min-height: 100vh;
    color: var(--gray-900);
    line-height: 1.6;
  }
  
  .container { max-width: 700px; margin: 0 auto; padding: 20px; }
  
  .card {
    background: var(--white);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    margin-bottom: 12px;
  }
  
  .card.solved {
    opacity: 0.5;
    background: #f6ffed;
  }
  
  .card.clue {
    border-left: 4px solid var(--purple);
  }
  
  .card.puzzle {
    border-left: 4px solid var(--primary);
  }
  
  h1 { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
  h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
  h3 { font-size: 14px; font-weight: 600; color: var(--gray-500); margin-bottom: 4px; }
  
  .subtitle { color: var(--gray-500); font-size: 14px; margin-bottom: 16px; }
  
  .section-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gray-500);
    margin: 20px 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--gray-300);
  }
  
  .section-title.purple { color: var(--purple); border-color: var(--purple); }
  .section-title.blue { color: var(--primary); border-color: var(--primary); }
  
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    font-size: 14px;
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
  
  .player-card .icon { font-size: 36px; margin-bottom: 8px; }
  
  .input {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    font-family: inherit;
  }
  
  .input:focus { outline: none; border-color: var(--primary); }
  .input:disabled { background: var(--gray-100); }
  
  .info-box {
    background: var(--gray-100);
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    padding: 14px;
    margin: 12px 0;
    font-size: 14px;
  }
  
  .info-box.blue { background: #e6f4ff; border-color: #91caff; }
  .info-box.yellow { background: #fffbe6; border-color: #ffe58f; }
  
  .content-box {
    background: var(--gray-100);
    border-radius: 6px;
    padding: 14px;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    font-size: 13px;
    line-height: 1.7;
    margin: 8px 0;
  }
  
  .badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
    margin-left: 6px;
  }
  
  .badge-blue { background: #e6f4ff; color: var(--primary); }
  .badge-purple { background: #f9f0ff; color: var(--purple); }
  .badge-green { background: #f6ffed; color: var(--success); }
  
  .message {
    padding: 8px 12px;
    border-radius: 6px;
    margin-top: 10px;
    font-size: 13px;
  }
  
  .message.success { background: #f6ffed; border: 1px solid #b7eb8f; color: #389e0d; }
  .message.error { background: #fff2f0; border: 1px solid #ffccc7; color: #cf1322; }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .progress-text { font-size: 13px; color: var(--gray-500); }
  .progress-text strong { color: var(--success); }
  
  .form-row {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  
  .form-row .input { flex: 1; }
  
  .solved-check { color: var(--success); font-weight: 600; }
  
  .for-label {
    font-size: 11px;
    color: var(--gray-500);
    margin-top: 8px;
  }
  
  .victory { text-align: center; padding: 40px 20px; }
  .victory h1 { font-size: 42px; margin-bottom: 12px; }
  
  @media (max-width: 500px) {
    .player-select { grid-template-columns: 1fr; }
    .form-row { flex-direction: column; }
  }
</style>
`;

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
      <p class="subtitle">2-player cooperative puzzle game</p>
      
      <div class="info-box blue" style="text-align: left;">
        <strong>📋 How it works:</strong><br>
        • Each player has <strong>2 puzzles</strong> to solve<br>
        • Each player has <strong>clues</strong> for the OTHER player<br>
        • You must share info to escape! 🗣️
      </div>
      
      <div class="player-select">
        <a href="/play/1" class="card player-card" style="text-decoration: none; color: inherit;">
          <div class="icon">🔵</div>
          <h2 style="margin: 0;">Player 1</h2>
        </a>
        
        <a href="/play/2" class="card player-card" style="text-decoration: none; color: inherit;">
          <div class="icon">🟣</div>
          <h2 style="margin: 0;">Player 2</h2>
        </a>
      </div>
      
      <div class="info-box yellow">
        ⚠️ <strong>Don't peek</strong> at each other's screens!
      </div>
    </div>
  </div>
</body>
</html>
`;

function playerHTML(player: 1 | 2, message?: { puzzleId: string; type: string; text: string }): string {
  const myPuzzles = player === 1 ? PLAYER1_PUZZLES : PLAYER2_PUZZLES;
  const myClues = player === 1 ? PLAYER1_CLUES : PLAYER2_CLUES;
  const otherPlayer = player === 1 ? 2 : 1;
  
  const totalPuzzles = PLAYER1_PUZZLES.length + PLAYER2_PUZZLES.length;
  const solvedCount = solvedPuzzles.size;
  const allSolved = solvedCount === totalPuzzles;
  
  if (allSolved) {
    return victoryHTML();
  }
  
  const playerColor = player === 1 ? 'blue' : 'purple';
  const playerEmoji = player === 1 ? '🔵' : '🟣';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="https://hl-apps.web.app/favicon.svg">
  <title>${playerEmoji} Player ${player}</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div>
          <a href="/" class="btn btn-default">← Exit</a>
          <span class="badge badge-${playerColor}">Player ${player}</span>
        </div>
        <div class="progress-text">
          <strong>${solvedCount}</strong> / ${totalPuzzles} total
        </div>
      </div>
      <h1>${playerEmoji} Player ${player}</h1>
      <p class="subtitle">Solve your puzzles & share clues with Player ${otherPlayer}</p>
    </div>
    
    <div class="section-title ${playerColor}">🔧 Your Puzzles (solve these)</div>
    
    ${myPuzzles.map(puzzle => {
      const isSolved = solvedPuzzles.has(puzzle.id);
      const hasMessage = message && message.puzzleId === puzzle.id;
      
      return `
        <div class="card puzzle ${isSolved ? 'solved' : ''}">
          <h2>
            ${puzzle.title}
            ${isSolved ? '<span class="solved-check">✅</span>' : ''}
          </h2>
          <p style="color: var(--gray-600); font-size: 13px;">${puzzle.description}</p>
          
          ${isSolved ? '' : `
            <form action="/play/${player}/answer" method="POST">
              <input type="hidden" name="puzzleId" value="${puzzle.id}">
              <div class="form-row">
                <input type="text" name="answer" class="input" placeholder="${puzzle.placeholder}" autocomplete="off">
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>
            ${hasMessage ? `<div class="message ${message.type}">${message.text}</div>` : ''}
          `}
        </div>
      `;
    }).join('')}
    
    <div class="section-title purple">📋 Clues for Player ${otherPlayer}</div>
    
    ${myClues.map(clue => `
      <div class="card clue">
        <h2>${clue.title}</h2>
        <div class="content-box">${clue.content}</div>
        <p class="for-label">💡 This helps: ${clue.forPuzzle}</p>
      </div>
    `).join('')}
    
    <div class="info-box" style="text-align: center;">
      <a href="/play/${player}" class="btn btn-default">🔄 Refresh</a>
      <span style="color: var(--gray-500); margin-left: 8px; font-size: 13px;">to see updates</span>
    </div>
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
  <title>🎉 Escaped!</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card victory">
      <h1>🎉</h1>
      <h1>ESCAPED!</h1>
      <p style="font-size: 16px; margin: 20px 0; color: var(--gray-500);">
        All 4 puzzles solved!
      </p>
      <p style="margin-bottom: 24px;">Great teamwork! 🤝</p>
      <a href="/reset" class="btn btn-primary">Play Again</a>
    </div>
  </div>
</body>
</html>
`;
}

// Routes
app.get('/', (req, res) => res.send(landingHTML));
app.get('/apps/escape-room', (req, res) => res.send(landingHTML));
app.get('/apps/escape-room/', (req, res) => res.send(landingHTML));

app.get('/play/1', (req, res) => res.send(playerHTML(1)));
app.get('/play/2', (req, res) => res.send(playerHTML(2)));

app.post('/play/:player/answer', (req, res) => {
  const player = parseInt(req.params.player) as 1 | 2;
  const { puzzleId, answer } = req.body;
  
  const allPuzzles = [...PLAYER1_PUZZLES, ...PLAYER2_PUZZLES];
  const puzzle = allPuzzles.find(p => p.id === puzzleId);
  
  if (!puzzle) {
    return res.redirect(`/play/${player}`);
  }
  
  if (solvedPuzzles.has(puzzleId)) {
    return res.send(playerHTML(player, { puzzleId, type: 'success', text: '✅ Already solved!' }));
  }
  
  const correct = answer.trim().toUpperCase().replace(/\s+/g, '') === 
                  puzzle.answer.toUpperCase().replace(/\s+/g, '');
  
  if (correct) {
    solvedPuzzles.add(puzzleId);
    res.redirect(`/play/${player}`);
  } else {
    res.send(playerHTML(player, { puzzleId, type: 'error', text: '❌ Try again!' }));
  }
});

app.get('/reset', (req, res) => {
  solvedPuzzles = new Set();
  res.redirect('/');
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.listen(port, () => {
  console.log(`🔐 Escape Room running on port ${port}`);
});
