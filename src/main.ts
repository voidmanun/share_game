import './style.css'
import { Game } from './Game'
import { getLanguage, setLanguage, t, tWeapon, tEnemy, updateUI } from './i18n';
import { getLeaderboard } from './leaderboard';
import { initPWA } from './pwa';
import { SkillTreeManager, type SkillBranch } from './systems/SkillTree';
import { FloatingText } from './entities/FloatingText';
import type { CharacterClass } from './entities/Player';

// Initialize language UI immediately on load
updateUI();

window.addEventListener('DOMContentLoaded', () => {
  initPWA();
  const game = new Game('game-canvas');

  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar');
  const startBtn = document.getElementById('start-btn');
  const characterSelect = document.getElementById('character-select');
  const muteBtn = document.getElementById('mute-btn');
  const langBtn = document.getElementById('lang-btn');
  const loadingText = loadingScreen?.querySelector('h1');

  // Skill button elements
  const skillBtn = document.getElementById('skill-btn');
  const skillIcon = document.getElementById('skill-icon');
  const skillCooldown = document.getElementById('skill-cooldown');
  const skillName = document.getElementById('skill-name');

  // Character card elements
  const characterCards = document.querySelectorAll('.character-card');

  // Handle character selection
  characterCards.forEach(card => {
    card.addEventListener('click', () => {
      const character = card.getAttribute('data-character') as CharacterClass;
      if (character) {
        game.selectedCharacterClass = character;
        skillTreeManager.setCharacterClass(character);
        (game as any).initializeGame(); // Re-initialize to apply character class

        // Update skill button based on character
        updateSkillButton(character);

        // Hide character select, show game
        if (characterSelect) characterSelect.classList.add('hidden');
        document.getElementById('game-canvas')?.classList.remove('hidden');
        document.getElementById('ui-layer')?.classList.remove('hidden');
        game.soundManager.playStartSound();
        game.start();

        // Start skill update loop
        startSkillUpdateLoop();
      }
    });

    // Hover effects
    card.addEventListener('mouseenter', () => {
      (card as HTMLElement).style.transform = 'translateY(-10px)';
      (card as HTMLElement).style.boxShadow = '10px 10px 0 #000';
    });
    card.addEventListener('mouseleave', () => {
      (card as HTMLElement).style.transform = 'translateY(0)';
      (card as HTMLElement).style.boxShadow = '6px 6px 0 #000';
    });
  });

  function updateSkillButton(character: CharacterClass): void {
    if (!skillIcon || !skillName || !skillBtn) return;

    const skillData: Record<CharacterClass, { icon: string, name: string, nameZh: string, color: string }> = {
      knight: { icon: '🛡️', name: 'Invincibility', nameZh: '无敌', color: 'linear-gradient(145deg, #4169E1, #1E3A8A)' },
      warrior: { icon: '⚔️', name: 'Rage', nameZh: '狂暴', color: 'linear-gradient(145deg, #DC143C, #8B0000)' },
      mage: { icon: '⚡', name: 'Haste', nameZh: '急速', color: 'linear-gradient(145deg, #FFD700, #9932CC)' },
      hunter: { icon: '🏹', name: 'Call of the Wild', nameZh: '野性呼唤', color: 'linear-gradient(145deg, #2E8B57, #006400)' }
    };

    const data = skillData[character];
    skillIcon.textContent = data.icon;
    skillName.textContent = getLanguage() === 'zh' ? data.nameZh : data.name;
    skillBtn.style.background = data.color;
  }

  function startSkillUpdateLoop(): void {
    const updateSkillUI = () => {
      if (!game.player || !skillCooldown || !skillBtn) return;

      const skill = game.player.skill;
      if (skill.currentCooldown > 0) {
        skillCooldown.style.display = 'flex';
        skillCooldown.textContent = Math.ceil(skill.currentCooldown).toString();
        skillBtn.style.opacity = '0.6';
        skillBtn.style.cursor = 'not-allowed';
      } else {
        skillCooldown.style.display = 'none';
        skillBtn.style.opacity = '1';
        skillBtn.style.cursor = 'pointer';
      }

      requestAnimationFrame(updateSkillUI);
    };
    requestAnimationFrame(updateSkillUI);
  }

  // Skill button click handler
  skillBtn?.addEventListener('click', () => {
    if (game.player && game.player.skill.currentCooldown <= 0 && !game.player.skill.isActive) {
      game.player.useSkill();
    }
  });

  muteBtn?.addEventListener('click', () => {
    game.soundManager.toggleMute();
    if (muteBtn) {
      const soundOnText = getLanguage() === 'zh' ? '🔊 声音: 开' : '🔊 Sound: ON';
      const soundOffText = getLanguage() === 'zh' ? '🔇 声音: 关' : '🔇 Sound: OFF';
      muteBtn.textContent = game.soundManager.isMuted ? soundOffText : soundOnText;
    }
  });


  const changelogBtn = document.getElementById('changelog-btn') as HTMLButtonElement;
  const changelogModal = document.getElementById('changelog-modal') as HTMLElement;
  const changelogList = document.getElementById('changelog-list') as HTMLElement;
  const closeChangelogBtn = document.getElementById('close-changelog-btn') as HTMLButtonElement;
  const closeChangelogX = document.getElementById('close-changelog-x') as HTMLButtonElement;
  const changelogPrevBtn = document.getElementById('changelog-prev') as HTMLButtonElement;
  const changelogNextBtn = document.getElementById('changelog-next') as HTMLButtonElement;
  const changelogPageInfo = document.getElementById('changelog-page-info') as HTMLElement;

  let changelogData: any[] = [];
  let changelogPage = 1;
  const changelogPerPage = 8;

  const leaderboardBtn = document.getElementById('leaderboard-btn');
  const leaderboardModal = document.getElementById('leaderboard-modal');
  const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
  const modalLeaderboardList = document.getElementById('modal-leaderboard-list');


  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const mobileShopBtn = document.getElementById('mobile-shop-btn'); // the shop btn in settings

  // Skill Tree
  const skillTreeManager = new SkillTreeManager();
  game.setSkillTreeManager(skillTreeManager);
  const skilltreeBtn = document.getElementById('skilltree-btn') as HTMLButtonElement;
  const skilltreeModal = document.getElementById('skilltree-modal') as HTMLElement;
  const closeSkilltreeBtn = document.getElementById('close-skilltree-btn') as HTMLButtonElement;
  const closeSkilltreeX = document.getElementById('close-skilltree-x') as HTMLButtonElement;
  const skilltreeContent = document.getElementById('skilltree-content') as HTMLElement;
  const skillPointsEl = document.getElementById('skill-points') as HTMLElement;
  const resetSkillsBtn = document.getElementById('reset-skills-btn') as HTMLButtonElement;
  const branchAttackBtn = document.getElementById('branch-attack') as HTMLButtonElement;
  const branchDefenseBtn = document.getElementById('branch-defense') as HTMLButtonElement;
  const branchSupportBtn = document.getElementById('branch-support') as HTMLButtonElement;

  let currentBranch: SkillBranch = 'attack';

  function renderSkillTree(branch: SkillBranch) {
    const skills = skillTreeManager.getSkillsByBranch(branch);
    const lang = getLanguage();

    skilltreeContent.innerHTML = '';
    skillPointsEl.textContent = skillTreeManager.getSkillPoints().toString();

    const tierGroups: Map<number, typeof skills> = new Map();
    skills.forEach(skill => {
      if (!tierGroups.has(skill.tier)) {
        tierGroups.set(skill.tier, []);
      }
      tierGroups.get(skill.tier)!.push(skill);
    });

    for (let tier = 0; tier <= 3; tier++) {
      const tierSkills = tierGroups.get(tier) || [];
      if (tierSkills.length === 0) continue;

      const tierDiv = document.createElement('div');
      tierDiv.style.marginBottom = '20px';

      const tierLabel = document.createElement('div');
      tierLabel.style.fontSize = '14px';
      tierLabel.style.color = '#999';
      tierLabel.style.marginBottom = '10px';
      tierLabel.style.paddingLeft = '5px';
      tierLabel.textContent = lang === 'zh' ? `第 ${tier + 1} 层` : `Tier ${tier + 1}`;
      tierDiv.appendChild(tierLabel);

      tierSkills.forEach(skill => {
        const check = skillTreeManager.canUnlockSkill(skill.id);
        const isMaxed = skill.currentLevel >= skill.maxLevel;
        const hasLevels = skill.currentLevel > 0;

        const skillDiv = document.createElement('div');
        skillDiv.className = `skill-node ${hasLevels ? 'unlocked' : ''} ${isMaxed ? 'maxed' : ''} ${!check.canUnlock && skill.currentLevel === 0 ? 'locked' : ''}`;

        skillDiv.innerHTML = `
          <div class="skill-icon">${skill.icon}</div>
          <div class="skill-info">
            <div class="skill-name">${lang === 'zh' ? skill.nameZh : skill.name}</div>
            <div class="skill-description">${lang === 'zh' ? skill.descriptionZh : skill.description}</div>
            <div class="skill-level">${lang === 'zh' ? `等级: ${skill.currentLevel}/${skill.maxLevel}` : `Level: ${skill.currentLevel}/${skill.maxLevel}`}</div>
            ${skill.requires && skill.currentLevel === 0 ? `<div class="skill-requirements">${lang === 'zh' ? '需要前置技能' : 'Requires prerequisites'}</div>` : ''}
          </div>
          <div class="skill-actions">
            <button class="skill-upgrade-btn" data-skill-id="${skill.id}" ${!check.canUnlock || isMaxed ? 'disabled' : ''}>
              ${lang === 'zh' ? '升级' : 'Upgrade'}
            </button>
            <div class="skill-cost">${lang === 'zh' ? `消耗: ${skill.cost}` : `Cost: ${skill.cost}`}</div>
          </div>
        `;

        tierDiv.appendChild(skillDiv);
      });

      skilltreeContent.appendChild(tierDiv);
    }

    skilltreeContent.querySelectorAll('.skill-upgrade-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const skillId = (e.target as HTMLElement).getAttribute('data-skill-id');
        if (skillId && skillTreeManager.unlockSkill(skillId)) {
          // Visual feedback for skill upgrade
          if (game.player) {
            game.floatingTexts.push(new FloatingText(game.player.x, game.player.y - 60, '✨ 技能升级!', '#FFD700', 'level'));
            game.triggerShake(8);
            game.createExplosion(game.player.x, game.player.y, '#FFD700');
          }
          renderSkillTree(currentBranch);
        }
      });
    });
  }

  if (skilltreeBtn) {
    skilltreeBtn.addEventListener('click', () => {
      if (settingsModal) settingsModal.classList.add('hidden');
      skilltreeModal.classList.remove('hidden');
      renderSkillTree(currentBranch);
    });
  }

  if (closeSkilltreeBtn) {
    closeSkilltreeBtn.addEventListener('click', () => {
      skilltreeModal.classList.add('hidden');
      if (settingsModal) settingsModal.classList.remove('hidden');
    });
  }

  if (closeSkilltreeX) {
    closeSkilltreeX.addEventListener('click', () => {
      skilltreeModal.classList.add('hidden');
      if (settingsModal) settingsModal.classList.remove('hidden');
    });
  }

  if (resetSkillsBtn) {
    resetSkillsBtn.addEventListener('click', () => {
      if (confirm(getLanguage() === 'zh' ? '确定要重置所有技能吗？' : 'Reset all skills?')) {
        skillTreeManager.resetSkills();
        renderSkillTree(currentBranch);
      }
    });
  }

  function setActiveBranch(branch: SkillBranch) {
    currentBranch = branch;

    [branchAttackBtn, branchDefenseBtn, branchSupportBtn].forEach(btn => {
      if (btn) {
        btn.style.background = 'rgba(255, 255, 255, 0.1)';
      }
    });

    const activeBtn = branch === 'attack' ? branchAttackBtn : branch === 'defense' ? branchDefenseBtn : branchSupportBtn;
    if (activeBtn) {
      activeBtn.style.background = branch === 'attack' ? '#ff4444' : branch === 'defense' ? '#4444ff' : '#44ff44';
    }

    renderSkillTree(branch);
  }

  branchAttackBtn?.addEventListener('click', () => setActiveBranch('attack'));
  branchDefenseBtn?.addEventListener('click', () => setActiveBranch('defense'));
  branchSupportBtn?.addEventListener('click', () => setActiveBranch('support'));

  function timeAgo(dateString: string, lang: string = 'zh'): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return lang === 'zh' ? '刚刚' : 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return lang === 'zh' ? `${minutes}分钟前` : `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return lang === 'zh' ? `${hours}小时前` : `${hours} hrs ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return lang === 'zh' ? `${days}天前` : `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return lang === 'zh' ? `${months}个月前` : `${months} mos ago`;
    const years = Math.floor(days / 365);
    return lang === 'zh' ? `${years}年前` : `${years} yrs ago`;
  }

  function renderChangelogPage() {
    const totalPages = Math.ceil(changelogData.length / changelogPerPage);
    const start = (changelogPage - 1) * changelogPerPage;
    const end = start + changelogPerPage;
    const pageData = changelogData.slice(start, end);

    changelogList.innerHTML = '';
    if (pageData.length > 0) {
      pageData.forEach((log: any) => {
        const div = document.createElement('div');
        div.style.padding = '8px';
        div.style.background = 'rgba(255, 255, 255, 0.1)';
        div.style.borderRadius = '6px';
        div.style.borderLeft = '4px solid #ffcc00';
        div.style.marginBottom = '8px';

        const timeSpan = document.createElement('div');
        timeSpan.style.fontSize = '12px';
        timeSpan.style.color = '#ccc';
        timeSpan.style.marginBottom = '4px';
        timeSpan.textContent = timeAgo(log.time, getLanguage());

        const msgSpan = document.createElement('div');
        msgSpan.style.fontSize = '14px';
        msgSpan.style.color = '#fff';
        msgSpan.textContent = log.msg;

        div.appendChild(timeSpan);
        div.appendChild(msgSpan);
        changelogList.appendChild(div);
      });
    } else {
      changelogList.innerHTML = '<div style="text-align: center; color: #ccc;">暂无中文版本记录</div>';
    }

    if (changelogPageInfo) {
      changelogPageInfo.textContent = getLanguage() === 'zh'
        ? `第 ${changelogPage} / ${totalPages || 1} 页`
        : `Page ${changelogPage} / ${totalPages || 1}`;
    }

    if (changelogPrevBtn) {
      changelogPrevBtn.disabled = changelogPage <= 1;
      changelogPrevBtn.style.opacity = changelogPage <= 1 ? '0.5' : '1';
      changelogPrevBtn.style.cursor = changelogPage <= 1 ? 'not-allowed' : 'pointer';
    }
    if (changelogNextBtn) {
      changelogNextBtn.disabled = changelogPage >= totalPages;
      changelogNextBtn.style.opacity = changelogPage >= totalPages ? '0.5' : '1';
      changelogNextBtn.style.cursor = changelogPage >= totalPages ? 'not-allowed' : 'pointer';
    }
  }

  if (changelogBtn) {
    changelogBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/changelog');
        changelogData = await res.json();
        changelogPage = 1;
        renderChangelogPage();
        if (settingsModal) settingsModal.classList.add('hidden');
        changelogModal.classList.remove('hidden');
      } catch (e) {
        console.error('Failed to load changelog', e);
      }
    });
  }

  if (changelogPrevBtn) {
    changelogPrevBtn.addEventListener('click', () => {
      if (changelogPage > 1) {
        changelogPage--;
        renderChangelogPage();
      }
    });
  }

  if (changelogNextBtn) {
    changelogNextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(changelogData.length / changelogPerPage);
      if (changelogPage < totalPages) {
        changelogPage++;
        renderChangelogPage();
      }
    });
  }

  if (closeChangelogBtn) {
    closeChangelogBtn.addEventListener('click', () => {
      changelogModal.classList.add('hidden');
      if (settingsModal) settingsModal.classList.remove('hidden');
    });
  }
  if (closeChangelogX) {
    closeChangelogX.addEventListener('click', () => {
      changelogModal.classList.add('hidden');
      if (settingsModal) settingsModal.classList.remove('hidden');
    });
  }



  settingsBtn?.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.remove('hidden');
    game.pause();
  });

  closeSettingsBtn?.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.add('hidden');
    game.resume();
  });

  // Stats modal logic
  const statsBtn = document.getElementById('stats-btn');
  const statsModal = document.getElementById('stats-modal');
  const closeStatsBtn = document.getElementById('close-stats-btn');
  const closeStatsX = document.getElementById('close-stats-x');
  const playerStatsContent = document.getElementById('player-stats-content');
  const weaponsStatsContent = document.getElementById('weapons-stats-content');
  const enemiesStatsContent = document.getElementById('enemies-stats-content');

  function updateStatsModal(): void {
    if (!playerStatsContent || !weaponsStatsContent || !enemiesStatsContent) return;

    const lang = getLanguage();
    const player = game.player;

    // Player Stats
    const charNames: Record<string, { zh: string, en: string }> = {
      knight: { zh: '骑士', en: 'Knight' },
      warrior: { zh: '战士', en: 'Warrior' },
      mage: { zh: '法师', en: 'Mage' }
    };
    const charName = charNames[player.characterClass] || { zh: '骑士', en: 'Knight' };

    let playerHTML = `
      <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 4px;">
        <span style="color: #aaa;">${lang === 'zh' ? '职业' : 'Class'}</span>
        <span style="color: #fff; font-weight: bold;">${lang === 'zh' ? charName.zh : charName.en}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 4px;">
        <span style="color: #aaa;">❤️ ${lang === 'zh' ? '生命值' : 'HP'}</span>
        <span style="color: #90EE90; font-weight: bold;">${Math.floor(player.hp)} / ${player.maxHp}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 4px;">
        <span style="color: #aaa;">🏃 ${lang === 'zh' ? '移动速度' : 'Speed'}</span>
        <span style="color: #87CEEB; font-weight: bold;">${player.getSpeed().toFixed(0)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 4px;">
        <span style="color: #aaa;">⚡ ${lang === 'zh' ? '伤害倍率' : 'DMG Mult'}</span>
        <span style="color: #FF6B6B; font-weight: bold;">x${player.damageMultiplier.toFixed(1)}</span>
      </div>
    `;
    playerStatsContent.innerHTML = playerHTML;

    // Weapons Stats
    let weaponsHTML = '';
    if (player.weapons.length === 0) {
      weaponsHTML = `<div style="color: #888; text-align: center; padding: 10px;">${lang === 'zh' ? '无武器' : 'No weapons'}</div>`;
    } else {
      player.weapons.forEach(w => {
        const actualDamage = (w.damage * player.damageMultiplier).toFixed(1);
        weaponsHTML += `
          <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 8px; background: rgba(255,107,107,0.2); border-radius: 4px; border-left: 3px solid #FF6B6B;">
            <span style="color: #fff;">${tWeapon(w.name)} Lv${w.level}</span>
            <span style="color: #FF6B6B; font-weight: bold;">${actualDamage} ${lang === 'zh' ? '伤害' : 'DMG'}</span>
          </div>
        `;
      });
    }
    weaponsStatsContent.innerHTML = weaponsHTML;

    // Enemies Stats
    const hpMultiplier = 1 + (Math.floor(game.gameTime / 30) * 0.5);
    const damageBonus = Math.floor(game.gameTime / 60);

    const enemyData = [
      { name: 'Basic', hp: 6, dmg: 1, color: '#39FF14' },
      { name: 'Scout', hp: 4, dmg: 1, color: '#00FFFF' },
      { name: 'Swarm', hp: 2, dmg: 1, color: '#AA44AA' },
      { name: 'Tank', hp: 30, dmg: 2, color: '#448844' },
      { name: 'Splitter', hp: 8, dmg: 1, color: '#FF6666' },
      { name: 'Charger', hp: 10, dmg: 2, color: '#CC3333' },
      { name: 'Teleporter', hp: 4, dmg: 1, color: '#9933FF' },
      { name: 'Star', hp: 4, dmg: 1, color: '#FFCC00' },
      { name: 'Slime', hp: 30, dmg: 2, color: '#32CD32' },
      { name: 'Boss', hp: 20, dmg: 3, color: '#880000' },
      { name: 'Twin Elite', hp: 200, dmg: 4, color: '#4444FF' },
      { name: 'Devourer', hp: 150, dmg: 3, color: '#8B008B' },
      { name: 'Titan', hp: 500, dmg: 5, color: '#555555' },
      { name: 'Necromancer', hp: 1500, dmg: 5, color: '#4B0082' },
    ];

    let enemiesHTML = '';
    enemyData.forEach(e => {
      const currentHP = Math.floor(e.hp * hpMultiplier);
      const currentDMG = e.dmg + damageBonus;
      enemiesHTML += `
        <div style="display: flex; justify-content: space-between; margin: 4px 0; padding: 6px; background: rgba(255,68,68,0.15); border-radius: 4px; border-left: 3px solid ${e.color};">
          <span style="color: #fff; font-size: 13px;">${tEnemy(e.name)}</span>
          <span style="color: #90EE90; font-size: 12px;">HP: ${currentHP}</span>
          <span style="color: #FF6B6B; font-size: 12px;">ATK: ${currentDMG}</span>
        </div>
      `;
    });
    enemiesStatsContent.innerHTML = enemiesHTML;
  }

  statsBtn?.addEventListener('click', () => {
    updateStatsModal();
    if (statsModal) statsModal.classList.remove('hidden');
    game.pause();
  });

  closeStatsBtn?.addEventListener('click', () => {
    if (statsModal) statsModal.classList.add('hidden');
    game.resume();
  });

  closeStatsX?.addEventListener('click', () => {
    if (statsModal) statsModal.classList.add('hidden');
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

    const changelogBtnElem = document.getElementById('changelog-btn');
    if (changelogBtnElem) {
      changelogBtnElem.innerHTML = newLang === 'zh' ? '📜 版本列表' : '📜 Changelog';
    }
    const changelogTitleElem = document.getElementById('changelog-title');
    if (changelogTitleElem) {
      changelogTitleElem.innerHTML = newLang === 'zh' ? '📜 版本列表' : '📜 Changelog';
    }
    const closeChangelogBtnElem = document.getElementById('close-changelog-btn');
    if (closeChangelogBtnElem) {
      closeChangelogBtnElem.innerHTML = newLang === 'zh' ? '关闭' : 'Close';
    }
    if (changelogPrevBtn) {
      changelogPrevBtn.innerHTML = newLang === 'zh' ? '◀ 上一页' : '◀ Prev';
    }
    if (changelogNextBtn) {
      changelogNextBtn.innerHTML = newLang === 'zh' ? '下一页 ▶' : 'Next ▶';
    }
    renderChangelogPage();
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

  // Simulate asset loading - optimized for faster initial load
  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.random() * 35 + 25;
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
      }, 50);
    } else {
      if (loadingBar) loadingBar.style.width = `${progress}%`;
    }
  }, 15);

  // Auto-pause when game goes to background (tab switch, minimize, etc.)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.pause();
    } else {
      game.resume();
    }
  });

  startBtn?.addEventListener('click', () => {
    if (loadingScreen) loadingScreen.style.display = 'none';
    // Show character selection instead of starting directly
    if (characterSelect) characterSelect.classList.remove('hidden');
  });

  // Auto-pause when game goes to background (tab switch, minimize, etc.)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.pause();
    } else {
      game.resume();
    }
  });

  // Award skill points every 60 seconds
  let lastSkillPointTime = 0;
  const gameLoop = () => {
    if (game.player && game.gameTime - lastSkillPointTime >= 60) {
      lastSkillPointTime = game.gameTime;
      skillTreeManager.addSkillPoints(1);
      const lang = getLanguage();
      const msg = lang === 'zh' ? '获得 1 技能点！' : 'Gained 1 skill point!';
      game.addFloatingText(new FloatingText(
        game.player.x,
        game.player.y - 50,
        msg,
        '#9932CC'
      ));
    }
    requestAnimationFrame(gameLoop);
  };
  requestAnimationFrame(gameLoop);
});
