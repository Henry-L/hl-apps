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
  <style>
    .unlocked {
      animation: fadeIn 0.5s ease-out;
      border-left: 3px solid var(--success) !important;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .new-badge {
      background: var(--success);
      color: white;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      margin-left: 8px;
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <a href="/" class="btn btn-default">← Exit</a>
        <div class="progress-text">
          Solved: <strong id="solved-count">0</strong> / <span id="total-count">0</span>
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
    const ALL_ITEMS = ${itemsJSON};
    const STORAGE_KEY = 'escapeRoom_solved_p' + PLAYER;
    const SEEN_KEY = 'escapeRoom_seen_p' + PLAYER;
    
    // Get solved puzzles from localStorage
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
    
    // Track which items have been seen (to show "NEW" badge)
    function getSeen() {
      try {
        return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));
      } catch {
        return new Set();
      }
    }
    
    function saveSeen(seen) {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
    }
    
    function shuffleArray(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    
    // Get items that are currently visible (unlocked)
    function getVisibleItems(solved) {
      return ALL_ITEMS.filter(item => {
        if (!item.unlockedBy) return true; // No requirement = always visible
        return solved.has(item.unlockedBy); // Visible if requirement is solved
      });
    }
    
    function render() {
      const solved = getSolved();
      const seen = getSeen();
      const container = document.getElementById('items-container');
      
      // Get visible items based on what's been solved
      const visibleItems = getVisibleItems(solved);
      const shuffled = shuffleArray(visibleItems);
      
      // Count puzzles
      const myPuzzles = visibleItems.filter(i => i.hasInput);
      const mySolvedCount = myPuzzles.filter(p => solved.has(p.id)).length;
      const totalPuzzles = ALL_ITEMS.filter(i => i.hasInput).length;
      
      document.getElementById('solved-count').textContent = mySolvedCount;
      document.getElementById('total-count').textContent = totalPuzzles;
      
      // Check victory (all puzzles solved)
      const allPuzzles = ALL_ITEMS.filter(i => i.hasInput);
      const allSolved = allPuzzles.every(p => solved.has(p.id));
      
      if (allSolved) {
        document.getElementById('victory').classList.add('show');
        document.getElementById('footer').classList.add('hidden');
        container.innerHTML = '';
        return;
      }
      
      // Mark all visible items as seen
      const newSeen = new Set(seen);
      visibleItems.forEach(item => newSeen.add(item.id));
      saveSeen(newSeen);
      
      container.innerHTML = shuffled.map(item => {
        const isSolved = item.hasInput && solved.has(item.id);
        const isNew = !seen.has(item.id);
        const isUnlocked = item.unlockedBy && solved.has(item.unlockedBy);
        
        return \`
          <div class="card item-card \${isSolved ? 'solved' : ''} \${isUnlocked ? 'unlocked' : ''}" id="card-\${item.id}">
            <h2>
              \${item.title}
              \${isSolved ? '<span class="solved-badge">✅</span>' : ''}
              \${isNew ? '<span class="new-badge">NEW</span>' : ''}
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
      const item = ALL_ITEMS.find(i => i.id === itemId);
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
      localStorage.removeItem(SEEN_KEY);
      render();
    }
    
    // Initial render
    render();
  </script>
`;
}
