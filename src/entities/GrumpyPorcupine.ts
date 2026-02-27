import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { Particle } from './Particle';
import { Boss } from './Boss';

export class GrumpyPorcupine extends Pet {
    private damageTimer: number = 0;

    constructor(player: Player, game: Game) {
        // Slowest pet, brown color
        super(player, game, 45, 120, 10, '#A0522D'); // Sienna
    }

    public act(deltaTime: number): void {
        this.damageTimer -= deltaTime;

        // Cooldown for dealing damage
        if (this.damageTimer > 0) return;

        const enemies = this.game.getEnemies();
        for (const enemy of enemies) {
            if (enemy.isDead || enemy instanceof Boss) {
                // Ignore bosses to not make it overpowered
                continue;
            }

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // If enemy touches porcupine
            if (dist < this.radius + enemy.radius) {
                // Deal damage
                enemy.takeDamage(5); // High burst damage

                // Visual feedback
                for (let i = 0; i < 5; i++) {
                    this.game.particles.push(new Particle(this.x, this.y, '#FF4500')); // OrangeRed sparks
                }

                // Knockback
                if (!enemy.isDead) {
                    const angle = Math.atan2(dy, dx);
                    enemy.x += Math.cos(angle) * 30;
                    enemy.y += Math.sin(angle) * 30;
                }

                this.damageTimer = 0.5; // 0.5s cooldown before it can do damage again
                break; // Only hurt one enemy per frame
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        // Boy/Body
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Spikes
        ctx.fillStyle = '#8B4513';
        const numSpikes = 8;
        for (let i = 0; i < numSpikes; i++) {
            const angle = (i * Math.PI * 2) / numSpikes + this.hoverAngle;

            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * this.radius, Math.sin(angle) * this.radius);

            // Spike tip
            ctx.lineTo(
                Math.cos(angle) * (this.radius + 8),
                Math.sin(angle) * (this.radius + 8)
            );

            ctx.lineTo(
                Math.cos(angle + 0.3) * this.radius,
                Math.sin(angle + 0.3) * this.radius
            );

            ctx.closePath();
            ctx.fill();
            ctx.stroke(); // stroke spikes for cartoon look
        }

        // Grumpy Face
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-3, -2, 2, 0, Math.PI * 2);
        ctx.arc(3, -2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-3, -2, 1, 0, Math.PI * 2);
        ctx.arc(3, -2, 1, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrows
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -4);
        ctx.lineTo(-1, -2);
        ctx.moveTo(5, -4);
        ctx.lineTo(1, -2);
        ctx.stroke();

        ctx.restore();
    }
}
