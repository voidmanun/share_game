import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { FusionBoss } from '../entities/FusionBoss';
import { Scout } from '../entities/Scout';
import { TankEnemy } from '../entities/TankEnemy';
import { SwarmEnemy } from '../entities/SwarmEnemy';
import { Charger } from '../entities/Charger';
import { Splitter } from '../entities/Splitter';
import { SlimeEnemy } from '../entities/SlimeEnemy';
import { Teleporter } from '../entities/Teleporter';
import { StarEnemy } from '../entities/StarEnemy';
import { TitanEnemy } from '../entities/TitanEnemy';
import { TwinElite } from '../entities/TwinElite';
import { DevourerElite } from '../entities/DevourerElite';
import { Necromancer } from '../entities/Necromancer';
import type { Player } from '../entities/Player';
import type { Game } from '../Game';

/**
 * 波次敌人配置接口
 */
interface WaveEnemyConfig {
    type: 'basic' | 'scout' | 'swarm' | 'tank' | 'splitter' | 'charger' | 
          'teleporter' | 'star' | 'slime' | 'necromancer';
    count: number;
}

/**
 * Boss类型配置
 */
type BossType = 'boss' | 'fusion' | 'titan' | 'twin' | 'devourer' | 'necromancer';

/**
 * 波次配置接口
 */
interface WaveConfig {
    waveNumber: number;
    enemies: WaveEnemyConfig[];
    bossType: BossType;
    bossCount: number;
}

/**
 * 波次状态
 */
type WaveState = 'idle' | 'spawning' | 'active' | 'completed';

/**
 * 波次管理器
 * 负责管理波次的生成、状态追踪和波次转换
 */
export class WaveManager {
    private game: Game;
    private player: Player;
    
    // 波次状态
    private currentWave: number = 0;
    private waveState: WaveState = 'idle';
    private waveConfig: WaveConfig | null = null;
    
    // 生成控制
    private spawnQueue: Array<() => Enemy> = [];
    private spawnTimer: number = 0;
    private spawnInterval: number = 0.8; // 每个怪物生成间隔
    
    // 统计
    private totalEnemiesInWave: number = 0;
    private spawnedCount: number = 0;
    private killedCount: number = 0;
    
    // 波次间延迟
    private waveDelayTimer: number = 0;
    private waveDelay: number = 3; // 波次间延迟3秒
    
    // 难度缩放
    private baseEnemyCount: number = 20; // 第一波基础敌人数量
    
    constructor(game: Game, player: Player) {
        this.game = game;
        this.player = player;
    }
    
    /**
     * 重置波次管理器（重新开始游戏时调用）
     */
    public reset(): void {
        this.currentWave = 0;
        this.waveState = 'idle';
        this.waveConfig = null;
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.totalEnemiesInWave = 0;
        this.spawnedCount = 0;
        this.killedCount = 0;
        this.waveDelayTimer = 0;
    }
    
    /**
     * 更新波次逻辑
     */
    public update(deltaTime: number): void {
        switch (this.waveState) {
            case 'idle':
                // 空闲状态，等待开始新波次
                this.waveDelayTimer += deltaTime;
                if (this.waveDelayTimer >= this.waveDelay) {
                    this.startNextWave();
                }
                break;
                
            case 'spawning':
                // 正在生成怪物
                this.spawnTimer += deltaTime;
                if (this.spawnTimer >= this.spawnInterval && this.spawnQueue.length > 0) {
                    this.spawnTimer = 0;
                    const spawnFn = this.spawnQueue.shift();
                    if (spawnFn) {
                        const enemy = spawnFn();
                        // 应用仇恨系统加成
                        const hatredMultiplier = this.game.hatredSystem.getHatredMultiplier();
                        enemy.hp *= hatredMultiplier;
                        enemy.speed *= (1 + (hatredMultiplier - 1) * 0.5);
                        this.game.getEnemies().push(enemy);
                        this.spawnedCount++;
                    }
                }
                // 所有怪物已生成，切换到活跃状态
                if (this.spawnQueue.length === 0) {
                    this.waveState = 'active';
                }
                break;
                
            case 'active':
                // 活跃状态，等待所有敌人被消灭
                this.checkWaveCompletion();
                break;
                
            case 'completed':
                // 波次完成，短暂延迟后开始下一波
                this.waveDelayTimer += deltaTime;
                if (this.waveDelayTimer >= this.waveDelay) {
                    this.startNextWave();
                }
                break;
        }
    }
    
    /**
     * 开始下一波次
     */
    private startNextWave(): void {
        this.currentWave++;
        this.waveState = 'spawning';
        this.waveDelayTimer = 0;
        this.spawnedCount = 0;
        this.killedCount = 0;
        this.spawnTimer = 0;
        this.spawnQueue = [];
        
        // 生成波次配置
        this.waveConfig = this.generateWaveConfig(this.currentWave);
        
        // 构建生成队列
        this.buildSpawnQueue();
        
        // 计算总敌人数量
        this.totalEnemiesInWave = this.spawnQueue.length;
        
        // 波次开始提示
        console.log(`[WaveManager] Starting Wave ${this.currentWave} with ${this.totalEnemiesInWave} enemies`);
    }
    
    /**
     * 生成波次配置
     */
    private generateWaveConfig(waveNumber: number): WaveConfig {
        const config: WaveConfig = {
            waveNumber,
            enemies: [],
            bossType: this.selectBossType(waveNumber),
            bossCount: this.calculateBossCount(waveNumber)
        };
        
        // 计算本波次的敌人总数（随波次递增）
        const enemyCount = Math.floor(this.baseEnemyCount + (waveNumber - 1) * 5);
        
        // 根据波次决定敌人组成
        if (waveNumber <= 3) {
            // 前3波：简单敌人
            config.enemies.push(
                { type: 'basic', count: Math.floor(enemyCount * 0.5) },
                { type: 'scout', count: Math.floor(enemyCount * 0.3) },
                { type: 'star', count: Math.floor(enemyCount * 0.2) }
            );
        } else if (waveNumber <= 6) {
            // 4-6波：引入更多类型
            config.enemies.push(
                { type: 'basic', count: Math.floor(enemyCount * 0.3) },
                { type: 'scout', count: Math.floor(enemyCount * 0.2) },
                { type: 'swarm', count: Math.floor(enemyCount * 0.15) },
                { type: 'splitter', count: Math.floor(enemyCount * 0.1) },
                { type: 'teleporter', count: Math.floor(enemyCount * 0.1) },
                { type: 'star', count: Math.floor(enemyCount * 0.15) }
            );
        } else if (waveNumber <= 10) {
            // 7-10波：中等难度
            config.enemies.push(
                { type: 'basic', count: Math.floor(enemyCount * 0.2) },
                { type: 'scout', count: Math.floor(enemyCount * 0.15) },
                { type: 'swarm', count: Math.floor(enemyCount * 0.15) },
                { type: 'tank', count: Math.floor(enemyCount * 0.1) },
                { type: 'splitter', count: Math.floor(enemyCount * 0.1) },
                { type: 'charger', count: Math.floor(enemyCount * 0.1) },
                { type: 'teleporter', count: Math.floor(enemyCount * 0.1) },
                { type: 'slime', count: Math.floor(enemyCount * 0.1) }
            );
        } else {
            // 11波以上：困难模式
            config.enemies.push(
                { type: 'basic', count: Math.floor(enemyCount * 0.15) },
                { type: 'scout', count: Math.floor(enemyCount * 0.1) },
                { type: 'swarm', count: Math.floor(enemyCount * 0.1) },
                { type: 'tank', count: Math.floor(enemyCount * 0.12) },
                { type: 'splitter', count: Math.floor(enemyCount * 0.1) },
                { type: 'charger', count: Math.floor(enemyCount * 0.12) },
                { type: 'teleporter', count: Math.floor(enemyCount * 0.1) },
                { type: 'slime', count: Math.floor(enemyCount * 0.1) },
                { type: 'necromancer', count: Math.floor(enemyCount * 0.11) }
            );
        }
        
        return config;
    }
    
    /**
     * 选择Boss类型
     */
    private selectBossType(waveNumber: number): BossType {
        // 每5波出现更强的Boss
        if (waveNumber % 10 === 0) {
            return 'titan';
        } else if (waveNumber % 7 === 0) {
            return 'fusion';
        } else if (waveNumber % 5 === 0) {
            return 'twin';
        } else if (waveNumber % 3 === 0) {
            return 'devourer';
        } else {
            return 'boss';
        }
    }
    
    /**
     * 计算Boss数量
     */
    private calculateBossCount(waveNumber: number): number {
        if (waveNumber >= 15) return 2;
        if (waveNumber >= 10) return 1;
        return 1;
    }
    
    /**
     * 构建生成队列
     */
    private buildSpawnQueue(): void {
        if (!this.waveConfig) return;
        
        const hpMultiplier = 1 + (this.currentWave - 1) * 0.15;
        
        // 添加普通敌人到队列
        for (const enemyConfig of this.waveConfig.enemies) {
            for (let i = 0; i < enemyConfig.count; i++) {
                this.spawnQueue.push(() => {
                    return this.createEnemy(enemyConfig.type, hpMultiplier);
                });
            }
        }
        
        // 添加Boss到队列（在最后生成）
        for (let i = 0; i < this.waveConfig.bossCount; i++) {
            this.spawnQueue.push(() => {
                return this.createBoss(this.waveConfig!.bossType, hpMultiplier);
            });
        }
        
        // 随机打乱生成顺序（但Boss保持在最后）
        const bossSpawns = this.spawnQueue.splice(-this.waveConfig.bossCount);
        this.shuffleArray(this.spawnQueue);
        this.spawnQueue.push(...bossSpawns);
    }
    
    /**
     * 创建敌人
     */
    private createEnemy(type: string, hpMultiplier: number): Enemy {
        const pos = this.getSpawnPosition();
        let enemy: Enemy;
        
        switch (type) {
            case 'scout':
                enemy = new Scout(pos.x, pos.y, this.player);
                break;
            case 'swarm':
                enemy = new SwarmEnemy(pos.x, pos.y, this.player, this.game);
                break;
            case 'tank':
                enemy = new TankEnemy(pos.x, pos.y, this.player);
                break;
            case 'splitter':
                enemy = new Splitter(pos.x, pos.y, this.player);
                break;
            case 'charger':
                enemy = new Charger(pos.x, pos.y, this.player, this.game);
                break;
            case 'teleporter':
                enemy = new Teleporter(pos.x, pos.y, this.player, this.game);
                break;
            case 'star':
                enemy = new StarEnemy(pos.x, pos.y, this.player);
                break;
            case 'slime':
                enemy = new SlimeEnemy(pos.x, pos.y, this.player, this.game, 0);
                break;
            case 'necromancer':
                enemy = new Necromancer(pos.x, pos.y, this.player, this.game);
                break;
            default:
                enemy = new Enemy(pos.x, pos.y, this.player);
        }
        
        enemy.hp *= hpMultiplier;
        if ((enemy as any).maxHp !== undefined) {
            (enemy as any).maxHp = enemy.hp;
        }
        
        return enemy;
    }
    
    /**
     * 创建Boss
     */
    private createBoss(type: BossType, hpMultiplier: number): Enemy {
        const pos = this.getSpawnPosition();
        let boss: Enemy;
        
        switch (type) {
            case 'fusion':
                boss = new FusionBoss(pos.x, pos.y, this.player);
                break;
            case 'titan':
                boss = new TitanEnemy(pos.x, pos.y, this.player);
                break;
            case 'twin':
                // Twin Elite特殊处理，生成一对
                const twin1 = new TwinElite(pos.x, pos.y, this.player, this.game, 'light');
                const twin2 = new TwinElite(pos.x + 40, pos.y + 40, this.player, this.game, 'dark');
                twin1.hp *= hpMultiplier;
                twin2.hp *= hpMultiplier;
                twin1.sibling = twin2;
                twin2.sibling = twin1;
                // 返回第一个，第二个需要手动添加
                this.game.getEnemies().push(twin2);
                boss = twin1;
                break;
            case 'devourer':
                boss = new DevourerElite(pos.x, pos.y, this.player, this.game);
                break;
            case 'necromancer':
                boss = new Necromancer(pos.x, pos.y, this.player, this.game);
                break;
            default:
                boss = new Boss(pos.x, pos.y, this.player);
        }
        
        boss.hp *= hpMultiplier;
        if ((boss as any).maxHp !== undefined) {
            (boss as any).maxHp = boss.hp;
        }
        
        return boss;
    }
    
    /**
     * 获取生成位置（在玩家视野外）
     */
    private getSpawnPosition(): { x: number; y: number } {
        const canvas = (this.game as any).canvas as HTMLCanvasElement;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(canvas.width, canvas.height) / 2 + 100;
        const x = this.player.x + Math.cos(angle) * radius;
        const y = this.player.y + Math.sin(angle) * radius;
        return { x, y };
    }
    
    /**
     * 检查波次是否完成
     */
    private checkWaveCompletion(): void {
        const aliveEnemies = this.game.getEnemies().filter(e => !e.isDead && !e.charmed);
        
        if (aliveEnemies.length === 0 && this.spawnQueue.length === 0) {
            this.waveState = 'completed';
            this.waveDelayTimer = 0;
            console.log(`[WaveManager] Wave ${this.currentWave} completed!`);
        }
    }
    
    /**
     * 敌人死亡时调用（用于追踪击杀数）
     */
    public onEnemyKilled(): void {
        this.killedCount++;
    }
    
    /**
     * 获取当前波次号
     */
    public getCurrentWave(): number {
        return this.currentWave;
    }
    
    /**
     * 获取波次状态
     */
    public getWaveState(): WaveState {
        return this.waveState;
    }
    
    /**
     * 获取波次中的总敌人数量
     */
    public getTotalEnemiesInWave(): number {
        return this.totalEnemiesInWave;
    }
    
    /**
     * 获取剩余敌人数量
     */
    public getRemainingEnemies(): number {
        return this.game.getEnemies().filter(e => !e.isDead && !e.charmed).length;
    }
    
    /**
     * 获取已击杀敌人数量
     */
    public getKilledCount(): number {
        return this.killedCount;
    }
    
    /**
     * 获取波次延迟剩余时间
     */
    public getWaveDelayRemaining(): number {
        if (this.waveState === 'idle' || this.waveState === 'completed') {
            return Math.max(0, this.waveDelay - this.waveDelayTimer);
        }
        return 0;
    }
    
    /**
     * 是否正在波次间隔期
     */
    public isInWaveDelay(): boolean {
        return this.waveState === 'idle' || this.waveState === 'completed';
    }
    
    /**
     * 强制开始下一波（跳过延迟）
     */
    public forceNextWave(): void {
        if (this.isInWaveDelay()) {
            this.startNextWave();
        }
    }
    
    /**
     * 打乱数组
     */
    private shuffleArray<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}