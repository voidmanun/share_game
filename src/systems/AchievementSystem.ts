import { Game } from '../Game';
import { FloatingText } from '../entities/FloatingText';

export interface Achievement {
    id: string;
    name: string;
    nameZh: string;
    description: string;
    icon: string;
    condition: (stats: AchievementStats) => boolean;
    reward: { gold?: number; exp?: number; heal?: number };
    unlocked: boolean;
}

export interface AchievementStats {
    totalKills: number;
    maxCombo: number;
    survivalTime: number;
    goldEarned: number;
    bossesKilled: number;
    elitesKilled: number;
    petsOwned: number;
    damageDealt: number;
    revivesUsed: number;
}

export class AchievementSystem {
    private game: Game;
    private achievements: Achievement[] = [];
    private stats: AchievementStats = {
        totalKills: 0,
        maxCombo: 0,
        survivalTime: 0,
        goldEarned: 0,
        bossesKilled: 0,
        elitesKilled: 0,
        petsOwned: 0,
        damageDealt: 0,
        revivesUsed: 0
    };
    private notificationQueue: Achievement[] = [];
    private notificationTimer: number = 0;
    private currentNotification: Achievement | null = null;

    constructor(game: Game) {
        this.game = game;
        this.initAchievements();
    }

    private initAchievements(): void {
        this.achievements = [
            {
                id: 'first_blood',
                name: 'First Blood',
                nameZh: '初战告捷',
                description: '击杀第一个敌人',
                icon: '🩸',
                condition: (s) => s.totalKills >= 1,
                reward: { gold: 10, exp: 10 },
                unlocked: false
            },
            {
                id: 'killer_10',
                name: 'Killer',
                nameZh: '猎杀者',
                description: '击杀10个敌人',
                icon: '⚔️',
                condition: (s) => s.totalKills >= 10,
                reward: { gold: 30, exp: 30 },
                unlocked: false
            },
            {
                id: 'killer_50',
                name: 'Slayer',
                nameZh: '屠戮者',
                description: '击杀50个敌人',
                icon: '🗡️',
                condition: (s) => s.totalKills >= 50,
                reward: { gold: 100, exp: 50 },
                unlocked: false
            },
            {
                id: 'killer_100',
                name: 'Destroyer',
                nameZh: '毁灭者',
                description: '击杀100个敌人',
                icon: '💀',
                condition: (s) => s.totalKills >= 100,
                reward: { gold: 200, exp: 100 },
                unlocked: false
            },
            {
                id: 'combo_10',
                name: 'Combo Starter',
                nameZh: '连击新手',
                description: '达成10连击',
                icon: '🔥',
                condition: (s) => s.maxCombo >= 10,
                reward: { gold: 50 },
                unlocked: false
            },
            {
                id: 'combo_50',
                name: 'Combo Master',
                nameZh: '连击大师',
                description: '达成50连击',
                icon: '💫',
                condition: (s) => s.maxCombo >= 50,
                reward: { gold: 150, exp: 80 },
                unlocked: false
            },
            {
                id: 'survivor_60',
                name: 'Survivor',
                nameZh: '幸存者',
                description: '存活1分钟',
                icon: '⏱️',
                condition: (s) => s.survivalTime >= 60,
                reward: { gold: 20 },
                unlocked: false
            },
            {
                id: 'survivor_300',
                name: 'Endurance',
                nameZh: '坚韧不拔',
                description: '存活5分钟',
                icon: '🏃',
                condition: (s) => s.survivalTime >= 300,
                reward: { gold: 100, heal: 20 },
                unlocked: false
            },
            {
                id: 'boss_slayer',
                name: 'Boss Slayer',
                nameZh: 'Boss终结者',
                description: '击杀一个Boss',
                icon: '👑',
                condition: (s) => s.bossesKilled >= 1,
                reward: { gold: 100, exp: 100 },
                unlocked: false
            },
            {
                id: 'elite_hunter',
                name: 'Elite Hunter',
                nameZh: '精英猎人',
                description: '击杀5个精英怪',
                icon: '🎯',
                condition: (s) => s.elitesKilled >= 5,
                reward: { gold: 150 },
                unlocked: false
            },
            {
                id: 'gold_500',
                name: 'Wealthy',
                nameZh: '小富翁',
                description: '累计获得500金币',
                icon: '💰',
                condition: (s) => s.goldEarned >= 500,
                reward: { exp: 50 },
                unlocked: false
            },
            {
                id: 'pet_master',
                name: 'Pet Master',
                nameZh: '宠物大师',
                description: '同时拥有3只宠物',
                icon: '🐾',
                condition: (s) => s.petsOwned >= 3,
                reward: { gold: 50 },
                unlocked: false
            },
            {
                id: 'phoenix',
                name: 'Phoenix',
                nameZh: '不死鸟',
                description: '使用复活功能3次',
                icon: '🔥',
                condition: (s) => s.revivesUsed >= 3,
                reward: { gold: 100, heal: 30 },
                unlocked: false
            }
        ];
    }

    public update(deltaTime: number): void {
        // 更新生存时间
        this.stats.survivalTime += deltaTime;

        // 更新宠物数量
        this.stats.petsOwned = this.game.pets.length;

        // 检查成就
        this.checkAchievements();

        // 处理通知队列
        if (this.currentNotification) {
            this.notificationTimer -= deltaTime;
            if (this.notificationTimer <= 0) {
                this.currentNotification = null;
            }
        } else if (this.notificationQueue.length > 0) {
            this.currentNotification = this.notificationQueue.shift()!;
            this.notificationTimer = 3.0;
        }
    }

    private checkAchievements(): void {
        for (const achievement of this.achievements) {
            if (!achievement.unlocked && achievement.condition(this.stats)) {
                this.unlockAchievement(achievement);
            }
        }
    }

    private unlockAchievement(achievement: Achievement): void {
        achievement.unlocked = true;

        // 发放奖励
        if (achievement.reward.gold) {
            this.game.gold += achievement.reward.gold;
        }
        if (achievement.reward.exp) {
            this.game.playerLevelSystem.addExperience(achievement.reward.exp);
        }
        if (achievement.reward.heal) {
            this.game.player.heal(achievement.reward.heal);
        }

        // 添加到通知队列
        this.notificationQueue.push(achievement);

        // 显示飘字
        this.game.floatingTexts.push(new FloatingText(
            this.game.player.x,
            this.game.player.y - 100,
            `成就解锁: ${achievement.nameZh}`,
            '#FFD700',
            'level'
        ));
    }

    // 更新统计数据的方法
    public onEnemyKill(isBoss: boolean = false, isElite: boolean = false): void {
        this.stats.totalKills++;
        if (isBoss) this.stats.bossesKilled++;
        if (isElite) this.stats.elitesKilled++;
    }

    public onComboAchieved(combo: number): void {
        if (combo > this.stats.maxCombo) {
            this.stats.maxCombo = combo;
        }
    }

    public onGoldEarned(amount: number): void {
        this.stats.goldEarned += amount;
    }

    public onRevive(): void {
        this.stats.revivesUsed++;
    }

    public onDamageDealt(amount: number): void {
        this.stats.damageDealt += amount;
    }

    public getUnlockedCount(): number {
        return this.achievements.filter(a => a.unlocked).length;
    }

    public getTotalCount(): number {
        return this.achievements.length;
    }

    public getAchievements(): Achievement[] {
        return this.achievements;
    }

    public render(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
        // 渲染当前通知
        if (this.currentNotification) {
            ctx.save();
            
            const alpha = Math.min(1, this.notificationTimer);
            ctx.globalAlpha = alpha;
            
            // 通知框
            const boxWidth = 300;
            const boxHeight = 80;
            const boxX = (canvasWidth - boxWidth) / 2;
            const boxY = 50;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            
            // 圆角矩形
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
            ctx.fill();
            ctx.stroke();
            
            // 成就内容
            ctx.font = 'bold 24px "Fredoka One", cursive';
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.currentNotification.icon} 成就解锁!`, boxX + boxWidth / 2, boxY + 30);
            
            ctx.font = '18px "Fredoka One", cursive';
            ctx.fillStyle = '#FFF';
            ctx.fillText(this.currentNotification.nameZh, boxX + boxWidth / 2, boxY + 55);
            
            ctx.font = '14px "Fredoka One", cursive';
            ctx.fillStyle = '#AAA';
            ctx.fillText(this.currentNotification.description, boxX + boxWidth / 2, boxY + 72);
            
            ctx.restore();
        }
    }
}