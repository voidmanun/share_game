import { Player } from './entities/Player';
import type { CharacterClass } from './entities/Player';
import { Input } from './systems/Input';
import { Enemy } from './entities/Enemy';
import { Necromancer } from './entities/Necromancer';
import { Boss } from './entities/Boss';
import { FusionBoss } from './entities/FusionBoss';
import { Scout } from './entities/Scout';
import { TankEnemy } from './entities/TankEnemy';
import { SwarmEnemy } from './entities/SwarmEnemy';
import { Charger } from './entities/Charger';
import { Splitter } from './entities/Splitter';
import { SlimeEnemy } from './entities/SlimeEnemy';
import { Teleporter } from './entities/Teleporter';
import { StarEnemy } from './entities/StarEnemy';
import { TitanEnemy } from './entities/TitanEnemy';
import { TwinElite } from './entities/TwinElite';
import { DevourerElite } from './entities/DevourerElite';
import { Projectile } from './weapons/Projectile';
import { MagicWand } from './weapons/MagicWand';
import { Laser } from './weapons/Laser';
import { Pickup } from './entities/Pickup';
import { Particle } from './entities/Particle';
import { Shop } from './ui/Shop';
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
import { Pet } from './entities/Pet';
import { GreedyDog } from './entities/GreedyDog';
import { MagicFairy } from './entities/MagicFairy';
import { SpeedyTurtle } from './entities/SpeedyTurtle';
import { GrumpyPorcupine } from './entities/GrumpyPorcupine';
import { BouncySlime } from './entities/BouncySlime';
import { LuckyCat } from './entities/LuckyCat';
import { HolyLightTurtle } from './entities/HolyLightTurtle';
import { getLeaderboard, saveScore } from './leaderboard';
import { EliteRewardSystem } from './systems/EliteRewardSystem';

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

        if (isTemporary) {
            newPet.isTemporary = true;
            newPet.lifeTimer = duration;
        }
        this.pets.push(newPet);
    }

    public getEnemies(): Enemy[] { return this.enemies; }
    private projectiles: Projectile[] = [];
    private pickups: (Pickup | WeaponPickup | HealthPickup | LollipopPickup | PetEggPickup | CharmPotionPickup)[] = [];
    public particles: Particle[] = [];
    public floatingTexts: FloatingText[] = [];

    public addFloatingText(text: FloatingText): void {
        this.floatingTexts.push(text);
    }

    public pets: Pet[] = [];
    private spawnTimer: number = 0;
    private spawnInterval: number = 1.2; // Start slightly slower
    private bossSpawnTimer: number = 0;
    private fusionBossSpawnTimer: number = 0;
    private titanSpawnTimer: number = 0;
    private twinEliteSpawnTimer: number = 0;
    private devourerSpawnTimer: number = 0;
    private damageFlashTimer: number = 0;
    public gold: number = 0;
    public gameTime: number = 0; // In seconds
    public hasSavedScore: boolean = false;

    public shop!: Shop;
    public eliteRewardSystem!: EliteRewardSystem;
    private isPaused: boolean = false;

    private stars: { x: number; y: number; size: number; alpha: number }[] = [];
    private backgroundLeaderboard: { name: string, score: number }[] = [];

    // Selected character class
    public selectedCharacterClass: CharacterClass = 'knight';

    private initializeGame(): void {
        this.enemies = [];
        this.projectiles = [];
        this.pickups = [];
        this.particles = [];
        this.floatingTexts = [];
        this.pets = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1.2;
        this.bossSpawnTimer = 0;
        this.titanSpawnTimer = 0;
        this.twinEliteSpawnTimer = 0;
        this.devourerSpawnTimer = 0;
        this.damageFlashTimer = 0;
        this.gold = 0;
        this.gameTime = 0;
        this.hasSavedScore = false;
        this.isPaused = false;

        this.backgroundLeaderboard = [];
        getLeaderboard().then(board => {
            this.backgroundLeaderboard = board;
        });

        this.input = new Input();
        this.player = new Player(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2, this.input, this.WORLD_WIDTH, this.WORLD_HEIGHT, this.selectedCharacterClass);
        this.player.setGame(this);
        this.player.addWeapon(new MagicWand(this, this.player));

        for (let i = 0; i < 1; i++) {
            const rand = Math.random();
            if (rand < 0.16) {
                this.pets.push(new GreedyDog(this.player, this));
            } else if (rand < 0.32) {
                this.pets.push(new MagicFairy(this.player, this));
            } else if (rand < 0.48) {
                this.pets.push(new SpeedyTurtle(this.player, this));
            } else if (rand < 0.64) {
                this.pets.push(new GrumpyPorcupine(this.player, this));
            } else if (rand < 0.80) {
                this.pets.push(new BouncySlime(this.player, this));
            } else if (rand < 0.90) {
                this.pets.push(new HolyLightTurtle(this.player, this));
            } else {
                this.pets.push(new LuckyCat(this.player, this));
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
        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.5);
        const damageBonus = Math.floor(this.gameTime / 60);

        const enemyData = [
            { name: "Basic", hp: 6, dmg: 1 },
            { name: "Scout", hp: 4, dmg: 1 },
            { name: "Swarm", hp: 2, dmg: 1 },
            { name: "Tank", hp: 30, dmg: 2 },
            { name: "Splitter", hp: 8, dmg: 1 },
            { name: "Charger", hp: 10, dmg: 2 },
            { name: "Teleporter", hp: 4, dmg: 1 },
            { name: "Star", hp: 4, dmg: 1 },
            { name: "Slime", hp: 30, dmg: 2 },
            { name: "Boss", hp: 20, dmg: 3 },
            { name: "FusionBoss", hp: 100, dmg: 3 },
            { name: "TwinElite", hp: 200, dmg: 4 },
            { name: "DevourerElite", hp: 150, dmg: 3 },
            { name: "Titan", hp: 500, dmg: 5 },
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

        // Difficulty scaling: decrease spawn interval over time (min 0.6s)
        this.spawnInterval = Math.max(0.6, 1.2 * Math.pow(0.9, Math.floor(this.gameTime / 30)));

        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= deltaTime;
        }

        this.player.update(deltaTime);

        // Spawn enemies
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            const spawnCount = Math.min(3, 1 + Math.floor(this.gameTime / 60));
            for (let i = 0; i < spawnCount; i++) {
                this.spawnEnemy();
            }
        }

        // Spawn bosses
        this.bossSpawnTimer += deltaTime;
        if (this.bossSpawnTimer >= 15) {
            this.bossSpawnTimer = 0;
            this.spawnBoss();
        }

        this.titanSpawnTimer += deltaTime;
        if (this.titanSpawnTimer >= 45 && this.gameTime > 60) {
            this.titanSpawnTimer = 0;
            this.spawnTitan();
        }

        this.fusionBossSpawnTimer += deltaTime;
        if (this.fusionBossSpawnTimer >= 50 && this.gameTime > 80) {
            this.fusionBossSpawnTimer = 0;
            this.spawnFusionBoss();
        }

        this.twinEliteSpawnTimer += deltaTime;
        if (this.twinEliteSpawnTimer >= 120 && this.gameTime > 40) {
            this.twinEliteSpawnTimer = 0;
            this.spawnTwinElite();
        }

        this.devourerSpawnTimer += deltaTime;
        if (this.devourerSpawnTimer >= 160 && this.gameTime > 50) {
            this.devourerSpawnTimer = 0;
            this.spawnDevourerElite();
        }

        this.enemies.forEach(enemy => enemy.update(deltaTime));
        this.projectiles.forEach(p => p.update(deltaTime));

        this.checkCollisions();
        this.checkCollections();

        this.enemies = this.enemies.filter(e => !e.isDead);
        this.projectiles = this.projectiles.filter(p => !p.isDead);
        this.pickups = this.pickups.filter(p => !p.isDead);

        this.particles.forEach(p => p.update(deltaTime));
        this.particles = this.particles.filter(p => !p.isDead);

        this.floatingTexts.forEach(t => t.update(deltaTime));
        this.floatingTexts = this.floatingTexts.filter(t => !t.isDead);

        this.pets.forEach(p => p.update(deltaTime));
        this.pets = this.pets.filter(p => !p.isDead);

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
    }

    public handleEnemyDeath(enemy: Enemy): void {
        const hpMult = 1 + (Math.floor(this.gameTime / 30) * 0.5);

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

        this.pickups.push(new Pickup(enemy.x, enemy.y, 1));

        if (enemy instanceof Boss || enemy instanceof TitanEnemy || enemy instanceof FusionBoss) {
            this.pause();
            this.eliteRewardSystem.show();

            let deathMsg = "精英强化！三选一";
            if (enemy instanceof Boss) deathMsg = "Boss 陨落！强化三选一";
            else if (enemy instanceof TitanEnemy) deathMsg = "泰坦 陨落！强化三选一";
            else if (enemy instanceof FusionBoss) deathMsg = "融合体 陨落！强化三选一";

            this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 60, deathMsg, '#FFD700'));
        } else if (enemy instanceof TwinElite) {
            const twin = enemy as TwinElite;
            const siblingAlive = twin.sibling && !twin.sibling.isDead;
            if (!siblingAlive) {
                this.pause();
                this.eliteRewardSystem.show();
                this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 60, `双子陨落！强化三选一`, '#FF4500'));
            } else {
                this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 60, `一个双子逃走了！`, '#FF69B4'));
            }
        } else if (enemy instanceof DevourerElite) {
            this.pause();
            this.eliteRewardSystem.show();
            this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 60, `精英强化！三选一`, '#FF4500'));
        } else {
            const weaponTypes = ['Magic Wand', 'Laser', 'Missile Launcher', 'Shotgun', 'Orbit Shield', 'Bubble Gun', 'Boomerang', 'Splitter Gun', 'Poison Gun', 'Freeze Gun'];
            const dropRand = Math.random();
            if (dropRand < 0.001) {
                this.pickups.push(new LollipopPickup(enemy.x, enemy.y));
            } else if (dropRand < 0.06) {
                const type = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
                this.pickups.push(new WeaponPickup(enemy.x, enemy.y, type));
            } else if (dropRand < 0.08) {
                this.pickups.push(new HealthPickup(enemy.x, enemy.y, 5));
            } else if (dropRand < 0.13) {
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

    public addProjectile(projectile: Projectile): void {
        this.projectiles.push(projectile);
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

    public createExplosion(x: number, y: number, color: string): void {
        if (this.particles.length > 300) return;
        for (let i = 0; i < 8; i++) this.particles.push(new Particle(x, y, color));
    }

    private spawnEnemy(): void {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        const x = this.player.x + Math.cos(angle) * radius;
        const y = this.player.y + Math.sin(angle) * radius;
        const rand = Math.random();
        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.5);
        let newEnemy: Enemy;

        if (this.gameTime > 60) {
            if (rand < 0.10) newEnemy = new TankEnemy(x, y, this.player);
            else if (rand < 0.20) newEnemy = new Charger(x, y, this.player, this);
            else if (rand < 0.30) newEnemy = new Teleporter(x, y, this.player, this);
            else if (rand < 0.40) newEnemy = new Splitter(x, y, this.player);
            else if (rand < 0.50) newEnemy = new SlimeEnemy(x, y, this.player, this, 0);
            else if (rand < 0.60) newEnemy = new SwarmEnemy(x, y, this.player, this);
            else if (rand < 0.70) newEnemy = new Scout(x, y, this.player);
            else if (rand < 0.80) newEnemy = new StarEnemy(x, y, this.player);
            else if (rand < 0.90) newEnemy = new Necromancer(x, y, this.player, this);
            else newEnemy = new Enemy(x, y, this.player);
        } else if (this.gameTime > 30) {
            if (rand < 0.15) newEnemy = new Splitter(x, y, this.player);
            else if (rand < 0.25) newEnemy = new Charger(x, y, this.player, this);
            else if (rand < 0.35) newEnemy = new Teleporter(x, y, this.player, this);
            else if (rand < 0.45) newEnemy = new SlimeEnemy(x, y, this.player, this, 0);
            else if (rand < 0.65) newEnemy = new SwarmEnemy(x, y, this.player, this);
            else if (rand < 0.85) newEnemy = new Scout(x, y, this.player);
            else if (rand < 0.95) newEnemy = new StarEnemy(x, y, this.player);
            else newEnemy = new Enemy(x, y, this.player);
        } else {
            if (rand < 0.3) newEnemy = new Scout(x, y, this.player);
            else if (rand < 0.4) newEnemy = new StarEnemy(x, y, this.player);
            else newEnemy = new Enemy(x, y, this.player);
        }
        newEnemy.hp *= hpMultiplier;
        if ((newEnemy as any).maxHp !== undefined) (newEnemy as any).maxHp = newEnemy.hp;
        this.enemies.push(newEnemy);
    }

    private spawnBoss(): void {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        const x = this.player.x + Math.cos(angle) * radius;
        const y = this.player.y + Math.sin(angle) * radius;
        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.5);
        const boss = new Boss(x, y, this.player);
        boss.hp *= hpMultiplier;
        this.enemies.push(boss);
    }

    private spawnTitan(): void {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        const x = this.player.x + Math.cos(angle) * radius;
        const y = this.player.y + Math.sin(angle) * radius;
        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.5);
        const titan = new TitanEnemy(x, y, this.player);
        titan.hp *= hpMultiplier;
        this.enemies.push(titan);
    }

    private spawnFusionBoss(): void {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        const x = this.player.x + Math.cos(angle) * radius;
        const y = this.player.y + Math.sin(angle) * radius;
        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.5);
        const boss = new FusionBoss(x, y, this.player);
        boss.hp *= hpMultiplier;
        boss.maxHp = boss.hp;
        this.enemies.push(boss);
    }

    private spawnTwinElite(): void {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        const x1 = this.player.x + Math.cos(angle) * radius;
        const y1 = this.player.y + Math.sin(angle) * radius;
        const lightTwin = new TwinElite(x1, y1, this.player, this, 'light');
        const darkTwin = new TwinElite(x1 + 40, y1 + 40, this.player, this, 'dark');
        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.5);
        lightTwin.hp *= hpMultiplier; darkTwin.hp *= hpMultiplier;
        lightTwin.sibling = darkTwin; darkTwin.sibling = lightTwin;
        this.enemies.push(lightTwin, darkTwin);
    }

    private spawnDevourerElite(): void {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        const x = this.player.x + Math.cos(angle) * radius;
        const y = this.player.y + Math.sin(angle) * radius;
        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.5);
        const devourer = new DevourerElite(x, y, this.player, this);
        devourer.hp *= hpMultiplier;
        this.enemies.push(devourer);
    }

    private render(): void {
        this.ctx.fillStyle = '#8ced73';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const camX = this.player.x - this.canvas.width / 2;
        const camY = this.player.y - this.canvas.height / 2;
        this.ctx.save();
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
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.projectiles.forEach(p => p.render(this.ctx));
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
