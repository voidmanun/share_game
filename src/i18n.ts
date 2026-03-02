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
    gold: ' Seconds',
    restartGame: 'Restart Game',
    lang: '🌐 English',
    none: 'None',
    lv: 'Lv',
    dmg: 'DMG',
    hp: 'HP',
    atk: 'ATK',
    leaderboardTitle: 'Leaderboard (Top 10)',
    enterName: 'Enter your name',
    saveScoreBtn: 'Save',
    // Enemies
    enemyBasic: 'Basic',
    enemyScout: 'Scout',
    enemySwarm: 'Swarm',
    enemyTank: 'Tank',
    enemySplitter: 'Splitter',
    enemyCharger: 'Charger',
    enemyTeleporter: 'Teleporter',
    enemyStar: 'Star',
    enemySlime: 'Slime',
    enemyBoss: 'Boss',
    enemyHealer: 'Healer',
        FusionBoss: 'Fusion Boss',
    // Weapons
    weaponWand: 'Wand',
    weaponWhip: 'Whip',
    weaponAura: 'Aura',
    weaponKnife: 'Knife',
    weaponOrb: 'Orb',
    weaponBoomerang: 'Shuriken',
    weaponScythe: 'Scythe',
    weaponFireball: 'Fireball',
    weaponLightning: 'Lightning',
    encyclopedia: 'Encyclopedia',
    weapons: 'Weapons',
    monsters: 'Monsters',
    pets: 'Pets',
    closeEncyclopedia: 'Close',
    weaponMagicWand: 'Magic Wand',
    weaponLaser: 'Laser',
    weaponMissileLauncher: 'Missile Launcher',
    weaponShotgun: 'Shotgun',
    weaponOrbitShield: 'Orbit Shield',
    weaponBubbleGun: 'Bubble Gun',
    weaponBoomerangNew: 'Boomerang',
    weaponSplitterGun: 'Splitter Gun',
    enemyTitan: 'Titan',
    enemyNecromancer: 'Necromancer',
    enemySpirit: 'Spirit',
    enemyTwinElite: 'Twin Elite',
    enemyDevourerElite: 'Devourer Elite',
    petGreedyDog: 'Greedy Dog',
    petMagicFairy: 'Magic Fairy',
    petSpeedyTurtle: 'Speedy Turtle',
    petGrumpyPorcupine: 'Grumpy Porcupine',
    petBouncySlime: 'Bouncy Slime',
    petLuckyCat: 'Lucky Cat',
    descMagicWand: 'Fires magic bolts at nearest enemy',
    descLaser: 'Fires powerful laser beams',
    descMissileLauncher: 'Launches missiles that explode',
    descShotgun: 'Fires multiple pellets in a spread',
    descOrbitShield: 'Shields that orbit around you',
    descBubbleGun: 'Shoots bubbles that trap enemies',
    descBoomerang: 'Returns after hitting enemies',
    descGreedyDog: 'Collects nearby gold automatically',
    descMagicFairy: 'Heals you slowly over time',
    descSpeedyTurtle: 'Increases your movement speed',
    descGrumpyPorcupine: 'Shoots spikes at nearby enemies',
    descBouncySlime: 'Bounces and damages enemies',
    descLuckyCat: 'Increases gold pickup range',
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
    gold: ' 秒',
    restartGame: '重新开始',
    lang: '🌐 中文',
    none: '无',
    lv: 'Lv',
    dmg: '伤害',
    hp: '生命',
    atk: '攻击',
    leaderboardTitle: '排行榜 (前10名)',
    enterName: '输入你的名字',
    saveScoreBtn: '保存',
    // Enemies
    enemyBasic: '普通怪',
    enemyScout: '侦察怪',
    enemySwarm: '蜂群怪',
    enemyTank: '坦克怪',
    enemySplitter: '分裂怪',
    enemyCharger: '冲锋怪',
    enemyTeleporter: '传送怪',
    enemyStar: '星星怪',
    enemySlime: '史莱姆',
    enemyBoss: '首领',
    enemyHealer: '治疗怪',
    // Weapons
    weaponWand: '法杖',
    weaponWhip: '鞭子',
    weaponAura: '光环',
    weaponKnife: '飞刀',
    weaponOrb: '法球',
    weaponBoomerang: '忍者飞镖',
    weaponScythe: '死神镰刀',
    weaponFireball: '火球',
    weaponLightning: '闪电',
    encyclopedia: '图鉴',
    weapons: '武器',
    monsters: '怪物',
    pets: '宠物',
    closeEncyclopedia: '关闭',
    weaponMagicWand: '魔法杖',
    weaponLaser: '激光',
    weaponMissileLauncher: '导弹发射器',
    weaponShotgun: '霰弹枪',
    weaponOrbitShield: '轨道护盾',
    weaponBubbleGun: '泡泡枪',
    weaponBoomerangNew: '回旋镖',
    weaponSplitterGun: '分裂枪',
    enemyTitan: '泰坦',
    enemyNecromancer: '死灵法师',
    enemySpirit: '死灵',
    enemyTwinElite: '双子精英',
    enemyDevourerElite: '吞噬精英',
    petGreedyDog: '贪吃狗',
    petMagicFairy: '魔法 fairy',
    petSpeedyTurtle: '快速乌龟',
    petGrumpyPorcupine: '脾气暴躁的刺猬',
    petBouncySlime: '弹跳史莱姆',
    petLuckyCat: '幸运猫',
    descMagicWand: '向最近的敌人发射魔法弹',
    descLaser: '发射强大的激光束',
    descMissileLauncher: '发射导弹爆炸',
    descShotgun: '向多个方向发射弹丸',
    descOrbitShield: '环绕你的护盾',
    descBubbleGun: '发射泡泡困住敌人',
    descBoomerang: '击中敌人后返回',
    descGreedyDog: '自动收集附近的金币',
    descMagicFairy: '随时间缓慢治愈你',
    descSpeedyTurtle: '增加你的移动速度',
    descGrumpyPorcupine: '向附近的敌人发射尖刺',
    descBouncySlime: '弹跳并伤害敌人',
    descLuckyCat: '增加金币拾取范围',
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
  return (translations[currentLanguage] as any)[key] || key;
}

export function tWeapon(name: string): string {
  const key = 'weapon' + name.replace(/\s+/g, '') as keyof typeof translations['en'];
  return (translations[currentLanguage] as any)[key] || name;
}

export function tEnemy(name: string): string {
  const key = 'enemy' + name.replace(/\s+/g, '') as keyof typeof translations['en'];
  return (translations[currentLanguage] as any)[key] || name;
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

  const leaderboardTitle = document.querySelector('#leaderboard-section h3');
  const playerNameInput = document.getElementById('player-name') as HTMLInputElement;
  const saveScoreBtn = document.getElementById('save-score-btn');
  if (leaderboardTitle) leaderboardTitle.textContent = t('leaderboardTitle');
  if (playerNameInput) playerNameInput.placeholder = t('enterName');
  if (saveScoreBtn) saveScoreBtn.textContent = t('saveScoreBtn');

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
