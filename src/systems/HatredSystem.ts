import { Game } from '../Game';

export class HatredSystem {
    private hatredPoints: number = 0;
    private readonly HATRED_THRESHOLD: number = 50; // 每50点提升一个仇恨等级
    private maxHatredLevel: number = 10;
    
    constructor(_game: Game) {
        // game参数保留用于未来扩展
    }

    // 添加仇恨值
    public addHatred(points: number): void {
        this.hatredPoints += points;
    }

    // 获取当前仇恨等级
    public getHatredLevel(): number {
        return Math.min(this.maxHatredLevel, Math.floor(this.hatredPoints / this.HATRED_THRESHOLD));
    }

    // 获取仇恨加成系数
    public getHatredMultiplier(): number {
        return 1 + this.getHatredLevel() * 0.1; // 每级增加10%
    }

    // 获取仇恨点数
    public getHatredPoints(): number {
        return this.hatredPoints;
    }

    // 获取下一级所需点数
    public getNextLevelProgress(): number {
        const currentLevel = this.getHatredLevel();
        const currentThreshold = currentLevel * this.HATRED_THRESHOLD;
        return (this.hatredPoints - currentThreshold) / this.HATRED_THRESHOLD;
    }

    // 重置仇恨
    public reset(): void {
        this.hatredPoints = 0;
    }

    // 事件触发
    public onEnemyKill(isBoss: boolean = false): void {
        this.hatredPoints += isBoss ? 15 : 2;
    }

    public onDamageDealt(damage: number): void {
        this.hatredPoints += Math.floor(damage / 10);
    }

    public onSkillUsed(): void {
        this.hatredPoints += 5;
    }

    public onGoldEarned(amount: number): void {
        this.hatredPoints += Math.floor(amount / 20);
    }

    public onComboAchieved(combo: number): void {
        if (combo >= 50) this.hatredPoints += 10;
        else if (combo >= 25) this.hatredPoints += 5;
        else if (combo >= 10) this.hatredPoints += 2;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        const level = this.getHatredLevel();
        if (level === 0) return;

        ctx.save();

        // 仇恨等级显示
        const barX = 20;
        const barY = 210;
        const barWidth = 120;
        const barHeight = 10;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 进度条
        const progress = this.getNextLevelProgress();
        const hatredColor = level >= 8 ? '#FF0000' : level >= 5 ? '#FF4500' : '#FFD700';
        ctx.fillStyle = hatredColor;
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // 边框
        ctx.strokeStyle = hatredColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // 文字
        ctx.font = 'bold 14px "Fredoka One", cursive';
        ctx.fillStyle = hatredColor;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        
        const levelText = `⚠️ 仇恨 Lv.${level}`;
        ctx.strokeText(levelText, barX, barY - 5);
        ctx.fillText(levelText, barX, barY - 5);

        // 高仇恨警告
        if (level >= 5) {
            ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
            ctx.fillStyle = level >= 8 ? '#FF0000' : '#FF4500';
            ctx.font = 'bold 16px "Fredoka One", cursive';
            ctx.textAlign = 'center';
            ctx.fillText(
                level >= 8 ? '⚠️ 极度危险 ⚠️' : '⚠️ 敌人变强了',
                ctx.canvas.width / 2,
                50
            );
        }

        ctx.restore();
    }
}