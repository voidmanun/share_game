import { Enemy } from './Enemy';
import { Player } from './Player';
import { Particle } from './Particle';
import { Game } from '../Game';

export class Teleporter extends Enemy {
    private game: Game;
    private teleportTimer: number;

    constructor(x: number, y: number, player: Player, game: Game) {
        super(x, y, player);
        this.game = game;
        this.radius = 12;
        this.color = '#00FFFF'; // Cyan
        this.hp = 2;
        this.damage = 1;
        this.speed = 50; // Moves very slowly normally
        this.teleportTimer = 3 + Math.random() * 2; // Teleports every 3-5 seconds
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        this.teleportTimer -= deltaTime;
        if (this.teleportTimer <= 0) {
            this.teleport();
            this.teleportTimer = 3 + Math.random() * 2;
        }
    }

    private teleport(): void {
        // Leave particles at old position
        for (let i = 0; i < 10; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '#00FFFF'));
        }

        // Teleport to a random position near the player (e.g. 100-250 pixels away)
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 150;
        this.x = this.player.x + Math.cos(angle) * dist;
        this.y = this.player.y + Math.sin(angle) * dist;

        // Particles at new position
        for (let i = 0; i < 10; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '#FFFFFF'));
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        // Draw an open diamond -> fill it and stroke it
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(this.radius, 0);
        ctx.lineTo(0, this.radius);
        ctx.lineTo(-this.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Center eye
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
