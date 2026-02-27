import { Pickup } from './Pickup';

export class PetEggPickup extends Pickup {
    private floatOffset: number = 0;
    private floatDir: number = 1;

    constructor(x: number, y: number) {
        super(x, y, 0); // No literal gold value, hatched on pickup
        this.radius = 12; // Base radius
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        // Gentle hover effect
        this.floatOffset += this.floatDir * 10 * deltaTime;
        if (this.floatOffset > 5) {
            this.floatDir = -1;
        } else if (this.floatOffset < -5) {
            this.floatDir = 1;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y + this.floatOffset);

        // Draw Egg Shape (Ellipse)
        ctx.beginPath();
        // Scale Y to make it taller
        ctx.ellipse(0, 0, this.radius, this.radius * 1.3, 0, 0, Math.PI * 2);

        // Flat color instead of gradient for cartoon style
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Spots
        ctx.fillStyle = '#FFA07A'; // Light Salmon
        ctx.beginPath(); ctx.arc(-this.radius * 0.4, -this.radius * 0.3, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(this.radius * 0.5, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(-this.radius * 0.2, this.radius * 0.5, 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        ctx.restore();
    }
}
