import { STYLES } from './styles';
import { Item, PLAYER1_ITEMS, PLAYER2_ITEMS } from '../data/items';

export function playerHTML(player: 1 | 2): string {
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
  
  ${gameScript(player, itemsJSON)}
</body>
</html>
`;
}

function gameScript(player: number, itemsJSON: string): string {
  return `
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
`;
}

