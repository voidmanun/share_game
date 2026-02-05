import { Entity } from './Entity';
import { Player } from './Player';

export class Enemy extends Entity {
    private player: Player;
    private speed: number = 100; // pixels per second
    public hp: number = 3;

    constructor(x: number, y: number, player: Player) {
        super(x, y, 10, '#f44336'); // Red circle
        this.player = player;
    }

    public takeDamage(amount: number): void {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.isDead = true;
        }
    }

    public update(deltaTime: number): void {
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.x += (dx / distance) * this.speed * deltaTime;
            this.y += (dy / distance) * this.speed * deltaTime;
        }
    }
}
