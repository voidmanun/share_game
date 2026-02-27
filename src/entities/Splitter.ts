import { Enemy } from './Enemy';
import { Player } from './Player';

export class Splitter extends Enemy {
    public isSplitterling: boolean = false;

    constructor(x: number, y: number, player: Player, isSplitterling: boolean = false) {
        super(x, y, player);
        this.isSplitterling = isSplitterling;

        if (isSplitterling) {
            this.radius = 8;
            this.color = '#FF69B4'; // Hot Pink
            this.hp = 1;
            this.speed = 150;
            this.damage = 1;
        } else {
            this.radius = 18;
            this.color = '#8A2BE2'; // Blue Violet
            this.hp = 4;
            this.speed = 90;
            this.damage = 1;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        // Two connected circles or simply two distinct circles inside radius
        ctx.beginPath();
        if (this.isSplitterling) {
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        } else {
            ctx.arc(-this.radius * 0.3, 0, this.radius * 0.7, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.3, 0, this.radius * 0.7, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        // Simple eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        if (this.isSplitterling) {
            ctx.arc(-3, -2, 2, 0, Math.PI * 2);
            ctx.arc(3, -2, 2, 0, Math.PI * 2);
        } else {
            ctx.arc(-this.radius * 0.3 - 3, -2, 3, 0, Math.PI * 2);
            ctx.arc(-this.radius * 0.3 + 3, -2, 3, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.3 - 3, -2, 3, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.3 + 3, -2, 3, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        if (this.isSplitterling) {
            ctx.arc(-3, -2, 1, 0, Math.PI * 2);
            ctx.arc(3, -2, 1, 0, Math.PI * 2);
        } else {
            ctx.arc(-this.radius * 0.3 - 3, -2, 1.5, 0, Math.PI * 2);
            ctx.arc(-this.radius * 0.3 + 3, -2, 1.5, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.3 - 3, -2, 1.5, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.3 + 3, -2, 1.5, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.restore();
    }
}
