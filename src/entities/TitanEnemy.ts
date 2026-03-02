import { Enemy } from './Enemy';
import { Player } from './Player';

export class TitanEnemy extends Enemy {
    constructor(x: number, y: number, player: Player) {
        super(x, y, player);
        this.color = '#800080'; // Purple
        this.speed = 60;       // Medium speed
        this.damage = 5;        // Massive damage
        this.hp = 500;          // Huge HP
        this.radius = 40;       // Giant size
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Glow Effect
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#800080';

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6;

        // Draw hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = Math.cos(angle) * this.radius;
            const py = Math.sin(angle) * this.radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Inner core
        ctx.fillStyle = '#FFD700'; // Gold core
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
