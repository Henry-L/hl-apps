import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Track which puzzles are solved (resets on server restart)
let solvedPuzzles: Set<number> = new Set();

// All the clues Player 1 sees (they need to figure out which goes with which puzzle)
const CLUES = [
  {
    id: 1,
    title: "🔍 Torn Note Fragment",
    content: "A torn piece of paper with symbols:\n\n▲ = 7\n● = 3\n■ = 9"
  },
  {
    id: 2,
    title: "📋 Maintenance Manual",
    content: "WIRE CUTTING ORDER:\n\n1. Cut the wire that rhymes with 'bed'\n2. Cut the wire matching the sky\n3. Cut the wire of warning signs\n4. Cut the wire of fresh grass"
  },
  {
    id: 3,
    title: "🗺️ Treasure Map",
    content: "The map shows a grid with an X at:\n\nRow C, Column 4\n\nA note says:\n'Add 2 to the row letter,\nsubtract 1 from the column'"
  },
  {
    id: 4,
    title: "📜 Old Journal",
    content: "Entry dated 1923:\n\n'The clock shows the hour when\nthe hour hand points to where\nthe sun sets (West on compass),\n\nand the minute hand points to\nthe number of seasons.'"
  },
  {
    id: 5,
    title: "📝 Cryptic Riddle",
    content: "What has hands but can't clap?\nWhat has a face but can't smile?\nSet me right to escape in style."
  }
];

// All the puzzles Player 2 sees
const PUZZLES = [
  {
    id: 1,
    title: "🔐 The Safe",
    description: "A 4-digit combination lock. Symbols above keypad: ● ▲ ■ ▲",
    placeholder: "Enter 4 digits...",
    answer: "3797"
  },
  {
    id: 2,
    title: "✂️ Wire Panel",
    description: "4 wires: 🔴 RED, 🔵 BLUE, 🟡 YELLOW, 🟢 GREEN. Enter colors in order (comma separated).",
    placeholder: "RED,BLUE,YELLOW,GREEN",
    answer: "RED,BLUE,YELLOW,GREEN"
  },
  {
    id: 3,
    title: "📍 Coordinate Lock",
    description: "A grid lock (A-E rows, 1-5 columns). Enter position like: E3",
    placeholder: "Enter coordinate...",
    answer: "E3"
  },
  {
    id: 4,
    title: "🕰️ Grandfather Clock",
    description: "Set the clock hands. Enter time as H:MM (like 3:45)",
    placeholder: "Enter time...",
    answer: "9:20"
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
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--gray-100);
    min-height: 100vh;
    color: var(--gray-900);
    line-height: 1.6;
  }
  
  .container { max-width: 700px; margin: 0 auto; padding: 24px; }
  
  .card {
    background: var(--white);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    margin-bottom: 16px;
  }
  
  .card.solved {
    opacity: 0.6;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
  }
  
  h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  h2 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
  h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--gray-700); }
  
  .subtitle { color: var(--gray-500); margin-bottom: 20px; }
  
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
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
  .btn-sm { padding: 6px 12px; font-size: 13px; }
  
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
    padding: 10px 12px;
    font-size: 15px;
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    font-family: inherit;
  }
  
  .input:focus {
    outline: none;
    border-color: var(--primary);
  }
  
  .input:disabled {
    background: var(--gray-100);
    cursor: not-allowed;
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
    background: var(--gray-100);
    border-radius: 6px;
    padding: 16px;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    font-size: 14px;
    line-height: 1.7;
    margin: 12px 0;
  }
  
  .badge {
    display: inline-block;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
    margin-left: 8px;
  }
  
  .badge-blue { background: #e6f4ff; color: var(--primary); }
  .badge-green { background: #f6ffed; color: var(--success); }
  
  .message {
    padding: 10px 14px;
    border-radius: 6px;
    margin-top: 12px;
    font-size: 14px;
  }
  
  .message.success { background: #f6ffed; border: 1px solid #b7eb8f; color: #389e0d; }
  .message.error { background: #fff2f0; border: 1px solid #ffccc7; color: #cf1322; }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .progress-text {
    font-size: 14px;
    color: var(--gray-500);
  }
  
  .progress-text strong {
    color: var(--success);
  }
  
  .form-row {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  
  .form-row .input { flex: 1; }
  
  .solved-badge {
    color: var(--success);
    font-weight: 600;
  }
  
  .victory { text-align: center; padding: 48px 24px; }
  .victory h1 { font-size: 48px; margin-bottom: 16px; }
  
  .refresh-note {
    text-align: center;
    color: var(--gray-500);
    font-size: 13px;
    margin-top: 16px;
  }
  
  @media (max-width: 500px) {
    .player-select { grid-template-columns: 1fr; }
    .container { padding: 16px; }
    .form-row { flex-direction: column; }
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
          • <strong>Player 1</strong> sees clues & documents<br>
          • <strong>Player 2</strong> sees puzzles to solve<br>
          • Figure out which clue matches which puzzle!<br>
          • <strong>Communicate</strong> to escape together 🗣️
        </p>
      </div>
      
      <div class="player-select">
        <a href="/play/1" class="card player-card" style="text-decoration: none; color: inherit;">
          <div class="icon">🔍</div>
          <h3 style="margin: 0;">Player 1</h3>
          <p style="color: var(--gray-500); font-size: 14px;">Has the clues</p>
        </a>
        
        <a href="/play/2" class="card player-card" style="text-decoration: none; color: inherit;">
          <div class="icon">🔧</div>
          <h3 style="margin: 0;">Player 2</h3>
          <p style="color: var(--gray-500); font-size: 14px;">Solves the puzzles</p>
        </a>
      </div>
      
      <div class="info-box yellow">
        <strong>⚠️ Don't peek!</strong> Each player must only see their own screen.
      </div>
    </div>
  </div>
</body>
</html>
`;

// Player 1 view - sees ALL clues
function player1HTML(): string {
  const solvedCount = solvedPuzzles.size;
  const totalPuzzles = PUZZLES.length;
  const allSolved = solvedCount === totalPuzzles;
  
  if (allSolved) {
    return victoryHTML();
  }
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="https://hl-apps.web.app/favicon.svg">
  <title>🔍 Player 1 - Clues</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div>
          <a href="/" class="btn btn-default btn-sm">← Exit</a>
          <span class="badge badge-blue">Player 1</span>
        </div>
        <div class="progress-text">
          <strong>${solvedCount}</strong> / ${totalPuzzles} solved
        </div>
      </div>
      
      <h1>🔍 Your Clues</h1>
      <p class="subtitle">
        These clues help solve puzzles. Figure out which clue matches which puzzle!<br>
        <em>Not all clues may be useful...</em> 🤔
      </p>
    </div>
    
    ${CLUES.map(clue => `
      <div class="card">
        <h2>${clue.title}</h2>
        <div class="content-box">${clue.content}</div>
      </div>
    `).join('')}
    
    <div class="info-box">
      <strong>💡 Tip:</strong> Describe your clues to Player 2 and help them figure out which puzzle each clue solves!
    </div>
    
    <p class="refresh-note">
      <a href="/play/1" class="btn btn-default btn-sm">🔄 Refresh</a>
      to see progress
    </p>
  </div>
</body>
</html>
`;
}

// Player 2 view - sees ALL puzzles
function player2HTML(message?: { puzzleId: number; type: string; text: string }): string {
  const solvedCount = solvedPuzzles.size;
  const totalPuzzles = PUZZLES.length;
  const allSolved = solvedCount === totalPuzzles;
  
  if (allSolved) {
    return victoryHTML();
  }
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="https://hl-apps.web.app/favicon.svg">
  <title>🔧 Player 2 - Puzzles</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div>
          <a href="/" class="btn btn-default btn-sm">← Exit</a>
          <span class="badge badge-blue">Player 2</span>
        </div>
        <div class="progress-text">
          <strong>${solvedCount}</strong> / ${totalPuzzles} solved
        </div>
      </div>
      
      <h1>🔧 Puzzles to Solve</h1>
      <p class="subtitle">
        Ask Player 1 for clues to help solve these puzzles!
      </p>
    </div>
    
    ${PUZZLES.map(puzzle => {
      const isSolved = solvedPuzzles.has(puzzle.id);
      const hasMessage = message && message.puzzleId === puzzle.id;
      
      return `
        <div class="card ${isSolved ? 'solved' : ''}">
          <h2>
            ${puzzle.title}
            ${isSolved ? '<span class="solved-badge">✅ Solved!</span>' : ''}
          </h2>
          <p style="color: var(--gray-600); margin-bottom: 12px;">${puzzle.description}</p>
          
          ${isSolved ? '' : `
            <form action="/play/2/answer" method="POST">
              <input type="hidden" name="puzzleId" value="${puzzle.id}">
              <div class="form-row">
                <input 
                  type="text" 
                  name="answer" 
                  class="input" 
                  placeholder="${puzzle.placeholder}"
                  autocomplete="off"
                >
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>
            ${hasMessage ? `<div class="message ${message.type}">${message.text}</div>` : ''}
          `}
        </div>
      `;
    }).join('')}
    
    <div class="info-box">
      <strong>💡 Tip:</strong> Tell Player 1 what puzzles you see - they have the clues to help!
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
  <title>🎉 You Escaped!</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card victory">
      <h1>🎉</h1>
      <h1>ESCAPED!</h1>
      <p style="font-size: 18px; margin: 24px 0; color: var(--gray-500);">
        You solved all ${PUZZLES.length} puzzles together!
      </p>
      <p style="margin-bottom: 32px;">Great teamwork! 🤝</p>
      <a href="/reset" class="btn btn-primary" style="font-size: 16px; padding: 14px 28px;">
        Play Again
      </a>
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

app.get('/play/1', (req, res) => res.send(player1HTML()));
app.get('/play/2', (req, res) => res.send(player2HTML()));

app.post('/play/2/answer', (req, res) => {
  const { puzzleId, answer } = req.body;
  const id = parseInt(puzzleId);
  
  const puzzle = PUZZLES.find(p => p.id === id);
  if (!puzzle) {
    return res.redirect('/play/2');
  }
  
  // Already solved?
  if (solvedPuzzles.has(id)) {
    return res.send(player2HTML({ puzzleId: id, type: 'success', text: '✅ Already solved!' }));
  }
  
  // Check answer (case insensitive, trim whitespace)
  const correct = answer.trim().toUpperCase().replace(/\s+/g, '') === 
                  puzzle.answer.toUpperCase().replace(/\s+/g, '');
  
  if (correct) {
    solvedPuzzles.add(id);
    res.redirect('/play/2');
  } else {
    res.send(player2HTML({ puzzleId: id, type: 'error', text: '❌ Incorrect, try again!' }));
  }
});

// Reset game
app.get('/reset', (req, res) => {
  solvedPuzzles = new Set();
  res.redirect('/');
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));
app.get('/apps/escape-room/health', (req, res) => res.json({ status: 'healthy' }));

app.listen(port, () => {
  console.log(`🔐 Escape Room running on port ${port}`);
});
