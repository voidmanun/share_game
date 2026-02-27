import { Entity } from './Entity';
import { Player } from './Player';

export class Enemy extends Entity {
    protected player: Player;
    protected speed: number = 100; // pixels per second
    public hp: number = 3;
    public damage: number = 1;
    public trappedInBubble: boolean = false;
    private floatDistance: number = 0;

    constructor(x: number, y: number, player: Player) {
        super(x, y, 15, '#39FF14'); // Neon Green
        this.player = player;
        // Removed sprite loading
    }

    public takeDamage(amount: number): void {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.isDead = true;
        }
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        if (this.trappedInBubble) {
            // Float upwards slowly
            this.y -= 50 * deltaTime;
            this.floatDistance += 50 * deltaTime;

            // Disappear after floating far enough
            if (this.floatDistance > 300) {
                this.isDead = true;
            }
            return; // Skip normal movement
        }

        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.x += (dx / dist) * this.speed * deltaTime;
            this.y += (dy / dist) * this.speed * deltaTime;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        let angle = Math.atan2(dy, dx);
        if (this.trappedInBubble) angle = -Math.PI / 2; // Look up if trapped

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        // Draw Alien Body
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Angry Eyes (facing towards angle 0 since we rotated)
        ctx.fillStyle = 'white';
        const eyeX = this.radius * 0.4;
        const eyeY = this.radius * 0.4;
        const eyeSize = this.radius * 0.3;

        ctx.beginPath();
        ctx.arc(eyeX, -eyeY, eyeSize, 0, Math.PI * 2); // Left Eye
        ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2); // Right Eye
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(eyeX + 1, -eyeY, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.arc(eyeX + 1, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Angry Eyebrows
        ctx.beginPath();
        ctx.moveTo(eyeX - 4, -eyeY - 6);
        ctx.lineTo(eyeX + 4, -eyeY - 2);
        ctx.moveTo(eyeX + 4, eyeY + 2);
        ctx.lineTo(eyeX - 4, eyeY + 6);
        ctx.stroke();

        // Draw bubble if trapped
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
