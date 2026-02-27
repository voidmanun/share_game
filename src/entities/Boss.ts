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
        ctx.save();
        ctx.translate(this.x, this.y);

        // Glow Effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF0000';

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;

        // Draw Triangle
        const size = this.radius * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, size);
        ctx.lineTo(-size, size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0; // Turn off for details

        // Core / Eye
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Big angry eyebrows
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-15, -15);
        ctx.lineTo(-5, -5);
        ctx.moveTo(15, -15);
        ctx.lineTo(5, -5);
        ctx.stroke();

        ctx.restore();
    }
}
