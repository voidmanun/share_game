import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { HealthPickup } from './HealthPickup';
import { Pickup } from './Pickup';
import { Particle } from './Particle';

export class MagicFairy extends Pet {
    private spawnTimer: number = 0;

    constructor(player: Player, game: Game) {
        super(player, game, 50, 150, 6, '#FFB6C1'); // Light pink
        this.spawnTimer = 10 + Math.random() * 5; // First spawn in 10-15s
    }

    public act(deltaTime: number): void {
        this.spawnTimer -= deltaTime;

        // Leave a sparkly trail
        if (Math.random() < 0.1) {
            this.game.particles.push(new Particle(this.x, this.y, '#FFD700'));
        }

        if (this.spawnTimer <= 0) {
            this.spawnAbility();
            this.spawnTimer = 15 + Math.random() * 10; // next spawn in 15-25s
        }
    }

    private spawnAbility(): void {
        // 50% chance for BIG coin, 50% chance for BIG health
        const dropX = this.x;
        const dropY = this.y;

        if (Math.random() < 0.5) {
            const h = new HealthPickup(dropX, dropY, 20); // Big 20 HP heal!
            h.radius = 16;
            this.game.addPickup(h);
        } else {
            const c = new Pickup(dropX, dropY, 10); // Big 10x value coin
            c.radius = 14;
            this.game.addPickup(c);
        }

        // Visual flair
        this.game.createExplosion(this.x, this.y, '#FF69B4');
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        // Fairy body (diamond/starish)
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(this.radius, 0);
        ctx.lineTo(0, this.radius);
        ctx.lineTo(-this.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Wings
        const wingFlap = Math.sin(Date.now() / 50) * Math.PI / 8; // fast flapping
        ctx.fillStyle = 'white';

        ctx.beginPath();
        ctx.ellipse(-6, -4, 6, 3, -Math.PI / 6 + wingFlap, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(6, -4, 6, 3, Math.PI / 6 - wingFlap, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Simple Face
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-2, 0, 1, 0, Math.PI * 2);
        ctx.arc(2, 0, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
