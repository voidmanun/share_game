import { Scout } from './Scout';
import { Player } from './Player';
import { Particle } from './Particle';
import { Game } from '../Game';

export class SwarmEnemy extends Scout {
    private game: Game;

    constructor(x: number, y: number, player: Player, game: Game) {
        // Yellow (#FFFF00), smaller radius (8)
        super(x, y, player);
        this.game = game;
        this.radius = 8;
        this.color = '#FFFF00';

        // Very low HP, very fast speed
        this.hp = 1;
        this.speed = 250;
        this.damage = 1;

        // Add random jitter to make movement erratic
        this.movementTimer = Math.random() * 2;
    }

    private movementTimer: number = 0;
    private jitterX: number = 0;
    private jitterY: number = 0;

    public update(deltaTime: number): void {
        this.movementTimer -= deltaTime;
        if (this.movementTimer <= 0) {
            // Change jitter direction frequently
            this.movementTimer = 0.2 + Math.random() * 0.3;
            // Random angle offset for erratic movement
            const angle = Math.random() * Math.PI * 2;
            const magnitude = 150; // Jitter strength
            this.jitterX = Math.cos(angle) * magnitude;
            this.jitterY = Math.sin(angle) * magnitude;
        }

        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            const dirX = dx / dist;
            const dirY = dy / dist;

            // Combine directed velocity and jitter
            this.x += (dirX * this.speed + this.jitterX) * deltaTime;
            this.y += (dirY * this.speed + this.jitterY) * deltaTime;
        }

        // Particle trail due to high speed
        if (Math.random() < 0.2) {
            this.game.particles.push(new Particle(this.x, this.y, '#AAAA00'));
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Triangle shape pointing to player roughly
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        let angle = Math.atan2(dy, dx);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        ctx.moveTo(this.radius, 0); // Tip
        ctx.lineTo(-this.radius, this.radius * 0.8); // Back Right
        ctx.lineTo(-this.radius, -this.radius * 0.8); // Back Left
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        // Small eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(1, 0, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
