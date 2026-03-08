import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { Particle } from './Particle';
import { Boss } from './Boss';
import { PetProjectile } from './PetProjectile';

export class GrumpyPorcupine extends Pet {
    private damageTimer: number = 0;

    constructor(player: Player, game: Game) {
        super(player, game, 45, 120, 10, '#A0522D');
        this.attackInterval = 1.5;
        this.attackRange = 200;
        this.attackDamage = 2;
        this.projectileColor = '#8B4513';
    }

    public act(deltaTime: number): void {
        this.damageTimer -= deltaTime;
        this.updateAttackCooldown(deltaTime);
        
        const enemies = this.game.getEnemies();

        let nearestEnemy = null;
        let minDist = Infinity;

        for (const enemy of enemies) {
            if (enemy.isDead || enemy instanceof Boss) continue;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distSquared = dx * dx + dy * dy;

            if (distSquared < minDist) {
                minDist = distSquared;
                nearestEnemy = enemy;
            }
        }

        if (nearestEnemy && minDist < 400 * 400) {
            const dx = nearestEnemy.x - this.x;
            const dy = nearestEnemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > this.radius + nearestEnemy.radius) {
                this.x += (dx / dist) * (this.speed * 0.8) * deltaTime;
                this.y += (dy / dist) * (this.speed * 0.8) * deltaTime;
            }
            
            if (dist <= this.attackRange) {
                this.performSpikeAttack(nearestEnemy.x, nearestEnemy.y);
            }
        }

        if (this.damageTimer > 0) return;

        for (const enemy of enemies) {
            if (enemy.isDead || enemy instanceof Boss) continue;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.radius + enemy.radius) {
                enemy.takeDamage(5 * this.damageMultiplier);

                for (let i = 0; i < 5; i++) {
                    this.game.particles.push(new Particle(this.x, this.y, '#FF4500'));
                }

                if (!enemy.isDead) {
                    const angle = Math.atan2(dy, dx);
                    enemy.x += Math.cos(angle) * 30;
                    enemy.y += Math.sin(angle) * 30;
                }

                this.damageTimer = 0.5;
                break;
            }
        }
    }
    
    private performSpikeAttack(targetX: number, targetY: number): void {
        if (this.attackCooldown > 0) return;
        
        const baseAngle = Math.atan2(targetY - this.y, targetX - this.x);
        const spreadAngles = [-Math.PI / 6, 0, Math.PI / 6];
        
        for (const angleOffset of spreadAngles) {
            const angle = baseAngle + angleOffset;
            const targetXOffset = this.x + Math.cos(angle) * this.attackRange;
            const targetYOffset = this.y + Math.sin(angle) * this.attackRange;
            
            const projectile = new PetProjectile(
                this.x, this.y, targetXOffset, targetYOffset,
                this.attackDamage * this.damageMultiplier,
                this.constructor.name, this.game, this.projectileColor, 'normal'
            );
            projectile.radius = 4;
            
            this.game.addPetProjectile(projectile);
        }
        
        for (let i = 0; i < 3; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '#8B4513'));
        }
        
        this.attackCooldown = this.attackInterval;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#8B4513';
        const numSpikes = 8;
        for (let i = 0; i < numSpikes; i++) {
            const angle = (i * Math.PI * 2) / numSpikes + this.hoverAngle;

            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * this.radius, Math.sin(angle) * this.radius);
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
            ctx.stroke();
        }

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

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -4);
        ctx.lineTo(-1, -2);
        ctx.moveTo(5, -4);
        ctx.lineTo(1, -2);
        ctx.stroke();

        ctx.restore();
        this.renderLevelInfo(ctx);
    }
}