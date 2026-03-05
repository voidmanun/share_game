import { Entity } from './Entity';
import { Game } from '../Game';

export type ChestRewardType = 
    | 'health'      // 恢复生命值
    | 'speed'       // 移动速度提升
    | 'damage'      // 武器伤害提升
    | 'attackSpeed' // 攻击速度提升
    | 'maxHp'       // 最大生命值提升
    | 'gold'        // 金币奖励
    | 'shield';     // 临时护盾

export class Chest extends Entity {
    private rewardType: ChestRewardType;
    private rewardValue: number;
    private game: Game;
    private isSelected: boolean = false;
    private hoverTimer: number = 0;

    constructor(x: number, y: number, game: Game, rewardType: ChestRewardType, rewardValue: number) {
        super(x, y, 25, '#FFD700');
        this.game = game;
        this.rewardType = rewardType;
        this.rewardValue = rewardValue;
    }

    public update(deltaTime: number): void {
        this.hoverTimer += deltaTime;
    }

    public select(): void {
        this.isSelected = true;
        this.applyReward();
    }

    private applyReward(): void {
        const player = this.game.player;
        
        switch (this.rewardType) {
            case 'health':
                const healed = player.heal(this.rewardValue);
                this.game.floatingTexts.push(
                    new (this.game as any).FloatingText(player.x, player.y - 20, `+${healed} HP`, '#00FF00')
                );
                break;
            case 'speed':
                (player as any).speed *= (1 + this.rewardValue);
                this.game.floatingTexts.push(
                    new (this.game as any).FloatingText(player.x, player.y - 40, `速度 +${(this.rewardValue * 100).toFixed(0)}%`, '#00FFFF')
                );
                break;
            case 'damage':
                player.weapons.forEach(w => {
                    w.damage *= (1 + this.rewardValue);
                });
                this.game.floatingTexts.push(
                    new (this.game as any).FloatingText(player.x, player.y - 40, `伤害 +${(this.rewardValue * 100).toFixed(0)}%`, '#FF4444')
                );
                break;
            case 'attackSpeed':
                (player as any).attackSpeedMultiplier *= (1 + this.rewardValue);
                this.game.floatingTexts.push(
                    new (this.game as any).FloatingText(player.x, player.y - 40, `攻速 +${(this.rewardValue * 100).toFixed(0)}%`, '#FFFF00')
                );
                break;
            case 'maxHp':
                (player as any).maxHp += this.rewardValue;
                (player as any).hp += this.rewardValue;
                this.game.floatingTexts.push(
                    new (this.game as any).FloatingText(player.x, player.y - 40, `最大生命 +${this.rewardValue}`, '#FF69B4')
                );
                break;
            case 'gold':
                (this.game as any).gold += this.rewardValue;
                this.game.floatingTexts.push(
                    new (this.game as any).FloatingText(player.x, player.y - 40, `+${this.rewardValue} 金币`, '#FFD700')
                );
                break;
            case 'shield':
                (player as any).becomeInvincible(this.rewardValue);
                this.game.floatingTexts.push(
                    new (this.game as any).FloatingText(player.x, player.y - 40, `护盾 ${this.rewardValue}秒`, '#8A2BE2')
                );
                break;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Hover animation
        const hoverOffset = Math.sin(this.hoverTimer * 3) * 3;
        ctx.translate(0, hoverOffset);
        
        // Glow effect
        ctx.shadowBlur = this.isSelected ? 0 : 15;
        ctx.shadowColor = this.isSelected ? '#FFFFFF' : '#FFD700';
        
        // Chest body
        ctx.fillStyle = this.isSelected ? '#666666' : this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        
        // Draw chest shape (rectangle with rounded corners)
        const w = 40;
        const h = 30;
        ctx.beginPath();
        ctx.roundRect(-w/2, -h/2, w, h, 5);
        ctx.fill();
        ctx.stroke();
        
        // Chest lid
        ctx.fillStyle = this.isSelected ? '#444444' : '#FFA500';
        ctx.beginPath();
        ctx.roundRect(-w/2, -h/2, w, h/3, 5);
        ctx.fill();
        ctx.stroke();
        
        // Lock symbol
        if (!this.isSelected) {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        
        ctx.restore();
    }
}
