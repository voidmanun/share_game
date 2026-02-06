import { Entity } from './Entity';

export class Pickup extends Entity {
    public value: number;

    constructor(x: number, y: number, value: number) {
        super(x, y, 8, '#FFFF00'); // Yellow
        this.value = value;
        // Removed sprite
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#DAA520'; // GoldenRod outline
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
}
