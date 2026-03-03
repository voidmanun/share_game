const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newBtn = `            <button id="changelog-btn" style="padding: 10px; font-size: 16px; border-radius: 8px; background: #ff9900; color: #000; font-family: 'Fredoka One', cursive; cursor: pointer; border: 3px solid #000; font-weight: bold; box-shadow: 3px 3px 0 #000; text-shadow: none;">📜 版本列表</button>\n            <div style="margin-top: 10px;`;
html = html.replace('<div style="margin-top: 10px;', newBtn);

const newModal = `        <div id="changelog-modal" class="hidden" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.85); color: white; padding: 20px; border-radius: 10px; z-index: 3000; text-align: center; min-width: 300px; max-width: 80%; max-height: 80vh; overflow-y: auto; border: 2px solid #ffcc00;">
          <h2 id="changelog-title" style="margin-top: 0; color: #ffcc00; text-shadow: 1px 1px 0 #000;">📜 版本列表</h2>
          <div id="changelog-list" style="text-align: left; font-size: 14px; margin: 15px 0; padding-left: 10px; display: flex; flex-direction: column; gap: 10px;"></div>
          <button id="close-changelog-btn" style="padding: 8px 16px; font-size: 16px; font-family: 'Fredoka One', cursive; cursor: pointer; border: none; border-radius: 5px; background: #ffcc00; color: #333;">关闭</button>
        </div>
        <div id="leaderboard-modal"`;
html = html.replace('<div id="leaderboard-modal"', newModal);

fs.writeFileSync('index.html', html);
console.log('index.html patched');
