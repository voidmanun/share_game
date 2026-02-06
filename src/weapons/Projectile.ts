import { Entity } from '../entities/Entity';

export class Projectile extends Entity {
    public velocityX: number;
    public velocityY: number;
    public damage: number;
    public lifeTimer: number = 0;
    public maxLife: number = 2; // Seconds

    constructor(x: number, y: number, vx: number, vy: number, damage: number) {
        super(x, y, 5, '#FFA500'); // Orange
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

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        // Draw Ellipse (stretch in direction of movement)
        const angle = Math.atan2(this.velocityY, this.velocityX);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2); // RadiusX 10, RadiusY 5
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
        ctx.closePath();
    }
}
