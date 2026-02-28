import { Player } from './entities/Player';
import { Input } from './systems/Input';
import { Enemy } from './entities/Enemy';
import { Boss } from './entities/Boss';
import { Scout } from './entities/Scout';
import { TankEnemy } from './entities/TankEnemy';
import { SwarmEnemy } from './entities/SwarmEnemy';
import { Charger } from './entities/Charger';
import { Splitter } from './entities/Splitter';
import { Teleporter } from './entities/Teleporter';
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
import { BubbleProjectile } from './weapons/BubbleProjectile';
import { FloatingText } from './entities/FloatingText';
import { LollipopPickup } from './entities/LollipopPickup';
import { PetEggPickup } from './entities/PetEggPickup';
import { Pet } from './entities/Pet';
import { GreedyDog } from './entities/GreedyDog';
import { MagicFairy } from './entities/MagicFairy';
import { SpeedyTurtle } from './entities/SpeedyTurtle';
import { GrumpyPorcupine } from './entities/GrumpyPorcupine';

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
    public getEnemies(): Enemy[] { return this.enemies; }
    private projectiles: Projectile[] = [];
    private pickups: (Pickup | WeaponPickup | HealthPickup | LollipopPickup | PetEggPickup)[] = [];
    public particles: Particle[] = [];
    private floatingTexts: FloatingText[] = [];
    public pets: Pet[] = [];
    private spawnTimer: number = 0;
    private spawnInterval: number = 1.2; // Start slightly slower
    private bossSpawnTimer: number = 0;
    private damageFlashTimer: number = 0;
    public gold: number = 0;
    public gameTime: number = 0; // In seconds

    public shop!: Shop;
    private isPaused: boolean = false;
    // private background: HTMLImageElement; // Removed image background

    private stars: { x: number; y: number; size: number; alpha: number }[] = [];

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
        this.damageFlashTimer = 0;
        this.gold = 0;
        this.gameTime = 0;
        this.isPaused = false;

        this.input = new Input();
        this.player = new Player(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2, this.input, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.player.addWeapon(new MagicWand(this, this.player));

        const rand = Math.random();
        if (rand < 0.25) {
            this.pets.push(new GreedyDog(this.player, this));
        } else if (rand < 0.5) {
            this.pets.push(new MagicFairy(this.player, this));
        } else if (rand < 0.75) {
            this.pets.push(new SpeedyTurtle(this.player, this));
        } else {
            this.pets.push(new GrumpyPorcupine(this.player, this));
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

        this.ctx = ctx;

        this.weaponStatsEl = document.getElementById('weapon-stats');
        this.enemyStatsEl = document.getElementById('enemy-stats');

        // Generate Stars
        for (let i = 0; i < 2000; i++) {
            this.stars.push({
                x: Math.random() * this.WORLD_WIDTH,
                y: Math.random() * this.WORLD_HEIGHT,
                size: Math.random() * 2,
                alpha: Math.random()
            });
        }

        // this.background = new Image();
        // this.background.src = '/assets/background.png';

        this.soundManager = new SoundManager();

        this.shop = new Shop(this);
        this.initializeGame();

        this.resize();
        window.addEventListener('resize', () => this.resize());
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
                    <span class="stat-label">${w.name} Lv${w.level}:</span>
                    <span class="stat-value">${w.damage.toFixed(1)} DMG</span>
                </div>
            `;
        });
        if (weaponHTML === '') weaponHTML = '<div class="stat-row"><span class="stat-label">None</span></div>';
        this.weaponStatsEl.innerHTML = weaponHTML;

        // 2. Update Enemy Stats
        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.5);

        const enemyData = [
            { name: "Basic", hp: 3, dmg: 1 },
            { name: "Scout", hp: 2, dmg: 1 },
            { name: "Swarm", hp: 1, dmg: 1 },
            { name: "Tank", hp: 15, dmg: 2 },
            { name: "Splitter", hp: 4, dmg: 1 },
            { name: "Charger", hp: 5, dmg: 2 },
            { name: "Teleporter", hp: 2, dmg: 1 },
            { name: "Boss", hp: 10, dmg: 3 }
        ];

        let enemyHTML = '';
        enemyData.forEach(e => {
            const currentHP = (e.hp * hpMultiplier).toFixed(1);
            enemyHTML += `
                <div class="stat-row">
                    <span class="stat-label">${e.name}:</span>
                    <span class="stat-value">${currentHP} HP | ${e.dmg} ATK</span>
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

        // Difficulty scaling: decrease spawn interval over time (min 0.2s)
        this.spawnInterval = Math.max(0.2, 1.2 * Math.pow(0.9, Math.floor(this.gameTime / 30)));

        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= deltaTime;
        }

        this.player.update(deltaTime);

        // Spawn enemies
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            // Spawn 1 extra enemy every 60 seconds linearly scaling
            const spawnCount = 1 + Math.floor(this.gameTime / 60);
            for (let i = 0; i < spawnCount; i++) {
                this.spawnEnemy();
            }
        }

        // Spawn boss
        this.bossSpawnTimer += deltaTime;
        if (this.bossSpawnTimer >= 15) {
            this.bossSpawnTimer = 0;
            this.spawnBoss();
        }

        // Update enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime));

        // Update projectiles
        this.projectiles.forEach(p => p.update(deltaTime));

        // Collision Detection
        this.checkCollisions();

        // Check Collections
        this.checkCollections();

        // Cleanup dead entities
        this.enemies = this.enemies.filter(e => !e.isDead);
        this.projectiles = this.projectiles.filter(p => !p.isDead);
        this.pickups = this.pickups.filter(p => !p.isDead);

        // Update particles
        this.particles.forEach(p => p.update(deltaTime));
        this.particles = this.particles.filter(p => !p.isDead);

        // Update floating texts
        this.floatingTexts.forEach(t => t.update(deltaTime));
        this.floatingTexts = this.floatingTexts.filter(t => !t.isDead);

        // Update pets
        this.pets.forEach(p => p.update(deltaTime));

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

    private checkCollisions(): void {
        for (const projectile of this.projectiles) {
            for (const enemy of this.enemies) {
                const dx = projectile.x - enemy.x;
                const dy = projectile.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < projectile.radius + enemy.radius) {
                    if (projectile instanceof BubbleProjectile) {
                        // Bubble logic: trap enemy instead of raw damage
                        if (!enemy.trappedInBubble && !(enemy instanceof Boss)) {
                            enemy.trappedInBubble = true;
                            projectile.isDead = true;
                            this.soundManager.playExplosionSound(); // maybe a soft pop sound ideally
                        } else {
                            // Bosses are immune to bubbles, just pop bubble
                            projectile.isDead = true;
                        }
                    } else {
                        enemy.takeDamage(projectile.damage);
                        projectile.isDead = true;
                        if (enemy.isDead) { // Check if dead after damage
                            if (enemy instanceof Splitter && !enemy.isSplitterling) {
                                const hpMult = 1 + (Math.floor(this.gameTime / 30) * 0.5);
                                const s1 = new Splitter(enemy.x - 10, enemy.y, this.player, true);
                                const s2 = new Splitter(enemy.x + 10, enemy.y, this.player, true);
                                s1.hp *= hpMult;
                                s2.hp *= hpMult;
                                this.enemies.push(s1, s2);
                            }

                            this.pickups.push(new Pickup(enemy.x, enemy.y, 1));

                            // Boss drops are always the newer, rarer weapons
                            const weaponTypes = ['Magic Wand', 'Laser', 'Missile Launcher', 'Shotgun', 'Orbit Shield', 'Bubble Gun'];
                            const bossWeaponTypes = ['Missile Launcher', 'Shotgun', 'Orbit Shield', 'Bubble Gun'];

                            if (enemy instanceof Boss) {
                                const type = bossWeaponTypes[Math.floor(Math.random() * bossWeaponTypes.length)];
                                this.pickups.push(new WeaponPickup(enemy.x, enemy.y, type));
                            } else {
                                // 5% chance for weapon, 2% chance for health, 1% for Lollipop
                                const dropRand = Math.random();
                                if (dropRand < 0.01) {
                                    this.pickups.push(new LollipopPickup(enemy.x, enemy.y));
                                } else if (dropRand < 0.06) {
                                    const type = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
                                    this.pickups.push(new WeaponPickup(enemy.x, enemy.y, type));
                                } else if (dropRand < 0.08) {
                                    this.pickups.push(new HealthPickup(enemy.x, enemy.y, 5)); // Heals 5 HP
                                }
                            }

                            this.createExplosion(enemy.x, enemy.y, enemy.color);
                            this.soundManager.playExplosionSound();
                        }
                    }
                    break;
                }
            }
        }

        // Enemy touches Player
        for (const enemy of this.enemies) {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.player.radius + enemy.radius) {
                if (this.player.isInvincible) {
                    // Invincible player instantly destroys enemy on touch
                    enemy.takeDamage(9999);
                    this.createExplosion(enemy.x, enemy.y, enemy.color);
                    this.soundManager.playExplosionSound();

                    // Simple pickup logic for instakill
                    this.pickups.push(new Pickup(enemy.x, enemy.y, 1));
                } else {
                    this.player.takeDamage(enemy.damage);
                    this.soundManager.playPlayerHitSound();
                    this.damageFlashTimer = 0.2; // Flash for 0.2s

                    // Push enemy back to avoid instant death
                    const angle = Math.atan2(dy, dx);
                    enemy.x -= Math.cos(angle) * 50;
                    enemy.y -= Math.sin(angle) * 50;

                    if (this.player.isDead) {
                        this.gameOver();
                    }
                }
            }
        }
    }

    private gameOver(): void {
        this.pause();
        const gameOverEl = document.getElementById('game-over');
        const scoreEl = document.getElementById('final-score');
        const restartBtn = document.getElementById('restart-btn');

        if (gameOverEl && scoreEl && restartBtn) {
            scoreEl.textContent = this.gold.toString();
            gameOverEl.classList.remove('hidden');

            restartBtn.onclick = () => {
                this.initializeGame();
                this.resume();
            };
            restartBtn.ontouchstart = (e) => {
                e.preventDefault();
                this.initializeGame();
                this.resume();
            };
        } else {
            // Fallback
            alert(`Game Over! Gold: ${this.gold}`);
            this.initializeGame();
            this.resume();
        }
    }

    private checkCollections(): void {
        for (const pickup of this.pickups) {
            let collected = false;
            
            // Check player collision
            const dx = this.player.x - pickup.x;
            const dy = this.player.y - pickup.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Collection radius slightly larger than player
            if (dist < this.player.radius + pickup.radius + 10) {
                collected = true;
            } else {
                // Check GreedyDog collision
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
                    this.soundManager.playPickupSound(); // using same sound for now
                } else if (pickup instanceof HealthPickup) {
                    const healed = this.player.heal(pickup.healAmount);
                    if (healed > 0) {
                        this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 20, `+${healed} HP`, '#00FF00'));
                    } else {
                        this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 20, `MAX HP`, '#00FF00'));
                    }
                    this.soundManager.playPickupSound(); // Reusing coin sound for now
                } else if (pickup instanceof LollipopPickup) {
                    this.player.becomeInvincible(10); // 10 seconds of invincibility
                    this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `INVINCIBLE!`, '#FF00FF'));
                    this.soundManager.playPickupSound();
                } else if (pickup instanceof PetEggPickup) {
                    // Hatch a pet
                    const rand = Math.random();
                    if (rand < 0.25) {
                        this.pets.push(new GreedyDog(this.player, this));
                        this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `Greedy Dog Hatched!`, '#8B4513'));
                    } else if (rand < 0.5) {
                        this.pets.push(new MagicFairy(this.player, this));
                        this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `Magic Fairy Hatched!`, '#FFB6C1'));
                    } else if (rand < 0.75) {
                        this.pets.push(new SpeedyTurtle(this.player, this));
                        this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `Speedy Turtle Hatched!`, '#2E8B57'));
                    } else {
                        this.pets.push(new GrumpyPorcupine(this.player, this));
                        this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `Grumpy Porcupine Hatched!`, '#A0522D'));
                    }
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
            console.log(`Picked up new weapon: ${type}`);
        }
    }

    public addProjectile(projectile: Projectile): void {
        this.projectiles.push(projectile);
    }

    public addPickup(pickup: Pickup | WeaponPickup | HealthPickup | LollipopPickup | PetEggPickup): void {
        this.pickups.push(pickup);
    }

    public getPickups(): (Pickup | WeaponPickup | HealthPickup | LollipopPickup | PetEggPickup)[] {
        return this.pickups;
    }

    public getNearestEnemy(x: number, y: number): Enemy | null {
        let nearest: Enemy | null = null;
        let minDist = Infinity;

        for (const enemy of this.enemies) {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        }
        return nearest;
    }

    public createExplosion(x: number, y: number, color: string): void {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    private spawnEnemy(): void {
        // Spawn distance: outside of screen
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        const x = this.player.x + Math.cos(angle) * radius;
        const y = this.player.y + Math.sin(angle) * radius;

        // Dynamic spawn pool based on gameTime
        const rand = Math.random();

        // High HP scaling: +50% HP per 30 seconds
        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.5);
        let newEnemy: Enemy;

        if (this.gameTime > 60) {
            // 60s+: Tank(10%), Charger(10%), Teleporter(15%), Splitter(15%), Swarm(20%), Scout(10%), Basic(20%)
            if (rand < 0.10) {
                newEnemy = new TankEnemy(x, y, this.player);
            } else if (rand < 0.20) {
                newEnemy = new Charger(x, y, this.player, this);
            } else if (rand < 0.35) {
                newEnemy = new Teleporter(x, y, this.player, this);
            } else if (rand < 0.50) {
                newEnemy = new Splitter(x, y, this.player);
            } else if (rand < 0.70) {
                newEnemy = new SwarmEnemy(x, y, this.player, this);
            } else if (rand < 0.80) {
                newEnemy = new Scout(x, y, this.player);
            } else {
                newEnemy = new Enemy(x, y, this.player);
            }
        } else if (this.gameTime > 30) {
            // 30s-60s: Splitter(15%), Charger(10%), Teleporter(10%), Swarm(20%), Scout(20%), Basic(25%)
            if (rand < 0.15) {
                newEnemy = new Splitter(x, y, this.player);
            } else if (rand < 0.25) {
                newEnemy = new Charger(x, y, this.player, this);
            } else if (rand < 0.35) {
                newEnemy = new Teleporter(x, y, this.player, this);
            } else if (rand < 0.55) {
                newEnemy = new SwarmEnemy(x, y, this.player, this);
            } else if (rand < 0.75) {
                newEnemy = new Scout(x, y, this.player);
            } else {
                newEnemy = new Enemy(x, y, this.player);
            }
        } else {
            // 0-30s: Scout (30%), Basic (70%)
            if (rand < 0.3) {
                newEnemy = new Scout(x, y, this.player);
            } else {
                newEnemy = new Enemy(x, y, this.player);
            }
        }

        // Apply HP multiplier
        newEnemy.hp *= hpMultiplier;
        this.enemies.push(newEnemy);
    }

    private spawnBoss(): void {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        const x = this.player.x + Math.cos(angle) * radius;
        const y = this.player.y + Math.sin(angle) * radius;

        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.5);
        console.log(`Spawning Boss with HP Multiplier: ${hpMultiplier}`);
        const boss = new Boss(x, y, this.player);
        boss.hp *= hpMultiplier;
        this.enemies.push(boss);
    }

    private render(): void {
        // Clear screen with cartoon grass green
        this.ctx.fillStyle = '#8ced73';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Camera follow logic
        const camX = this.player.x - this.canvas.width / 2;
        const camY = this.player.y - this.canvas.height / 2;

        this.ctx.save();
        this.ctx.translate(-camX, -camY);

        // Render Grid
        this.drawGrid(camX, camY);

        // Render pickups
        this.pickups.forEach(p => p.render(this.ctx));

        // Render enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));

        // Render projectiles
        this.projectiles.forEach(p => p.render(this.ctx));

        // Render particles
        this.particles.forEach(p => p.render(this.ctx));

        // Render game objects
        this.pets.forEach(p => p.render(this.ctx));
        this.player.render(this.ctx);

        // Render floating texts on top
        this.floatingTexts.forEach(t => t.render(this.ctx));

        this.ctx.restore();

        // Damage Flash
        if (this.damageFlashTimer > 0) {
            this.ctx.fillStyle = `rgba(255, 0, 0, ${this.damageFlashTimer * 2})`; // Fade out
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Debug info (Top Right)
        const debugX = this.canvas.width - 20;
        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 4;
        this.ctx.font = '18px "Fredoka One", cursive, monospace';

        let displayMin = Math.floor(this.gameTime / 60);
        let displaySec = Math.floor(this.gameTime % 60);
        let timeString = `${displayMin.toString().padStart(2, '0')}:${displaySec.toString().padStart(2, '0')}`;

        this.ctx.strokeText(`Time: ${timeString}`, debugX, 30);
        this.ctx.fillText(`Time: ${timeString}`, debugX, 30);
        this.ctx.strokeText(`Pos: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, debugX, 55);
        this.ctx.fillText(`Pos: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, debugX, 55);
        this.ctx.strokeText(`Enemies: ${this.enemies.length}`, debugX, 80);
        this.ctx.fillText(`Enemies: ${this.enemies.length}`, debugX, 80);
        // this.ctx.fillText(`Gold: ${this.gold}`, debugX, 100); // Redundant, shown in HUD
        this.ctx.textAlign = 'left'; // Reset alignment
    }

    private drawGrid(camX: number, camY: number): void {
        this.ctx.save();
        // Draw grass patches instead of stars
        const viewX = camX;
        const viewY = camY;
        const viewW = this.canvas.width;
        const viewH = this.canvas.height;

        this.ctx.fillStyle = '#65c44f'; // Darker green for grass details
        for (const star of this.stars) {
            // Simple culling
            if (star.x >= viewX && star.x <= viewX + viewW &&
                star.y >= viewY && star.y <= viewY + viewH) {

                this.ctx.globalAlpha = star.alpha * 0.5 + 0.5; // More visible
                this.ctx.beginPath();
                this.ctx.ellipse(star.x, star.y, star.size * 3, star.size * 1.5, 0, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.restore();

        // Draw World Border
        this.ctx.save();
        this.ctx.strokeStyle = '#52993d'; // Dark green cartoon border
        this.ctx.lineWidth = 15; // Thick border
        this.ctx.strokeRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.ctx.restore();
    }
}
