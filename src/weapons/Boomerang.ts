import { Weapon } from './Weapon';
import { Game } from '../Game';
import { Player } from '../entities/Player';
import { Entity } from '../entities/Entity';
import { Enemy } from '../entities/Enemy';

class BoomerangProjectile extends Entity {
    public velocityX: number;
    public velocityY: number;
    public damage: number;
    public lifeTimer: number = 0;
    public maxLife: number = 2.5; // Seconds
    private initialSpeed: number;
    private owner: Player;
    public rotation: number = 0;
    public hasHitEnemy: Set<Enemy> = new Set();
    private returning: boolean = false;

    constructor(x: number, y: number, vx: number, vy: number, damage: number, owner: Player) {
        super(x, y, 12, '#8B4513'); // SaddleBrown
        this.velocityX = vx;
        this.velocityY = vy;
        this.damage = damage;
        this.owner = owner;
        this.initialSpeed = Math.sqrt(vx * vx + vy * vy);
    }

    public update(deltaTime: number): void {
        this.lifeTimer += deltaTime;
        
        // Flight phase: 0 to 40% outward, 40% to 100% return to player
        const phase = this.lifeTimer / this.maxLife;
        
        if (phase < 0.4) {
            // Slow down going out
            const speedMult = Math.max(0, 1 - (phase / 0.4));
            this.x += this.velocityX * speedMult * deltaTime;
            this.y += this.velocityY * speedMult * deltaTime;
        } else {
            if (!this.returning) {
                this.returning = true;
                this.hasHitEnemy.clear(); // Can hit again on the way back
            }
            
            // Accelerate back towards player
            const dx = this.owner.x - this.x;
            const dy = this.owner.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 20) {
                // Homing return
                const returnSpeed = this.initialSpeed * ((phase - 0.4) / 0.6) * 1.5;
                this.x += (dx / dist) * returnSpeed * deltaTime;
                this.y += (dy / dist) * returnSpeed * deltaTime;
            } else if (phase > 0.5) {
                // Caught by player
                this.isDead = true;
            }
        }

        // Spin
        this.rotation += Math.PI * 8 * deltaTime; // 4 rotations per sec

        if (this.lifeTimer >= this.maxLife) {
            this.isDead = true;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw V-shaped boomerang
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(12, 12);
        ctx.quadraticCurveTo(15, 0, 12, -12);
        ctx.lineTo(0, 0);
        
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#5c2e0b';
        ctx.stroke();

        ctx.restore();
    }
}

export class Boomerang extends Weapon {
    public name = 'Boomerang';
    private activeBoomerangs: BoomerangProjectile[] = [];
    private speed: number = 700;

    constructor(game: Game, owner: Player) {
        super(game, owner, 1.5, 15); // 1.5s fire rate, 15 damage
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        // Update active boomerangs
        for (let i = this.activeBoomerangs.length - 1; i >= 0; i--) {
            const b = this.activeBoomerangs[i];
            b.update(deltaTime);
            
            // Check collisions
            const enemies = this.game.getEnemies();
            for (const enemy of enemies) {
                if (b.hasHitEnemy.has(enemy)) continue;

                const dx = enemy.x - b.x;
                const dy = enemy.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < enemy.radius + b.radius) {
                    enemy.takeDamage(this.damage);
                    b.hasHitEnemy.add(enemy); // Pierce through, only hit once per direction
                    // Small particle effect
                    this.game.createExplosion(enemy.x, enemy.y, '#8B4513');
                    
                    if (enemy.isDead) {
                        this.game.handleEnemyDeath(enemy);
                    }
                }
            }

            if (b.isDead) {
                this.activeBoomerangs.splice(i, 1);
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        for (const b of this.activeBoomerangs) {
            b.render(ctx);
        }
    }

    protected fire(): void {
        const target = this.game.getNearestEnemy(this.owner.x, this.owner.y);
        let vx = 0;
        let vy = -this.speed;

        if (target) {
            const dx = target.x - this.owner.x;
            const dy = target.y - this.owner.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            vx = (dx / distance) * this.speed;
            vy = (dy / distance) * this.speed;
        }

        // Add boomerang based on weapon level (more boomerangs at higher levels?)
        // For level 1, just 1. Let's make it shoot 1 normally, level up increases damage
        // But let's add a slight spread for higher levels: 
        const numProjectiles = Math.min(3, 1 + Math.floor(this.level / 3)); 
        
        for (let i = 0; i < numProjectiles; i++) {
            // angle spread if multiple
            let angle = Math.atan2(vy, vx);
            if (numProjectiles > 1) {
                angle += (i - (numProjectiles - 1) / 2) * 0.2;
            }
            const finalVx = Math.cos(angle) * this.speed;
            const finalVy = Math.sin(angle) * this.speed;

            this.activeBoomerangs.push(new BoomerangProjectile(
                this.owner.x, 
                this.owner.y, 
                finalVx, 
                finalVy, 
                this.damage, 
                this.owner
            ));
        }
        
        this.game.soundManager.playShootSound();
    }
}
