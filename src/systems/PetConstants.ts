// Shared Pet Constants
// 宠物系统共享常量：中文名称映射

export const PET_CHINESE_NAMES: Record<string, string> = {
    'GreedyDog': '贪财狗',
    'MagicFairy': '魔法精灵',
    'SpeedyTurtle': '极速龟',
    'GrumpyPorcupine': '暴躁豪猪',
    'BouncySlime': '弹跳史莱姆',
    'LuckyCat': '幸运猫',
    'HolyLightTurtle': '圣光龟',
    'KnightPet': '骑士宠物',
};

export function getPetChineseName(englishName: string): string {
    return PET_CHINESE_NAMES[englishName] || englishName;
}