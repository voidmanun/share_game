// Pet Nurture System
// 宠物养成核心系统：等级、经验、进化、亲密度

import type { Pet } from '../entities/Pet';
import { getPetChineseName } from './PetConstants';

// 为 Pet 类添加唯一 ID 属性
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
    intimacy: number; // 0-100
    intimacyLevel: number; // 1-10
    evolutionStage: number; // 0-2 (base, advanced, ultimate)
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
    };
}

export class PetNurtureSystem {
    private petDataMap: Map<string, PetData> = new Map();
    private equipmentDatabase: Map<string, PetEquipment> = new Map();
    private expTable: number[] = [];

    constructor() {
        this.initializeExpTable();
        this.initializeEquipmentDatabase();
    }

    private initializeExpTable(): void {
        // 经验表：升级所需经验 = base * (level ^ 2.5)
        for (let i = 1; i <= 50; i++) {
            this.expTable[i] = Math.floor(100 * Math.pow(i, 2.5));
        }
    }

    private initializeEquipmentDatabase(): void {
        // 初始化装备数据库
        const equipments: PetEquipment[] = [
            // 项圈类
            {
                id: 'collar_basic',
                name: 'Basic Collar',
                nameZh: '基础项圈',
                slot: 'collar',
                rarity: 'common',
                effects: new Map([['damage', 5]]),
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
                id: 'collar_dragon',
                name: 'Dragon Collar',
                nameZh: '巨龙项圈',
                slot: 'collar',
                rarity: 'legendary',
                effects: new Map([['damage', 25], ['health', 20], ['speed', 10]]),
                setName: 'dragon_set',
            },
            // 饰品类
            {
                id: 'accessory_luck',
                name: 'Lucky Charm',
                nameZh: '幸运护符',
                slot: 'accessory',
                rarity: 'rare',
                effects: new Map([['gold', 15]]),
            },
            {
                id: 'accessory_fire',
                name: 'Fire Pendant',
                nameZh: '火焰吊坠',
                slot: 'accessory',
                rarity: 'epic',
                effects: new Map([['damage', 20], ['critChance', 5]]),
            },
            // 徽章类
            {
                id: 'badge_warrior',
                name: 'Warrior Badge',
                nameZh: '勇士徽章',
                slot: 'badge',
                rarity: 'rare',
                effects: new Map([['damage', 12]]),
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
        ];

        equipments.forEach(eq => {
            this.equipmentDatabase.set(eq.id, eq);
        });
    }

    // 生成宠物唯一 ID（使用宠物对象引用作为键）
    private getPetId(pet: Pet): string {
        // 使用 pet 对象本身作为弱键，避免 ID 变化
        if (!pet._petNurtureId) {
            pet._petNurtureId = `${pet.constructor.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return pet._petNurtureId;
    }

    // 注册宠物
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
                },
            });
            // 同步 petData 引用和基础属性到宠物实体
            const data = this.petDataMap.get(petId)!;
            pet.petData = data;
            pet.level = data.level;
            pet.experience = data.experience;
            pet.maxExperience = data.maxExperience;
        }
    }

    // 获取宠物数据
    public getPetData(pet: Pet): PetData | null {
        const petId = this.getPetId(pet);
        return this.petDataMap.get(petId) || null;
    }

    // 查找宠物数据（通过构造函数名）
    public getPetDataByName(petName: string): PetData | null {
        for (const [_, data] of this.petDataMap.entries()) {
            if (data.name === petName) {
                return data;
            }
        }
        return null;
    }

    // 获取所有宠物数据
    public getAllPetData(): PetData[] {
        return Array.from(this.petDataMap.values());
    }

    // 添加经验
    public addExperience(pet: Pet, amount: number): void {
        const petId = this.getPetId(pet);
        let data = this.petDataMap.get(petId);
        if (!data) {
            this.registerPet(pet);
            data = this.petDataMap.get(petId);
            if (!data) return;
        }

        data.experience += amount;
        
        // 同步经验值到宠物实体，让 UI 能正确显示
        pet.experience = data.experience;
        pet.maxExperience = data.maxExperience;
        pet.level = data.level;

        // 检查升级
        while (data.experience >= data.maxExperience && data.level < 50) {
            data.experience -= data.maxExperience;
            data.level++;
            data.maxExperience = this.expTable[data.level] || this.expTable[50];
            data.skillPoints += 1;
            
            // 升级属性提升
            data.stats.damageMultiplier += 0.05; // +5% 伤害
            data.stats.speedMultiplier += 0.03;  // +3% 速度
            data.stats.healthMultiplier += 0.04; // +4% 生命

            // 检查进化条件
            this.checkEvolutionCondition(data);
            
            // 同步等级和最大值到宠物实体
            pet.experience = data.experience;
            pet.maxExperience = data.maxExperience;
            pet.level = data.level;
        }

        // 同步 petData 引用到宠物实体
        pet.petData = data;
        
        // 更新宠物实际属性
        this.applyPetStats(pet, data);
    }

    // 检查进化条件
    private checkEvolutionCondition(data: PetData): void {
        const evolutionLevels = [15, 30]; // 进化等级要求
        if (data.evolutionStage < 2 && data.level >= evolutionLevels[data.evolutionStage]) {
            data.canEvolve = true;
        }
    }

    // 执行进化
    public evolvePet(pet: Pet): boolean {
        const petId = this.getPetId(pet);
        const data = this.petDataMap.get(petId);
        if (!data || !data.canEvolve) return false;

        data.evolutionStage++;
        data.canEvolve = false;

        // 进化大幅提升了属性
        data.stats.damageMultiplier *= 1.3;
        data.stats.speedMultiplier *= 1.2;
        data.stats.healthMultiplier *= 1.25;

        // 重置等级到 1（进化后重新成长）
        data.level = 1;
        data.experience = 0;
        data.maxExperience = this.expTable[1];

        // 同步到宠物实体
        pet.level = 1;
        pet.experience = 0;
        pet.maxExperience = this.expTable[1];

        // 同步 petData 引用到宠物实体
        pet.petData = data;

        this.applyPetStats(pet, data);
        return true;
    }

    // 增加亲密度
    public addIntimacy(pet: Pet, amount: number): void {
        const petId = this.getPetId(pet);
        const data = this.petDataMap.get(petId);
        if (!data) return;

        data.intimacy = Math.min(100, data.intimacy + amount);
        data.intimacyLevel = Math.floor(data.intimacy / 10) + 1;

        // 亲密度属性加成（最高 +20%）
        const intimacyBonus = data.intimacy / 500; // 100 亲密度 = 20% 加成
        data.stats.damageMultiplier += intimacyBonus;
        data.stats.speedMultiplier += intimacyBonus * 0.5;
        
        // 同步 petData 引用到宠物实体
        pet.petData = data;
        
        this.applyPetStats(pet, data);
    }

    // 装备物品
    public equipItem(pet: Pet, equipmentId: string): boolean {
        const petId = this.getPetId(pet);
        const data = this.petDataMap.get(petId);
        if (!data) return false;

        const equipment = this.equipmentDatabase.get(equipmentId);
        if (!equipment) return false;

        // 装备到对应槽位
        data.equipment[equipment.slot] = equipment;
        this.recalculateStats(data);
        
        // 同步 petData 引用到宠物实体
        pet.petData = data;
        
        this.applyPetStats(pet, data);

        return true;
    }

    // 卸下装备
    public unequipItem(pet: Pet, slot: 'collar' | 'accessory' | 'badge'): boolean {
        const petId = this.getPetId(pet);
        const data = this.petDataMap.get(petId);
        if (!data) return false;

        data.equipment[slot] = null;
        this.recalculateStats(data);
        
        // 同步 petData 引用到宠物实体
        pet.petData = data;
        
        this.applyPetStats(pet, data);

        return true;
    }

    // 重新计算属性（包括装备和套装效果）
    private recalculateStats(data: PetData): void {
        // 重置为基础值（根据等级和亲密度）
        const baseDamage = 1.0 + (data.level - 1) * 0.05;
        const baseSpeed = 1.0 + (data.level - 1) * 0.03;
        const baseHealth = 1.0 + (data.level - 1) * 0.04;
        const intimacyBonus = data.intimacy / 500;

        data.stats.damageMultiplier = baseDamage + intimacyBonus;
        data.stats.speedMultiplier = baseSpeed + intimacyBonus * 0.5;
        data.stats.healthMultiplier = baseHealth;

        // 应用装备属性
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
                }
            });
        });

        // 检查套装效果
        this.checkSetBonuses(data);
    }

    // 检查套装效果
    private checkSetBonuses(data: PetData): void {
        const setCounts: Map<string, number> = new Map();

        [data.equipment.collar, data.equipment.accessory, data.equipment.badge]
            .filter((item): item is PetEquipment => item !== null && item.setName !== undefined)
            .forEach(item => {
                const setName = item.setName!;
                setCounts.set(setName, (setCounts.get(setName) || 0) + 1);
            });

        // 2 件套效果
        setCounts.forEach((count, setName) => {
            if (count >= 2) {
                if (setName === 'dragon_set') {
                    data.stats.damageMultiplier += 0.15;
                } else if (setName === 'champion_set') {
                    data.stats.damageMultiplier += 0.10;
                    data.stats.speedMultiplier += 0.10;
                }
            }
        });
    }

    // 应用属性到宠物实体
    private applyPetStats(pet: Pet, data: PetData): void {
        pet.damageMultiplier = data.stats.damageMultiplier;
        // 速度和生命已在 Pet.update() 中通过 petData.stats 应用
    }

    // 获取装备数据库
    public getEquipmentDatabase(): Map<string, PetEquipment> {
        return this.equipmentDatabase;
    }

    // 获取中文宠物名
    private getPetChineseName(englishName: string): string {
        return getPetChineseName(englishName);
    }

    // 获取进化后的宠物类名
    public getEvolvedPetClassName(baseClassName: string, stage: number): string {
        const evolutionMap: Record<string, string[]> = {
            'GreedyDog': ['GreedyDog', 'TreasureHound', 'MidasWolf'],
            'MagicFairy': ['MagicFairy', 'ArcaneSpirit', 'CelestialBeing'],
            'SpeedyTurtle': ['SpeedyTurtle', 'SwiftShell', 'TempestTurtle'],
            'LuckyCat': ['LuckyCat', 'FortuneCat', 'GoldCat'],
        };

        const chain = evolutionMap[baseClassName];
        if (chain && stage < chain.length) {
            return chain[stage];
        }
        return baseClassName;
    }
}
