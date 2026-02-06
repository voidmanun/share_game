import { Entity } from './Entity';
import { Player } from './Player';

export class Enemy extends Entity {
    private player: Player;
    protected speed: number = 100; // pixels per second
    public hp: number = 3;
    public damage: number = 1;

    constructor(x: number, y: number, player: Player) {
        super(x, y, 15, '#808080'); // Gray
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
        // Draw Square
        ctx.fillStyle = this.color;
        const size = this.radius * 2;
        ctx.fillRect(this.x - this.radius, this.y - this.radius, size, size);
    }
}
