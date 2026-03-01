import { Enemy } from './Enemy';
import { Player } from './Player';

export class StarEnemy extends Enemy {
    private timeAlive: number = 0;

    constructor(x: number, y: number, player: Player) {
        super(x, y, player);
        this.radius = 16;
        this.color = '#FFD700'; // Gold Star
        this.hp = 2; // Relatively low HP
        this.damage = 1;
        this.speed = 100; // Normal speed
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        this.timeAlive += deltaTime;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        const cycle = (this.timeAlive % 4) / 4; // 0.0 to 1.0 (4 seconds cycle)
        
        let alpha = 1.0;
        let isBlinking = false;

        // Sequence:
        // 0.0 - 0.3: Visible (30%)
        // 0.3 - 0.4: Blinking out (10%)
        // 0.4 - 0.7: Invisible (30%)
        // 0.7 - 0.8: Blinking in (10%)
        // 0.8 - 1.0: Visible (20%)
        
        if (cycle > 0.3 && cycle <= 0.4) {
            isBlinking = true;
            alpha = Math.random() > 0.5 ? 1.0 : 0.2;
        } else if (cycle > 0.4 && cycle <= 0.7) {
            alpha = 0.05; // Almost completely invisible
        } else if (cycle > 0.7 && cycle <= 0.8) {
            isBlinking = true;
            alpha = Math.random() > 0.5 ? 1.0 : 0.2;
        }

        if (this.trappedInBubble) {
            alpha = 1.0;
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Rotate constantly
        ctx.rotate(this.timeAlive * 2);

        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = isBlinking ? '#FFFFFF' : this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Draw Star Shape
        const spikes = 5;
        const outerRadius = this.radius;
        const innerRadius = this.radius / 2.5;

        ctx.beginPath();
        let rot = Math.PI / 2 * 3;
        let x = 0;
        let y = 0;
        let step = Math.PI / spikes;

        ctx.moveTo(0, -outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = Math.cos(rot) * outerRadius;
            y = Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = Math.cos(rot) * innerRadius;
            y = Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(0, -outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // If trapped in bubble, draw bubble
        if (this.trappedInBubble) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.restore();
    }
}
