// Pet Nurture System
// 宠物养成核心系统：等级、经验、进化、亲密度、装备、技能

import type { Pet } from '../entities/Pet';
import { getPetChineseName } from './PetConstants';

declare module '../entities/Pet' {
    interface Pet {
        _petNurtureId?: string;
    }
}

export interface PetEquipment {
    id: string;
    name: string;
    nameZh: string;
    slot: 'collar' | 'accessory' | 'badge';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    effects: Map<string, number>;
    setName?: string;
}

export interface PetData {
    id: string;
    name: string;
    nameZh: string;
    level: number;
    experience: number;
    maxExperience: number;
    intimacy: number;
    intimacyLevel: number;
    evolutionStage: number;
    canEvolve: boolean;
    skillPoints: number;
    unlockedSkills: string[];
    equipment: {
        collar: PetEquipment | null;
        accessory: PetEquipment | null;
        badge: PetEquipment | null;
    };
    stats: {
        damageMultiplier: number;
        speedMultiplier: number;
        healthMultiplier: number;
        critChance: number;
        critDamage: number;
    };
}

export interface PetSkill {
    id: string;
    name: string;
    nameZh: string;
    description: string;
    descriptionZh: string;
    cost: number;
    maxLevel: number;
    effect: (pet: Pet, level: number) => void;
}

export class PetNurtureSystem {
    private petDataMap: Map<string, PetData> = new Map();
    private equipmentDatabase: Map<string, PetEquipment> = new Map();
    private expTable: number[] = [];
    private skillsDatabase: Map<string, PetSkill> = new Map();

    constructor() {
        this.initializeExpTable();
        this.initializeEquipmentDatabase();
        this.initializeSkillsDatabase();
    }

    private initializeExpTable(): void {
        for (let i = 1; i <= 50; i++) {
            if (i <= 10) {
                this.expTable[i] = Math.floor(80 * Math.pow(i, 1.8));
            } else if (i <= 25) {
                this.expTable[i] = Math.floor(100 * Math.pow(i, 2.0));
            } else {
                this.expTable[i] = Math.floor(120 * Math.pow(i, 2.2));
            }
        }
    }

    private initializeEquipmentDatabase(): void {
        const equipments: PetEquipment[] = [
            // === 项圈类 (Collar) ===
            {
                id: 'collar_basic',
                name: 'Basic Collar',
                nameZh: '基础项圈',
                slot: 'collar',
                rarity: 'common',
                effects: new Map([['damage', 5]]),
            },
            {
                id: 'collar_leather',
                name: 'Leather Collar',
                nameZh: '皮革项圈',
                slot: 'collar',
                rarity: 'common',
                effects: new Map([['damage', 3], ['speed', 3]]),
            },
            {
                id: 'collar_iron',
                name: 'Iron Collar',
                nameZh: '钢铁项圈',
                slot: 'collar',
                rarity: 'rare',
                effects: new Map([['damage', 10], ['health', 10]]),
            },
            {
                id: 'collar_spiked',
                name: 'Spiked Collar',
                nameZh: '尖刺项圈',
                slot: 'collar',
                rarity: 'rare',
                effects: new Map([['damage', 8], ['critChance', 3]]),
            },
            {
                id: 'collar_ruby',
                name: 'Ruby Collar',
                nameZh: '红宝石项圈',
                slot: 'collar',
                rarity: 'epic',
                effects: new Map([['damage', 18], ['critDamage', 20]]),
            },
            {
                id: 'collar_dragon',
                name: 'Dragon Collar',
                nameZh: '巨龙项圈',
                slot: 'collar',
                rarity: 'legendary',
                effects: new Map([['damage', 25], ['health', 20], ['speed', 10]]),
                setName: 'dragon_set',
            },
            
            // === 饰品类 (Accessory) ===
            {
                id: 'accessory_feather',
                name: 'Swift Feather',
                nameZh: '迅捷羽毛',
                slot: 'accessory',
                rarity: 'common',
                effects: new Map([['speed', 8]]),
            },
            {
                id: 'accessory_luck',
                name: 'Lucky Charm',
                nameZh: '幸运护符',
                slot: 'accessory',
                rarity: 'rare',
                effects: new Map([['gold', 15], ['critChance', 2]]),
            },
            {
                id: 'accessory_fire',
                name: 'Fire Pendant',
                nameZh: '火焰吊坠',
                slot: 'accessory',
                rarity: 'epic',
                effects: new Map([['damage', 20], ['critChance', 5]]),
                setName: 'fire_set',
            },
            {
                id: 'accessory_ice',
                name: 'Ice Crystal',
                nameZh: '冰晶吊坠',
                slot: 'accessory',
                rarity: 'epic',
                effects: new Map([['damage', 15], ['speed', 12]]),
                setName: 'frost_set',
            },
            {
                id: 'accessory_shadow',
                name: 'Shadow Amulet',
                nameZh: '暗影护符',
                slot: 'accessory',
                rarity: 'legendary',
                effects: new Map([['damage', 22], ['critChance', 8], ['critDamage', 15]]),
                setName: 'shadow_set',
            },
            
            // === 徽章类 (Badge) ===
            {
                id: 'badge_novice',
                name: 'Novice Badge',
                nameZh: '新手徽章',
                slot: 'badge',
                rarity: 'common',
                effects: new Map([['damage', 4]]),
            },
            {
                id: 'badge_warrior',
                name: 'Warrior Badge',
                nameZh: '勇士徽章',
                slot: 'badge',
                rarity: 'rare',
                effects: new Map([['damage', 12]]),
            },
            {
                id: 'badge_guardian',
                name: 'Guardian Badge',
                nameZh: '守护徽章',
                slot: 'badge',
                rarity: 'rare',
                effects: new Map([['health', 18], ['speed', 5]]),
            },
            {
                id: 'badge_berserker',
                name: 'Berserker Badge',
                nameZh: '狂战士徽章',
                slot: 'badge',
                rarity: 'epic',
                effects: new Map([['damage', 18], ['critChance', 6]]),
                setName: 'fire_set',
            },
            {
                id: 'badge_frost',
                name: 'Frost Badge',
                nameZh: '寒冰徽章',
                slot: 'badge',
                rarity: 'epic',
                effects: new Map([['damage', 12], ['speed', 15], ['health', 10]]),
                setName: 'frost_set',
            },
            {
                id: 'badge_champion',
                name: 'Champion Badge',
                nameZh: '冠军徽章',
                slot: 'badge',
                rarity: 'legendary',
                effects: new Map([['damage', 20], ['speed', 15], ['health', 15]]),
                setName: 'champion_set',
            },
            {
                id: 'badge_void',
                name: 'Void Badge',
                nameZh: '虚空徽章',
                slot: 'badge',
                rarity: 'legendary',
                effects: new Map([['damage', 28], ['critChance', 10], ['speed', 8]]),
                setName: 'shadow_set',
            },
        ];

        equipments.forEach(eq => {
            this.equipmentDatabase.set(eq.id, eq);
        });
    }

    private initializeSkillsDatabase(): void {
        const skills: PetSkill[] = [
            {
                id: 'power_strike',
                name: 'Power Strike',
                nameZh: '强力打击',
                description: 'Increase damage by 5% per level',
                descriptionZh: '每级伤害+5%',
                cost: 1,
                maxLevel: 10,
                effect: (_pet: Pet, _level: number) => {},
            },
            {
                id: 'swift_movement',
                name: 'Swift Movement',
                nameZh: '迅捷移动',
                description: 'Increase speed by 3% per level',
                descriptionZh: '每级速度+3%',
                cost: 1,
                maxLevel: 10,
                effect: (_pet: Pet, _level: number) => {},
            },
            {
                id: 'critical_eye',
                name: 'Critical Eye',
                nameZh: '致命之眼',
                description: 'Increase crit chance by 2% per level',
                descriptionZh: '每级暴击率+2%',
                cost: 2,
                maxLevel: 5,
                effect: (_pet: Pet, _level: number) => {},
            },
            {
                id: 'vitality',
                name: 'Vitality',
                nameZh: '生命力',
                description: 'Increase health by 5% per level',
                descriptionZh: '每级生命+5%',
                cost: 1,
                maxLevel: 10,
                effect: (_pet: Pet, _level: number) => {},
            },
        ];

        skills.forEach(skill => {
            this.skillsDatabase.set(skill.id, skill);
        });
    }

    private getPetId(pet: Pet): string {
        if (!pet._petNurtureId) {
            pet._petNurtureId = `${pet.constructor.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return pet._petNurtureId;
    }

    public registerPet(pet: Pet): void {
        const petId = this.getPetId(pet);
        if (!this.petDataMap.has(petId)) {
            this.petDataMap.set(petId, {
                id: petId,
                name: pet.constructor.name,
                nameZh: this.getPetChineseName(pet.constructor.name),
                level: 1,
                experience: 0,
                maxExperience: this.expTable[1],
                intimacy: 0,
                intimacyLevel: 1,
                evolutionStage: 0,
                canEvolve: false,
                skillPoints: 0,
                unlockedSkills: [],
                equipment: {
                    collar: null,
                    accessory: null,
                    badge: null,
                },
                stats: {
                    damageMultiplier: 1.0,
                    speedMultiplier: 1.0,
                    healthMultiplier: 1.0,
                    critChance: 0,
                    critDamage: 1.5,
                },
            });
            const data = this.petDataMap.get(petId)!;
            pet.petData = data;
            pet.level = data.level;
            pet.experience = data.experience;
            pet.maxExperience = data.maxExperience;
        }
    }

    public getPetData(pet: Pet): PetData | null {
        const petId = this.getPetId(pet);
        return this.petDataMap.get(petId) || null;
    }

    public getPetDataByName(petName: string): PetData | null {
        for (const [_, data] of this.petDataMap.entries()) {
            if (data.name === petName) {
                return data;
            }
        }
        return null;
    }

    public getAllPetData(): PetData[] {
        return Array.from(this.petDataMap.values());
    }

    public addExperience(pet: Pet, amount: number): void {
        const petId = this.getPetId(pet);
        let data = this.petDataMap.get(petId);
        if (!data) {
            this.registerPet(pet);
            data = this.petDataMap.get(petId);
            if (!data) return;
        }

        data.experience += amount;
        
        pet.experience = data.experience;
        pet.maxExperience = data.maxExperience;
        pet.level = data.level;

        while (data.experience >= data.maxExperience && data.level < 50) {
            data.experience -= data.maxExperience;
            data.level++;
            data.maxExperience = this.expTable[data.level] || this.expTable[50];
            data.skillPoints += 1;
            
            data.stats.damageMultiplier += 0.06;
            data.stats.speedMultiplier += 0.04;
            data.stats.healthMultiplier += 0.05;

            this.checkEvolutionCondition(data);
            
            pet.experience = data.experience;
            pet.maxExperience = data.maxExperience;
            pet.level = data.level;
        }

        pet.petData = data;
        this.applyPetStats(pet, data);
    }

    private checkEvolutionCondition(data: PetData): void {
        const evolutionLevels = [12, 25, 40];
        if (data.evolutionStage < 3 && data.level >= evolutionLevels[data.evolutionStage]) {
            data.canEvolve = true;
        }
    }

    public evolvePet(pet: Pet): boolean {
        const petId = this.getPetId(pet);
        const data = this.petDataMap.get(petId);
        if (!data || !data.canEvolve) return false;

        data.evolutionStage++;
        data.canEvolve = false;

        const evolutionMultipliers = [
            { damage: 1.25, speed: 1.15, health: 1.20 },
            { damage: 1.35, speed: 1.25, health: 1.30 },
            { damage: 1.50, speed: 1.35, health: 1.45 },
        ];
        
        const mult = evolutionMultipliers[Math.min(data.evolutionStage - 1, 2)];
        data.stats.damageMultiplier *= mult.damage;
        data.stats.speedMultiplier *= mult.speed;
        data.stats.healthMultiplier *= mult.health;

        data.level = 1;
        data.experience = 0;
        data.maxExperience = this.expTable[1];

        pet.level = 1;
        pet.experience = 0;
        pet.maxExperience = this.expTable[1];

        pet.petData = data;
        this.applyPetStats(pet, data);
        return true;
    }

    public addIntimacy(pet: Pet, amount: number): void {
        const petId = this.getPetId(pet);
        const data = this.petDataMap.get(petId);
        if (!data) return;

        const maxIntimacy = 200;
        data.intimacy = Math.min(maxIntimacy, data.intimacy + amount);
        data.intimacyLevel = Math.floor(data.intimacy / 20) + 1;

        this.recalculateStats(data);
        
        pet.petData = data;
        this.applyPetStats(pet, data);
    }

    public equipItem(pet: Pet, equipmentId: string): boolean {
        const petId = this.getPetId(pet);
        const data = this.petDataMap.get(petId);
        if (!data) return false;

        const equipment = this.equipmentDatabase.get(equipmentId);
        if (!equipment) return false;

        data.equipment[equipment.slot] = equipment;
        this.recalculateStats(data);
        
        pet.petData = data;
        this.applyPetStats(pet, data);

        return true;
    }

    public unequipItem(pet: Pet, slot: 'collar' | 'accessory' | 'badge'): boolean {
        const petId = this.getPetId(pet);
        const data = this.petDataMap.get(petId);
        if (!data) return false;

        data.equipment[slot] = null;
        this.recalculateStats(data);
        
        pet.petData = data;
        this.applyPetStats(pet, data);

        return true;
    }

    private recalculateStats(data: PetData): void {
        const baseDamage = 1.0 + (data.level - 1) * 0.06;
        const baseSpeed = 1.0 + (data.level - 1) * 0.04;
        const baseHealth = 1.0 + (data.level - 1) * 0.05;
        const intimacyBonus = data.intimacy / 500;

        data.stats.damageMultiplier = baseDamage + intimacyBonus;
        data.stats.speedMultiplier = baseSpeed + intimacyBonus * 0.5;
        data.stats.healthMultiplier = baseHealth;
        data.stats.critChance = 0;
        data.stats.critDamage = 1.5;

        const equippedItems = [
            data.equipment.collar,
            data.equipment.accessory,
            data.equipment.badge,
        ].filter((item): item is PetEquipment => item !== null);

        equippedItems.forEach(item => {
            item.effects.forEach((value, key) => {
                if (key === 'damage') {
                    data.stats.damageMultiplier += value / 100;
                } else if (key === 'speed') {
                    data.stats.speedMultiplier += value / 100;
                } else if (key === 'health') {
                    data.stats.healthMultiplier += value / 100;
                } else if (key === 'critChance') {
                    data.stats.critChance += value;
                } else if (key === 'critDamage') {
                    data.stats.critDamage += value / 100;
                }
            });
        });

        this.checkSetBonuses(data);
    }

    private checkSetBonuses(data: PetData): void {
        const setCounts: Map<string, number> = new Map();

        [data.equipment.collar, data.equipment.accessory, data.equipment.badge]
            .filter((item): item is PetEquipment => item !== null && item.setName !== undefined)
            .forEach(item => {
                const setName = item.setName!;
                setCounts.set(setName, (setCounts.get(setName) || 0) + 1);
            });

        setCounts.forEach((count, setName) => {
            if (count >= 2) {
                if (setName === 'dragon_set') {
                    data.stats.damageMultiplier += 0.15;
                    data.stats.healthMultiplier += 0.10;
                } else if (setName === 'champion_set') {
                    data.stats.damageMultiplier += 0.10;
                    data.stats.speedMultiplier += 0.10;
                    data.stats.critChance += 5;
                } else if (setName === 'fire_set') {
                    data.stats.damageMultiplier += 0.12;
                    data.stats.critDamage += 0.25;
                } else if (setName === 'frost_set') {
                    data.stats.speedMultiplier += 0.15;
                    data.stats.critChance += 8;
                } else if (setName === 'shadow_set') {
                    data.stats.damageMultiplier += 0.18;
                    data.stats.critChance += 10;
                }
            }
            if (count >= 3) {
                if (setName === 'dragon_set') {
                    data.stats.damageMultiplier += 0.10;
                } else if (setName === 'champion_set') {
                    data.stats.critDamage += 0.30;
                } else if (setName === 'fire_set') {
                    data.stats.critChance += 10;
                } else if (setName === 'frost_set') {
                    data.stats.damageMultiplier += 0.10;
                } else if (setName === 'shadow_set') {
                    data.stats.critDamage += 0.35;
                }
            }
        });
    }

    private applyPetStats(pet: Pet, data: PetData): void {
        pet.damageMultiplier = data.stats.damageMultiplier;
    }

    public getEquipmentDatabase(): Map<string, PetEquipment> {
        return this.equipmentDatabase;
    }

    public getSkillsDatabase(): Map<string, PetSkill> {
        return this.skillsDatabase;
    }

    public learnSkill(pet: Pet, skillId: string): boolean {
        const petId = this.getPetId(pet);
        const data = this.petDataMap.get(petId);
        if (!data) return false;

        const skill = this.skillsDatabase.get(skillId);
        if (!skill) return false;

        const currentLevel = data.unlockedSkills.filter(s => s === skillId).length;
        if (currentLevel >= skill.maxLevel) return false;
        if (data.skillPoints < skill.cost) return false;

        data.skillPoints -= skill.cost;
        data.unlockedSkills.push(skillId);
        
        skill.effect(pet, currentLevel + 1);
        
        pet.petData = data;
        return true;
    }

    private getPetChineseName(englishName: string): string {
        return getPetChineseName(englishName);
    }

    public getEvolvedPetClassName(baseClassName: string, stage: number): string {
        const evolutionMap: Record<string, string[]> = {
            'GreedyDog': ['GreedyDog', 'TreasureHound', 'MidasWolf', 'GoldenEmperor'],
            'MagicFairy': ['MagicFairy', 'ArcaneSpirit', 'CelestialBeing', 'DivineFairy'],
            'SpeedyTurtle': ['SpeedyTurtle', 'SwiftShell', 'TempestTurtle', 'StormGuardian'],
            'LuckyCat': ['LuckyCat', 'FortuneCat', 'GoldCat', 'FortuneDeity'],
            'HolyLightTurtle': ['HolyLightTurtle', 'DivineShell', 'SacredTurtle', 'HolyGuardian'],
            'GrumpyPorcupine': ['GrumpyPorcupine', 'FierceQuill', 'RagingBeast', 'TitanQuill'],
            'BouncySlime': ['BouncySlime', 'AcidSlime', 'ToxicBlob', 'CorrosiveTitan'],
            'KnightPet': ['KnightPet', 'PaladinPet', 'HolyKnight', 'DivineCrusader'],
        };

        const chain = evolutionMap[baseClassName];
        if (chain && stage < chain.length) {
            return chain[stage];
        }
        return baseClassName;
    }

    public getRarityColor(rarity: string): string {
        const colors: Record<string, string> = {
            'common': '#B0B0B0',
            'rare': '#0070DD',
            'epic': '#A335EE',
            'legendary': '#FF8000',
        };
        return colors[rarity] || '#FFFFFF';
    }
}