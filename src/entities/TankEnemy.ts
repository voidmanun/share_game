import { Enemy } from './Enemy';
import { Player } from './Player';

export class TankEnemy extends Enemy {
    constructor(x: number, y: number, player: Player) {
        // Dark gray (#555555), larger radius (25)
        super(x, y, player);
        this.radius = 25;
        this.color = '#555555';

        // High HP, very slow
        this.hp = 15;
        this.speed = 50;
        this.damage = 2; // Hits harder than basic
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Red angry eyes
        ctx.fillStyle = '#FF0000';
        const eyeOffset = this.radius * 0.4;
        const eyeSize = this.radius * 0.2;

        ctx.beginPath();
        // Slightly downward angled eyes for angry look
        ctx.arc(-eyeOffset, -eyeOffset * 0.4, eyeSize, 0, Math.PI * 2); // Left Eye
        ctx.arc(eyeOffset, -eyeOffset * 0.4, eyeSize, 0, Math.PI * 2); // Right Eye
        ctx.fill();
        ctx.stroke();

        // Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-eyeOffset + 2, -eyeOffset * 0.4, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.arc(eyeOffset - 2, -eyeOffset * 0.4, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
