import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Track which puzzles are solved
let solvedPuzzles: Set<string> = new Set();

// Everything Player 1 sees (puzzles, clues, and red herrings all mixed)
const PLAYER1_ITEMS = [
  {
    type: 'puzzle',
    id: 'p1-safe',
    title: "🔐 Heavy Safe",
    content: "A locked safe with a 4-digit keypad. Strange symbols above it: ● ▲ ■ ▲",
    hasInput: true,
    placeholder: "Enter code...",
    answer: "3797"
  },
  {
    type: 'clue',
    id: 'c1-wires',
    title: "📋 Maintenance Manual",
    content: "EMERGENCY WIRE PROTOCOL:\n\n1. First cut what rhymes with 'bed'\n2. Then the color of a clear sky\n3. Next, the color of warning signs\n4. Finally, the color of spring grass",
    hasInput: false
  },
  {
    type: 'puzzle',
    id: 'p1-clock',
    title: "🕰️ Grandfather Clock",
    content: "An antique clock. The hands can be moved. Something feels important about the time...",
    hasInput: true,
    placeholder: "Set time (H:MM)...",
    answer: "9:20"
  },
  {
    type: 'clue',
    id: 'c1-grid',
    title: "🗺️ Old Map",
    content: "A dusty map with a grid. An X is marked at:\nRow C, Column 4\n\nScrawled in the margin:\n'Go 2 rows down,\n1 column left'",
    hasInput: false
  },
  {
    type: 'herring',
    id: 'h1-photo',
    title: "📸 Faded Photograph",
    content: "A family photo from 1952.\nFour people standing in front of a house.\nThe house number reads: 7734",
    hasInput: false
  },
  {
    type: 'herring',
    id: 'h1-recipe',
    title: "📝 Recipe Card",
    content: "GRANDMOTHER'S SECRET SOUP\n\n2 cups water\n3 carrots\n1 onion\n4 potatoes\n\n'Stir clockwise 7 times'",
    hasInput: false
  },
  {
    type: 'herring',
    id: 'h1-ticket',
    title: "🎫 Concert Ticket",
    content: "THE ROLLING KEYS\nLive at Madison Square\nRow Q, Seat 17\nDoors: 7:30 PM",
    hasInput: false
  }
];

// Everything Player 2 sees (puzzles, clues, and red herrings all mixed)
const PLAYER2_ITEMS = [
  {
    type: 'clue',
    id: 'c2-symbols',
    title: "🔍 Torn Note",
    content: "Found crumpled in a corner:\n\n▲ = 7\n● = 3\n■ = 9\n\n(the rest is torn off)",
    hasInput: false
  },
  {
    type: 'puzzle',
    id: 'p2-wires',
    title: "✂️ Wire Panel",
    content: "A mess of wires behind a panel:\n🔴 RED   🔵 BLUE\n🟡 YELLOW   🟢 GREEN\n\nCut them in the right order!",
    hasInput: true,
    placeholder: "e.g. RED,BLUE,YELLOW,GREEN",
    answer: "RED,BLUE,YELLOW,GREEN"
  },
  {
    type: 'clue',
    id: 'c2-journal',
    title: "📜 Journal Entry",
    content: "March 15th, 1923\n\n'The old clock holds the secret.\nPoint the hour to where\nsun meets horizon in evening.\nMinutes show the seasons count.'",
    hasInput: false
  },
  {
    type: 'puzzle',
    id: 'p2-grid',
    title: "📍 Grid Lock",
    content: "A strange lock with a 5x5 grid:\n\n    1  2  3  4  5\nA   ○  ○  ○  ○  ○\nB   ○  ○  ○  ○  ○\nC   ○  ○  ○  ○  ○\nD   ○  ○  ○  ○  ○\nE   ○  ○  ○  ○  ○",
    hasInput: true,
    placeholder: "Enter coordinate (e.g. B3)...",
    answer: "E3"
  },
  {
    type: 'herring',
    id: 'h2-calendar',
    title: "📅 Old Calendar",
    content: "DECEMBER 1987\n\nCircled dates: 3, 12, 25\n\nNote: 'Don't forget the party!\nBring 4 bottles of wine.'",
    hasInput: false
  },
  {
    type: 'herring',
    id: 'h2-newspaper',
    title: "📰 Newspaper Clipping",
    content: "LOCAL MAN WINS LOTTERY\n\nNumbers: 7-14-21-28-35\n\n'I always knew lucky 7\nwould save me,' he said.",
    hasInput: false
  },
  {
    type: 'herring',
    id: 'h2-postcard',
    title: "✉️ Postcard",
    content: "Greetings from BERMUDA!\n\nWeather is lovely.\nRoom 447 has ocean view.\nSee you in 2 weeks!\n\n- Uncle Frank",
    hasInput: false
  }
];

// Shuffle function
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
  
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  
  .card {
    background: var(--white);
    border-radius: 8px;
    padding: 18px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    margin-bottom: 12px;
  }
  
  .card.solved {
    opacity: 0.4;
    background: #f6ffed;
  }
  
  h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  h2 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
  
  .subtitle { color: var(--gray-500); font-size: 13px; margin-bottom: 16px; }
  
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
    padding: 28px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid var(--gray-300);
  }
  
  .player-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  .player-card .icon { font-size: 32px; margin-bottom: 8px; }
  
  .input {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    font-family: inherit;
  }
  
  .input:focus { outline: none; border-color: var(--primary); }
  
  .info-box {
    background: var(--gray-100);
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    padding: 14px;
    margin: 12px 0;
    font-size: 13px;
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
    line-height: 1.6;
  }
  
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
    margin-bottom: 12px;
  }
  
  .progress-text { font-size: 13px; color: var(--gray-500); }
  .progress-text strong { color: var(--success); }
  
  .form-row {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  
  .form-row .input { flex: 1; }
  
  .solved-badge { color: var(--success); font-weight: 600; margin-left: 8px; }
  
  .victory { text-align: center; padding: 40px 20px; }
  .victory h1 { font-size: 40px; margin-bottom: 12px; }
  
  .item-card {
    border-left: 3px solid var(--gray-300);
  }
  
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
        <strong>📋 Rules:</strong><br>
        • Each player sees different things<br>
        • Some items are puzzles, some are clues<br>
        • Figure out what helps what!<br>
        • Talk to each other to escape 🗣️
      </div>
      
      <div class="player-select">
        <a href="/play/1" class="card player-card" style="text-decoration: none; color: inherit;">
          <div class="icon">👤</div>
          <h2 style="margin: 0;">Player 1</h2>
        </a>
        
        <a href="/play/2" class="card player-card" style="text-decoration: none; color: inherit;">
          <div class="icon">👤</div>
          <h2 style="margin: 0;">Player 2</h2>
        </a>
      </div>
      
      <div class="info-box yellow">
        ⚠️ <strong>No peeking</strong> at each other's screens!
      </div>
    </div>
  </div>
</body>
</html>
`;

function playerHTML(player: 1 | 2, message?: { itemId: string; type: string; text: string }): string {
  const items = player === 1 ? PLAYER1_ITEMS : PLAYER2_ITEMS;
  // Shuffle items each time for variety (but keep puzzles trackable by ID)
  const shuffledItems = shuffle(items);
  
  const totalPuzzles = 4; // 2 per player
  const solvedCount = solvedPuzzles.size;
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
  <title>🔐 Player ${player}</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <a href="/" class="btn btn-default">← Exit</a>
        <div class="progress-text">
          Escaped: <strong>${solvedCount}</strong> / ${totalPuzzles}
        </div>
      </div>
      <h1>🔐 The Room</h1>
      <p class="subtitle">You look around and find these items...</p>
    </div>
    
    ${shuffledItems.map(item => {
      const isSolved = item.hasInput && solvedPuzzles.has(item.id);
      const hasMessage = message && message.itemId === item.id;
      
      return `
        <div class="card item-card ${isSolved ? 'solved' : ''}">
          <h2>
            ${item.title}
            ${isSolved ? '<span class="solved-badge">✅</span>' : ''}
          </h2>
          <div class="content-box">${item.content}</div>
          
          ${item.hasInput && !isSolved ? `
            <form action="/play/${player}/answer" method="POST">
              <input type="hidden" name="itemId" value="${item.id}">
              <div class="form-row">
                <input type="text" name="answer" class="input" placeholder="${item.placeholder}" autocomplete="off">
                <button type="submit" class="btn btn-primary">Try</button>
              </div>
            </form>
            ${hasMessage ? `<div class="message ${message.type}">${message.text}</div>` : ''}
          ` : ''}
        </div>
      `;
    }).join('')}
    
    <div style="text-align: center; margin-top: 16px;">
      <a href="/play/${player}" class="btn btn-default">🔄 Look around again</a>
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
      <h1>YOU ESCAPED!</h1>
      <p style="font-size: 15px; margin: 20px 0; color: var(--gray-500);">
        All puzzles solved. Freedom!
      </p>
      <p style="margin-bottom: 24px;">Great teamwork 🤝</p>
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
  const { itemId, answer } = req.body;
  
  const allItems = [...PLAYER1_ITEMS, ...PLAYER2_ITEMS];
  const item = allItems.find(i => i.id === itemId);
  
  if (!item || !item.hasInput) {
    return res.redirect(`/play/${player}`);
  }
  
  if (solvedPuzzles.has(itemId)) {
    return res.send(playerHTML(player, { itemId, type: 'success', text: '✅ Already solved!' }));
  }
  
  const correct = answer.trim().toUpperCase().replace(/\s+/g, '') === 
                  item.answer!.toUpperCase().replace(/\s+/g, '');
  
  if (correct) {
    solvedPuzzles.add(itemId);
    res.redirect(`/play/${player}`);
  } else {
    res.send(playerHTML(player, { itemId, type: 'error', text: '❌ Nothing happens...' }));
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
