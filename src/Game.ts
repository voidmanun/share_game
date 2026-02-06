import { Player } from './entities/Player';
import { Input } from './systems/Input';
import { Enemy } from './entities/Enemy';
import { Boss } from './entities/Boss';
import { Scout } from './entities/Scout';
import { Projectile } from './weapons/Projectile';
import { MagicWand } from './weapons/MagicWand';
import { Laser } from './weapons/Laser';
import { Pickup } from './entities/Pickup';
import { Particle } from './entities/Particle';
import { Shop } from './ui/Shop';
import { SoundManager } from './systems/SoundManager';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime: number = 0;

    public readonly WORLD_WIDTH = 4000;
    public readonly WORLD_HEIGHT = 4000;

    private input: Input;
    public soundManager: SoundManager; // Public for weapons
    public player: Player; // Public for Shop access

    private enemies: Enemy[] = [];
    public getEnemies(): Enemy[] { return this.enemies; }
    private projectiles: Projectile[] = [];
    private pickups: Pickup[] = [];
    private particles: Particle[] = [];
    private spawnTimer: number = 0;
    private spawnInterval: number = 1;
    private bossSpawnTimer: number = 0;
    private damageFlashTimer: number = 0;
    public gold: number = 0;

    private shop: Shop;
    private isPaused: boolean = false;
    // private background: HTMLImageElement; // Removed image background

    private stars: { x: number; y: number; size: number; alpha: number }[] = [];

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
        this.input = new Input();
        // Start player in center of the world
        this.player = new Player(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2, this.input, this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Give player a weapon
        this.player.addWeapon(new MagicWand(this, this.player, 0.5, 1));
        this.player.addWeapon(new Laser(this, this.player));

        this.shop = new Shop(this);

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    private resize(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
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
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= deltaTime;
        }

        this.player.update(deltaTime);

        // Spawn enemies
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy();
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
    }

    private checkCollisions(): void {
        for (const projectile of this.projectiles) {
            for (const enemy of this.enemies) {
                const dx = projectile.x - enemy.x;
                const dy = projectile.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < projectile.radius + enemy.radius) {
                    enemy.takeDamage(projectile.damage);
                    projectile.isDead = true;
                    if (enemy.isDead) { // Check if dead after damage
                        this.pickups.push(new Pickup(enemy.x, enemy.y, 10));
                        this.createExplosion(enemy.x, enemy.y, enemy.color);
                        this.soundManager.playExplosionSound();
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

    private gameOver(): void {
        this.pause();
        const gameOverEl = document.getElementById('game-over');
        const scoreEl = document.getElementById('final-score');
        const restartBtn = document.getElementById('restart-btn');

        if (gameOverEl && scoreEl && restartBtn) {
            scoreEl.textContent = this.gold.toString();
            gameOverEl.classList.remove('hidden');

            restartBtn.onclick = () => {
                window.location.reload();
            };
        } else {
            // Fallback
            alert(`Game Over! Gold: ${this.gold}`);
            window.location.reload();
        }
    }

    private checkCollections(): void {
        for (const pickup of this.pickups) {
            const dx = this.player.x - pickup.x;
            const dy = this.player.y - pickup.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Collection radius slightly larger than player
            if (dist < this.player.radius + pickup.radius + 10) {
                this.gold += pickup.value;
                this.soundManager.playPickupSound();
                pickup.isDead = true;
            }
        }
    }

    public addProjectile(projectile: Projectile): void {
        this.projectiles.push(projectile);
    }

    public addPickup(pickup: Pickup): void {
        this.pickups.push(pickup);
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

        // 30% Chance for Scout
        if (Math.random() < 0.3) {
            this.enemies.push(new Scout(x, y, this.player));
        } else {
            this.enemies.push(new Enemy(x, y, this.player));
        }
    }

    private spawnBoss(): void {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        const x = this.player.x + Math.cos(angle) * radius;
        const y = this.player.y + Math.sin(angle) * radius;

        console.log("Spawning Boss!");
        this.enemies.push(new Boss(x, y, this.player));
    }

    private render(): void {
        // Clear screen
        this.ctx.fillStyle = '#1a1a1a';
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
        this.player.render(this.ctx);

        this.ctx.restore();

        // Damage Flash
        if (this.damageFlashTimer > 0) {
            this.ctx.fillStyle = `rgba(255, 0, 0, ${this.damageFlashTimer * 2})`; // Fade out
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Debug info (Top Right)
        const debugX = this.canvas.width - 10;
        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`FPS: ${Math.round(1 / ((performance.now() - this.lastTime * 1000) / 1000) || 60)}`, debugX, 20);
        this.ctx.fillText(`Pos: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, debugX, 40);
        this.ctx.fillText(`Enemies: ${this.enemies.length}`, debugX, 60);
        // this.ctx.fillText(`Gold: ${this.gold}`, debugX, 80); // Redundant, shown in HUD
        this.ctx.textAlign = 'left'; // Reset alignment

        // Update HUD HTML
        const goldEl = document.getElementById('gold');
        if (goldEl) goldEl.innerText = this.gold.toString();

        const hpEl = document.getElementById('hp');
        if (hpEl) hpEl.innerText = Math.max(0, this.player.hp).toString();
    }

    private drawGrid(camX: number, camY: number): void {
        // Draw Stars
        this.ctx.fillStyle = '#000000'; // Space Black
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Clear with black (already done in render but strictly ensures no trail)

        this.ctx.save();
        // Stars are in world space, so we translate them by camera
        // Note: drawGrid is called AFTER translate(-camX, -camY) in render()
        // So we just draw them at their world coordinates.
        // Optimization: Only draw visible stars

        const viewX = camX;
        const viewY = camY;
        const viewW = this.canvas.width;
        const viewH = this.canvas.height;

        this.ctx.fillStyle = 'white';
        for (const star of this.stars) {
            // Simple culling
            if (star.x >= viewX && star.x <= viewX + viewW &&
                star.y >= viewY && star.y <= viewY + viewH) {

                this.ctx.globalAlpha = star.alpha;
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.restore();     // Draw World Border
        this.ctx.save();
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.ctx.restore();
    }
}
