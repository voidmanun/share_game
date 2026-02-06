import { Entity } from './Entity';

export class Particle extends Entity {
    private vx: number;
    private vy: number;
    private life: number = 0.5; // Seconds
    private initialLife: number = 0.5;

    constructor(x: number, y: number, color: string) {
        super(x, y, 3, color); // Small particles

        // Random velocity
        const speed = Math.random() * 200 + 50;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    public update(deltaTime: number): void {
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.isDead = true;
        }

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.globalAlpha = this.life / this.initialLife;
        ctx.fillStyle = this.color;

        // Draw small square
        const size = this.radius * 2;
        ctx.fillRect(this.x - this.radius, this.y - this.radius, size, size);

        ctx.restore();
    }
}
