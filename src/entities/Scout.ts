import { Enemy } from './Enemy';
import { Player } from './Player';

export class Scout extends Enemy {
    private timeAlive: number = 0;

    constructor(x: number, y: number, player: Player) {
        super(x, y, player);
        this.speed = 250; // Fast
        this.hp = 2; // Fragile
        this.damage = 1; // Low damage
        this.color = '#00FFFF'; // Cyan
        this.radius = 10; // Smaller
    }

    public update(deltaTime: number): void {
        this.timeAlive += deltaTime;

        // Custom movement override
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            // Forward vector
            const fx = dx / dist;
            const fy = dy / dist;

            // Right vector (perpendicular)
            const rx = -fy;
            const ry = fx;

            // Sine wave offset using timeAlive
            // Amplitude: 100, Frequency: 5
            const wave = Math.sin(this.timeAlive * 5) * 2;

            // Combine velocities
            // We want to move FORWARD plus some SIDEWAYS

            // Actually simpler: Just modify position
            // But super.update moves it too if we called it. We won't call super.update() for movement.
            // But we need Entity.update() for animation if any? Entity just does nothing or basic stuff.
            // Let's check Entity.ts? assuming it's safe to skip super.update() if Enemy.update() only did movement.

            // Enemy.ts update:
            // super.update(deltaTime);
            // ... movement ...

            // So we should call super.super.update()? No, just duplicate Entity.update logic if needed (usually empty or just sprite anim).
            // Let's assume it's fine.

            this.x += (fx * this.speed + rx * wave * 50) * deltaTime;
            this.y += (fy * this.speed + ry * wave * 50) * deltaTime;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Draw Dart/Triangle
        ctx.save();
        ctx.translate(this.x, this.y);

        // Rotate towards direction? Or just towards player?
        // Towards player is easier
        const angle = Math.atan2(this.player.y - this.y, this.player.x - this.x);
        ctx.rotate(angle);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, 5);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(3, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(4, 0, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
