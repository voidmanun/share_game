import { Entity } from './Entity';
import { Game } from '../Game';
import { Enemy } from './Enemy';
import { Player } from './Player';

export type ProjectileType = 'normal' | 'piercing' | 'homing' | 'bouncing' | 'crit';

export class PetProjectile extends Entity {
    private vx: number;
    private vy: number;
    private damage: number;
    private owner: string;
    private lifetime: number = 3;
    private game: Game;
    
    public projectileType: ProjectileType = 'normal';
    public penetration: number = 1;
    public bounceCount: number = 0;
    public maxBounces: number = 0;
    public isHoming: boolean = false;
    public homingStrength: number = 0;
    public hitEnemies: Set<Enemy> = new Set();
    public isCrit: boolean = false;
    public speedBoostDuration: number = 0;
    
    constructor(
        x: number, 
        y: number, 
        targetX: number, 
        targetY: number, 
        damage: number, 
        owner: string, 
        game: Game, 
        color: string = '#FFD700',
        type: ProjectileType = 'normal'
    ) {
        super(x, y, 5, color);
        this.damage = damage;
        this.owner = owner;
        this.game = game;
        this.projectileType = type;
        
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = type === 'piercing' ? 400 : 300;
        
        this.vx = dist > 0 ? (dx / dist) * speed : speed;
        this.vy = dist > 0 ? (dy / dist) * speed : 0;
        
        if (type === 'piercing') {
            this.penetration = 3;
        } else if (type === 'bouncing') {
            this.maxBounces = 2;
            this.bounceCount = 0;
        } else if (type === 'homing') {
            this.isHoming = true;
            this.homingStrength = 3;
        } else if (type === 'crit') {
            this.isCrit = Math.random() < 0.2;
            if (this.isCrit) {
                this.damage *= 2;
                this.color = '#FFD700';
                this.radius = 8;
            }
        }
    }

    public update(deltaTime: number): void {
        if (this.isHoming) {
            const target = this.game.getNearestEnemy(this.x, this.y);
            if (target) {
                const dx = target.x - this.x;
                const dy = target.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    const targetVx = (dx / dist) * 300;
                    const targetVy = (dy / dist) * 300;
                    this.vx += (targetVx - this.vx) * this.homingStrength * deltaTime;
                    this.vy += (targetVy - this.vy) * this.homingStrength * deltaTime;
                    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    if (currentSpeed > 300) {
                        this.vx = (this.vx / currentSpeed) * 300;
                        this.vy = (this.vy / currentSpeed) * 300;
                    }
                }
            }
        }
        
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.lifetime -= deltaTime;

        if (this.lifetime <= 0) {
            this.isDead = true;
        }
    }
    
    public onHitEnemy(enemy: Enemy): void {
        if (this.hitEnemies.has(enemy)) return;
        
        enemy.takeDamage(this.damage);
        this.hitEnemies.add(enemy);
        
        if (this.projectileType === 'piercing') {
            this.penetration--;
            if (this.penetration <= 0) {
                this.isDead = true;
            }
        } else if (this.projectileType === 'bouncing') {
            this.damage *= 0.8;
        } else {
            this.isDead = true;
        }
    }
    
    public onHitWall(canvasWidth: number, canvasHeight: number): void {
        if (this.projectileType === 'bouncing' && this.bounceCount < this.maxBounces) {
            if (this.x <= this.radius || this.x >= canvasWidth - this.radius) {
                this.vx *= -1;
                this.bounceCount++;
            }
            if (this.y <= this.radius || this.y >= canvasHeight - this.radius) {
                this.vy *= -1;
                this.bounceCount++;
            }
        } else if (this.x < -50 || this.x > canvasWidth + 50 || 
                   this.y < -50 || this.y > canvasHeight + 50) {
            this.isDead = true;
        }
    }
    
    public onHitPlayer(player: Player): void {
        if (this.speedBoostDuration > 0) {
            player.speedMultiplier = Math.min(player.speedMultiplier + 0.2, 2.0);
            setTimeout(() => {
                player.speedMultiplier = Math.max(player.speedMultiplier - 0.2, 1.0);
            }, this.speedBoostDuration * 1000);
        }
    }

    public getDamage(): number {
        return this.damage;
    }

    public getOwner(): string {
        return this.owner;
    }
    
    public canPenetrate(): boolean {
        return this.penetration > 0;
    }
}