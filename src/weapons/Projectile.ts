import { Entity } from '../entities/Entity';

export class Projectile extends Entity {
    public velocityX: number;
    public velocityY: number;
    public damage: number;
    public lifeTimer: number = 0;
    public maxLife: number = 2; // Seconds

    constructor(x: number, y: number, vx: number, vy: number, damage: number) {
        super(x, y, 5, '#FFFF00'); // Yellow dot
        this.velocityX = vx;
        this.velocityY = vy;
        this.damage = damage;
    }

    public update(deltaTime: number): void {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        this.lifeTimer += deltaTime;
        if (this.lifeTimer >= this.maxLife) {
            this.isDead = true;
        }
    }
}
