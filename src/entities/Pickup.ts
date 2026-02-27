import { Entity } from './Entity';

export class Pickup extends Entity {
    public value: number;

    constructor(x: number, y: number, value: number) {
        super(x, y, 8, '#FFFF00'); // Yellow
        this.value = value;
        // Removed sprite
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000'; // Cartoon thick outline
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cartoon shine (small white arc)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-2, -2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
