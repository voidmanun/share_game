import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { PetProjectile } from './PetProjectile';

export class HolyLightTurtle extends Pet {
    private healTimer: number = 0;
    private shieldTimer: number = 0;
    private readonly HEAL_INTERVAL: number = 10;
    private readonly SHIELD_INTERVAL: number = 10;
    private readonly HEAL_AMOUNT: number = 1;
    private readonly SHIELD_HITS: number = 3;

    constructor(player: Player, game: Game) {
        super(player, game, 70, 60, 14, '#FFD700');
        this.healTimer = this.HEAL_INTERVAL;
        this.shieldTimer = this.SHIELD_INTERVAL;
        this.attackInterval = 1.5;
        this.attackRange = 250;
        this.attackDamage = 3;
        this.projectileColor = '#FFD700';
    }

    public act(deltaTime: number): void {
        this.healTimer -= deltaTime;
        this.shieldTimer -= deltaTime;
        this.updateAttackCooldown(deltaTime);

        if (this.healTimer <= 0) {
            this.heal();
            this.healTimer = this.HEAL_INTERVAL;
        }

        if (this.shieldTimer <= 0) {
            this.generateShield();
            this.shieldTimer = this.SHIELD_INTERVAL;
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
        projectile.radius = 8;
        
        this.game.addPetProjectile(projectile);
        this.attackCooldown = this.attackInterval;
    }

    private heal(): void {
        if (this.player.hp < this.player.maxHp) {
            const healed = this.player.heal(this.HEAL_AMOUNT);
            if (healed > 0) {
                this.game.createExplosion(this.x, this.y, '#FFD700');
            }
        }
    }

    private generateShield(): void {
        this.player.addShield(this.SHIELD_HITS);
        this.game.createExplosion(this.player.x, this.player.y, '#87CEEB');
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius + 4, this.radius, this.hoverAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius + 8, this.radius + 4, this.hoverAngle, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.save();
        ctx.rotate(this.hoverAngle);
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.moveTo(0, -6);
        ctx.lineTo(0, 6);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#FFFACD';
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 3;
        const headX = Math.cos(this.hoverAngle) * (this.radius + 4);
        const headY = Math.sin(this.hoverAngle) * (this.radius + 4);
        ctx.beginPath();
        ctx.arc(headX, headY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const time = Date.now() / 500;
        const glowAlpha = 0.3 + Math.sin(time) * 0.2;
        ctx.strokeStyle = `rgba(255, 255, 224, ${glowAlpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
        this.renderLevelInfo(ctx);
    }
}