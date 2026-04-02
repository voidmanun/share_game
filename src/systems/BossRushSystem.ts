import { Game } from '../Game';
import { Boss } from '../entities/Boss';
import { FusionBoss } from '../entities/FusionBoss';
import { TitanEnemy } from '../entities/TitanEnemy';
import { FloatingText } from '../entities/FloatingText';
import { Particle } from '../entities/Particle';

export class BossRushSystem {
    private game: Game;
    private isActive: boolean = false;
    private currentWave: number = 0;
    private maxWaves: number = 10;
    private waveTimer: number = 0;
    private delayBetweenWaves: number = 3.0;
    private isWaiting: boolean = false;
    private totalRewards: number = 0;

    constructor(game: Game) {
        this.game = game;
    }

    public start(): void {
        this.isActive = true;
        this.currentWave = 0;
        this.totalRewards = 0;
        this.spawnNextBoss();
    }

    public stop(): void {
        this.isActive = false;
    }

    public toggle(): void {
        if (this.isActive) {
            this.stop();
        } else {
            this.start();
        }
    }

    private spawnNextBoss(): void {
        if (this.currentWave >= this.maxWaves) {
            this.completeRush();
            return;
        }

        this.currentWave++;
        this.isWaiting = false;

        // 根据波数选择Boss类型
        const boss = this.createBossForWave(this.currentWave);
        if (boss) {
            this.game.addEnemy(boss);
            this.game.floatingTexts.push(new FloatingText(
                boss.x,
                boss.y - 50,
                `Boss Rush - 波次 ${this.currentWave}/${this.maxWaves}`,
                '#FF4500',
                'level'
            ));
        }
    }

    private createBossForWave(wave: number): Boss | FusionBoss | TitanEnemy | null {
        const x = this.game.player.x + (Math.random() - 0.5) * 600;
        const y = this.game.player.y + (Math.random() - 0.5) * 600;
        
        // 确保Boss不会生成在玩家太近的位置
        const dx = x - this.game.player.x;
        const dy = y - this.game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const spawnX = dist < 300 ? this.game.player.x + (Math.random() > 0.5 ? 350 : -350) : x;
        const spawnY = dist < 300 ? this.game.player.y + (Math.random() > 0.5 ? 350 : -350) : y;

        // 波数越高，Boss越强
        const hpMultiplier = 1 + (wave - 1) * 0.3;
        const damageMultiplier = 1 + (wave - 1) * 0.1;

        let boss: Boss | FusionBoss | TitanEnemy;
        
        // 后期波次使用更强的Boss
        if (wave >= 8) {
            boss = new TitanEnemy(spawnX, spawnY, this.game.player);
        } else if (wave >= 5) {
            boss = new FusionBoss(spawnX, spawnY, this.game.player);
        } else {
            boss = new Boss(spawnX, spawnY, this.game.player);
        }

        // 增强Boss属性
        boss.hp *= hpMultiplier;
        (boss as any).damage = ((boss as any).damage || 1) * damageMultiplier;

        return boss;
    }

    public update(deltaTime: number): void {
        if (!this.isActive) return;

        // 检查当前Boss是否已死亡
        const hasBoss = this.game.getEnemies().some(e => 
            e instanceof Boss || e instanceof FusionBoss || e instanceof TitanEnemy
        );

        if (!hasBoss && !this.isWaiting) {
            // Boss被击败
            this.onBossDefeated();
        }

        // 等待下一波
        if (this.isWaiting) {
            this.waveTimer -= deltaTime;
            if (this.waveTimer <= 0) {
                this.spawnNextBoss();
            }
        }
    }

    private onBossDefeated(): void {
        const reward = 50 + this.currentWave * 20;
        this.totalRewards += reward;
        this.game.gold += reward;

        // 给予经验
        this.game.playerLevelSystem.addExperience(30 + this.currentWave * 10);

        // 显示奖励
        this.game.floatingTexts.push(new FloatingText(
            this.game.player.x,
            this.game.player.y - 60,
            `+${reward}金币 | 波次完成!`,
            '#FFD700'
        ));

        // 粒子效果
        for (let i = 0; i < 20; i++) {
            this.game.particles.push(new Particle(
                this.game.player.x + (Math.random() - 0.5) * 100,
                this.game.player.y + (Math.random() - 0.5) * 100,
                '#FFD700'
            ));
        }

        // 开始等待下一波
        this.isWaiting = true;
        this.waveTimer = this.delayBetweenWaves;
    }

    private completeRush(): void {
        this.isActive = false;

        // 额外完成奖励
        const bonusReward = this.totalRewards * 0.5;
        this.game.gold += bonusReward;

        this.game.floatingTexts.push(new FloatingText(
            this.game.player.x,
            this.game.player.y - 80,
            `Boss Rush 完成! 总奖励: ${this.totalRewards} + ${bonusReward}金币`,
            '#FFD700',
            'level'
        ));

        // 大量粒子
        for (let i = 0; i < 50; i++) {
            this.game.particles.push(new Particle(
                this.game.player.x + (Math.random() - 0.5) * 200,
                this.game.player.y + (Math.random() - 0.5) * 200,
                '#FFD700'
            ));
        }
    }

    public isActiveRush(): boolean {
        return this.isActive;
    }

    public getCurrentWave(): number {
        return this.currentWave;
    }

    public getMaxWaves(): number {
        return this.maxWaves;
    }

    public getProgress(): number {
        return this.currentWave / this.maxWaves;
    }

    public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
        if (!this.isActive) return;

        ctx.save();

        // Boss Rush 进度条
        const barWidth = 200;
        const barHeight = 20;
        const barX = (canvasWidth - barWidth) / 2;
        const barY = 10;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10);

        // 进度条
        const progress = this.currentWave / this.maxWaves;
        const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth * progress, 0);
        gradient.addColorStop(0, '#FF4500');
        gradient.addColorStop(1, '#FFD700');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // 边框
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // 文字
        ctx.font = 'bold 14px "Fredoka One", cursive';
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.fillText(
            `Boss Rush: ${this.currentWave}/${this.maxWaves}`,
            barX + barWidth / 2,
            barY + 15
        );

        // 等待提示
        if (this.isWaiting) {
            ctx.font = 'bold 24px "Fredoka One", cursive';
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';
            ctx.fillText(
                `下一波: ${Math.ceil(this.waveTimer)}秒`,
                canvasWidth / 2,
                canvasHeight / 2 - 100
            );
        }

        ctx.restore();
    }
}