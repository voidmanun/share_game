import { Entity } from './Entity';
import { Player } from './Player';
import { Game } from '../Game';
import type { PetData } from '../systems/PetNurtureSystem';

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
