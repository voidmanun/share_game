import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { Particle } from './Particle';

export class LuckyCat extends Pet {
    private attackTimer: number = 0;

    constructor(player: Player, game: Game) {
        // Hover distance 45, Speed 160, Radius 8, Color Gold
        super(player, game, 45, 160, 8, '#FFD700'); 
    }

    public act(deltaTime: number): void {
        this.attackTimer += deltaTime;

        // Cat occasionally attacks enemies nearby
        if (this.attackTimer > 2.0) {
            this.attackTimer = 0;
            this.swipeAttack();
        }
    }

    private swipeAttack(): void {
        const enemies = this.game.getEnemies();
        const attackRadius = 60;
        const damage = 5;

        for (const enemy of enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= attackRadius) {
                enemy.takeDamage(damage);
                this.game.createExplosion(enemy.x, enemy.y, '#FFD700');
                
                // Visual effect for cat swipe
                for (let i = 0; i < 3; i++) {
                    this.game.particles.push(new Particle(this.x + (Math.random() - 0.5) * 20, this.y + (Math.random() - 0.5) * 20, '#FFFFFF')); 
                }
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#DAA520'; // Goldenrod border
        ctx.lineWidth = 2;

        // Cat body (circle)
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ears
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.8, -this.radius * 0.5);
        ctx.lineTo(-this.radius * 0.8, -this.radius * 1.5);
        ctx.lineTo(-this.radius * 0.2, -this.radius * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.radius * 0.8, -this.radius * 0.5);
        ctx.lineTo(this.radius * 0.8, -this.radius * 1.5);
        ctx.lineTo(this.radius * 0.2, -this.radius * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-3, -2, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = 'pink';
        ctx.beginPath();
        ctx.arc(0, 1, 1, 0, Math.PI * 2);
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-2, 1); ctx.lineTo(-8, 0);
        ctx.moveTo(-2, 2); ctx.lineTo(-8, 3);
        ctx.moveTo(2, 1); ctx.lineTo(8, 0);
        ctx.moveTo(2, 2); ctx.lineTo(8, 3);
        ctx.stroke();

        ctx.restore();
    }
}
