// Skill Tree System
// Three branches: Attack, Defense, Support
// With class-specific bonuses for Knight, Warrior, Mage, Hunter

export type SkillBranch = 'attack' | 'defense' | 'support';
export type CharacterClass = 'knight' | 'warrior' | 'mage' | 'hunter';

export interface Skill {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  branch: SkillBranch;
  tier: number;
  maxLevel: number;
  currentLevel: number;
  cost: number;
  icon: string;
  requires?: string[];
  effects: SkillEffect[];
  classSpecific?: CharacterClass[];
}

export interface SkillEffect {
  type: 'damage' | 'speed' | 'health' | 'gold' | 'critChance' | 'critDamage' | 'lifesteal' | 'armor' | 'pickupRange' | 'attackSpeed' | 'skillCooldown' | 'skillDuration' | 'invincibility' | 'rage' | 'haste' | 'petLuck' | 'petDamage' | 'petSpeed';
  value: number;
  isPercentage: boolean;
}

export interface SkillTreeState {
  skillPoints: number;
  totalSkillPointsEarned: number;
  skills: Map<string, Skill>;
  branchLevels: Map<SkillBranch, number>;
  characterClass: CharacterClass;
}

export class SkillTreeManager {
  private state: SkillTreeState;
  private onChangeCallbacks: (() => void)[] = [];
  private classBonuses: Map<CharacterClass, Map<string, number>>;

  constructor(characterClass: CharacterClass = 'knight') {
    this.classBonuses = this.initializeClassBonuses();
    this.state = {
      skillPoints: 0,
      totalSkillPointsEarned: 0,
      skills: new Map(),
      branchLevels: new Map([['attack', 0], ['defense', 0], ['support', 0]]),
      characterClass: characterClass
    };
    this.initializeSkills();
  }

  private initializeSkills() {
    const skills: Skill[] = [
      // ===== ATTACK BRANCH =====
      {
        id: 'power_strike',
        name: 'Power Strike',
        nameZh: '强力打击',
        description: 'Increase damage by 10%',
        descriptionZh: '伤害提升10%',
        branch: 'attack',
        tier: 0,
        maxLevel: 5,
        currentLevel: 0,
        cost: 1,
        icon: '⚔️',
        effects: [{ type: 'damage', value: 10, isPercentage: true }]
      },
      {
        id: 'rapid_fire',
        name: 'Rapid Fire',
        nameZh: '急速射击',
        description: 'Increase attack speed by 8%',
        descriptionZh: '攻击速度提升8%',
        branch: 'attack',
        tier: 0,
        maxLevel: 5,
        currentLevel: 0,
        cost: 1,
        icon: '⚡',
        effects: [{ type: 'attackSpeed', value: 8, isPercentage: true }]
      },
      {
        id: 'critical_eye',
        name: 'Critical Eye',
        nameZh: '致命之眼',
        description: 'Increase critical chance by 5%',
        descriptionZh: '暴击率提升5%',
        branch: 'attack',
        tier: 1,
        maxLevel: 5,
        currentLevel: 0,
        cost: 2,
        icon: '👁️',
        requires: ['power_strike'],
        effects: [{ type: 'critChance', value: 5, isPercentage: true }]
      },
      {
        id: 'devastating_blow',
        name: 'Devastating Blow',
        nameZh: '毁灭打击',
        description: 'Increase critical damage by 25%',
        descriptionZh: '暴击伤害提升25%',
        branch: 'attack',
        tier: 1,
        maxLevel: 3,
        currentLevel: 0,
        cost: 2,
        icon: '💥',
        requires: ['power_strike'],
        effects: [{ type: 'critDamage', value: 25, isPercentage: true }]
      },
      {
        id: 'vampiric_strike',
        name: 'Vampiric Strike',
        nameZh: '吸血打击',
        description: 'Heal 3% of damage dealt',
        descriptionZh: '回复造成伤害的3%',
        branch: 'attack',
        tier: 2,
        maxLevel: 3,
        currentLevel: 0,
        cost: 3,
        icon: '🩸',
        requires: ['critical_eye'],
        effects: [{ type: 'lifesteal', value: 3, isPercentage: true }]
      },
      {
        id: 'armor_pierce',
        name: 'Armor Pierce',
        nameZh: '穿甲',
        description: 'Ignore 15% of enemy defense',
        descriptionZh: '无视敌人15%防御',
        branch: 'attack',
        tier: 2,
        maxLevel: 3,
        currentLevel: 0,
        cost: 3,
        icon: '🗡️',
        requires: ['devastating_blow'],
        effects: [{ type: 'damage', value: 15, isPercentage: true }]
      },
      {
        id: 'bloodlust',
        name: 'Bloodlust',
        nameZh: '嗜血',
        description: 'Kill enemies to gain temporary damage boost',
        descriptionZh: '击杀敌人获得临时伤害加成',
        branch: 'attack',
        tier: 3,
        maxLevel: 1,
        currentLevel: 0,
        cost: 5,
        icon: '🔥',
        requires: ['vampiric_strike', 'armor_pierce'],
        effects: [{ type: 'damage', value: 20, isPercentage: true }]
      },

      // ===== DEFENSE BRANCH =====
      {
        id: 'tough_skin',
        name: 'Tough Skin',
        nameZh: '坚韧皮肤',
        description: 'Increase max HP by 15',
        descriptionZh: '最大生命值+15',
        branch: 'defense',
        tier: 0,
        maxLevel: 5,
        currentLevel: 0,
        cost: 1,
        icon: '🛡️',
        effects: [{ type: 'health', value: 15, isPercentage: false }]
      },
      {
        id: 'swift_feet',
        name: 'Swift Feet',
        nameZh: '疾风步',
        description: 'Increase movement speed by 10%',
        descriptionZh: '移动速度提升10%',
        branch: 'defense',
        tier: 0,
        maxLevel: 5,
        currentLevel: 0,
        cost: 1,
        icon: '👟',
        effects: [{ type: 'speed', value: 10, isPercentage: true }]
      },
      {
        id: 'iron_will',
        name: 'Iron Will',
        nameZh: '钢铁意志',
        description: 'Reduce damage taken by 5%',
        descriptionZh: '减少受到伤害5%',
        branch: 'defense',
        tier: 1,
        maxLevel: 4,
        currentLevel: 0,
        cost: 2,
        icon: '🔰',
        requires: ['tough_skin'],
        effects: [{ type: 'armor', value: 5, isPercentage: true }]
      },
      {
        id: 'second_wind',
        name: 'Second Wind',
        nameZh: '第二春',
        description: 'Heal 1 HP every 5 seconds',
        descriptionZh: '每5秒回复1点生命',
        branch: 'defense',
        tier: 1,
        maxLevel: 3,
        currentLevel: 0,
        cost: 2,
        icon: '💚',
        requires: ['tough_skin'],
        effects: [{ type: 'health', value: 0.2, isPercentage: false }] // per second
      },
      {
        id: 'dodge_master',
        name: 'Dodge Master',
        nameZh: '闪避大师',
        description: '8% chance to dodge attacks',
        descriptionZh: '8%几率闪避攻击',
        branch: 'defense',
        tier: 2,
        maxLevel: 3,
        currentLevel: 0,
        cost: 3,
        icon: '💨',
        requires: ['swift_feet'],
        effects: [{ type: 'speed', value: 5, isPercentage: true }]
      },
      {
        id: 'last_stand',
        name: 'Last Stand',
        nameZh: '背水一战',
        description: 'When HP below 30%, gain 20% damage reduction',
        descriptionZh: '生命低于30%时，减伤20%',
        branch: 'defense',
        tier: 2,
        maxLevel: 1,
        currentLevel: 0,
        cost: 3,
        icon: '⭐',
        requires: ['iron_will', 'second_wind'],
        effects: [{ type: 'armor', value: 20, isPercentage: true }]
      },
      {
        id: 'fortress',
        name: 'Fortress',
        nameZh: '堡垒',
        description: 'Become immovable, gain massive defense',
        descriptionZh: '屹立不倒，大幅提升防御',
        branch: 'defense',
        tier: 3,
        maxLevel: 1,
        currentLevel: 0,
        cost: 5,
        icon: '🏰',
        requires: ['last_stand', 'dodge_master'],
        effects: [{ type: 'armor', value: 30, isPercentage: true }]
      },

      // ===== SUPPORT BRANCH =====
      {
        id: 'gold_finder',
        name: 'Gold Finder',
        nameZh: '寻金者',
        description: 'Increase gold drop by 15%',
        descriptionZh: '金币掉落提升15%',
        branch: 'support',
        tier: 0,
        maxLevel: 5,
        currentLevel: 0,
        cost: 1,
        icon: '💰',
        effects: [{ type: 'gold', value: 15, isPercentage: true }]
      },
      {
        id: 'magnetism',
        name: 'Magnetism',
        nameZh: '磁力',
        description: 'Increase pickup range by 20%',
        descriptionZh: '拾取范围提升20%',
        branch: 'support',
        tier: 0,
        maxLevel: 5,
        currentLevel: 0,
        cost: 1,
        icon: '🧲',
        effects: [{ type: 'pickupRange', value: 20, isPercentage: true }]
      },
      {
        id: 'treasure_hunter',
        name: 'Treasure Hunter',
        nameZh: '宝藏猎人',
        description: 'Chance to find extra gold from kills',
        descriptionZh: '击杀敌人有几率获得额外金币',
        branch: 'support',
        tier: 1,
        maxLevel: 3,
        currentLevel: 0,
        cost: 2,
        icon: '💎',
        requires: ['gold_finder'],
        effects: [{ type: 'gold', value: 20, isPercentage: true }]
      },
      {
        id: 'pet_mastery',
        name: 'Pet Mastery',
        nameZh: '宠物精通',
        description: 'Pets deal 10% more damage',
        descriptionZh: '宠物伤害提升10%',
        branch: 'support',
        tier: 1,
        maxLevel: 3,
        currentLevel: 0,
        cost: 2,
        icon: '🐾',
        requires: ['magnetism'],
        effects: [{ type: 'damage', value: 10, isPercentage: true }]
      },
      {
        id: 'fortune',
        name: 'Fortune',
        nameZh: '财运',
        description: 'Double gold chance 10%',
        descriptionZh: '10%几率获得双倍金币',
        branch: 'support',
        tier: 2,
        maxLevel: 3,
        currentLevel: 0,
        cost: 3,
        icon: '🍀',
        requires: ['treasure_hunter'],
        effects: [{ type: 'gold', value: 10, isPercentage: true }]
      },
      {
        id: 'scavenger',
        name: 'Scavenger',
        nameZh: '拾荒者',
        description: 'Enemies drop more pickups',
        descriptionZh: '敌人掉落更多物品',
        branch: 'support',
        tier: 2,
        maxLevel: 3,
        currentLevel: 0,
        cost: 3,
        icon: '🎒',
        requires: ['pet_mastery'],
        effects: [{ type: 'pickupRange', value: 15, isPercentage: true }]
      },
      {
        id: 'midas_touch',
        name: 'Midas Touch',
        nameZh: '点金手',
        description: 'Convert kills to gold more efficiently',
        descriptionZh: '将击杀更高效地转化为金币',
        branch: 'support',
        tier: 3,
        maxLevel: 1,
        currentLevel: 0,
        cost: 5,
        icon: '👑',
        requires: ['fortune', 'scavenger'],
        effects: [{ type: 'gold', value: 50, isPercentage: true }]
      }
    ];

    skills.forEach(skill => {
      this.state.skills.set(skill.id, skill);
    });
  }

  getSkill(skillId: string): Skill | undefined {
    return this.state.skills.get(skillId);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.state.skills.values());
  }

  getSkillsByBranch(branch: SkillBranch): Skill[] {
    return this.getAllSkills().filter(s => s.branch === branch);
  }

  getSkillPoints(): number {
    return this.state.skillPoints;
  }

  addSkillPoints(amount: number) {
    this.state.skillPoints += amount;
    this.state.totalSkillPointsEarned += amount;
    this.notifyChange();
  }

  canUnlockSkill(skillId: string): { canUnlock: boolean; reason: string } {
    const skill = this.state.skills.get(skillId);
    if (!skill) {
      return { canUnlock: false, reason: 'Skill not found' };
    }

    if (skill.currentLevel >= skill.maxLevel) {
      return { canUnlock: false, reason: 'Skill already maxed' };
    }

    if (this.state.skillPoints < skill.cost) {
      return { canUnlock: false, reason: 'Not enough skill points' };
    }

    // Check prerequisites
    if (skill.requires) {
      for (const reqId of skill.requires) {
        const reqSkill = this.state.skills.get(reqId);
        if (!reqSkill || reqSkill.currentLevel === 0) {
          const lang = localStorage.getItem('language') || 'zh';
          return { 
            canUnlock: false, 
            reason: lang === 'zh' 
              ? `需要先解锁: ${reqSkill?.nameZh || reqId}` 
              : `Requires: ${reqSkill?.name || reqId}` 
          };
        }
      }
    }

    // Check tier requirements (need total points in branch)
    const branchPoints = this.state.branchLevels.get(skill.branch) || 0;
    const requiredPoints = skill.tier * 3;
    if (branchPoints < requiredPoints) {
      const lang = localStorage.getItem('language') || 'zh';
      return { 
        canUnlock: false, 
        reason: lang === 'zh' 
          ? `需要在${skill.branch === 'attack' ? '攻击' : skill.branch === 'defense' ? '防御' : '辅助'}系投入${requiredPoints}点` 
          : `Need ${requiredPoints} points in ${skill.branch} branch` 
      };
    }

    return { canUnlock: true, reason: '' };
  }

  unlockSkill(skillId: string): boolean {
    const check = this.canUnlockSkill(skillId);
    if (!check.canUnlock) {
      return false;
    }

    const skill = this.state.skills.get(skillId);
    if (!skill) return false;

    this.state.skillPoints -= skill.cost;
    skill.currentLevel++;
    
    const currentBranchLevel = this.state.branchLevels.get(skill.branch) || 0;
    this.state.branchLevels.set(skill.branch, currentBranchLevel + 1);
    
    this.notifyChange();
    return true;
  }

  resetSkills() {
    this.state.skills.forEach(skill => {
      this.state.skillPoints += skill.currentLevel * skill.cost;
      skill.currentLevel = 0;
    });
    
    this.state.branchLevels.set('attack', 0);
    this.state.branchLevels.set('defense', 0);
    this.state.branchLevels.set('support', 0);
    
    this.notifyChange();
  }

  setCharacterClass(characterClass: CharacterClass) {
    this.state.characterClass = characterClass;
    this.notifyChange();
  }

  private initializeClassBonuses(): Map<CharacterClass, Map<string, number>> {
    const bonuses = new Map<CharacterClass, Map<string, number>>();

    // Knight: 防御型，侧重生存和护盾
    const knightBonuses = new Map<string, number>([
      ['invincibility', 15],    // 无敌持续时间 +15%
      ['armor', 20],            // 护甲 +20%
      ['health', 25],           // 生命 +25%
      ['skillCooldown', -10]    // 技能冷却 -10%
    ]);
    bonuses.set('knight', knightBonuses);

    // Warrior: 攻击型，侧重伤害和攻速
    const warriorBonuses = new Map<string, number>([
      ['damage', 20],           // 伤害 +20%
      ['attackSpeed', 15],      // 攻速 +15%
      ['critDamage', 25],       // 暴击伤害 +25%
      ['rage', 20]              // 狂暴效果 +20%
    ]);
    bonuses.set('warrior', warriorBonuses);

    // Mage: 技能型，侧重冷却缩减和技能效果
    const mageBonuses = new Map<string, number>([
      ['skillCooldown', -25],   // 技能冷却 -25%
      ['skillDuration', 20],    // 技能持续时间 +20%
      ['haste', 25],            // 急速效果 +25%
      ['damage', 15]            // 伤害 +15%
    ]);
    bonuses.set('mage', mageBonuses);

    // Hunter: 宠物型，侧重宠物强化和幸运
    const hunterBonuses = new Map<string, number>([
      ['petDamage', 30],        // 宠物伤害 +30%
      ['petSpeed', 20],         // 宠物速度 +20%
      ['petLuck', 25],          // 宠物幸运 +25%
      ['gold', 20]              // 金币 +20%
    ]);
    bonuses.set('hunter', hunterBonuses);

    return bonuses;
  }

  // Calculate total bonuses from skills including class-specific bonuses
  getSkillBonuses(): Map<string, number> {
    const bonuses = new Map<string, number>();
    
    // Add class-specific base bonuses
    const classBonus = this.classBonuses.get(this.state.characterClass);
    if (classBonus) {
      classBonus.forEach((value, key) => {
        bonuses.set(key, value);
      });
    }
    
    // Add skill bonuses
    this.state.skills.forEach(skill => {
      if (skill.currentLevel > 0) {
        // Skip class-specific skills that don't match current class
        if (skill.classSpecific && !skill.classSpecific.includes(this.state.characterClass)) {
          return;
        }
        
        skill.effects.forEach(effect => {
          const current = bonuses.get(effect.type) || 0;
          const bonus = effect.value * skill.currentLevel;
          bonuses.set(effect.type, current + bonus);
        });
      }
    });
    
    return bonuses;
  }

  onChange(callback: () => void) {
    this.onChangeCallbacks.push(callback);
  }

  private notifyChange() {
    this.onChangeCallbacks.forEach(cb => cb());
  }

  getState(): SkillTreeState {
    return this.state;
  }

  // Get total points invested in a branch
  getBranchLevel(branch: SkillBranch): number {
    return this.state.branchLevels.get(branch) || 0;
  }
}