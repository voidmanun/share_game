import { Enemy } from './Enemy';
import { Player } from './Player';
import { Particle } from './Particle';
import { Game } from '../Game';

export class Charger extends Enemy {
    private game: Game;
    private state: 'normal' | 'charging' = 'normal';
    private stateTimer: number = 0;

    constructor(x: number, y: number, player: Player, game: Game) {
        super(x, y, player);
        this.game = game;
        this.radius = 20; // Slightly bigger
        this.color = '#FFA500'; // Orange
        this.hp = 5;
        this.damage = 2; // High collision damage
        this.speed = 80; // Slower normally
        this.stateTimer = 2 + Math.random() * 2; // 2-4 seconds normal walking
    }

    public update(deltaTime: number): void {
        this.stateTimer -= deltaTime;

        if (this.state === 'normal' && this.stateTimer <= 0) {
            this.state = 'charging';
            this.stateTimer = 1.0; // Charge for 1 second
            this.speed = 450; // Very fast
        } else if (this.state === 'charging' && this.stateTimer <= 0) {
            this.state = 'normal';
            this.stateTimer = 2 + Math.random() * 2;
            this.speed = 80;
        }

        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.x += (dx / dist) * this.speed * deltaTime;
            this.y += (dy / dist) * this.speed * deltaTime;
        }

        if (this.state === 'charging' && Math.random() < 0.3) {
            this.game.particles.push(new Particle(this.x, this.y, '#FFA500'));
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        // Render as a pentagon
        ctx.beginPath();
        const sides = 5;
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const px = Math.cos(angle) * this.radius;
            const py = Math.sin(angle) * this.radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Angry dashes
        ctx.beginPath();
        ctx.moveTo(-5, -5);
        ctx.lineTo(0, 0);
        ctx.lineTo(5, -5);
        ctx.stroke();

        ctx.restore();
    }
}
