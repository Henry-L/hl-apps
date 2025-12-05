import { STYLES } from './styles';

export function getLandingHTML(basePath: string = '') {
  return `
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
        <a href="${basePath}/play/1" class="card player-card" style="text-decoration: none; color: inherit;">
          <div class="icon">👤</div>
          <h2 style="margin: 0;">Player 1</h2>
        </a>
        
        <a href="${basePath}/play/2" class="card player-card" style="text-decoration: none; color: inherit;">
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
}

// Keep backwards compatibility
export const landingHTML = getLandingHTML();
