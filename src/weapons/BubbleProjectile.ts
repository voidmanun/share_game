import { Projectile } from './Projectile';

export class BubbleProjectile extends Projectile {
    private scale: number = 0;

    constructor(x: number, y: number, dirX: number, dirY: number, damage: number) {
        // Projectile takes (x, y, vx, vy, damage)
        // Bubble is slow so we multiply dirX/dirY by 150
        super(x, y, dirX * 150, dirY * 150, damage);
        this.radius = 20; // Big bubble
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        if (this.scale < 1) {
            this.scale += deltaTime * 5; // Pop into existence
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(Math.min(this.scale, 1), Math.min(this.scale, 1));

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);

        // Transparent cyan/blue fill
        ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.fill();

        // Outline
        ctx.strokeStyle = '#000'; // Cartoon black outline
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shiny highlight
        ctx.beginPath();
        ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        ctx.restore();
    }
}
