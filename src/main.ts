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

  leaderboardBtn?.addEventListener('click', async (e) => {
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

  const weaponsData = [
    { name: 'Magic Wand', desc: 'Fires magic bolts at nearest enemy', dmg: '10', rate: '0.5s' },
    { name: 'Laser', desc: 'Fires powerful laser beams', dmg: '15', rate: '0.8s' },
    { name: 'Missile Launcher', desc: 'Launches missiles that explode', dmg: '25', rate: '1.5s' },
    { name: 'Shotgun', desc: 'Fires multiple pellets in a spread', dmg: '8x5', rate: '1.0s' },
    { name: 'Orbit Shield', desc: 'Shields that orbit around you', dmg: '5', rate: 'continuous' },
    { name: 'Bubble Gun', desc: 'Shoots bubbles that trap enemies', dmg: '2', rate: '0.6s' },
    { name: 'Boomerang', desc: 'Returns after hitting enemies', dmg: '12', rate: '0.7s' },
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
         w.name === 'Boomerang' ? '回旋镖' : w.name) : w.name;
      const translatedDesc = getLanguage() === 'zh' ?
        (w.desc === 'Fires magic bolts at nearest enemy' ? '向最近的敌人发射魔法弹' :
         w.desc === 'Fires powerful laser beams' ? '发射强大的激光束' :
         w.desc === 'Launches missiles that explode' ? '发射导弹爆炸' :
         w.desc === 'Fires multiple pellets in a spread' ? '向多个方向发射弹丸' :
         w.desc === 'Shields that orbit around you' ? '环绕你的护盾' :
         w.desc === 'Shoots bubbles that trap enemies' ? '发射泡泡困住敌人' :
         w.desc === 'Returns after hitting enemies' ? '击中敌人后返回' : w.desc) : w.desc;
      html += `<div style="margin-bottom: 12px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 6px;">
        <div style="font-weight: bold; color: #ffcc00;">${translatedName}</div>
        <div style="color: #aaa; font-size: 12px;">${translatedDesc}</div>
        <div style="font-size: 12px; margin-top: 4px;">DMG: ${w.dmg} | Rate: ${w.rate}</div>
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
      html += `<div style="margin-bottom: 12px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 6px;">
        <div style="font-weight: bold; color: #ff3366;">${translatedName}</div>
        <div style="color: #aaa; font-size: 12px;">${translatedDesc}</div>
        <div style="font-size: 12px; margin-top: 4px;">HP: ${currentHP} | ATK: ${m.dmg}</div>
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
      html += `<div style="margin-bottom: 12px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 6px;">
        <div style="font-weight: bold; color: #32cd32;">${translatedName}</div>
        <div style="color: #aaa; font-size: 12px;">${translatedDesc}</div>
      </div>`;
    });
    encyclopediaContent.innerHTML = html;
  }

  encyclopediaBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (encyclopediaModal) encyclopediaModal.classList.remove('hidden');
    renderWeapons();
  });

  closeEncyclopediaBtn?.addEventListener('click', () => {
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
