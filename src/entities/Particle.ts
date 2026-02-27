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
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // A simple star or diamond shape for a cartoon "POW" spark effect
        ctx.beginPath();
        ctx.moveTo(0, -this.radius * 2);
        ctx.lineTo(this.radius, -this.radius);
        ctx.lineTo(this.radius * 2, 0);
        ctx.lineTo(this.radius, this.radius);
        ctx.lineTo(0, this.radius * 2);
        ctx.lineTo(-this.radius, this.radius);
        ctx.lineTo(-this.radius * 2, 0);
        ctx.lineTo(-this.radius, -this.radius);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
