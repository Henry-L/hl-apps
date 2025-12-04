// Shared CSS styles following design guide
export const STYLES = `
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

