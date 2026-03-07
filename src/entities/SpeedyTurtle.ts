import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { PetProjectile } from './PetProjectile';

export class SpeedyTurtle extends Pet {
    private buffActive: boolean = false;
    private buffTimer: number = 0;

    constructor(player: Player, game: Game) {
        super(player, game, 60, 80, 12, '#2E8B57');
        this.buffTimer = 5 + Math.random() * 5;
        this.attackInterval = 1.0;
        this.attackRange = 300;
        this.attackDamage = 2;
        this.projectileColor = '#00BFFF';
    }

    public act(deltaTime: number): void {
        this.buffTimer -= deltaTime;
        this.updateAttackCooldown(deltaTime);

        if (this.buffTimer <= 0) {
            if (!this.buffActive) {
                this.buffActive = true;
                this.buffTimer = 5;
                this.player.speedMultiplier = 1.5;
                this.player.color = '#00FF7F';
            } else {
                this.buffActive = false;
                this.buffTimer = 15 + Math.random() * 10;
                this.player.speedMultiplier = 1.0;
                this.player.color = '#006994';
            }
        }
        
        const target = this.findNearestEnemy();
        if (target) {
            this.performAttack(target.x, target.y);
        }
    }
    
    protected performAttack(targetX: number, targetY: number): void {
        if (this.attackCooldown > 0) return;
        
        const projectile = new PetProjectile(
            this.x, this.y, targetX, targetY,
            this.attackDamage * this.damageMultiplier,
            this.constructor.name, this.game, this.projectileColor, 'piercing'
        );
        projectile.radius = 6;
        projectile.speedBoostDuration = 2;
        
        this.game.addPetProjectile(projectile);
        this.attackCooldown = this.attackInterval;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius + 4, this.radius, this.hoverAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 2;
        ctx.save();
        ctx.rotate(this.hoverAngle);
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#3CB371';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const headX = Math.cos(this.hoverAngle) * (this.radius + 4);
        const headY = Math.sin(this.hoverAngle) * (this.radius + 4);
        ctx.arc(headX, headY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (this.buffActive) {
            ctx.strokeStyle = 'rgba(0, 255, 127, 0.8)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
        this.renderLevelInfo(ctx);
    }
}