import { Pickup } from './Pickup';

export class CharmPotionPickup extends Pickup {
    private angle: number = 0;

    constructor(x: number, y: number) {
        super(x, y, 0); // No gold value
        this.radius = 12;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        this.angle += 0.03;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw heart shape (charm/love symbol)
        ctx.fillStyle = '#FF69B4'; // Hot pink
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Heart shape using bezier curves
        const size = this.radius;
        ctx.moveTo(0, size * 0.3);
        ctx.bezierCurveTo(-size, -size, -size * 1.5, size * 0.5, 0, size);
        ctx.bezierCurveTo(size * 1.5, size * 0.5, size, -size, 0, size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Sparkle effect
        ctx.rotate(this.angle);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(size * 0.3, -size * 0.3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
