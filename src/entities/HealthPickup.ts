import { Entity } from './Entity';

export class HealthPickup extends Entity {
    public healAmount: number;

    constructor(x: number, y: number, amount: number) {
        super(x, y, 10, '#00FF00'); // Green
        this.healAmount = amount;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();

        // Draw cross (+) shape
        const w = 4;
        const h = 14;
        ctx.rect(-w / 2, -h / 2, w, h); // Vertical rect
        ctx.rect(-h / 2, -w / 2, h, w); // Horizontal rect

        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Cartoon outline
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        ctx.restore();
    }
}
