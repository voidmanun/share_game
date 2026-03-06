import { Entity } from './Entity';
import { Player } from './Player';
import { Game } from '../Game';
import type { PetData } from '../systems/PetNurtureSystem';
import { PetProjectile } from './PetProjectile';

export abstract class Pet extends Entity {
    protected player: Player;
    protected game: Game;
    protected speed: number;
    protected hoverAngle: number = 0;
    protected hoverDistance: number;
    public isTemporary: boolean = false;
    public lifeTimer: number = 0;
    public damageMultiplier: number = 1.0;
    public isDead: boolean = false;
    
    // 养成系统属性
    public level: number = 1;
    public experience: number = 0;
    public maxExperience: number = 100;
    public intimacy: number = 0;
    public intimacyLevel: number = 1;
    public evolutionStage: number = 0;
    public canEvolve: boolean = false;
    public skillPoints: number = 0;
    public petData: PetData | null = null;
    
    // 攻击系统属性
    protected attackCooldown: number = 0;
    protected attackInterval: number = 2; // 默认2秒攻击一次
    protected attackDamage: number = 5;
    protected attackRange: number = 200;
    protected projectileColor: string = '#FFD700';
    
    // 技能系统
    protected skillCooldown: number = 0;
    protected skillMaxCooldown: number = 30; // 主动技能30秒冷却
    protected hasSkill: boolean = false;

    constructor(player: Player, game: Game, hoverDistance: number, speed: number, radius: number, color: string) {
        super(player.x, player.y, radius, color);
        this.player = player;
        this.game = game;
        this.hoverDistance = hoverDistance;
        this.speed = speed;
        this.hoverAngle = Math.random() * Math.PI * 2;
    }

    public abstract act(deltaTime: number): void;

    public update(deltaTime: number): void {
        super.update(deltaTime);

        this.hoverAngle += deltaTime;

        const targetX = this.player.x + Math.cos(this.hoverAngle) * this.hoverDistance;
        const targetY = this.player.y + Math.sin(this.hoverAngle) * this.hoverDistance;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 应用速度加成
        const speedWithBonus = this.speed * (this.petData?.stats.speedMultiplier || 1.0);

        if (dist > 5) {
            this.x += (dx / dist) * speedWithBonus * deltaTime;
            this.y += (dy / dist) * speedWithBonus * deltaTime;
        }

        if (this.isTemporary) {
            this.lifeTimer -= deltaTime;
            if (this.lifeTimer <= 0) {
                this.isDead = true;
            }
        }

        this.act(deltaTime);
    }

    // 获取经验值
    public addExperience(amount: number): void {
        const nurtureSystem = this.game.petNurtureSystem;
        if (nurtureSystem) {
            // 先注册宠物
            nurtureSystem.registerPet(this);
            nurtureSystem.addExperience(this, amount);
        } else {
            // 简化版本（无系统时）
            this.experience += amount;
            while (this.experience >= this.maxExperience && this.level < 50) {
                this.experience -= this.maxExperience;
                this.level++;
                this.maxExperience = Math.floor(100 * Math.pow(this.level, 2.5));
                this.skillPoints++;
                this.damageMultiplier += 0.05;
                this.speed *= 1.03;
                if (this.level === 15 || this.level === 30) {
                    this.canEvolve = true;
                }
            }
        }
    }

    // 增加亲密度
    public addIntimacy(amount: number): void {
        const nurtureSystem = this.game.petNurtureSystem;
        if (nurtureSystem) {
            nurtureSystem.registerPet(this);
            nurtureSystem.addIntimacy(this, amount);
        } else {
            this.intimacy = Math.min(100, this.intimacy + amount);
            this.intimacyLevel = Math.floor(this.intimacy / 10) + 1;
        }
    }

    // 执行进化
    public evolve(): boolean {
        if (!this.canEvolve) return false;
        
        const nurtureSystem = this.game.petNurtureSystem;
        if (nurtureSystem) {
            const success = nurtureSystem.evolvePet(this);
            if (success) {
                this.evolutionStage++;
                this.canEvolve = false;
                this.level = 1;
                this.experience = 0;
                return true;
            }
        }
        return false;
    }

    // 宠物自动攻击最近的敌人
    protected performAttack(targetX: number, targetY: number): void {
        if (this.attackCooldown > 0) return;
        
        const projectile = new PetProjectile(
            this.x, 
            this.y, 
            targetX, 
            targetY, 
            this.attackDamage * this.damageMultiplier, 
            this.constructor.name,
            this.game,
            this.projectileColor
        );
        
        this.game.addPetProjectile(projectile);
        this.attackCooldown = this.attackInterval;
    }

    // 查找最近的敌人
    protected findNearestEnemy(): { x: number; y: number; dist: number } | null {
        const enemies = this.game.getEnemies();
        let nearest: { x: number; y: number; dist: number } | null = null;
        let minDist = this.attackRange * this.attackRange;

        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distSquared = dx * dx + dy * dy;

            if (distSquared < minDist) {
                minDist = distSquared;
                nearest = { x: enemy.x, y: enemy.y, dist: Math.sqrt(distSquared) };
            }
        }

        return nearest;
    }

    // 更新攻击冷却
    protected updateAttackCooldown(deltaTime: number): void {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
    }

    // 技能冷却更新
    protected updateSkillCooldown(deltaTime: number): void {
        if (this.skillCooldown > 0) {
            this.skillCooldown -= deltaTime;
        }
    }

    // 释放主动技能（子类可重写）
    public useSkill(): boolean {
        if (this.skillCooldown > 0 || !this.hasSkill) return false;
        
        this.skillCooldown = this.skillMaxCooldown;
        return true;
    }

    // 获取技能冷却百分比
    public getSkillCooldownPercent(): number {
        if (!this.hasSkill) return 0;
        return Math.max(0, this.skillCooldown / this.skillMaxCooldown);
    }

    // 渲染等级和亲密度 UI（由子类调用）
    public renderLevelInfo(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        
        // 等级显示
        ctx.strokeText(`Lv.${this.level}`, this.x, this.y - this.radius - 5);
        ctx.fillText(`Lv.${this.level}`, this.x, this.y - this.radius - 5);
        
        // 亲密度心形
        if (this.intimacy > 0) {
            const hearts = Math.ceil(this.intimacy / 20);
            ctx.fillStyle = '#FF69B4';
            for (let i = 0; i < hearts; i++) {
                ctx.fillText('♥', this.x - 15 + i * 8, this.y - this.radius - 15);
            }
        }
        
        // 进化提示
        if (this.canEvolve) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 12px Arial';
            ctx.strokeText('进化!', this.x, this.y - this.radius - 25);
            ctx.fillText('进化!', this.x, this.y - this.radius - 25);
        }
        
        ctx.restore();
    }
}
