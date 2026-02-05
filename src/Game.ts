import { Player } from './entities/Player';
import { Input } from './systems/Input';
import { Enemy } from './entities/Enemy';
import { Projectile } from './weapons/Projectile';
import { MagicWand } from './weapons/MagicWand';
import { Pickup } from './entities/Pickup';
import { Shop } from './ui/Shop';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime: number = 0;

    private input: Input;
    public player: Player; // Public for Shop access
    private enemies: Enemy[] = [];
    private projectiles: Projectile[] = [];
    private pickups: Pickup[] = [];
    private spawnTimer: number = 0;
    private spawnInterval: number = 1;
    public gold: number = 0;

    private shop: Shop;
    private isPaused: boolean = false;

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

        this.input = new Input();
        this.player = new Player(window.innerWidth / 2, window.innerHeight / 2, this.input);

        // Give player a weapon
        this.player.addWeapon(new MagicWand(this, this.player, 0.5, 1));

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
        this.player.update(deltaTime);

        // Spawn enemies
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy();
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
                this.player.takeDamage(1);
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
        alert(`Game Over! Gold: ${this.gold}`);
        window.location.reload();
    }

    private checkCollections(): void {
        for (const pickup of this.pickups) {
            const dx = this.player.x - pickup.x;
            const dy = this.player.y - pickup.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Collection radius slightly larger than player
            if (dist < this.player.radius + pickup.radius + 10) {
                this.gold += pickup.value;
                pickup.isDead = true;
            }
        }
    }

    public addProjectile(projectile: Projectile): void {
        this.projectiles.push(projectile);
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

    private spawnEnemy(): void {
        // Spawn distance: outside of screen
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        const x = this.player.x + Math.cos(angle) * radius;
        const y = this.player.y + Math.sin(angle) * radius;

        this.enemies.push(new Enemy(x, y, this.player));
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

        // Render game objects
        this.player.render(this.ctx);

        this.ctx.restore();

        // Debug info
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`FPS: ${Math.round(1 / ((performance.now() - this.lastTime * 1000) / 1000) || 60)}`, 10, 20);
        this.ctx.fillText(`Pos: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, 10, 40);
        this.ctx.fillText(`Enemies: ${this.enemies.length}`, 10, 60);
        this.ctx.fillText(`Gold: ${this.gold}`, 10, 80);
    }

    private drawGrid(camX: number, camY: number): void {
        const gridSize = 100;
        const startX = Math.floor(camX / gridSize) * gridSize;
        const startY = Math.floor(camY / gridSize) * gridSize;
        const endX = camX + this.canvas.width;
        const endY = camY + this.canvas.height;

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
        }

        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
        }

        this.ctx.stroke();
    }
}
