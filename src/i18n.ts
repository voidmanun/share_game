export type Language = 'en' | 'zh';

export const translations = {
  en: {
    loading: 'Loading Game...',
    ready: 'Ready!',
    startGame: 'Start Game',
    instructionsDesktop: 'WASD to Move | P to Shop',
    shopBtn: 'Shop',
    soundOn: '🔊 Sound: ON',
    soundOff: '🔇 Sound: OFF',
    arsenal: 'Arsenal',
    enemies: 'Enemies',
    shopTitle: 'Shop',
    upgradeDamage: 'Upgrade Damage (',
    upgradeSpeed: 'Upgrade Speed (',
    upgradeHp: 'Upgrade Max HP (',
    hatchPet: 'Hatch Random Pet (',
    closeShop: 'Close (P)',
    gameOver: 'Game Over',
    score: 'Score: ',
    gold: ' Gold',
    restartGame: 'Restart Game',
    lang: '🌐 English',
    none: 'None',
    lv: 'Lv',
    dmg: 'DMG',
    hp: 'HP',
    atk: 'ATK',
    // Enemies
    enemyBasic: 'Basic',
    enemyScout: 'Scout',
    enemySwarm: 'Swarm',
    enemyTank: 'Tank',
    enemySplitter: 'Splitter',
    enemyCharger: 'Charger',
    enemyTeleporter: 'Teleporter',
    enemyStar: 'Star',
    enemyBoss: 'Boss',
    // Weapons
    weaponWand: 'Wand',
    weaponWhip: 'Whip',
    weaponAura: 'Aura',
    weaponKnife: 'Knife',
    weaponOrb: 'Orb',
    weaponBoomerang: 'Boomerang',
    weaponScythe: 'Scythe',
    weaponFireball: 'Fireball',
    weaponLightning: 'Lightning',
  },
  zh: {
    loading: '游戏加载中...',
    ready: '准备就绪!',
    startGame: '开始游戏',
    instructionsDesktop: 'WASD移动 | P键商店',
    shopBtn: '商店',
    soundOn: '🔊 声音: 开',
    soundOff: '🔇 声音: 关',
    arsenal: '武器库',
    enemies: '敌人',
    shopTitle: '商店',
    upgradeDamage: '升级伤害 (',
    upgradeSpeed: '升级速度 (',
    upgradeHp: '升级最大生命 (',
    hatchPet: '孵化随机宠物 (',
    closeShop: '关闭 (P)',
    gameOver: '游戏结束',
    score: '得分: ',
    gold: ' 金币',
    restartGame: '重新开始',
    lang: '🌐 中文',
    none: '无',
    lv: 'Lv',
    dmg: '伤害',
    hp: '生命',
    atk: '攻击',
    // Enemies
    enemyBasic: '普通怪',
    enemyScout: '侦察怪',
    enemySwarm: '蜂群怪',
    enemyTank: '坦克怪',
    enemySplitter: '分裂怪',
    enemyCharger: '冲锋怪',
    enemyTeleporter: '传送怪',
    enemyStar: '星星怪',
    enemyBoss: '首领',
    // Weapons
    weaponWand: '法杖',
    weaponWhip: '鞭子',
    weaponAura: '光环',
    weaponKnife: '飞刀',
    weaponOrb: '法球',
    weaponBoomerang: '回旋镖',
    weaponScythe: '死神镰刀',
    weaponFireball: '火球',
    weaponLightning: '闪电',
  }
};

let currentLanguage: Language = 'en';

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  updateUI();
}

export function t(key: keyof typeof translations['en']): string {
  return translations[currentLanguage][key] || key;
}

export function tWeapon(name: string): string {
  const key = 'weapon' + name.replace(/\s+/g, '') as keyof typeof translations['en'];
  return translations[currentLanguage][key] || name;
}

export function tEnemy(name: string): string {
  const key = 'enemy' + name.replace(/\s+/g, '') as keyof typeof translations['en'];
  return translations[currentLanguage][key] || name;
}

function updateUI() {
  const elements = {
    loadingText: document.querySelector('#loading-screen h1'),
    startBtn: document.getElementById('start-btn'),
    instructionsDesktop: document.querySelector('.desktop-only'),
    mobileShopBtn: document.getElementById('mobile-shop-btn'),
    statsPanelArsenal: document.querySelector('#stats-panel h3:nth-of-type(1)'),
    statsPanelEnemies: document.querySelector('#stats-panel h3:nth-of-type(2)'),
    shopTitle: document.querySelector('#shop h2'),
    closeShop: document.getElementById('close-shop'),
    gameOverTitle: document.querySelector('#game-over h2'),
    restartBtn: document.getElementById('restart-btn'),
    langBtn: document.getElementById('lang-btn'),
  };

  if (elements.loadingText && elements.loadingText.textContent !== t('ready') && elements.loadingText.textContent !== translations['en']['ready'] && elements.loadingText.textContent !== translations['zh']['ready']) {
      elements.loadingText.textContent = t('loading');
  } else if (elements.loadingText) {
      elements.loadingText.textContent = t('ready');
  }
  
  if (elements.startBtn) elements.startBtn.textContent = t('startGame');
  if (elements.instructionsDesktop) elements.instructionsDesktop.textContent = t('instructionsDesktop');
  if (elements.mobileShopBtn) elements.mobileShopBtn.textContent = t('shopBtn');
  if (elements.statsPanelArsenal) elements.statsPanelArsenal.textContent = t('arsenal');
  if (elements.statsPanelEnemies) elements.statsPanelEnemies.textContent = t('enemies');
  if (elements.shopTitle) elements.shopTitle.textContent = t('shopTitle');
  if (elements.closeShop) elements.closeShop.textContent = t('closeShop');
  if (elements.gameOverTitle) elements.gameOverTitle.textContent = t('gameOver');
  if (elements.restartBtn) elements.restartBtn.textContent = t('restartGame');
  if (elements.langBtn) elements.langBtn.textContent = t('lang');

  // Update shop buttons with costs
  const buyDamage = document.getElementById('buy-damage');
  const costDamage = document.getElementById('cost-damage')?.textContent || '20';
  if (buyDamage) buyDamage.innerHTML = `${t('upgradeDamage')}<span id="cost-damage">${costDamage}</span>g)`;

  const buySpeed = document.getElementById('buy-speed');
  const costSpeed = document.getElementById('cost-speed')?.textContent || '15';
  if (buySpeed) buySpeed.innerHTML = `${t('upgradeSpeed')}<span id="cost-speed">${costSpeed}</span>g)`;

  const buyHp = document.getElementById('buy-hp');
  const costHp = document.getElementById('cost-hp')?.textContent || '15';
  if (buyHp) buyHp.innerHTML = `${t('upgradeHp')}<span id="cost-hp">${costHp}</span>g)`;

  const buyPet = document.getElementById('buy-pet');
  const costPet = document.getElementById('cost-pet')?.textContent || '50';
  if (buyPet) buyPet.innerHTML = `${t('hatchPet')}<span id="cost-pet">${costPet}</span>g)`;
  
  // Game over score
  const scorePara = document.querySelector('#game-over p');
  const finalScore = document.getElementById('final-score')?.textContent || '0';
  if (scorePara) scorePara.innerHTML = `${t('score')}<span id="final-score">${finalScore}</span>${t('gold')}`;
  
  // Trigger custom event so Game.ts can redraw stats
  window.dispatchEvent(new Event('languageChanged'));
}
