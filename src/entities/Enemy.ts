import { Entity } from './Entity';
import { Player } from './Player';

export class Enemy extends Entity {
    protected player: Player;
    protected speed: number = 100; // pixels per second
    public hp: number = 3;
    public damage: number = 1;

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
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.x += (dx / dist) * this.speed * deltaTime;
            this.y += (dy / dist) * this.speed * deltaTime;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Draw Alien (Rounded Head with eyes)
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'black';
        const eyeOffset = this.radius * 0.4;
        const eyeSize = this.radius * 0.25;

        ctx.beginPath();
        ctx.arc(this.x - eyeOffset, this.y - eyeOffset * 0.5, eyeSize, 0, Math.PI * 2); // Left Eye
        ctx.arc(this.x + eyeOffset, this.y - eyeOffset * 0.5, eyeSize, 0, Math.PI * 2); // Right Eye
        ctx.fill();
    }
}
