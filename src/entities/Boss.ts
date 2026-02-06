import { Enemy } from './Enemy';
import { Player } from './Player';

export class Boss extends Enemy {
    constructor(x: number, y: number, player: Player) {
        super(x, y, player);
        this.color = '#FF0000'; // Red
        this.speed = 200;       // 2x speed
        this.damage = 2;        // 2x damage
        this.hp = 10;           // More HP for boss feel
        this.radius = 20;       // Slightly larger
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;

        // Draw Triangle
        const size = this.radius * 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - size);
        ctx.lineTo(this.x + size, this.y + size);
        ctx.lineTo(this.x - size, this.y + size);
        ctx.closePath();
        ctx.fill();
    }
}
