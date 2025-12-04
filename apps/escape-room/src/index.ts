import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

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
  
  .card.solved { opacity: 0.4; background: #f6ffed; }
  
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
    display: none;
  }
  
  .message.show { display: block; }
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
  
  .victory { text-align: center; padding: 40px 20px; display: none; }
  .victory.show { display: block; }
  .victory h1 { font-size: 40px; margin-bottom: 12px; }
  
  .item-card { border-left: 3px solid var(--gray-300); }
  .hidden { display: none !important; }
  
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

function playerHTML(player: 1 | 2): string {
  const items = player === 1 ? PLAYER1_ITEMS : PLAYER2_ITEMS;
  const itemsJSON = JSON.stringify(items);
  
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
          Solved: <strong id="solved-count">0</strong> / 2
        </div>
      </div>
      <h1>🔐 The Room</h1>
      <p class="subtitle">You look around and find these items...</p>
    </div>
    
    <div id="items-container"></div>
    
    <div id="victory" class="card victory">
      <h1>🎉</h1>
      <h1>YOU ESCAPED!</h1>
      <p style="font-size: 15px; margin: 20px 0; color: var(--gray-500);">
        All puzzles solved. Freedom!
      </p>
      <p style="margin-bottom: 24px;">You made it out! 🚪</p>
      <button class="btn btn-primary" onclick="resetGame()">Play Again</button>
    </div>
    
    <div id="footer" style="text-align: center; margin-top: 16px;">
      <button class="btn btn-default" onclick="shuffle()">🔄 Look around again</button>
      <button class="btn btn-default" onclick="resetGame()" style="margin-left: 8px;">↺ Reset</button>
    </div>
  </div>
  
  <script>
    const PLAYER = ${player};
    const ITEMS = ${itemsJSON};
    const STORAGE_KEY = 'escapeRoom_solved_p' + PLAYER;
    
    // Get solved puzzles from localStorage (each browser/device has its own)
    function getSolved() {
      try {
        return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
      } catch {
        return new Set();
      }
    }
    
    function saveSolved(solved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...solved]));
    }
    
    function shuffleArray(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    
    function render() {
      const solved = getSolved();
      const container = document.getElementById('items-container');
      const shuffled = shuffleArray(ITEMS);
      
      // Count my puzzles (items with hasInput)
      const myPuzzleIds = ITEMS.filter(i => i.hasInput).map(i => i.id);
      const mySolvedCount = myPuzzleIds.filter(id => solved.has(id)).length;
      
      document.getElementById('solved-count').textContent = mySolvedCount;
      
      // Check victory (this player solved their 2 puzzles)
      const myPuzzles = ITEMS.filter(i => i.hasInput);
      const allMySolved = myPuzzles.every(p => solved.has(p.id));
      
      if (allMySolved) {
        document.getElementById('victory').classList.add('show');
        document.getElementById('footer').classList.add('hidden');
        container.innerHTML = '';
        return;
      }
      
      container.innerHTML = shuffled.map(item => {
        const isSolved = item.hasInput && solved.has(item.id);
        
        return \`
          <div class="card item-card \${isSolved ? 'solved' : ''}" id="card-\${item.id}">
            <h2>
              \${item.title}
              \${isSolved ? '<span class="solved-badge">✅</span>' : ''}
            </h2>
            <div class="content-box">\${item.content}</div>
            
            \${item.hasInput && !isSolved ? \`
              <div class="form-row">
                <input 
                  type="text" 
                  class="input" 
                  id="input-\${item.id}" 
                  placeholder="\${item.placeholder}" 
                  autocomplete="off"
                  onkeypress="if(event.key==='Enter')tryAnswer('\${item.id}')"
                >
                <button class="btn btn-primary" onclick="tryAnswer('\${item.id}')">Try</button>
              </div>
              <div class="message" id="msg-\${item.id}"></div>
            \` : ''}
          </div>
        \`;
      }).join('');
    }
    
    function tryAnswer(itemId) {
      const item = ITEMS.find(i => i.id === itemId);
      if (!item || !item.answer) return;
      
      const input = document.getElementById('input-' + itemId);
      const msg = document.getElementById('msg-' + itemId);
      const answer = input.value.trim().toUpperCase().replace(/\\s+/g, '');
      const correct = answer === item.answer.toUpperCase().replace(/\\s+/g, '');
      
      if (correct) {
        const solved = getSolved();
        solved.add(itemId);
        saveSolved(solved);
        render();
      } else {
        msg.textContent = '❌ Nothing happens...';
        msg.className = 'message error show';
        input.value = '';
        input.focus();
      }
    }
    
    function shuffle() {
      render();
    }
    
    function resetGame() {
      localStorage.removeItem(STORAGE_KEY);
      render();
    }
    
    // Initial render
    render();
  </script>
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

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.listen(port, () => {
  console.log(`🔐 Escape Room running on port ${port}`);
});
