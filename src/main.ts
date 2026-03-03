import './style.css'
import { Game } from './Game'
import { getLanguage, setLanguage, t } from './i18n';
import { getLeaderboard } from './leaderboard';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game('game-canvas');

  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar');
  const startBtn = document.getElementById('start-btn');
  const muteBtn = document.getElementById('mute-btn');
  const langBtn = document.getElementById('lang-btn');
  const loadingText = loadingScreen?.querySelector('h1');

  muteBtn?.addEventListener('click', () => {
    game.soundManager.toggleMute();
    if (muteBtn) {
      const soundOnText = getLanguage() === 'zh' ? '🔊 声音: 开' : '🔊 Sound: ON';
      const soundOffText = getLanguage() === 'zh' ? '🔇 声音: 关' : '🔇 Sound: OFF';
      muteBtn.textContent = game.soundManager.isMuted ? soundOffText : soundOnText;
    }
  });


  const leaderboardBtn = document.getElementById('leaderboard-btn');
  const leaderboardModal = document.getElementById('leaderboard-modal');
  const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
  const modalLeaderboardList = document.getElementById('modal-leaderboard-list');

  
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const mobileShopBtn = document.getElementById('mobile-shop-btn'); // the shop btn in settings

  settingsBtn?.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.remove('hidden');
    game.pause();
  });

  closeSettingsBtn?.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.add('hidden');
    game.resume();
  });

  // When clicking shop from settings, close settings so it doesn't overlap
  mobileShopBtn?.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.add('hidden');
    // The shop toggle logic handles pausing/resuming
  });

  // Similarly for leaderboard and encyclopedia, they might not pause/resume cleanly if settings isn't closed
  // But they are just modals that don't resume game by themselves currently. Wait, leaderboard btn doesn't pause game today?
  // Let's modify leaderboard and encyclopedia to just hide settings modal when opened.
  leaderboardBtn?.addEventListener('click', async (e) => {
    if (settingsModal) settingsModal.classList.add('hidden');

    e.preventDefault();
    if (leaderboardModal) leaderboardModal.classList.remove('hidden');
    if (modalLeaderboardList) {
      modalLeaderboardList.innerHTML = '<li>Loading...</li>';
      try {
        const data = await getLeaderboard();
        modalLeaderboardList.innerHTML = '';
        if (Array.isArray(data) && data.length > 0) {
          data.slice(0, 10).forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.name} - ${entry.score}`;
            modalLeaderboardList.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.textContent = getLanguage() === 'zh' ? '暂无数据' : 'No Data';
          modalLeaderboardList.appendChild(li);
        }
      } catch (err) {
        modalLeaderboardList.innerHTML = '<li>Error loading leaderboard</li>';
      }
    }
  });

  closeLeaderboardBtn?.addEventListener('click', () => {
    game.resume();
    if (leaderboardModal) leaderboardModal.classList.add('hidden');
  });

  // Encyclopedia functionality
  const encyclopediaBtn = document.getElementById('encyclopedia-btn');
  const encyclopediaModal = document.getElementById('encyclopedia-modal');
  const closeEncyclopediaBtn = document.getElementById('close-encyclopedia-btn');
  const encyclopediaContent = document.getElementById('encyclopedia-content');
  const tabWeapons = document.getElementById('tab-weapons');
  const tabMonsters = document.getElementById('tab-monsters');
  const tabPets = document.getElementById('tab-pets');

  // SVG Icons for monsters - matching actual game rendering
  const monsterSvgs: Record<string, string> = {
    'Basic': `<svg width="40" height="40" viewBox="0 0 40 40"><path d="M10 26 Q6 16 20 12 Q34 16 30 26 Q32 30 26 28 Q20 32 14 28 Q8 30 10 26" fill="#39FF14" stroke="#000" stroke-width="2"/><circle cx="20" cy="17" r="5" fill="#fff" stroke="#000" stroke-width="2"/><ellipse cx="20" cy="17" rx="2" ry="4" fill="#000"/><line x1="20" y1="12" x2="18" y2="6" stroke="#000" stroke-width="2"/><line x1="20" y1="12" x2="22" y2="6" stroke="#000" stroke-width="2"/><circle cx="18" cy="5" r="2" fill="#FF3333" stroke="#000" stroke-width="1"/><circle cx="22" cy="5" r="2" fill="#FF3333" stroke="#000" stroke-width="1"/></svg>`,
    'Scout': `<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="32,20 10,10 10,30" fill="#00FFFF" stroke="#000" stroke-width="3"/><circle cx="24" cy="20" r="3" fill="#fff" stroke="#000" stroke-width="1"/><circle cx="25" cy="20" r="1.5" fill="#000"/></svg>`,
    'Swarm': `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="10" r="5" fill="#AA44AA" stroke="#000" stroke-width="2"/><circle cx="12" cy="18" r="4" fill="#AA44AA" stroke="#000" stroke-width="2"/><circle cx="28" cy="18" r="4" fill="#AA44AA" stroke="#000" stroke-width="2"/><circle cx="16" cy="28" r="4" fill="#AA44AA" stroke="#000" stroke-width="2"/><circle cx="24" cy="28" r="4" fill="#AA44AA" stroke="#000" stroke-width="2"/></svg>`,
    'Tank': `<svg width="40" height="40" viewBox="0 0 40 40"><rect x="5" y="14" width="30" height="20" rx="3" fill="#448844" stroke="#000" stroke-width="3"/><rect x="8" y="10" width="24" height="6" rx="2" fill="#336633" stroke="#000" stroke-width="2"/><circle cx="20" cy="24" r="5" fill="#224422"/><circle cx="15" cy="18" r="2" fill="#fff"/><circle cx="25" cy="18" r="2" fill="#fff"/></svg>`,
    'Splitter': `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="#FF6666" stroke="#000" stroke-width="2"/><circle cx="20" cy="20" r="6" fill="#FFCCCC" stroke="#000" stroke-width="1"/><line x1="20" y1="8" x2="20" y2="2" stroke="#FF6666" stroke-width="3"/><line x1="20" y1="32" x2="20" y2="38" stroke="#FF6666" stroke-width="3"/><line x1="8" y1="20" x2="2" y2="20" stroke="#FF6666" stroke-width="3"/><line x1="32" y1="20" x2="38" y2="20" stroke="#FF6666" stroke-width="3"/></svg>`,
    'Charger': `<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="32,20 10,8 10,32" fill="#CC3333" stroke="#000" stroke-width="3"/><circle cx="26" cy="15" r="3" fill="#fff"/><circle cx="26" cy="25" r="3" fill="#fff"/><circle cx="26" cy="15" r="1.5" fill="#000"/><circle cx="26" cy="25" r="1.5" fill="#000"/><path d="M8 17 L4 20 L8 23" stroke="#000" stroke-width="2" fill="none"/></svg>`,
    'Teleporter': `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="#9933FF" stroke="#000" stroke-width="2"/><circle cx="20" cy="20" r="10" fill="none" stroke="#CC66FF" stroke-width="2"/><circle cx="20" cy="20" r="5" fill="#CC66FF"/><circle cx="16" cy="16" r="2" fill="#fff"/></svg>`,
    'Star': `<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,4 23,14 34,14 25,21 28,32 20,25 12,32 15,21 6,14 17,14" fill="#FFCC00" stroke="#000" stroke-width="2"/><circle cx="17" cy="18" r="2" fill="#000"/><circle cx="23" cy="18" r="2" fill="#000"/></svg>`,
    'Boss': `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="22" r="14" fill="#880000" stroke="#000" stroke-width="3"/><polygon points="20,4 23,12 31,12 25,18 27,26 20,22 13,18 9,12 17,26 15,18" fill="#FFCC00" stroke="#000" stroke-width="2"/><circle cx="15" cy="18" r="3" fill="#fff"/><circle cx="25" cy="18" r="3" fill="#fff"/><circle cx="15" cy="18" r="1.5" fill="#000"/><circle cx="25" cy="18" r="1.5" fill="#000"/></svg>`,
    'Twin Elite': `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="14" cy="20" r="10" fill="#4444FF" stroke="#000" stroke-width="3"/><circle cx="26" cy="20" r="10" fill="#4444FF" stroke="#000" stroke-width="3"/><circle cx="14" cy="17" r="2" fill="#fff"/><circle cx="26" cy="17" r="2" fill="#fff"/><circle cx="14" cy="23" r="2" fill="#fff"/><circle cx="26" cy="23" r="2" fill="#fff"/></svg>`,
    'Titan': `<svg width="40" height="40" viewBox="0 0 40 40"><rect x="4" y="10" width="32" height="26" rx="4" fill="#555555" stroke="#000" stroke-width="3"/><rect x="6" y="4" width="12" height="8" rx="2" fill="#777777" stroke="#000" stroke-width="2"/><rect x="22" y="4" width="12" height="8" rx="2" fill="#777777" stroke="#000" stroke-width="2"/><circle cx="12" cy="18" r="3" fill="#FF0000"/><circle cx="28" cy="18" r="3" fill="#FF0000"/><rect x="10" y="28" width="20" height="5" fill="#333333"/></svg>`,
  };

  // SVG Icons for pets - matching actual game rendering
  const petSvgs: Record<string, string> = {
    'Greedy Dog': `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="#8B4513" stroke="#000" stroke-width="3"/><ellipse cx="15" cy="12" rx="3" ry="5" fill="#654321" stroke="#000" stroke-width="2"/><ellipse cx="25" cy="12" rx="3" ry="5" fill="#654321" stroke="#000" stroke-width="2"/><circle cx="16" cy="18" r="2" fill="#fff"/><circle cx="24" cy="18" r="2" fill="#fff"/><circle cx="16" cy="18" r="1" fill="#000"/><circle cx="24" cy="18" r="1" fill="#000"/><circle cx="20" cy="22" r="2" fill="#000"/></svg>`,
    'Magic Fairy': `<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,8 28,20 20,32 12,20" fill="#FFB6C1" stroke="#000" stroke-width="3"/><ellipse cx="14" cy="16" rx="5" ry="3" fill="#fff" stroke="#000" stroke-width="1"/><ellipse cx="26" cy="16" rx="5" ry="3" fill="#fff" stroke="#000" stroke-width="1"/><circle cx="16" cy="16" r="1" fill="#000"/><circle cx="24" cy="16" r="1" fill="#000"/></svg>`,
    'Speedy Turtle': `<svg width="40" height="40" viewBox="0 0 40 40"><ellipse cx="20" cy="20" rx="14" ry="12" fill="#2E8B57" stroke="#000" stroke-width="3"/><ellipse cx="20" cy="20" rx="8" ry="6" fill="#006400" stroke="#000" stroke-width="1"/><circle cx="16" cy="16" r="2" fill="#000"/><circle cx="24" cy="16" r="2" fill="#000"/><circle cx="20" cy="28" r="4" fill="#3CB371" stroke="#000" stroke-width="2"/></svg>`,
    'Grumpy Porcupine': `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="22" r="10" fill="#666666" stroke="#000" stroke-width="3"/><line x1="20" y1="12" x2="20" y2="4" stroke="#888888" stroke-width="3"/><line x1="14" y1="14" x2="8" y2="8" stroke="#888888" stroke-width="3"/><line x1="26" y1="14" x2="32" y2="8" stroke="#888888" stroke-width="3"/><line x1="10" y1="22" x2="4" y2="20" stroke="#888888" stroke-width="3"/><line x1="30" y1="22" x2="36" y2="20" stroke="#888888" stroke-width="3"/><circle cx="16" cy="20" r="2" fill="#fff"/><circle cx="24" cy="20" r="2" fill="#fff"/><circle cx="16" cy="20" r="1" fill="#000"/><circle cx="24" cy="20" r="1" fill="#000"/></svg>`,
    'Bouncy Slime': `<svg width="40" height="40" viewBox="0 0 40 40"><ellipse cx="20" cy="24" rx="10" ry="8" fill="#32CD32" stroke="#006400" stroke-width="2"/><circle cx="17" cy="20" r="1.5" fill="#000"/><circle cx="23" cy="20" r="1.5" fill="#000"/></svg>`,
    'Lucky Cat': `<svg width="40" height="40" viewBox="0 0 40 40"><ellipse cx="20" cy="24" rx="12" ry="10" fill="#FFFFFF" stroke="#000" stroke-width="3"/><polygon points="12,16 6,6 16,12" fill="#FFFFFF" stroke="#000" stroke-width="2"/><polygon points="28,16 34,6 24,12" fill="#FFFFFF" stroke="#000" stroke-width="2"/><polygon points="12,16 6,6 16,12" fill="#FF6666"/><polygon points="28,16 34,6 24,12" fill="#FF6666"/><circle cx="15" cy="20" r="3" fill="#000"/><circle cx="25" cy="20" r="3" fill="#000"/><circle cx="14" cy="19" r="1" fill="#fff"/><circle cx="24" cy="19" r="1" fill="#fff"/><ellipse cx="20" cy="26" rx="3" ry="2" fill="#FF6666"/><line x1="17" y1="10" x2="23" y2="10" stroke="#000" stroke-width="2"/></svg>`,
  };

  // SVG Icons for weapons
  const weaponSvgs: Record<string, string> = {
    'Magic Wand': `<svg width="40" height="40" viewBox="0 0 40 40"><rect x="18" y="15" width="4" height="20" rx="2" fill="#8B4513" stroke="#000" stroke-width="1"/><circle cx="20" cy="10" r="6" fill="#9933ff" stroke="#000" stroke-width="1"/><circle cx="18" cy="8" r="2" fill="#fff"/></svg>`,
    'Laser': `<svg width="40" height="40" viewBox="0 0 40 40"><rect x="15" y="18" width="10" height="4" fill="#444" stroke="#000" stroke-width="1"/><rect x="10" y="10" width="20" height="3" fill="#ff0000" stroke="#000" stroke-width="1"/><rect x="10" y="27" width="20" height="3" fill="#ff0000" stroke="#000" stroke-width="1"/><circle cx="20" cy="20" r="4" fill="#ff0000" stroke="#000" stroke-width="1"/></svg>`,
    'Missile Launcher': `<svg width="40" height="40" viewBox="0 0 40 40"><rect x="8" y="12" width="24" height="16" rx="2" fill="#666" stroke="#000" stroke-width="2"/><circle cx="14" cy="20" r="4" fill="#333" stroke="#000" stroke-width="1"/><circle cx="26" cy="20" r="4" fill="#333" stroke="#000" stroke-width="1"/><polygon points="6,18 2,20 6,22" fill="#ff6600" stroke="#000" stroke-width="1"/></svg>`,
    'Shotgun': `<svg width="40" height="40" viewBox="0 0 40 40"><rect x="14" y="16" width="18" height="6" rx="1" fill="#444" stroke="#000" stroke-width="2"/><rect x="30" y="14" width="4" height="10" rx="1" fill="#222" stroke="#000" stroke-width="1"/><rect x="8" y="18" width="8" height="2" fill="#222" stroke="#000" stroke-width="1"/></svg>`,
    'Orbit Shield': `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#00ccff" stroke-width="2" stroke-dasharray="4,2"/><circle cx="20" cy="8" r="5" fill="#00ccff" stroke="#000" stroke-width="1"/><circle cx="32" cy="20" r="5" fill="#00ccff" stroke="#000" stroke-width="1"/><circle cx="20" cy="32" r="5" fill="#00ccff" stroke="#000" stroke-width="1"/><circle cx="8" cy="20" r="5" fill="#00ccff" stroke="#000" stroke-width="1"/></svg>`,
    'Bubble Gun': `<svg width="40" height="40" viewBox="0 0 40 40"><rect x="14" y="18" width="12" height="8" rx="1" fill="#666" stroke="#000" stroke-width="2"/><circle cx="20" cy="12" r="6" fill="#66ccff" stroke="#000" stroke-width="1" opacity="0.8"/><circle cx="26" cy="8" r="4" fill="#66ccff" stroke="#000" stroke-width="1" opacity="0.6"/><circle cx="14" cy="8" r="3" fill="#66ccff" stroke="#000" stroke-width="1" opacity="0.5"/></svg>`,
    'Boomerang': `<svg width="40" height="40" viewBox="0 0 40 40"><path d="M10 20 Q20 10 30 20 Q25 15 20 15 Q15 15 10 20" fill="#888" stroke="#000" stroke-width="2"/><path d="M12 22 Q20 14 28 22" fill="none" stroke="#555" stroke-width="1"/></svg>`,
    'Splitter Gun': `<svg width="40" height="40" viewBox="0 0 40 40"><rect x="14" y="16" width="16" height="8" rx="1" fill="#444" stroke="#000" stroke-width="2"/><circle cx="20" cy="20" r="3" fill="#ff00ff" stroke="#000" stroke-width="1"/><polygon points="6,16 2,20 6,24" fill="#ff00ff" stroke="#000" stroke-width="1"/><polygon points="34,16 38,20 34,24" fill="#ff00ff" stroke="#000" stroke-width="1"/></svg>`,
    'Poison Gun': `<svg width="40" height="40" viewBox="0 0 40 40"><rect x="14" y="18" width="16" height="6" rx="1" fill="#444" stroke="#000" stroke-width="2"/><circle cx="30" cy="21" r="4" fill="#00ff00" stroke="#000" stroke-width="1"/><path d="M28 21 Q30 18 32 21 Q30 24 28 21" fill="#00ff00" stroke="#000" stroke-width="1"/><circle cx="10" cy="20" r="3" fill="#00ff00" stroke="#000" stroke-width="1" opacity="0.6"/></svg>`,
  };

  const weaponsData = [
    { name: 'Magic Wand', desc: 'Fires magic bolts at nearest enemy', dmg: '10', rate: '0.5s' },
    { name: 'Laser', desc: 'Fires powerful laser beams', dmg: '15', rate: '0.8s' },
    { name: 'Missile Launcher', desc: 'Launches missiles that explode', dmg: '25', rate: '1.5s' },
    { name: 'Shotgun', desc: 'Fires multiple pellets in a spread', dmg: '8x5', rate: '1.0s' },
    { name: 'Orbit Shield', desc: 'Shields that orbit around you', dmg: '5', rate: 'continuous' },
    { name: 'Bubble Gun', desc: 'Shoots bubbles that trap enemies', dmg: '2', rate: '0.6s' },
    { name: 'Boomerang', desc: 'Returns after hitting enemies', dmg: '12', rate: '0.7s' },
    { name: 'Splitter Gun', desc: 'Splits on impact', dmg: '8', rate: '1.2s' },
    { name: 'Poison Gun', desc: 'Poisons enemies, preventing them from healing', dmg: '2', rate: '1.5s' }
  ];

  const monstersData = [
    { name: 'Basic', hp: '6', dmg: '1', desc: 'Basic enemy that moves toward player' },
    { name: 'Scout', hp: '4', dmg: '1', desc: 'Fast but weak enemy' },
    { name: 'Swarm', hp: '2', dmg: '1', desc: 'Appears in groups, low HP' },
    { name: 'Tank', hp: '30', dmg: '2', desc: 'Slow but high HP' },
    { name: 'Splitter', hp: '8', dmg: '1', desc: 'Splits into smaller enemies on death' },
    { name: 'Charger', hp: '10', dmg: '2', desc: 'Quickly charges at player' },
    { name: 'Teleporter', hp: '4', dmg: '1', desc: 'Teleports around the player' },
    { name: 'Star', hp: '4', dmg: '1', desc: 'Moves in star patterns' },
    { name: 'Boss', hp: '20', dmg: '3', desc: 'Rare boss enemy, drops rare weapons' },
    { name: 'Twin Elite', hp: '200', dmg: '4', desc: 'Elite twins, appear after 40s' },
    { name: 'Titan', hp: '500', dmg: '5', desc: 'Giant boss, appears after 60s' },
  ];

  const petsData = [
    { name: 'Greedy Dog', desc: 'Collects nearby gold automatically' },
    { name: 'Magic Fairy', desc: 'Heals you slowly over time' },
    { name: 'Speedy Turtle', desc: 'Increases your movement speed' },
    { name: 'Grumpy Porcupine', desc: 'Shoots spikes at nearby enemies' },
    { name: 'Bouncy Slime', desc: 'Bounces and damages enemies' },
    { name: 'Lucky Cat', desc: 'Increases gold pickup range' },
  ];

  function renderWeapons() {
    if (!encyclopediaContent) return;
    let html = '';
    weaponsData.forEach(w => {
      const translatedName = getLanguage() === 'zh' ? 
        (w.name === 'Magic Wand' ? '魔法杖' : 
         w.name === 'Laser' ? '激光' : 
         w.name === 'Missile Launcher' ? '导弹发射器' : 
         w.name === 'Shotgun' ? '霰弹枪' : 
         w.name === 'Orbit Shield' ? '轨道护盾' : 
         w.name === 'Bubble Gun' ? '泡泡枪' : 
         w.name === 'Boomerang' ? '回旋镖' : 
         w.name === 'Splitter Gun' ? '分裂枪' :
         w.name === 'Poison Gun' ? '毒素枪' : w.name) : w.name;
      const translatedDesc = getLanguage() === 'zh' ?
        (w.desc === 'Fires magic bolts at nearest enemy' ? '向最近的敌人发射魔法弹' :
         w.desc === 'Fires powerful laser beams' ? '发射强大的激光束' :
         w.desc === 'Launches missiles that explode' ? '发射导弹爆炸' :
         w.desc === 'Fires multiple pellets in a spread' ? '向多个方向发射弹丸' :
         w.desc === 'Shields that orbit around you' ? '环绕你的护盾' :
         w.desc === 'Shoots bubbles that trap enemies' ? '发射泡泡困住敌人' :
         w.desc === 'Returns after hitting enemies' ? '击中敌人后返回' : 
         w.desc === 'Splits on impact' ? '击中后分裂' :
         w.desc === 'Poisons enemies, preventing them from healing' ? '使敌人中毒，阻止其恢复生命' : w.desc) : w.desc;
      const svg = weaponSvgs[w.name] || '';
      html += `<div style="margin-bottom: 12px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 6px; display: flex; align-items: center; gap: 12px;">
        <div style="flex-shrink: 0;">${svg}</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; color: #ffcc00;">${translatedName}</div>
          <div style="color: #aaa; font-size: 12px;">${translatedDesc}</div>
          <div style="font-size: 12px; margin-top: 4px;">DMG: ${w.dmg} | Rate: ${w.rate}</div>
        </div>
      </div>`;
    });
    encyclopediaContent.innerHTML = html;
  }

  function renderMonsters() {
    if (!encyclopediaContent) return;
    let html = '';
    const hpMultiplier = 1 + (Math.floor(game.gameTime / 30) * 0.5);
    monstersData.forEach(m => {
      const currentHP = (parseFloat(m.hp) * hpMultiplier).toFixed(1);
      const translatedName = getLanguage() === 'zh' ?
        (m.name === 'Basic' ? '普通怪' :
         m.name === 'Scout' ? '侦察怪' :
         m.name === 'Swarm' ? '蜂群怪' :
         m.name === 'Tank' ? '坦克怪' :
         m.name === 'Splitter' ? '分裂怪' :
         m.name === 'Charger' ? '冲锋怪' :
         m.name === 'Teleporter' ? '传送怪' :
         m.name === 'Star' ? '星星怪' :
         m.name === 'Boss' ? '首领' :
         m.name === 'Twin Elite' ? '双子精英' :
         m.name === 'Titan' ? '泰坦' : m.name) : m.name;
      const translatedDesc = getLanguage() === 'zh' ?
        (m.desc === 'Basic enemy that moves toward player' ? '朝玩家移动的基础敌人' :
         m.desc === 'Fast but weak enemy' ? '快速但脆弱的敌人' :
         m.desc === 'Appears in groups, low HP' ? '成群出现，生命值低' :
         m.desc === 'Slow but high HP' ? '缓慢但生命值高' :
         m.desc === 'Splits into smaller enemies on death' ? '死亡时分裂成更小的敌人' :
         m.desc === 'Quickly charges at player' ? '快速向玩家冲锋' :
         m.desc === 'Teleports around the player' ? '在玩家周围传送' :
         m.desc === 'Moves in star patterns' ? '以星星形状移动' :
         m.desc === 'Rare boss enemy, drops rare weapons' ? '稀有首领敌人，掉落稀有武器' :
         m.desc === 'Elite twins, appear after 40s' ? '精英双子，40秒后出现' :
         m.desc === 'Giant boss, appears after 60s' ? '巨型首领，60秒后出现' : m.desc) : m.desc;
      const svg = monsterSvgs[m.name] || '';
      html += `<div style="margin-bottom: 12px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 6px; display: flex; align-items: center; gap: 12px;">
        <div style="flex-shrink: 0;">${svg}</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; color: #ff3366;">${translatedName}</div>
          <div style="color: #aaa; font-size: 12px;">${translatedDesc}</div>
          <div style="font-size: 12px; margin-top: 4px;">HP: ${currentHP} | ATK: ${m.dmg}</div>
        </div>
      </div>`;
    });
    encyclopediaContent.innerHTML = html;
  }

  function renderPets() {
    if (!encyclopediaContent) return;
    let html = '';
    petsData.forEach(p => {
      const translatedName = getLanguage() === 'zh' ?
        (p.name === 'Greedy Dog' ? '贪吃狗' :
         p.name === 'Magic Fairy' ? '魔法 fairy' :
         p.name === 'Speedy Turtle' ? '快速乌龟' :
         p.name === 'Grumpy Porcupine' ? '脾气暴躁的刺猬' :
         p.name === 'Bouncy Slime' ? '弹跳史莱姆' :
         p.name === 'Lucky Cat' ? '幸运猫' : p.name) : p.name;
      const translatedDesc = getLanguage() === 'zh' ?
        (p.desc === 'Collects nearby gold automatically' ? '自动收集附近的金币' :
         p.desc === 'Heals you slowly over time' ? '随时间缓慢治愈你' :
         p.desc === 'Increases your movement speed' ? '增加你的移动速度' :
         p.desc === 'Shoots spikes at nearby enemies' ? '向附近的敌人发射尖刺' :
         p.desc === 'Bounces and damages enemies' ? '弹跳并伤害敌人' :
         p.desc === 'Increases gold pickup range' ? '增加金币拾取范围' : p.desc) : p.desc;
      const svg = petSvgs[p.name] || '';
      html += `<div style="margin-bottom: 12px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 6px; display: flex; align-items: center; gap: 12px;">
        <div style="flex-shrink: 0;">${svg}</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; color: #32cd32;">${translatedName}</div>
          <div style="color: #aaa; font-size: 12px;">${translatedDesc}</div>
        </div>
      </div>`;
    });
    encyclopediaContent.innerHTML = html;
  }

  encyclopediaBtn?.addEventListener('click', (e) => {
    if (settingsModal) settingsModal.classList.add('hidden');
    e.preventDefault();
    if (encyclopediaModal) encyclopediaModal.classList.remove('hidden');
    renderWeapons();
  });

  closeEncyclopediaBtn?.addEventListener('click', () => {
    game.resume();
    if (encyclopediaModal) encyclopediaModal.classList.add('hidden');
  });

  tabWeapons?.addEventListener('click', () => renderWeapons());
  tabMonsters?.addEventListener('click', () => renderMonsters());
  tabPets?.addEventListener('click', () => renderPets());

  const handleLangToggle = (e?: Event) => {

    if (e) e.preventDefault();
    const newLang = getLanguage() === 'en' ? 'zh' : 'en';
    setLanguage(newLang);

    
    
    // Update mute button text based on new language
    if (muteBtn) {
      const soundOnText = newLang === 'zh' ? '🔊 声音: 开' : '🔊 Sound: ON';
      const soundOffText = newLang === 'zh' ? '🔇 声音: 关' : '🔇 Sound: OFF';
      muteBtn.textContent = game.soundManager.isMuted ? soundOffText : soundOnText;
    }

    // Update shop title and close button
    const shopTitle = document.querySelector('#shop h2');
    if (shopTitle) {
      shopTitle.textContent = newLang === 'zh' ? '商店' : 'Shop';
    }
    const closeShopBtn = document.getElementById('close-shop');
    if (closeShopBtn) {
      closeShopBtn.textContent = newLang === 'zh' ? '关闭 (P)' : 'Close (P)';
    }
    
    // Update shop buy buttons
    const buyDamage = document.getElementById('buy-damage');
    const costDamage = document.getElementById('cost-damage')?.textContent || '20';
    if (buyDamage) {
      buyDamage.innerHTML = newLang === 'zh' 
        ? `升级伤害 (<span id="cost-damage">${costDamage}</span>g)` 
        : `Upgrade Damage (<span id="cost-damage">${costDamage}</span>g)`;
    }
    const buySpeed = document.getElementById('buy-speed');
    const costSpeed = document.getElementById('cost-speed')?.textContent || '15';
    if (buySpeed) {
      buySpeed.innerHTML = newLang === 'zh' 
        ? `升级速度 (<span id="cost-speed">${costSpeed}</span>g)` 
        : `Upgrade Speed (<span id="cost-speed">${costSpeed}</span>g)`;
    }
    const buyHp = document.getElementById('buy-hp');
    const costHp = document.getElementById('cost-hp')?.textContent || '15';
    if (buyHp) {
      buyHp.innerHTML = newLang === 'zh' 
        ? `升级最大生命 (<span id="cost-hp">${costHp}</span>g)` 
        : `Upgrade Max HP (<span id="cost-hp">${costHp}</span>g)`;
    }
    const buyPet = document.getElementById('buy-pet');
    const costPet = document.getElementById('cost-pet')?.textContent || '50';
    if (buyPet) {
      buyPet.innerHTML = newLang === 'zh' 
        ? `孵化随机宠物 (<span id="cost-pet">${costPet}</span>g)` 
        : `Hatch Random Pet (<span id="cost-pet">${costPet}g)`;
    }
    
    // Update leaderboard button text
    if (leaderboardBtn) {
      leaderboardBtn.innerHTML = newLang === 'zh' ? '🏆 排行榜' : '🏆 Leaderboard';
    }
    
    // Update leaderboard modal title and close button
    const modalTitle = leaderboardModal?.querySelector('h2');
    if (modalTitle) {
      modalTitle.innerHTML = newLang === 'zh' ? '🏆 排行榜' : '🏆 Leaderboard';
    }
    if (closeLeaderboardBtn) {
      closeLeaderboardBtn.innerHTML = newLang === 'zh' ? '关闭' : 'Close';
    }

    // Update encyclopedia button and modal
    if (encyclopediaBtn) {
      encyclopediaBtn.innerHTML = newLang === 'zh' ? '📖 图鉴' : '📖 Encyclopedia';
    }
    const encModalTitle = encyclopediaModal?.querySelector('h2');
    if (encModalTitle) {
      encModalTitle.innerHTML = newLang === 'zh' ? '📖 图鉴' : '📖 Encyclopedia';
    }
    
    // Update settings buttons
    if (settingsBtn) {
      const settingsTextSpan = document.getElementById('settings-text');
      if (settingsTextSpan) {
        settingsTextSpan.textContent = newLang === 'zh' ? '设置' : 'Settings';
      }
    }
    const settingsTitle = document.getElementById('settings-title');
    if (settingsTitle) {
      settingsTitle.innerHTML = newLang === 'zh' ? '⚙️ 设置' : '⚙️ Settings';
    }
    if (closeSettingsBtn) {
      closeSettingsBtn.textContent = newLang === 'zh' ? '关闭' : 'Close';
    }
    if (mobileShopBtn) {
      mobileShopBtn.textContent = newLang === 'zh' ? '🛒 商店' : '🛒 Shop';
    }
    if (langBtn) {
      langBtn.innerHTML = newLang === 'zh' ? '🌐 中文' : '🌐 English';
    }
    const desktopHint = document.getElementById('desktop-hint');
    if (desktopHint) {
      desktopHint.textContent = newLang === 'zh' ? 'WASD 移动 | P 打开商店' : 'WASD to Move | P to Shop';
    }
    if (closeEncyclopediaBtn) {
      closeEncyclopediaBtn.innerHTML = newLang === 'zh' ? '关闭' : 'Close';
    }


  };

  langBtn?.addEventListener('click', handleLangToggle);

  // Simulate asset loading
  let progress = 0;
  // Speed up loading: from 100ms interval to 30ms interval
  const loadInterval = setInterval(() => {
    progress += Math.random() * 25 + 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      if (loadingBar) loadingBar.style.width = '100%';
      if (loadingText) loadingText.textContent = t('ready');

      setTimeout(() => {
        if (loadingBar?.parentElement) {
          loadingBar.parentElement.style.display = 'none';
        }
        if (startBtn) {
          startBtn.classList.remove('hidden');
          startBtn.style.pointerEvents = 'auto';
        }
      }, 100);
    } else {
      if (loadingBar) loadingBar.style.width = `${progress}%`;
    }
  }, 30);

  startBtn?.addEventListener('click', () => {
    if (loadingScreen) loadingScreen.style.display = 'none';
    document.getElementById('game-canvas')?.classList.remove('hidden');
    document.getElementById('ui-layer')?.classList.remove('hidden');
    game.soundManager.playStartSound(); // Play game start sound
    game.start();
  });
});
