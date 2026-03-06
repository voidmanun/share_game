import { Entity } from './Entity';
import { Game } from '../Game';

export class PetProjectile extends Entity {
    private vx: number;
    private vy: number;
    private damage: number;
    private owner: string;
    private lifetime: number = 3; // 3 seconds lifetime

    constructor(x: number, y: number, targetX: number, targetY: number, damage: number, owner: string, _game: Game, color: string = '#FFD700') {
        super(x, y, 5, color);
        this.damage = damage;
        this.owner = owner;

        // Calculate direction to target
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 300;

        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
    }

    public update(deltaTime: number): void {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.lifetime -= deltaTime;

        if (this.lifetime <= 0) {
            this.isDead = true;
        }
    }

    public getDamage(): number {
        return this.damage;
    }

    public getOwner(): string {
        return this.owner;
    }
}