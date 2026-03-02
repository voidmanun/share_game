const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetToReplace = `<div id="instructions">
            <div style="margin-bottom: 8px;">
              <span class="desktop-only">WASD to Move | P to Shop</span>
              <button id="mobile-shop-btn" class="mobile-only">Shop</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
              <button id="mute-btn"
                style="padding: 4px 8px; font-size: 14px; display: inline-flex; align-items: center; gap: 4px;">🔊
                Sound: ON</button>
                            <button id="lang-btn"
                style="padding: 4px 8px; font-size: 14px; display: inline-flex; align-items: center; gap: 4px;">🌐
                English</button>
              <button id="leaderboard-btn"
                style="padding: 4px 8px; font-size: 14px; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;">🏆
                Leaderboard</button>
              <button id="encyclopedia-btn"
                style="padding: 4px 8px; font-size: 14px; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;">📖
                Encyclopedia</button>

            </div>
          </div>`;

const newHudTop = `<div style="margin-bottom: 8px; pointer-events: auto;">
            <button id="settings-btn" style="padding: 8px 16px; font-size: 18px; display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; background: rgba(0,0,0,0.6); color: white; border: 2px solid #fff; font-family: 'Fredoka One', cursive; cursor: pointer;">
              ⚙️ <span id="settings-text">Settings</span>
            </button>
          </div>`;

html = html.replace(targetToReplace, '');
html = html.replace('<div id="hud">', '<div id="hud">\n          ' + newHudTop);

const settingsModal = `
        <div id="settings-modal" class="hidden" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.85); color: white; padding: 25px; border-radius: 12px; z-index: 2500; text-align: center; min-width: 280px; border: 2px solid #66ccff; pointer-events: auto;">
          <h2 id="settings-title" style="margin-top: 0; margin-bottom: 20px; color: #66ccff; text-shadow: 1px 1px 0 #000;">⚙️ Settings</h2>
          <div style="display: flex; flex-direction: column; gap: 12px; align-items: stretch;">
            <button id="mobile-shop-btn" style="padding: 10px; font-size: 16px; border-radius: 8px; background: #ffaa00; color: #000; font-family: 'Fredoka One', cursive; cursor: pointer; border: 2px solid #fff; font-weight: bold;">🛒 Shop</button>
            <button id="mute-btn" style="padding: 10px; font-size: 16px; border-radius: 8px; background: #ffaa00; color: #000; font-family: 'Fredoka One', cursive; cursor: pointer; border: 2px solid #fff; font-weight: bold;">🔊 Sound: ON</button>
            <button id="lang-btn" style="padding: 10px; font-size: 16px; border-radius: 8px; background: #ffaa00; color: #000; font-family: 'Fredoka One', cursive; cursor: pointer; border: 2px solid #fff; font-weight: bold;">🌐 English</button>
            <button id="leaderboard-btn" style="padding: 10px; font-size: 16px; border-radius: 8px; background: #ffaa00; color: #000; font-family: 'Fredoka One', cursive; cursor: pointer; border: 2px solid #fff; font-weight: bold;">🏆 Leaderboard</button>
            <button id="encyclopedia-btn" style="padding: 10px; font-size: 16px; border-radius: 8px; background: #ffaa00; color: #000; font-family: 'Fredoka One', cursive; cursor: pointer; border: 2px solid #fff; font-weight: bold;">📖 Encyclopedia</button>
            <div style="margin-top: 10px; font-size: 12px; color: #ccc;">
              <span class="desktop-only" id="desktop-hint">WASD to Move | P to Shop</span>
            </div>
          </div>
          <button id="close-settings-btn" style="margin-top: 20px; padding: 10px 20px; font-size: 16px; font-family: 'Fredoka One', cursive; cursor: pointer; border: none; border-radius: 8px; background: #66ccff; color: #333; width: 100%; font-weight: bold;">Close</button>
        </div>
`;
html = html.replace('<div id="leaderboard-modal"', settingsModal + '        <div id="leaderboard-modal"');

fs.writeFileSync('index.html', html);
console.log('Updated index.html safely');
