import { Player } from './entities/Player';
import type { CharacterClass } from './entities/Player';
import { Input } from './systems/Input';
import { Enemy } from './entities/Enemy';
import { Necromancer } from './entities/Necromancer';
import { Boss } from './entities/Boss';
import { FusionBoss } from './entities/FusionBoss';
import { Splitter } from './entities/Splitter';
import { TitanEnemy } from './entities/TitanEnemy';
import { TwinElite } from './entities/TwinElite';
import { DevourerElite } from './entities/DevourerElite';
import { Projectile } from './weapons/Projectile';
import { MagicWand } from './weapons/MagicWand';
import { Laser } from './weapons/Laser';
import { Pickup } from './entities/Pickup';
import { Particle } from './entities/Particle';
import { EnhancedParticle, type ParticleType } from './entities/EnhancedParticle';
import { Shop } from './ui/Shop';
import { PetPanel } from './ui/PetPanel';
import { SoundManager } from './systems/SoundManager';
import { WeaponPickup } from './entities/WeaponPickup';
import { HealthPickup } from './entities/HealthPickup';
import { MissileWeapon } from './weapons/MissileWeapon';
import { Shotgun } from './weapons/Shotgun';
import { OrbitShield } from './weapons/OrbitShield';
import { BubbleGun } from './weapons/BubbleGun';
import { Boomerang } from './weapons/Boomerang';
import { SplitterGun } from './weapons/SplitterGun';
import { PoisonGun } from './weapons/PoisonGun';
import { FreezeGun } from './weapons/FreezeGun';
import { t, tWeapon, tEnemy } from './i18n';
import { BubbleProjectile } from './weapons/BubbleProjectile';
import { FloatingText } from './entities/FloatingText';
import { LollipopPickup } from './entities/LollipopPickup';
import { PetEggPickup } from './entities/PetEggPickup';
import { CharmPotionPickup } from './entities/CharmPotionPickup';
import { PetEquipmentPickup } from './entities/PetEquipmentPickup';
import { Pet } from './entities/Pet';
import { PetProjectile } from './entities/PetProjectile';
import { GreedyDog } from './entities/GreedyDog';
import { MagicFairy } from './entities/MagicFairy';
import { SpeedyTurtle } from './entities/SpeedyTurtle';
import { GrumpyPorcupine } from './entities/GrumpyPorcupine';
import { BouncySlime } from './entities/BouncySlime';
import { LuckyCat } from './entities/LuckyCat';
import { HolyLightTurtle } from './entities/HolyLightTurtle';
import { Spirit } from './entities/Spirit';
import { Obstacle, type ObstacleType } from './entities/Obstacle';
import { EliteRewardSystem } from './systems/EliteRewardSystem';
import { PetNurtureSystem } from './systems/PetNurtureSystem';
import { getLeaderboard, saveScore } from './leaderboard';
import type { SkillTreeManager } from './systems/SkillTree';
import { WaveManager } from './systems/WaveManager';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime: number = 0;

    public readonly WORLD_WIDTH = 4000;
    public readonly WORLD_HEIGHT = 4000;

    private weaponStatsEl: HTMLElement | null;
    private enemyStatsEl: HTMLElement | null;

    private input!: Input;
    public soundManager: SoundManager; // Public for weapons
    public player!: Player; // Public for Shop access

    private enemies: Enemy[] = [];

    public hatchRandomPet(isTemporary: boolean = false, duration: number = 20): void {
        const rand = Math.random();
        let newPet: Pet;

        if (rand < 0.16) {
            newPet = new GreedyDog(this.player, this);
            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `Greedy Dog Hatched!`, '#8B4513'));
        } else if (rand < 0.32) {
            newPet = new MagicFairy(this.player, this);
            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `Magic Fairy Hatched!`, '#FFB6C1'));
        } else if (rand < 0.48) {
            newPet = new SpeedyTurtle(this.player, this);
            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `Speedy Turtle Hatched!`, '#2E8B57'));
        } else if (rand < 0.64) {
            newPet = new GrumpyPorcupine(this.player, this);
            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `Grumpy Porcupine Hatched!`, '#A0522D'));
        } else if (rand < 0.80) {
            newPet = new BouncySlime(this.player, this);
            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `Bouncy Slime Hatched!`, '#32CD32'));
        } else if (rand < 0.90) {
            newPet = new HolyLightTurtle(this.player, this);
            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `Holy Light Turtle Hatched!`, '#FFD700'));
        } else {
            newPet = new LuckyCat(this.player, this);
            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `Lucky Cat Hatched!`, '#FFD700'));
        }

        // 注册到养成系统
        this.petNurtureSystem.registerPet(newPet);

        if (isTemporary) {
            newPet.isTemporary = true;
            newPet.lifeTimer = duration;
        }
        this.pets.push(newPet);
    }

    public getEnemies(): Enemy[] { return this.enemies; }
    private projectiles: Projectile[] = [];
    private petProjectiles: PetProjectile[] = []; // 宠物发射的投射物
    private pickups: (Pickup | WeaponPickup | HealthPickup | LollipopPickup | PetEggPickup | CharmPotionPickup | PetEquipmentPickup)[] = [];
    public particles: (Particle | EnhancedParticle)[] = [];
    public floatingTexts: FloatingText[] = [];

    public addFloatingText(text: FloatingText): void {
        this.floatingTexts.push(text);
    }

    public pets: Pet[] = [];
    public obstacles: Obstacle[] = [];
    private petLevelUpTimer: number = 0;
    private damageFlashTimer: number = 0;
    
    // Screen shake
    private shakeIntensity: number = 0;
    private shakeDecay: number = 0.9;
    private shakeX: number = 0;
    private shakeY: number = 0;
    
    public gold: number = 0;
    public gameTime: number = 0; // In seconds
    public hasSavedScore: boolean = false;
    public eliteDropCount: number = 0; // 精英掉落次数
    public eliteRewardUseCount: number = 0; // 强化卡使用次数

    public shop!: Shop;
    public eliteRewardSystem!: EliteRewardSystem;
    public petPanel!: PetPanel;
    public petNurtureSystem!: PetNurtureSystem;
    public waveManager!: WaveManager;
    private skillTreeManager: SkillTreeManager | null = null;
    private isPaused: boolean = false;

    private stars: { x: number; y: number; size: number; alpha: number }[] = [];
    private backgroundLeaderboard: { name: string, score: number }[] = [];

    // Selected character class
    public selectedCharacterClass: CharacterClass = 'knight';

    public setSkillTreeManager(manager: SkillTreeManager) {
        this.skillTreeManager = manager;
    }

    private initializeGame(): void {
        this.enemies = [];
        this.projectiles = [];
        this.pickups = [];
        this.particles = [];
        this.floatingTexts = [];
        this.pets = [];
        this.obstacles = [];
        this.petLevelUpTimer = 0;
        this.damageFlashTimer = 0;
        this.gold = 0;
        this.gameTime = 0;
        this.hasSavedScore = false;
        this.isPaused = false;
        this.eliteDropCount = 0;
        this.eliteRewardUseCount = 0;

        this.backgroundLeaderboard = [];
        getLeaderboard().then(board => {
            this.backgroundLeaderboard = board;
        });

        this.input = new Input();
        this.player = new Player(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2, this.input, this.WORLD_WIDTH, this.WORLD_HEIGHT, this.selectedCharacterClass);

        // Generate obstacles for the scene
        this.generateObstacles();
        this.player.setGame(this);
        if (this.skillTreeManager) {
            this.player.setSkillTreeManager(this.skillTreeManager);
        }
        this.player.addWeapon(new MagicWand(this, this.player));
        this.waveManager = new WaveManager(this, this.player);

        for (let i = 0; i < 1; i++) {
            const rand = Math.random();
            if (rand < 0.16) {
                const pet = new GreedyDog(this.player, this);
                this.pets.push(pet);
                this.petNurtureSystem.registerPet(pet);
            } else if (rand < 0.32) {
                const pet = new MagicFairy(this.player, this);
                this.pets.push(pet);
                this.petNurtureSystem.registerPet(pet);
            } else if (rand < 0.48) {
                const pet = new SpeedyTurtle(this.player, this);
                this.pets.push(pet);
                this.petNurtureSystem.registerPet(pet);
            } else if (rand < 0.64) {
                const pet = new GrumpyPorcupine(this.player, this);
                this.pets.push(pet);
                this.petNurtureSystem.registerPet(pet);
            } else if (rand < 0.80) {
                const pet = new BouncySlime(this.player, this);
                this.pets.push(pet);
                this.petNurtureSystem.registerPet(pet);
            } else if (rand < 0.90) {
                const pet = new HolyLightTurtle(this.player, this);
                this.pets.push(pet);
                this.petNurtureSystem.registerPet(pet);
            } else {
                const pet = new LuckyCat(this.player, this);
                this.pets.push(pet);
                this.petNurtureSystem.registerPet(pet);
            }
        }

        // Ensure Shop is linked correctly to the new player
        if (this.shop) {
            this.shop.updatePlayerRef();
        }

        // Hide game over screen
        const gameOverEl = document.getElementById('game-over');
        if (gameOverEl) {
            gameOverEl.classList.add('hidden');
        }

        this.updateHUD();
        this.updateStatsPanel();
    }

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }
        this.canvas = canvas;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context');
        }
        this.ctx = ctx;

        this.weaponStatsEl = document.getElementById('weapon-stats');
        this.enemyStatsEl = document.getElementById('enemy-stats');

        // Generate Stars (used for grass patches)
        for (let i = 0; i < 2000; i++) {
            this.stars.push({
                x: Math.random() * this.WORLD_WIDTH,
                y: Math.random() * this.WORLD_HEIGHT,
                size: Math.random() * 2,
                alpha: Math.random()
            });
        }

        this.soundManager = new SoundManager();

        this.shop = new Shop(this);
        this.eliteRewardSystem = new EliteRewardSystem(this);
        this.petNurtureSystem = new PetNurtureSystem();
        this.petPanel = new PetPanel(this);
        this.waveManager = new WaveManager(this, this.player);
        this.initializeGame();

        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('languageChanged', () => {
            this.updateStatsPanel();
            this.updateHUD();
        });
    }

    private resize(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    private updateStatsPanel(): void {
        if (!this.weaponStatsEl || !this.enemyStatsEl) return;

        // 1. Update Arsenal Stats
        let weaponHTML = '';
        this.player.weapons.forEach(w => {
            weaponHTML += `
                <div class="stat-row">
                    <span class="stat-label">${tWeapon(w.name)} ${t('lv')}${w.level}:</span>
                    <span class="stat-value">${w.damage.toFixed(1)} ${t('dmg')}</span>
                </div>
            `;
        });
        if (weaponHTML === '') weaponHTML = `<div class="stat-row"><span class="stat-label">${t('none')}</span></div>`;
        this.weaponStatsEl.innerHTML = weaponHTML;

        // 2. Update Enemy Stats
        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.3);
        const damageBonus = Math.floor(this.gameTime / 45);

        const enemyData = [
            { name: "Basic", hp: 10, dmg: 1 },
            { name: "Scout", hp: 4, dmg: 1 },
            { name: "Swarm", hp: 2, dmg: 1 },
            { name: "Tank", hp: 30, dmg: 2 },
            { name: "Splitter", hp: 8, dmg: 1 },
            { name: "Charger", hp: 10, dmg: 2 },
            { name: "Teleporter", hp: 4, dmg: 1 },
            { name: "Star", hp: 4, dmg: 1 },
            { name: "Slime", hp: 30, dmg: 2 },
            { name: "Boss", hp: 150, dmg: 3 },
            { name: "FusionBoss", hp: 200, dmg: 4 },
            { name: "TwinElite", hp: 300, dmg: 5 },
            { name: "DevourerElite", hp: 250, dmg: 4 },
            { name: "Titan", hp: 600, dmg: 6 },
            { name: "Necromancer", hp: 1500, dmg: 5 },
            { name: "Spirit", hp: 10, dmg: 1 }
        ];

        let enemyHTML = '';
        enemyData.forEach(e => {
            const currentHP = (e.hp * hpMultiplier).toFixed(1);
            const currentDMG = (e.dmg + damageBonus);
            enemyHTML += `
                <div class="stat-row">
                    <span class="stat-label">${tEnemy(e.name)}:</span>
                    <span class="stat-value">${currentHP} ${t('hp')} | ${currentDMG} ${t('atk')}</span>
                </div>
            `;
        });
        this.enemyStatsEl.innerHTML = enemyHTML;
    }

    public start(): void {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    public pause(): void {
        this.isPaused = true;
    }

    public resume(): void {
        this.isPaused = false;
        this.lastTime = performance.now(); // Reset time to avoid jump
        requestAnimationFrame((time) => this.loop(time));
    }

    private loop(time: number): void {
        if (this.isPaused) return;

        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.loop(time));
    }

    private update(deltaTime: number): void {
        this.gameTime += deltaTime;

        this.petLevelUpTimer += deltaTime;
        if (this.petLevelUpTimer >= 30 && this.pets.length > 0) {
            this.petLevelUpTimer = 0;
            this.pets.forEach(pet => {
                pet.addExperience(500);
                this.grantRandomPetSkill(pet);
            });
        }

        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= deltaTime;
        }

        this.updateShake(deltaTime);
        this.handlePetCommands();

        this.player.update(deltaTime);
        this.obstacles.forEach(o => o.update(deltaTime));
        
        this.waveManager.update(deltaTime);

        this.enemies.forEach(enemy => enemy.update(deltaTime));
        this.projectiles.forEach(p => p.update(deltaTime));
        this.petProjectiles.forEach(p => p.update(deltaTime));

        this.checkCollisions();
        this.checkCollections();

        this.enemies = this.enemies.filter(e => !e.isDead);
        this.projectiles = this.projectiles.filter(p => !p.isDead);
        this.petProjectiles = this.petProjectiles.filter(p => !p.isDead);
        this.pickups = this.pickups.filter(p => !p.isDead);

        this.particles.forEach(p => p.update(deltaTime));
        this.particles = this.particles.filter(p => !p.isDead);

        this.floatingTexts.forEach(t => t.update(deltaTime));
        this.floatingTexts = this.floatingTexts.filter(t => !t.isDead);

        this.pets.forEach(p => p.update(deltaTime));
        this.pets = this.pets.filter(p => !p.isDead);

        // Check player collision with obstacles
        this.obstacles.forEach(obstacle => {
            const dx = this.player.x - obstacle.x;
            const dy = this.player.y - obstacle.y;
            const distance = Math.hypot(dx, dy);
            const minDist = this.player.radius + obstacle.radius;

            if (distance < minDist) {
                const pushX = dx / distance;
                const pushY = dy / distance;
                const pushAmount = minDist - distance;
                this.player.x += pushX * pushAmount;
                this.player.y += pushY * pushAmount;
            }
        });

        // Check enemy collision with obstacles (except Spirit which phases through)
        this.obstacles.forEach(obstacle => {
            this.enemies.forEach(enemy => {
                // Spirit enemies can phase through obstacles
                if (enemy instanceof Spirit) return;

                const dx = enemy.x - obstacle.x;
                const dy = enemy.y - obstacle.y;
                const distance = Math.hypot(dx, dy);
                const minDist = enemy.radius + obstacle.radius;

                if (distance < minDist) {
                    const pushX = dx / distance;
                    const pushY = dy / distance;
                    const pushAmount = minDist - distance;
                    enemy.x += pushX * pushAmount;
                    enemy.y += pushY * pushAmount;
                }
            });
        });

        this.updateHUD();
        this.updateStatsPanel();
    }

private updateHUD(): void {
        const hpEl = document.getElementById('hp');
        const hpBarFill = document.getElementById('hp-bar-fill');
        const goldEl = document.getElementById('gold');

        if (hpEl) hpEl.textContent = `${Math.max(0, Math.floor(this.player.hp))} / ${this.player.maxHp}`;
        if (goldEl) goldEl.textContent = this.gold.toString();

        if (hpBarFill) {
            const hpPercent = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
            hpBarFill.style.width = `${hpPercent}%`;
        }
        
        this.updateWaveUI();
    }
    
    private updateWaveUI(): void {
        const waveNumberEl = document.getElementById('wave-number');
        const enemiesRemainingEl = document.getElementById('enemies-remaining');
        const enemiesTotalEl = document.getElementById('enemies-total');
        
        if (waveNumberEl) {
            waveNumberEl.textContent = `Wave ${this.waveManager.getCurrentWave()}`;
        }
        
        if (enemiesRemainingEl) {
            enemiesRemainingEl.textContent = this.waveManager.getRemainingEnemies().toString();
        }
        
        if (enemiesTotalEl) {
            enemiesTotalEl.textContent = this.waveManager.getTotalEnemiesInWave().toString();
        }
    }

    public handleEnemyDeath(enemy: Enemy): void {
        const hpMult = 1 + (Math.floor(this.gameTime / 30) * 0.5);

        // 宠物获取经验（击杀敌人分享经验）
        const expGained = Math.max(1, Math.floor(enemy.hp / 5));
        this.pets.forEach(pet => {
            pet.addExperience(expGained);
            pet.addIntimacy(0.5); // 每次击杀增加少量亲密度
        });

        if (enemy instanceof Splitter && !enemy.isSplitterling && !(enemy as any).isEvolved) {
            const numSpawns = 5;
            const radius = 15;
            for (let i = 0; i < numSpawns; i++) {
                const angle = (Math.PI * 2 / numSpawns) * i;
                const sx = enemy.x + Math.cos(angle) * radius;
                const sy = enemy.y + Math.sin(angle) * radius;
                const s = new Splitter(sx, sy, this.player, true);
                s.hp *= hpMult;
                this.enemies.push(s);
            }
        }

        if (enemy.noDrop) {
            this.createExplosion(enemy.x, enemy.y, enemy.color);
            this.soundManager.playExplosionSound();
            return;
        }

        this.pickups.push(new Pickup(enemy.x, enemy.y, 1));

        if (enemy instanceof Boss || enemy instanceof TitanEnemy || enemy instanceof FusionBoss) {
            this.triggerShake(15);
            this.createExplosion(enemy.x, enemy.y, '#FFD700');
            this.createExplosion(enemy.x, enemy.y, '#FF4500');
            
            for (let i = 0; i < 20; i++) {
                this.particles.push(new Particle(enemy.x, enemy.y, '#FFD700'));
            }
            
            if (Math.random() < 0.2 && this.eliteDropCount < 10) {
                this.eliteDropCount++;
                this.pause();
                this.eliteRewardSystem.show();
            } else {
                this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 80, `强化已满！获得金币`, '#FFD700', 'level'));
                this.gold += 100;
                this.createExplosion(enemy.x, enemy.y, '#FFD700');
            }
        } else if (enemy instanceof TwinElite) {
            const twin = enemy as TwinElite;
            const siblingAlive = twin.sibling && !twin.sibling.isDead;
            if (!siblingAlive) {
                this.triggerShake(12);
                this.createExplosion(enemy.x, enemy.y, '#FF4500');
            // 检查是否已达到精英掉落上限
            if (this.eliteDropCount < 10) {
                this.eliteDropCount++;
                this.pause();
                this.eliteRewardSystem.show();
                this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 80, `⚔️ 双子陨落！强化三选一`, '#FF4500', 'level'));
            } else {
                this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 80, `强化已满！获得金币`, '#FFD700', 'level'));
                this.gold += 100;
                this.createExplosion(enemy.x, enemy.y, '#FFD700');
            }
            } else {
                this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 60, `一个双子逃走了！`, '#FF69B4'));
            }
        } else if (enemy instanceof DevourerElite) {
            this.triggerShake(10);
            this.createExplosion(enemy.x, enemy.y, '#FF4500');
            // 检查是否已达到精英掉落上限
            if (this.eliteDropCount < 10) {
                this.eliteDropCount++;
                this.pause();
                this.eliteRewardSystem.show();
                this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 80, `👹 精英强化！三选一`, '#FF4500', 'level'));
            } else {
                this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 80, `强化已满！获得金币`, '#FFD700', 'level'));
                this.gold += 100;
                this.createExplosion(enemy.x, enemy.y, '#FFD700');
            }
        } else {
            const weaponTypes = ['Magic Wand', 'Laser', 'Missile Launcher', 'Shotgun', 'Orbit Shield', 'Bubble Gun', 'Boomerang', 'Splitter Gun', 'Poison Gun', 'Freeze Gun'];
            const dropRand = Math.random();
            if (dropRand < 0.002) {
                this.pickups.push(new LollipopPickup(enemy.x, enemy.y));
            } else if (dropRand < 0.03) {
                this.spawnPetEquipment(enemy.x, enemy.y);
            } else if (dropRand < 0.08) {
                const type = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
                this.pickups.push(new WeaponPickup(enemy.x, enemy.y, type));
            } else if (dropRand < 0.12) {
                this.pickups.push(new HealthPickup(enemy.x, enemy.y, 5));
            } else if (dropRand < 0.18) {
                this.pickups.push(new CharmPotionPickup(enemy.x, enemy.y));
            }
        }

        this.createExplosion(enemy.x, enemy.y, enemy.color);
        this.soundManager.playExplosionSound();
    }

    private checkCollisions(): void {
        if (this.player.isInvincible) return;

        for (const projectile of this.projectiles) {
            for (const enemy of this.enemies) {
                const dx = projectile.x - enemy.x;
                const dy = projectile.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < projectile.radius + enemy.radius) {
                    if ((projectile as any).hitEnemies && (projectile as any).hitEnemies.has(enemy)) continue;

                    if (projectile instanceof BubbleProjectile) {
                        if (!enemy.trappedInBubble && !(enemy instanceof Boss) && !(enemy instanceof FusionBoss)) {
                            enemy.trappedInBubble = true;
                            projectile.isDead = true;
                            this.soundManager.playExplosionSound();
                        } else {
                            projectile.isDead = true;
                        }
                    } else {
                        enemy.takeDamage(projectile.damage);
                        if ((projectile as any).hitEnemies) (projectile as any).hitEnemies.add(enemy);

                        if (typeof (projectile as any).onHit === 'function') (projectile as any).onHit(enemy);

                        if (enemy.isDead) {
                            this.handleEnemyDeath(enemy);
                            if (typeof (projectile as any).onKill === 'function') (projectile as any).onKill(enemy);
                        }

                        if (typeof (projectile as any).penetration === 'number') {
                            (projectile as any).penetration--;
                            if ((projectile as any).penetration <= 0) projectile.isDead = true;
                        } else {
                            projectile.isDead = true;
                        }
                    }
                    if (projectile.isDead) break;
                }
            }
        }

        // Pet projectile collision
        for (const proj of this.petProjectiles) {
            for (const enemy of this.enemies) {
                const dx = proj.x - enemy.x;
                const dy = proj.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < proj.radius + enemy.radius) {
                    enemy.takeDamage(proj.getDamage());
                    proj.isDead = true;
                    this.createExplosion(proj.x, proj.y, proj.color);

                    if (enemy.isDead) {
                        this.handleEnemyDeath(enemy);
                    }
                    break;
                }
            }
        }

        for (const enemy of this.enemies) {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.player.radius + enemy.radius) {
                if (this.player.isInvincible) {
                    const angle = Math.atan2(dy, dx);
                    enemy.x -= Math.cos(angle) * 50;
                    enemy.y -= Math.sin(angle) * 50;
                } else {
                    const totalDamage = enemy.damage + Math.floor(this.gameTime / 60);
                    this.player.takeDamage(totalDamage);
                    this.soundManager.playPlayerHitSound();
                    this.damageFlashTimer = 0.2;
                    const angle = Math.atan2(dy, dx);
                    enemy.x -= Math.cos(angle) * 50;
                    enemy.y -= Math.sin(angle) * 50;
                    if (this.player.isDead) this.gameOver();
                }
            }
        }
    }

    private updateLeaderboard(): void {
        const listEl = document.getElementById('leaderboard-list');
        if (listEl) listEl.innerHTML = '<li>Loading...</li>';

        getLeaderboard().then(leaderboard => {
            this.backgroundLeaderboard = leaderboard.slice(0, 10);
            if (listEl) {
                listEl.innerHTML = '';
                for (let i = 0; i < Math.min(10, leaderboard.length); i++) {
                    const li = document.createElement('li');
                    li.textContent = `${leaderboard[i].name} - ${leaderboard[i].score}`;
                    listEl.appendChild(li);
                }
            }

            const inputSection = document.getElementById('leaderboard-input-section');
            if (inputSection) {
                const currentScore = Math.floor(this.gameTime);
                if (!this.hasSavedScore && (leaderboard.length < 10 || currentScore > (leaderboard[9]?.score || 0))) {
                    inputSection.classList.remove('hidden');
                    const saveBtn = document.getElementById('save-score-btn');
                    const nameInput = document.getElementById('player-name') as HTMLInputElement;
                    if (saveBtn && nameInput) {
                        const newBtn = saveBtn.cloneNode(true);
                        saveBtn.parentNode?.replaceChild(newBtn, saveBtn);
                        newBtn.addEventListener('click', () => {
                            const name = nameInput.value.trim() || 'Anonymous';
                            this.hasSavedScore = true;
                            inputSection.classList.add('hidden');
                            if (listEl) listEl.innerHTML = '<li>Saving...</li>';
                            saveScore(name, currentScore).then(newBoard => {
                                this.backgroundLeaderboard = newBoard.slice(0, 10);
                                this.updateLeaderboard();
                            });
                        });
                    }
                } else {
                    inputSection.classList.add('hidden');
                }
            }
        });
    }

    private gameOver(): void {
        this.pause();
        const gameOverEl = document.getElementById('game-over');
        const scoreEl = document.getElementById('final-score');
        const restartBtn = document.getElementById('restart-btn');

        if (gameOverEl && scoreEl && restartBtn) {
            scoreEl.textContent = Math.floor(this.gameTime).toString();
            gameOverEl.classList.remove('hidden');
            this.updateLeaderboard();
            restartBtn.onclick = () => { this.initializeGame(); this.resume(); };
            restartBtn.ontouchstart = (e) => { e.preventDefault(); this.initializeGame(); this.resume(); };
        } else {
            alert(`Game Over! Score: ${Math.floor(this.gameTime)}`);
            this.initializeGame();
            this.resume();
        }
    }

    private checkCollections(): void {
        for (const pickup of this.pickups) {
            let collected = false;
            const dx = this.player.x - pickup.x;
            const dy = this.player.y - pickup.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.player.radius + pickup.radius + 10) {
                collected = true;
            } else {
                for (const pet of this.pets) {
                    if (pet instanceof GreedyDog) {
                        const pdx = pet.x - pickup.x;
                        const pdy = pet.y - pickup.y;
                        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
                        if (pdist < pet.radius + pickup.radius + 10) {
                            collected = true;
                            break;
                        }
                    }
                }
            }

            if (collected) {
                if (pickup instanceof WeaponPickup) {
                    this.handleWeaponPickup(pickup);
                    this.soundManager.playPickupSound();
                } else if (pickup instanceof HealthPickup) {
                    const healed = this.player.heal(pickup.healAmount);
                    if (healed > 0) this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 20, `+${healed} HP`, '#00FF00'));
                    else this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 20, `MAX HP`, '#00FF00'));
                    this.soundManager.playPickupSound();
                } else if (pickup instanceof LollipopPickup) {
                    this.player.becomeInvincible(10);
                    this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `INVINCIBLE!`, '#FF00FF'));
                    this.soundManager.playPickupSound();
                } else if (pickup instanceof PetEggPickup) {
                    this.hatchRandomPet();
                    this.soundManager.playPickupSound();
                } else if (pickup instanceof CharmPotionPickup) {
                    this.applyCharmPotion();
                    this.soundManager.playPickupSound();
                } else if (pickup instanceof PetEquipmentPickup) {
                    this.handlePetEquipmentPickup(pickup);
                    this.soundManager.playPickupSound();
                } else if (pickup instanceof Pickup) {
                    this.gold += pickup.value;
                    this.soundManager.playPickupSound();
                }
                pickup.isDead = true;
            }
        }
    }

    private handleWeaponPickup(pickup: WeaponPickup): void {
        const type = pickup.weaponType;
        let newWeapon;
        if (type === 'Laser') newWeapon = new Laser(this, this.player);
        else if (type === 'Missile Launcher') newWeapon = new MissileWeapon(this, this.player);
        else if (type === 'Shotgun') newWeapon = new Shotgun(this, this.player);
        else if (type === 'Orbit Shield') newWeapon = new OrbitShield(this, this.player);
        else if (type === 'Bubble Gun') newWeapon = new BubbleGun(this, this.player);
        else if (type === 'Boomerang') newWeapon = new Boomerang(this, this.player);
        else if (type === 'Splitter Gun') newWeapon = new SplitterGun(this, this.player);
        else if (type === 'Poison Gun') newWeapon = new PoisonGun(this, this.player);
        else if (type === 'Freeze Gun') newWeapon = new FreezeGun(this, this.player);
        else newWeapon = new MagicWand(this, this.player);

        const existingWeapon = this.player.weapons.find(w => w.name === newWeapon.name);
        if (existingWeapon) {
            if (existingWeapon.level < 10) {
                const stats = existingWeapon.upgrade();
                this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 20, `${type} Lv${existingWeapon.level} (+${stats.damage.toFixed(1)} Dmg)`, '#00FF00'));
            } else {
                this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 20, `MAX LEVEL!`, '#FFD700'));
            }
        } else {
            this.player.addWeapon(newWeapon);
            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 20, `New: ${type}!`, '#00FFFF'));
        }
    }

    private spawnPetEquipment(x: number, y: number): void {
        if (this.pets.length === 0) return;
        
        const equipments = Array.from(this.petNurtureSystem.getEquipmentDatabase().values());
        const randomEquip = equipments[Math.floor(Math.random() * equipments.length)];
        if (randomEquip) {
            this.pickups.push(new PetEquipmentPickup(x, y, randomEquip));
        }
    }

    // 宠物随机获取其他宠物的技能
    private grantRandomPetSkill(pet: Pet): void {
        // 定义所有宠物的技能列表
        const petSkills = [
            { name: 'GreedyDog', skill: '快速收集', icon: '💰' },
            { name: 'MagicFairy', skill: '魔法攻击', icon: '✨' },
            { name: 'SpeedyTurtle', skill: '极速冲刺', icon: '⚡' },
            { name: 'GrumpyPorcupine', skill: '反击尖刺', icon: '🦔' },
            { name: 'BouncySlime', skill: '弹跳攻击', icon: '🟢' },
            { name: 'LuckyCat', skill: '幸运加成', icon: '🐱' },
            { name: 'HolyLightTurtle', skill: '圣光治疗', icon: '🐢' },
            { name: 'KnightPet', skill: '护盾保护', icon: '🛡️' },
        ];
        
        // 获取当前宠物的技能
        const currentSkill = petSkills.find(s => s.name === pet.constructor.name);
        if (!currentSkill) return;
        
        // 随机获取另一个宠物的技能（排除当前）
        const otherSkills = petSkills.filter(s => s.name !== pet.constructor.name);
        const randomSkill = otherSkills[Math.floor(Math.random() * otherSkills.length)];
        
        // 显示浮动文字
        this.floatingTexts.push(new FloatingText(
            pet.x, 
            pet.y - 30, 
            `${randomSkill.icon} 获得新技能: ${randomSkill.skill}`, 
            '#FFD700'
        ));
        
        // 提升宠物属性作为技能加成
        pet.damageMultiplier += 0.1;
        pet.addIntimacy(10);
    }

    private handlePetEquipmentPickup(pickup: PetEquipmentPickup): void {
        if (this.pets.length === 0) return;
        
        // 装备到第一个宠物（或当前选中的宠物）
        const pet = this.pets[0];
        const success = this.petNurtureSystem.equipItem(pet, pickup.equipment.id);
        
        if (success) {
            this.floatingTexts.push(new FloatingText(pet.x, pet.y - 40, `装备！${pickup.equipment.nameZh}`, '#FFD700'));
            this.petPanel.updateUI();
        }
    }

    public addProjectile(projectile: Projectile): void {
        this.projectiles.push(projectile);
    }

    public addPetProjectile(projectile: PetProjectile): void {
        this.petProjectiles.push(projectile);
    }

    public addPickup(pickup: any): void {
        this.pickups.push(pickup);
    }

    public getPickups(): any[] {
        return this.pickups;
    }

    public getNearestEnemy(x: number, y: number): Enemy | null {
        let nearest: Enemy | null = null;
        let minDist = Infinity;
        for (const enemy of this.enemies) {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) { minDist = dist; nearest = enemy; }
        }
        return nearest;
    }

    private applyCharmPotion(): void {
        let strongest: Enemy | null = null;
        let maxHp = 0;
        for (const enemy of this.enemies) {
            if (enemy instanceof Boss || enemy instanceof FusionBoss || enemy instanceof TitanEnemy ||
                enemy instanceof TwinElite || enemy instanceof DevourerElite || enemy instanceof Necromancer) continue;
            if (enemy.hp > maxHp) { maxHp = enemy.hp; strongest = enemy; }
        }
        if (strongest) {
            strongest.applyCharm(20);
            this.floatingTexts.push(new FloatingText(strongest.x, strongest.y - 30, `CHARMED!`, '#FF69B4'));
        }
    }

    public createExplosion(x: number, y: number, color: string, type: ParticleType = 'default'): void {
        if (this.particles.length > 300) return;
        
        const particleCount = type === 'explosion' ? 12 : 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new EnhancedParticle(x, y, color, type, {
                size: 3 + Math.random() * 3,
                life: 0.3 + Math.random() * 0.4,
                secondaryColor: this.lightenColor(color, 20)
            });
            this.particles.push(particle);
        }
        
        if (type === 'default') {
            for (let i = 0; i < 3; i++) {
                const spark = new EnhancedParticle(x, y, '#FFFFFF', 'spark', {
                    size: 2,
                    life: 0.2
                });
                this.particles.push(spark);
            }
        }
    }

    public createFireExplosion(x: number, y: number): void {
        this.createExplosion(x, y, '#FF4500', 'fire');
        this.createExplosion(x, y, '#FFD700', 'fire');
    }

    public createIceExplosion(x: number, y: number): void {
        this.createExplosion(x, y, '#00BFFF', 'ice');
    }

    public createMagicExplosion(x: number, y: number): void {
        this.createExplosion(x, y, '#9932CC', 'magic');
    }

    private lightenColor(color: string, percent: number): string {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    public triggerShake(intensity: number): void {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }

    private updateShake(_deltaTime: number): void {
        if (this.shakeIntensity > 0.1) {
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeIntensity *= this.shakeDecay;
        } else {
            this.shakeIntensity = 0;
            this.shakeX = 0;
            this.shakeY = 0;
        }
    }

    private selectedPetIndex: number = 0;

    private handlePetCommands(): void {
        const cmd = this.input.consumeCommandKey();
        if (!cmd) return;

        if (cmd === 'Digit1' || cmd === 'Digit2' || cmd === 'Digit3') {
            const index = parseInt(cmd.charAt(5)) - 1;
            if (index < this.pets.length) {
                this.pets.forEach(p => p.isSelected = false);
                this.selectedPetIndex = index;
                this.pets[index].isSelected = true;
            }
        } else if (cmd === 'KeyQ' || cmd === 'KeyW' || cmd === 'KeyE' || cmd === 'KeyR') {
            const pet = this.pets[this.selectedPetIndex];
            if (pet) {
                const commandMap: Record<string, import('./entities/Pet').PetCommand> = {
                    'KeyQ': 'attack',
                    'KeyW': 'defend',
                    'KeyE': 'follow',
                    'KeyR': 'stay'
                };
                pet.setCommand(commandMap[cmd] || 'follow');
            }
        }
    }

    private generateObstacles(): void {
        const obstacleCount = 80; // Increased density
        const types: ObstacleType[] = ['grass', 'tree', 'rock', 'bush', 'forest'];
        const typeWeights = [0.35, 0.20, 0.15, 0.15, 0.15]; // 15% chance for large forests

        for (let i = 0; i < obstacleCount; i++) {
            let x: number, y: number;
            let attempts = 0;
            const minDistanceFromPlayer = 200; // Increased safe zone

            do {
                x = Math.random() * this.WORLD_WIDTH;
                y = Math.random() * this.WORLD_HEIGHT;
                attempts++;
            } while (
                attempts < 10 &&
                Math.hypot(x - this.WORLD_WIDTH / 2, y - this.WORLD_HEIGHT / 2) < minDistanceFromPlayer
            );

            const rand = Math.random();
            let typeIndex = 0;
            let weightSum = 0;
            for (let j = 0; j < typeWeights.length; j++) {
                weightSum += typeWeights[j];
                if (rand < weightSum) {
                    typeIndex = j;
                    break;
                }
            }

            this.obstacles.push(new Obstacle(x, y, types[typeIndex]));
        }
    }

    private render(): void {
        this.ctx.fillStyle = '#8ced73';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const camX = this.player.x - this.canvas.width / 2;
        const camY = this.player.y - this.canvas.height / 2;
        this.ctx.save();
        // Apply screen shake
        this.ctx.translate(this.shakeX, this.shakeY);
        this.ctx.translate(-camX, -camY);
        this.drawGrid(camX, camY);

        if (this.backgroundLeaderboard.length > 0) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.font = 'bold 48px "Fredoka One", cursive, monospace';
            const centerX = this.WORLD_WIDTH / 2 - 200;
            const centerY = this.WORLD_HEIGHT / 2;
            this.ctx.fillText(t('leaderboardTitle'), centerX, centerY - 250);
            this.ctx.font = '36px "Fredoka One", cursive, monospace';
            this.backgroundLeaderboard.forEach((entry, i) => {
                this.ctx.fillText(`${i + 1}. ${entry.name} - ${entry.score}`, centerX, centerY - 180 + i * 45);
            });
            this.ctx.restore();
        }

        this.pickups.forEach(p => p.render(this.ctx));
        this.obstacles.forEach(o => o.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.projectiles.forEach(p => p.render(this.ctx));
        this.petProjectiles.forEach(p => p.render(this.ctx));
        this.particles.forEach(p => p.render(this.ctx));
        this.pets.forEach(p => p.render(this.ctx));
        this.player.render(this.ctx);
        this.floatingTexts.forEach(t => t.render(this.ctx));
        this.ctx.restore();

        if (this.damageFlashTimer > 0) {
            this.ctx.fillStyle = `rgba(255, 0, 0, ${this.damageFlashTimer * 2})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        const debugX = this.canvas.width - 20;
        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 4;
        this.ctx.font = '18px "Fredoka One", cursive, monospace';
        let timeString = `${Math.floor(this.gameTime / 60).toString().padStart(2, '0')}:${Math.floor(this.gameTime % 60).toString().padStart(2, '0')}`;
        this.ctx.strokeText(`Time: ${timeString}`, debugX, 30);
        this.ctx.fillText(`Time: ${timeString}`, debugX, 30);
        this.ctx.strokeText(`Pos: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, debugX, 55);
        this.ctx.fillText(`Pos: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, debugX, 55);
        this.ctx.strokeText(`Enemies: ${this.enemies.length}`, debugX, 80);
        this.ctx.fillText(`Enemies: ${this.enemies.length}`, debugX, 80);
        this.ctx.textAlign = 'left';
    }

    private drawGrid(camX: number, camY: number): void {
        this.ctx.save();
        this.ctx.fillStyle = '#65c44f';
        for (const star of this.stars) {
            if (star.x >= camX && star.x <= camX + this.canvas.width && star.y >= camY && star.y <= camY + this.canvas.height) {
                this.ctx.globalAlpha = star.alpha * 0.5 + 0.5;
                this.ctx.beginPath();
                this.ctx.ellipse(star.x, star.y, star.size * 3, star.size * 1.5, 0, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.restore();
        this.ctx.save();
        this.ctx.strokeStyle = '#52993d';
        this.ctx.lineWidth = 15;
        this.ctx.strokeRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.ctx.restore();
    }
}
