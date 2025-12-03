package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", serveGame)
	http.HandleFunc("/apps/chess-slots", serveGame)
	http.HandleFunc("/apps/chess-slots/", serveGame)
	http.HandleFunc("/health", healthCheck)
	http.HandleFunc("/apps/chess-slots/health", healthCheck)

	log.Printf("Chess Slots starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status":"healthy","game":"chess-slots"}`)
}

func serveGame(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, gameHTML)
}

const gameHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="https://hl-apps.web.app/favicon.svg">
    <title>Chess Slots ♟️🎰</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Playfair+Display:wght@400;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cinzel', serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #d4af37;
            overflow: hidden;
        }
        
        .container {
            text-align: center;
            padding: 20px;
            max-width: 800px;
        }
        
        h1 {
            font-size: 3em;
            margin-bottom: 10px;
            text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
            letter-spacing: 4px;
        }
        
        .subtitle {
            font-family: 'Playfair Display', serif;
            font-size: 1.2em;
            color: #a0a0a0;
            margin-bottom: 30px;
        }
        
        .balance-container {
            background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
            border: 2px solid #d4af37;
            border-radius: 15px;
            padding: 15px 40px;
            margin-bottom: 30px;
            display: inline-block;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        
        .balance-label {
            font-size: 0.9em;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .balance {
            font-size: 2.5em;
            font-weight: 900;
            color: #ffd700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        
        .slot-machine {
            background: linear-gradient(180deg, #2d2d44 0%, #1a1a2e 50%, #0d0d1a 100%);
            border: 4px solid #d4af37;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.1);
            position: relative;
        }
        
        .slot-machine::before {
            content: '♔ ROYAL FLUSH ♔';
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #d4af37, #f4d03f, #d4af37);
            color: #1a1a2e;
            padding: 5px 25px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 700;
            letter-spacing: 2px;
        }
        
        .reels-container {
            display: flex;
            justify-content: center;
            gap: 10px;
            background: #0a0a15;
            padding: 20px;
            border-radius: 15px;
            border: 3px solid #333;
            box-shadow: inset 0 5px 20px rgba(0,0,0,0.8);
        }
        
        .reel {
            width: 100px;
            height: 280px;
            background: linear-gradient(180deg, #111 0%, #1a1a1a 50%, #111 100%);
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            border: 2px solid #444;
        }
        
        .reel-inner {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            transition: top 0.1s ease-out;
        }
        
        .symbol {
            width: 100%;
            height: 90px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3em;
            background: linear-gradient(180deg, #222 0%, #1a1a1a 100%);
            border-bottom: 1px solid #333;
        }
        
        .symbol.winning {
            animation: glow 0.5s ease-in-out infinite alternate;
            background: linear-gradient(180deg, #3d3d00 0%, #2a2a00 100%);
        }
        
        @keyframes glow {
            from { box-shadow: inset 0 0 20px rgba(255, 215, 0, 0.3); }
            to { box-shadow: inset 0 0 40px rgba(255, 215, 0, 0.6); }
        }
        
        .payline-indicator {
            position: absolute;
            left: -15px;
            right: -15px;
            height: 4px;
            background: linear-gradient(90deg, transparent, #d4af37, transparent);
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            z-index: 10;
        }
        
        .controls {
            display: flex;
            gap: 20px;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .spin-btn {
            background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%);
            color: #1a1a2e;
            border: none;
            padding: 20px 60px;
            font-size: 1.5em;
            font-family: 'Cinzel', serif;
            font-weight: 900;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        .spin-btn:hover:not(:disabled) {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 15px 40px rgba(212, 175, 55, 0.6);
        }
        
        .spin-btn:active:not(:disabled) {
            transform: translateY(0) scale(0.98);
        }
        
        .spin-btn:disabled {
            background: #555;
            color: #888;
            cursor: not-allowed;
            box-shadow: none;
        }
        
        .spin-cost {
            background: rgba(0,0,0,0.3);
            padding: 10px 25px;
            border-radius: 25px;
            font-size: 1em;
            color: #aaa;
        }
        
        .message {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5em;
            margin-top: 20px;
        }
        
        .message.win {
            color: #ffd700;
            animation: pulse 0.5s ease-in-out infinite;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
        }
        
        .message.lose {
            color: #666;
        }
        
        .message.jackpot {
            font-size: 2em;
            color: #ff6b6b;
            animation: rainbow 1s linear infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        @keyframes rainbow {
            0% { color: #ff6b6b; }
            25% { color: #ffd700; }
            50% { color: #4ecdc4; }
            75% { color: #a855f7; }
            100% { color: #ff6b6b; }
        }
        
        .paytable {
            background: rgba(0,0,0,0.3);
            border: 1px solid #333;
            border-radius: 15px;
            padding: 20px;
            margin-top: 30px;
            text-align: left;
        }
        
        .paytable h3 {
            text-align: center;
            margin-bottom: 15px;
            color: #d4af37;
            font-size: 1.2em;
        }
        
        .paytable-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
        }
        
        .pay-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
        }
        
        .pay-symbol {
            font-size: 1.5em;
            width: 40px;
            text-align: center;
        }
        
        .pay-value {
            color: #4ecdc4;
            font-weight: bold;
        }
        
        .reset-btn {
            background: transparent;
            border: 1px solid #666;
            color: #666;
            padding: 8px 20px;
            border-radius: 20px;
            cursor: pointer;
            font-family: 'Cinzel', serif;
            font-size: 0.9em;
            transition: all 0.3s;
            margin-top: 20px;
        }
        
        .reset-btn:hover {
            border-color: #d4af37;
            color: #d4af37;
        }
        
        .spinning .reel-inner {
            animation: spin 0.1s linear infinite;
        }
        
        @keyframes spin {
            from { top: 0; }
            to { top: -90px; }
        }
        
        @media (max-width: 600px) {
            h1 { font-size: 2em; }
            .reel { width: 70px; height: 200px; }
            .symbol { height: 65px; font-size: 2em; }
            .spin-btn { padding: 15px 40px; font-size: 1.2em; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>♟️ Chess Slots ♟️</h1>
        <p class="subtitle">Match the royalty to claim your fortune</p>
        
        <div class="balance-container">
            <div class="balance-label">Your Balance</div>
            <div class="balance"><span id="coins">500</span> 🪙</div>
        </div>
        
        <div class="slot-machine">
            <div class="reels-container">
                <div class="payline-indicator"></div>
                <div class="reel" id="reel1"><div class="reel-inner"></div></div>
                <div class="reel" id="reel2"><div class="reel-inner"></div></div>
                <div class="reel" id="reel3"><div class="reel-inner"></div></div>
                <div class="reel" id="reel4"><div class="reel-inner"></div></div>
                <div class="reel" id="reel5"><div class="reel-inner"></div></div>
            </div>
        </div>
        
        <div class="controls">
            <div class="spin-cost">Cost: 5 🪙</div>
            <button class="spin-btn" id="spinBtn" onclick="spin()">♔ SPIN ♔</button>
        </div>
        
        <div class="message" id="message"></div>
        
        <div class="paytable">
            <h3>💰 Paytable (3+ matching on payline)</h3>
            <div class="paytable-grid">
                <div class="pay-item"><span class="pay-symbol">👑</span> Queen <span class="pay-value">x100</span></div>
                <div class="pay-item"><span class="pay-symbol">♚</span> King <span class="pay-value">x75</span></div>
                <div class="pay-item"><span class="pay-symbol">🏰</span> Rook <span class="pay-value">x50</span></div>
                <div class="pay-item"><span class="pay-symbol">⛪</span> Bishop <span class="pay-value">x30</span></div>
                <div class="pay-item"><span class="pay-symbol">🐴</span> Knight <span class="pay-value">x20</span></div>
                <div class="pay-item"><span class="pay-symbol">🅰️</span> Ace <span class="pay-value">x10</span></div>
                <div class="pay-item"><span class="pay-symbol">🇰</span> King <span class="pay-value">x8</span></div>
                <div class="pay-item"><span class="pay-symbol">🇶</span> Queen <span class="pay-value">x6</span></div>
                <div class="pay-item"><span class="pay-symbol">🇯</span> Jack <span class="pay-value">x4</span></div>
            </div>
        </div>
        
        <button class="reset-btn" onclick="resetGame()">Reset Game</button>
    </div>
    
    <script>
        // Symbols with their weights (higher = more common) and payouts
        const symbols = [
            { symbol: '👑', name: 'Queen', weight: 2, payout: 100 },
            { symbol: '♚', name: 'King', weight: 3, payout: 75 },
            { symbol: '🏰', name: 'Rook', weight: 5, payout: 50 },
            { symbol: '⛪', name: 'Bishop', weight: 7, payout: 30 },
            { symbol: '🐴', name: 'Knight', weight: 10, payout: 20 },
            { symbol: '🅰️', name: 'Ace', weight: 15, payout: 10 },
            { symbol: '🇰', name: 'K', weight: 18, payout: 8 },
            { symbol: '🇶', name: 'Q', weight: 20, payout: 6 },
            { symbol: '🇯', name: 'J', weight: 22, payout: 4 },
        ];
        
        const SPIN_COST = 5;
        const NUM_REELS = 5;
        const VISIBLE_SYMBOLS = 3;
        
        let coins = parseInt(localStorage.getItem('chessSlots_coins')) || 500;
        let isSpinning = false;
        
        function init() {
            updateDisplay();
            // Initialize reels with random symbols
            for (let i = 1; i <= NUM_REELS; i++) {
                const reelInner = document.querySelector('#reel' + i + ' .reel-inner');
                reelInner.innerHTML = '';
                for (let j = 0; j < VISIBLE_SYMBOLS; j++) {
                    const sym = getRandomSymbol();
                    const div = document.createElement('div');
                    div.className = 'symbol';
                    div.textContent = sym.symbol;
                    div.dataset.symbol = sym.symbol;
                    reelInner.appendChild(div);
                }
            }
        }
        
        function getRandomSymbol() {
            const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
            let random = Math.random() * totalWeight;
            for (const sym of symbols) {
                random -= sym.weight;
                if (random <= 0) return sym;
            }
            return symbols[symbols.length - 1];
        }
        
        function updateDisplay() {
            document.getElementById('coins').textContent = coins;
            document.getElementById('spinBtn').disabled = coins < SPIN_COST || isSpinning;
            localStorage.setItem('chessSlots_coins', coins);
        }
        
        function showMessage(text, type = '') {
            const msg = document.getElementById('message');
            msg.textContent = text;
            msg.className = 'message ' + type;
        }
        
        async function spin() {
            if (isSpinning || coins < SPIN_COST) return;
            
            isSpinning = true;
            coins -= SPIN_COST;
            updateDisplay();
            showMessage('');
            
            // Clear winning highlights
            document.querySelectorAll('.symbol').forEach(s => s.classList.remove('winning'));
            
            // Generate final results
            const results = [];
            for (let i = 0; i < NUM_REELS; i++) {
                results.push(getRandomSymbol());
            }
            
            // Spin animation for each reel with delay
            const spinDurations = [1000, 1300, 1600, 1900, 2200];
            
            for (let i = 1; i <= NUM_REELS; i++) {
                const reel = document.getElementById('reel' + i);
                const reelInner = reel.querySelector('.reel-inner');
                
                // Add spinning class
                reel.classList.add('spinning');
                
                // Generate many symbols for spinning effect
                reelInner.innerHTML = '';
                for (let j = 0; j < 30; j++) {
                    const sym = (j < 27) ? getRandomSymbol() : results[i-1];
                    const div = document.createElement('div');
                    div.className = 'symbol';
                    div.textContent = sym.symbol;
                    div.dataset.symbol = sym.symbol;
                    reelInner.appendChild(div);
                }
                
                // Stop after duration
                setTimeout(() => {
                    reel.classList.remove('spinning');
                    reelInner.innerHTML = '';
                    
                    // Show final symbols (result in middle)
                    const beforeSym = getRandomSymbol();
                    const afterSym = getRandomSymbol();
                    
                    [beforeSym, results[i-1], afterSym].forEach((sym, idx) => {
                        const div = document.createElement('div');
                        div.className = 'symbol';
                        div.textContent = sym.symbol;
                        div.dataset.symbol = sym.symbol;
                        if (idx === 1) div.id = 'result-' + i;
                        reelInner.appendChild(div);
                    });
                }, spinDurations[i-1]);
            }
            
            // Check results after all reels stop
            setTimeout(() => {
                checkWin(results);
                isSpinning = false;
                updateDisplay();
            }, 2400);
        }
        
        function checkWin(results) {
            const symbolCounts = {};
            results.forEach(r => {
                symbolCounts[r.symbol] = (symbolCounts[r.symbol] || 0) + 1;
            });
            
            let maxCount = 0;
            let winningSymbol = null;
            let payout = 0;
            
            for (const [symbol, count] of Object.entries(symbolCounts)) {
                if (count >= 3 && count > maxCount) {
                    maxCount = count;
                    winningSymbol = symbol;
                    const symData = symbols.find(s => s.symbol === symbol);
                    if (symData) {
                        // Bonus for 4 or 5 of a kind
                        let multiplier = symData.payout;
                        if (count === 4) multiplier *= 3;
                        if (count === 5) multiplier *= 10;
                        payout = SPIN_COST * multiplier;
                    }
                }
            }
            
            if (payout > 0) {
                coins += payout;
                updateDisplay();
                
                // Highlight winning symbols
                for (let i = 1; i <= NUM_REELS; i++) {
                    const resultEl = document.getElementById('result-' + i);
                    if (resultEl && resultEl.textContent === winningSymbol) {
                        resultEl.classList.add('winning');
                    }
                }
                
                if (maxCount === 5) {
                    showMessage('🎉 JACKPOT! +' + payout + ' coins! 🎉', 'jackpot');
                } else if (maxCount === 4) {
                    showMessage('🔥 BIG WIN! +' + payout + ' coins!', 'win');
                } else {
                    showMessage('✨ WIN! +' + payout + ' coins!', 'win');
                }
            } else {
                showMessage('No luck this time...', 'lose');
            }
            
            // Check if out of coins
            if (coins < SPIN_COST) {
                setTimeout(() => {
                    showMessage('💀 Out of coins! Reset to play again.', 'lose');
                }, 1500);
            }
        }
        
        function resetGame() {
            if (confirm('Reset your balance to 500 coins?')) {
                coins = 500;
                updateDisplay();
                showMessage('');
                init();
            }
        }
        
        // Initialize
        init();
    </script>
</body>
</html>
`

