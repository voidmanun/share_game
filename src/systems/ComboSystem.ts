import { Game } from '../Game';
import { FloatingText } from '../entities/FloatingText';
import { Particle } from '../entities/Particle';

export class ComboSystem {
    private game: Game;
    private comboCount: number = 0;
    private comboTimer: number = 0;
    private readonly COMBO_TIMEOUT: number = 3.0; // 3秒内不击杀则连击重置
    private lastComboMilestone: number = 0; // 上一次触发的连击里程碑
    
    // 连击里程碑奖励配置
    private readonly MILESTONES = [
        { count: 5, damageBonus: 0.1, goldBonus: 0.1, name: '小连击' },
        { count: 10, damageBonus: 0.2, goldBonus: 0.2, name: '连击达人' },
        { count: 25, damageBonus: 0.3, goldBonus: 0.3, name: '连击大师' },
        { count: 50, damageBonus: 0.5, goldBonus: 0.5, name: '连击之王' },
        { count: 100, damageBonus: 1.0, goldBonus: 1.0, name: '连击之神' }
    ];

    constructor(game: Game) {
        this.game = game;
    }

    public update(deltaTime: number): void {
        if (this.comboCount > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.resetCombo();
            }
        }
    }

    public onEnemyKill(): void {
        this.comboCount++;
        this.comboTimer = this.COMBO_TIMEOUT;
        
        // 检查是否达到里程碑
        for (const milestone of this.MILESTONES) {
            if (this.comboCount >= milestone.count && this.lastComboMilestone < milestone.count) {
                this.triggerMilestone(milestone);
                this.lastComboMilestone = milestone.count;
                break;
            }
        }
    }

    private triggerMilestone(milestone: { count: number, damageBonus: number, goldBonus: number, name: string }): void {
        const player = this.game.player;
        
        // 触发粒子特效
        for (let i = 0; i < 20; i++) {
            this.game.particles.push(new Particle(player.x, player.y, '#FFD700'));
        }
        
        // 显示连击里程碑文字
        this.game.floatingTexts.push(new FloatingText(
            player.x,
            player.y - 60,
            `${milestone.name}! ${milestone.count}连击`,
            '#FFD700'
        ));
        
        // 播放声音
        this.game.soundManager.playPickupSound();
    }

    private resetCombo(): void {
        if (this.comboCount >= 5) {
            // 显示连击结束提示
            this.game.floatingTexts.push(new FloatingText(
                this.game.player.x,
                this.game.player.y - 30,
                `连击结束: ${this.comboCount}`,
                '#FF6B6B'
            ));
        }
        this.comboCount = 0;
        this.lastComboMilestone = 0;
    }

    public getComboCount(): number {
        return this.comboCount;
    }

    public getDamageBonus(): number {
        let bonus = 0;
        for (const milestone of this.MILESTONES) {
            if (this.comboCount >= milestone.count) {
                bonus = milestone.damageBonus;
            }
        }
        return bonus;
    }

    public getGoldBonus(): number {
        let bonus = 0;
        for (const milestone of this.MILESTONES) {
            if (this.comboCount >= milestone.count) {
                bonus = milestone.goldBonus;
            }
        }
        return bonus;
    }

    public getComboTimerPercent(): number {
        if (this.comboCount === 0) return 0;
        return this.comboTimer / this.COMBO_TIMEOUT;
    }

    public render(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
        if (this.comboCount <= 0) return;

        ctx.save();
        
        // 连击显示位置 - 屏幕中上方
        const comboX = canvasWidth / 2;
        const comboY = 120;
        
        // 连击背景条
        const barWidth = 150;
        const barHeight = 8;
        const timerPercent = this.getComboTimerPercent();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(comboX - barWidth / 2, comboY - 10, barWidth, barHeight);
        
        // 计时器进度条
        const timerColor = timerPercent > 0.5 ? '#00FF00' : timerPercent > 0.25 ? '#FFFF00' : '#FF0000';
        ctx.fillStyle = timerColor;
        ctx.fillRect(comboX - barWidth / 2, comboY - 10, barWidth * timerPercent, barHeight);
        
        // 连击数字
        ctx.font = 'bold 36px "Fredoka One", cursive';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        
        // 根据连击数改变颜色
        let comboColor = '#FFFFFF';
        if (this.comboCount >= 100) comboColor = '#FF00FF';
        else if (this.comboCount >= 50) comboColor = '#FFD700';
        else if (this.comboCount >= 25) comboColor = '#FF4500';
        else if (this.comboCount >= 10) comboColor = '#FF6B6B';
        else if (this.comboCount >= 5) comboColor = '#00FFFF';
        
        ctx.fillStyle = comboColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = comboColor;
        
        // 绘制连击文字
        ctx.strokeText(`连击`, comboX, comboY + 30);
        ctx.fillText(`连击`, comboX, comboY + 30);
        
        ctx.font = 'bold 48px "Fredoka One", cursive';
        ctx.strokeText(`${this.comboCount}`, comboX, comboY + 70);
        ctx.fillText(`${this.comboCount}`, comboX, comboY + 70);
        
        // 显示当前奖励
        const damageBonus = this.getDamageBonus();
        const goldBonus = this.getGoldBonus();
        if (damageBonus > 0 || goldBonus > 0) {
            ctx.font = '16px "Fredoka One", cursive';
            ctx.fillStyle = '#FFD700';
            ctx.shadowBlur = 0;
            ctx.fillText(`伤害+${(damageBonus * 100).toFixed(0)}% 金币+${(goldBonus * 100).toFixed(0)}%`, comboX, comboY + 95);
        }
        
        ctx.restore();
    }
}