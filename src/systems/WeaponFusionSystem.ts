import { Game } from '../Game';
import { Weapon } from '../weapons/Weapon';
import { MagicWand } from '../weapons/MagicWand';
import { MissileWeapon } from '../weapons/MissileWeapon';
import { Shotgun } from '../weapons/Shotgun';
import { BubbleGun } from '../weapons/BubbleGun';
import { Boomerang } from '../weapons/Boomerang';
import { SplitterGun } from '../weapons/SplitterGun';

interface FusionRecipe {
    weapon1: string;
    weapon2: string;
    result: string;
    resultName: string;
    bonusDamage: number;
    bonusFireRate: number;
}

export class WeaponFusionSystem {
    private game: Game;
    private fusionRecipes: FusionRecipe[] = [];
    private fusionCount: number = 0;

    constructor(game: Game) {
        this.game = game;
        this.initRecipes();
    }

    private initRecipes(): void {
        // 融合配方
        this.fusionRecipes = [
            { weapon1: 'Magic Wand', weapon2: 'Laser', result: 'Prism Cannon', resultName: '棱镜炮', bonusDamage: 1.8, bonusFireRate: 0.7 },
            { weapon1: 'Shotgun', weapon2: 'Missile Launcher', result: 'Cluster Bomb', resultName: '集束炸弹', bonusDamage: 2.0, bonusFireRate: 0.5 },
            { weapon1: 'Bubble Gun', weapon2: 'Freeze Gun', result: 'Cryo Bubble', resultName: '冰霜泡泡', bonusDamage: 1.5, bonusFireRate: 0.8 },
            { weapon1: 'Boomerang', weapon2: 'Orbit Shield', result: 'Vortex Disc', resultName: '旋涡圆盘', bonusDamage: 1.7, bonusFireRate: 0.6 },
            { weapon1: 'Poison Gun', weapon2: 'Splitter Gun', result: 'Plague Splitter', resultName: '瘟疫分裂者', bonusDamage: 1.6, bonusFireRate: 0.75 },
            { weapon1: 'Magic Wand', weapon2: 'Shotgun', result: 'Scatter Wand', resultName: '散射法杖', bonusDamage: 1.5, bonusFireRate: 0.85 },
            { weapon1: 'Laser', weapon2: 'Freeze Gun', result: 'Cryo Beam', resultName: '冰霜射线', bonusDamage: 1.6, bonusFireRate: 0.8 },
            { weapon1: 'Missile Launcher', weapon2: 'Bubble Gun', result: 'Bubble Rocket', resultName: '泡泡火箭', bonusDamage: 1.8, bonusFireRate: 0.65 },
        ];
    }

    public canFuse(weapon1: Weapon, weapon2: Weapon): boolean {
        return this.getFusionRecipe(weapon1.name, weapon2.name) !== null;
    }

    public getFusionRecipe(name1: string, name2: string): FusionRecipe | null {
        for (const recipe of this.fusionRecipes) {
            if ((recipe.weapon1 === name1 && recipe.weapon2 === name2) ||
                (recipe.weapon1 === name2 && recipe.weapon2 === name1)) {
                return recipe;
            }
        }
        return null;
    }

    public fuseWeapons(weapon1: Weapon, weapon2: Weapon): Weapon | null {
        const recipe = this.getFusionRecipe(weapon1.name, weapon2.name);
        if (!recipe) return null;

        // 创建融合武器（使用第一个武器类型但大幅增强）
        let fusedWeapon: Weapon;
        const baseDamage = Math.max(weapon1.damage, weapon2.damage) * recipe.bonusDamage;
        const baseFireRate = Math.min(weapon1.fireRate, weapon2.fireRate) * recipe.bonusFireRate;

        // 根据结果类型创建武器
        if (recipe.result.includes('Wand') || recipe.result.includes('Cannon') || recipe.result.includes('Beam')) {
            fusedWeapon = new MagicWand(this.game, this.game.player);
        } else if (recipe.result.includes('Bomb') || recipe.result.includes('Rocket')) {
            fusedWeapon = new MissileWeapon(this.game, this.game.player);
        } else if (recipe.result.includes('Bubble') || recipe.result.includes('Cryo')) {
            fusedWeapon = new BubbleGun(this.game, this.game.player);
        } else if (recipe.result.includes('Shotgun') || recipe.result.includes('Scatter')) {
            fusedWeapon = new Shotgun(this.game, this.game.player);
        } else if (recipe.result.includes('Disc') || recipe.result.includes('Vortex')) {
            fusedWeapon = new Boomerang(this.game, this.game.player);
        } else if (recipe.result.includes('Plague') || recipe.result.includes('Splitter')) {
            fusedWeapon = new SplitterGun(this.game, this.game.player);
        } else {
            fusedWeapon = new MagicWand(this.game, this.game.player);
        }

        // 应用融合属性
        fusedWeapon.damage = baseDamage;
        fusedWeapon.fireRate = baseFireRate;
        (fusedWeapon as any).name = recipe.result;
        (fusedWeapon as any).fusedName = recipe.resultName;
        (fusedWeapon as any).isFused = true;
        (fusedWeapon as any).fusionLevel = ++this.fusionCount;

        return fusedWeapon;
    }

    public getAvailableFusions(): Array<{ w1: Weapon, w2: Weapon, recipe: FusionRecipe }> {
        const available: Array<{ w1: Weapon, w2: Weapon, recipe: FusionRecipe }> = [];
        const weapons = this.game.player.weapons;

        for (let i = 0; i < weapons.length; i++) {
            for (let j = i + 1; j < weapons.length; j++) {
                const recipe = this.getFusionRecipe(weapons[i].name, weapons[j].name);
                if (recipe && !(weapons[i] as any).isFused && !(weapons[j] as any).isFused) {
                    available.push({ w1: weapons[i], w2: weapons[j], recipe });
                }
            }
        }

        return available;
    }

    public getFusionCount(): number {
        return this.fusionCount;
    }
}