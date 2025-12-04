import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory game sessions (in production, use Redis or Firestore)
interface GameSession {
  id: string;
  createdAt: Date;
  currentPuzzle: number;
  solved: boolean[];
  player1Joined: boolean;
  player2Joined: boolean;
}

const sessions: Map<string, GameSession> = new Map();

// Puzzle definitions - each has info split between players
const PUZZLES = [
  {
    id: 1,
    name: "The Locked Safe",
    description: "A heavy safe blocks your escape. The combination is hidden...",
    player1Info: {
      title: "🔍 Torn Note Fragment",
      content: "You found a torn piece of paper with symbols: ▲ = 7, ● = 3, ■ = 9",
      hint: "Tell Player 2 what each symbol means!"
    },
    player2Info: {
      title: "🔐 Safe Keypad",
      content: "The safe has a 4-digit code. Above the keypad are symbols: ● ▲ ■ ▲",
      hint: "Ask Player 1 what the symbols mean, then enter the code!",
      inputType: "code",
      answer: "3797"
    }
  },
  {
    id: 2,
    name: "The Color Wires",
    description: "A tangle of wires blocks the door mechanism...",
    player1Info: {
      title: "📋 Maintenance Manual",
      content: "WIRE CUTTING ORDER:\n1. Cut the wire that rhymes with 'bed'\n2. Cut the wire matching the sky\n3. Cut the wire of warning signs\n4. Cut the wire of fresh grass",
      hint: "Describe the order to Player 2 using colors!"
    },
    player2Info: {
      title: "✂️ Wire Panel",
      content: "You see 4 colored wires: 🔴 RED, 🔵 BLUE, 🟡 YELLOW, 🟢 GREEN",
      hint: "Ask Player 1 for the cutting order!",
      inputType: "sequence",
      answer: "RED,BLUE,YELLOW,GREEN"
    }
  },
  {
    id: 3,
    name: "The Map Coordinates",
    description: "A locked cabinet contains the exit key...",
    player1Info: {
      title: "🗺️ Treasure Map",
      content: "The map shows a grid with an X marked at position Row C, Column 4. A note says: 'Add 2 to row, subtract 1 from column'",
      hint: "Calculate the final position and tell Player 2!"
    },
    player2Info: {
      title: "📍 Coordinate Lock",
      content: "The lock has a grid selector:\n   1  2  3  4  5\nA  ·  ·  ·  ·  ·\nB  ·  ·  ·  ·  ·\nC  ·  ·  ·  ·  ·\nD  ·  ·  ·  ·  ·\nE  ·  ·  ·  ·  ·",
      hint: "Ask Player 1 for the coordinates!",
      inputType: "coordinate",
      answer: "E3"
    }
  },
  {
    id: 4,
    name: "The Clock Puzzle",
    description: "An ancient clock holds the final secret...",
    player1Info: {
      title: "📜 Old Journal",
      content: "Entry dated 1923:\n'The clock shows midnight when the hour hand points to where the sun sets, and the minute hand points to the number of seasons.'",
      hint: "West = 9 (on a clock), Seasons = 4. Tell Player 2!"
    },
    player2Info: {
      title: "🕰️ Grandfather Clock",
      content: "The clock hands can be set to any position. You need to set Hour and Minute hands correctly.",
      hint: "Ask Player 1 what time to set!",
      inputType: "time",
      answer: "9:20"
    }
  }
];

// CSS following design guide
const STYLES = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  :root {
    --color-black: #000000;
    --color-gray-900: #1f1f1f;
    --color-gray-700: #434343;
    --color-gray-500: #8c8c8c;
    --color-gray-300: #d9d9d9;
    --color-gray-100: #f5f5f5;
    --color-white: #ffffff;
    --color-primary: #1677ff;
    --color-success: #52c41a;
    --color-warning: #faad14;
    --color-error: #ff4d4f;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--color-gray-100);
    min-height: 100vh;
    color: var(--color-gray-900);
    line-height: 1.6;
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
  }
  
  .card {
    background: var(--color-white);
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 16px;
  }
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--color-black);
  }
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--color-gray-900);
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  .subtitle {
    color: var(--color-gray-500);
    font-size: 16px;
    margin-bottom: 24px;
  }
  
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
  }
  
  .btn-primary {
    background: var(--color-primary);
    color: white;
  }
  
  .btn-primary:hover {
    background: #4096ff;
  }
  
  .btn-default {
    background: var(--color-white);
    border: 1px solid var(--color-gray-300);
    color: var(--color-gray-700);
  }
  
  .btn-default:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
  
  .btn-success {
    background: var(--color-success);
    color: white;
  }
  
  .btn-block {
    width: 100%;
  }
  
  .btn-lg {
    padding: 16px 32px;
    font-size: 18px;
  }
  
  .player-select {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 24px;
  }
  
  .player-card {
    padding: 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .player-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }
  
  .player-card .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .input {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid var(--color-gray-300);
    border-radius: 6px;
    font-family: inherit;
  }
  
  .input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--color-gray-700);
  }
  
  .info-box {
    background: var(--color-gray-100);
    border: 1px solid var(--color-gray-300);
    border-radius: 6px;
    padding: 16px;
    margin: 16px 0;
  }
  
  .info-box.primary {
    background: #e6f4ff;
    border-color: #91caff;
  }
  
  .info-box.warning {
    background: #fffbe6;
    border-color: #ffe58f;
  }
  
  .hint {
    color: var(--color-gray-500);
    font-size: 14px;
    margin-top: 8px;
  }
  
  .progress-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }
  
  .progress-step {
    flex: 1;
    height: 8px;
    background: var(--color-gray-300);
    border-radius: 4px;
  }
  
  .progress-step.completed {
    background: var(--color-success);
  }
  
  .progress-step.current {
    background: var(--color-primary);
  }
  
  .badge {
    display: inline-block;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
    margin-right: 8px;
  }
  
  .badge-blue {
    background: #e6f4ff;
    color: var(--color-primary);
  }
  
  .badge-green {
    background: #f6ffed;
    color: var(--color-success);
  }
  
  .message {
    padding: 12px 16px;
    border-radius: 6px;
    margin: 16px 0;
    display: none;
  }
  
  .message.show {
    display: block;
  }
  
  .message.success {
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    color: #389e0d;
  }
  
  .message.error {
    background: #fff2f0;
    border: 1px solid #ffccc7;
    color: #cf1322;
  }
  
  .content-box {
    background: var(--color-white);
    border: 1px solid var(--color-gray-300);
    border-radius: 6px;
    padding: 20px;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    font-size: 15px;
    line-height: 1.8;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .room-code {
    font-family: monospace;
    font-size: 18px;
    background: var(--color-gray-100);
    padding: 8px 16px;
    border-radius: 4px;
  }
  
  .victory {
    text-align: center;
    padding: 48px 24px;
  }
  
  .victory h1 {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 600px) {
    .player-select {
      grid-template-columns: 1fr;
    }
  }
</style>
`;

// Landing page HTML
const landingHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="https://hl-apps.web.app/favicon.svg">
  <title>🔐 Escape Room - 2 Player Co-op</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card" style="text-align: center; padding: 48px 24px;">
      <h1>🔐 Escape Room</h1>
      <p class="subtitle">A 2-player cooperative puzzle game</p>
      
      <div class="info-box primary" style="text-align: left; max-width: 500px; margin: 24px auto;">
        <h3>📋 How to Play</h3>
        <p style="margin-top: 8px;">
          • Two players work together to escape<br>
          • Each player sees <strong>different information</strong><br>
          • You must <strong>communicate</strong> to solve puzzles<br>
          • Share clues verbally - don't show your screen!
        </p>
      </div>
      
      <div style="margin: 32px 0;">
        <button class="btn btn-primary btn-lg" onclick="createRoom()">
          🚀 Create New Room
        </button>
      </div>
      
      <div style="margin-top: 32px;">
        <p style="color: var(--color-gray-500); margin-bottom: 12px;">Or join an existing room:</p>
        <div style="display: flex; gap: 12px; max-width: 400px; margin: 0 auto;">
          <input type="text" id="roomCode" class="input" placeholder="Enter room code" style="text-transform: uppercase;">
          <button class="btn btn-default" onclick="joinRoom()">Join</button>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    function createRoom() {
      window.location.href = '/api/create-room';
    }
    
    function joinRoom() {
      const code = document.getElementById('roomCode').value.trim().toUpperCase();
      if (code.length === 6) {
        window.location.href = '/room/' + code;
      } else {
        alert('Please enter a valid 6-character room code');
      }
    }
    
    document.getElementById('roomCode').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') joinRoom();
    });
  </script>
</body>
</html>
`;

// Room lobby HTML
function roomLobbyHTML(roomId: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="https://hl-apps.web.app/favicon.svg">
  <title>🔐 Room ${roomId}</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h2>🔐 Room Lobby</h2>
        <div class="room-code">Code: <strong>${roomId}</strong></div>
      </div>
      
      <p class="subtitle">Share this code with your partner, then each pick a role:</p>
      
      <div class="player-select">
        <div class="card player-card" onclick="selectPlayer(1)">
          <div class="icon">🔍</div>
          <h3>Player 1</h3>
          <p style="color: var(--color-gray-500);">The Investigator</p>
          <p style="font-size: 14px; margin-top: 8px;">You find clues and documents</p>
        </div>
        
        <div class="card player-card" onclick="selectPlayer(2)">
          <div class="icon">🔧</div>
          <h3>Player 2</h3>
          <p style="color: var(--color-gray-500);">The Operator</p>
          <p style="font-size: 14px; margin-top: 8px;">You interact with locks and devices</p>
        </div>
      </div>
      
      <div class="info-box warning" style="margin-top: 24px;">
        <strong>⚠️ Important:</strong> Don't show your screen to the other player! Communication is the key to escape.
      </div>
    </div>
  </div>
  
  <script>
    function selectPlayer(player) {
      window.location.href = '/room/${roomId}/player/' + player;
    }
  </script>
</body>
</html>
`;
}

// Game HTML for each player
function gameHTML(roomId: string, player: number, session: GameSession): string {
  const puzzleIndex = session.currentPuzzle;
  const puzzle = PUZZLES[puzzleIndex];
  const isComplete = puzzleIndex >= PUZZLES.length;
  
  if (isComplete) {
    return victoryHTML(roomId);
  }
  
  const playerInfo = player === 1 ? puzzle.player1Info : puzzle.player2Info;
  const hasInput = player === 2;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="https://hl-apps.web.app/favicon.svg">
  <title>🔐 ${puzzle.name} - Player ${player}</title>
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div>
          <span class="badge badge-blue">Player ${player}</span>
          <span class="badge badge-green">Puzzle ${puzzleIndex + 1}/${PUZZLES.length}</span>
        </div>
        <div class="room-code">${roomId}</div>
      </div>
      
      <div class="progress-bar">
        ${PUZZLES.map((_, i) => `
          <div class="progress-step ${i < puzzleIndex ? 'completed' : i === puzzleIndex ? 'current' : ''}"></div>
        `).join('')}
      </div>
      
      <h2>${puzzle.name}</h2>
      <p style="color: var(--color-gray-500); margin-bottom: 24px;">${puzzle.description}</p>
      
      <div class="card" style="border: 2px solid var(--color-primary);">
        <h3>${playerInfo.title}</h3>
        <div class="content-box">${playerInfo.content}</div>
        <p class="hint">💡 ${playerInfo.hint}</p>
      </div>
      
      ${hasInput ? `
        <div class="card" style="margin-top: 16px;">
          <h3>🎯 Your Action</h3>
          <form onsubmit="submitAnswer(event)">
            <div class="form-group">
              <label>Enter your answer:</label>
              <input type="text" id="answer" class="input" placeholder="Type your answer..." autocomplete="off">
            </div>
            <button type="submit" class="btn btn-primary btn-block">Submit Answer</button>
          </form>
          <div id="message" class="message"></div>
        </div>
      ` : `
        <div class="info-box" style="margin-top: 16px; text-align: center;">
          <p>📢 Share this information with Player 2!</p>
          <p style="font-size: 14px; color: var(--color-gray-500);">Waiting for them to solve the puzzle...</p>
          <button class="btn btn-default" style="margin-top: 12px;" onclick="location.reload()">🔄 Refresh Status</button>
        </div>
      `}
    </div>
  </div>
  
  <script>
    async function submitAnswer(e) {
      e.preventDefault();
      const answer = document.getElementById('answer').value.trim().toUpperCase();
      const msgEl = document.getElementById('message');
      
      try {
        const res = await fetch('/api/room/${roomId}/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer, puzzle: ${puzzleIndex} })
        });
        
        const data = await res.json();
        
        if (data.correct) {
          msgEl.className = 'message success show';
          msgEl.innerHTML = '✅ Correct! Moving to next puzzle...';
          setTimeout(() => location.reload(), 1500);
        } else {
          msgEl.className = 'message error show';
          msgEl.innerHTML = '❌ Incorrect. Try again!';
        }
      } catch (err) {
        msgEl.className = 'message error show';
        msgEl.innerHTML = '❌ Error submitting answer';
      }
    }
    
    // Auto-refresh for Player 1 to check progress
    ${player === 1 ? `setInterval(() => location.reload(), 10000);` : ''}
  </script>
</body>
</html>
`;
}

function victoryHTML(roomId: string): string {
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
      <h1>🎉 ESCAPED! 🎉</h1>
      <p style="font-size: 24px; margin-bottom: 24px;">Congratulations, you solved all puzzles!</p>
      <p style="color: var(--color-gray-500);">Great teamwork and communication!</p>
      <a href="/" class="btn btn-primary btn-lg" style="margin-top: 32px; text-decoration: none;">
        🔄 Play Again
      </a>
    </div>
  </div>
</body>
</html>
`;
}

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send(landingHTML);
});

// Firebase proxy routes
app.get('/apps/escape-room', (req: Request, res: Response) => res.send(landingHTML));
app.get('/apps/escape-room/', (req: Request, res: Response) => res.send(landingHTML));

app.get('/api/create-room', (req: Request, res: Response) => {
  const roomId = uuidv4().substring(0, 6).toUpperCase();
  sessions.set(roomId, {
    id: roomId,
    createdAt: new Date(),
    currentPuzzle: 0,
    solved: [],
    player1Joined: false,
    player2Joined: false
  });
  res.redirect('/room/' + roomId);
});

app.get('/room/:roomId', (req: Request, res: Response) => {
  const roomId = req.params.roomId.toUpperCase();
  if (!sessions.has(roomId)) {
    sessions.set(roomId, {
      id: roomId,
      createdAt: new Date(),
      currentPuzzle: 0,
      solved: [],
      player1Joined: false,
      player2Joined: false
    });
  }
  res.send(roomLobbyHTML(roomId));
});

app.get('/room/:roomId/player/:player', (req: Request, res: Response) => {
  const roomId = req.params.roomId.toUpperCase();
  const player = parseInt(req.params.player);
  
  let session = sessions.get(roomId);
  if (!session) {
    session = {
      id: roomId,
      createdAt: new Date(),
      currentPuzzle: 0,
      solved: [],
      player1Joined: false,
      player2Joined: false
    };
    sessions.set(roomId, session);
  }
  
  if (player === 1) session.player1Joined = true;
  if (player === 2) session.player2Joined = true;
  
  res.send(gameHTML(roomId, player, session));
});

app.post('/api/room/:roomId/answer', (req: Request, res: Response) => {
  const roomId = req.params.roomId.toUpperCase();
  const { answer, puzzle } = req.body;
  
  const session = sessions.get(roomId);
  if (!session) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }
  
  const currentPuzzle = PUZZLES[puzzle];
  if (!currentPuzzle) {
    res.status(400).json({ error: 'Invalid puzzle' });
    return;
  }
  
  const correctAnswer = currentPuzzle.player2Info.answer.toUpperCase();
  const isCorrect = answer.toUpperCase() === correctAnswer;
  
  if (isCorrect) {
    session.solved.push(true);
    session.currentPuzzle++;
  }
  
  res.json({ correct: isCorrect, nextPuzzle: session.currentPuzzle });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

app.get('/apps/escape-room/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// Start server
app.listen(port, () => {
  console.log(`🔐 Escape Room running on port ${port}`);
});

