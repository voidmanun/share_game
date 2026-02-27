import { Projectile } from './Projectile';
import { Game } from '../Game';
import { Enemy } from '../entities/Enemy';
import { Particle } from '../entities/Particle';

export class Missile extends Projectile {
    private game: Game;
    private targetEnemy: Enemy | null = null;
    private turnRate: number = Math.PI * 2; // radians per second

    constructor(x: number, y: number, vx: number, vy: number, damage: number, game: Game) {
        super(x, y, vx, vy, damage);
        this.game = game;
        this.color = '#8A2BE2'; // BlueViolet for Missile
        this.radius = 6;
        this.maxLife = 4; // Lives a bit longer to find target
    }

    public update(deltaTime: number): void {
        // Find nearest if we don't have one or it died
        if (!this.targetEnemy || this.targetEnemy.isDead) {
            this.targetEnemy = this.game.getNearestEnemy(this.x, this.y);
        }

        if (this.targetEnemy) {
            const dx = this.targetEnemy.x - this.x;
            const dy = this.targetEnemy.y - this.y;
            const desiredAngle = Math.atan2(dy, dx);

            const currentVelocity = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
            const currentAngle = Math.atan2(this.velocityY, this.velocityX);

            // Simple turning math
            let angleDiff = desiredAngle - currentAngle;
            // Normalize angleDiff to -PI to PI
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            const maxTurn = this.turnRate * deltaTime;
            const turn = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));

            const newAngle = currentAngle + turn;
            this.velocityX = Math.cos(newAngle) * currentVelocity;
            this.velocityY = Math.sin(newAngle) * currentVelocity;

            // Speed up slightly over time up to a max
            if (currentVelocity < 800) {
                this.velocityX *= 1.02;
                this.velocityY *= 1.02;
            }
        }

        super.update(deltaTime);

        // Add particle trail
        if (Math.random() < 0.3) {
            this.game.particles.push(new Particle(this.x, this.y, '#FFA500'));
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        const currentAngle = Math.atan2(this.velocityY, this.velocityX);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(currentAngle);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Draw a cartoon rocket
        ctx.beginPath();
        // Body
        ctx.moveTo(10, 0); // Tip
        ctx.lineTo(0, 4);
        ctx.lineTo(-8, 4);
        ctx.lineTo(-8, -4);
        ctx.lineTo(0, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Fins
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(-4, 4);
        ctx.lineTo(-10, 8);
        ctx.lineTo(-8, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.lineTo(-10, -8);
        ctx.lineTo(-8, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
