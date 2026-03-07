import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { Particle } from './Particle';
import { PetProjectile } from './PetProjectile';

export class BouncySlime extends Pet {
    private jumpTimer: number = 0;
    private isJumping: boolean = false;
    private jumpHeight: number = 0;
    private maxJumpHeight: number = 20;

    constructor(player: Player, game: Game) {
        super(player, game, 40, 120, 8, '#32CD32');
        this.attackInterval = 1.3;
        this.attackRange = 220;
        this.attackDamage = 3;
        this.projectileColor = '#32CD32';
    }

    public act(deltaTime: number): void {
        this.jumpTimer += deltaTime;
        this.updateAttackCooldown(deltaTime);

        if (!this.isJumping && this.jumpTimer > 1.5) {
            this.isJumping = true;
            this.jumpTimer = 0;

            for (let i = 0; i < 3; i++) {
                this.game.particles.push(new Particle(this.x, this.y, '#98FB98'));
            }
        }

        if (this.isJumping) {
            if (this.jumpTimer < 0.25) {
                this.jumpHeight = (this.jumpTimer / 0.25) * this.maxJumpHeight;
            } else if (this.jumpTimer < 0.5) {
                this.jumpHeight = this.maxJumpHeight - ((this.jumpTimer - 0.25) / 0.25) * this.maxJumpHeight;
            } else {
                this.isJumping = false;
                this.jumpHeight = 0;
                this.jumpTimer = 0;

                this.dealLandingDamage();
            }
        }
        
        const target = this.findNearestEnemy();
        if (target && !this.isJumping) {
            this.performAttack(target.x, target.y);
        }
    }
    
    protected performAttack(targetX: number, targetY: number): void {
        if (this.attackCooldown > 0) return;
        
        const projectile = new PetProjectile(
            this.x, this.y - this.jumpHeight, targetX, targetY,
            this.attackDamage * this.damageMultiplier,
            this.constructor.name, this.game, this.projectileColor, 'bouncing'
        );
        projectile.radius = 7;
        
        this.game.addPetProjectile(projectile);
        
        for (let i = 0; i < 2; i++) {
            this.game.particles.push(new Particle(this.x, this.y - this.jumpHeight, '#32CD32'));
        }
        
        this.attackCooldown = this.attackInterval;
    }

    private dealLandingDamage(): void {
        for (let i = 0; i < 8; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '#32CD32'));
        }

        const enemies = this.game.getEnemies();
        const splashRadius = 40;
        const damage = 2;

        for (const enemy of enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= splashRadius) {
                enemy.takeDamage(damage * this.damageMultiplier);
                this.game.createExplosion(enemy.x, enemy.y, enemy.color);
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        const renderY = this.y - this.jumpHeight;
        ctx.translate(this.x, renderY);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 2;

        let stretch = 1;
        let squash = 1;

        if (this.isJumping) {
            if (this.jumpTimer < 0.25) {
                stretch = 1.3;
                squash = 0.8;
            } else {
                stretch = 1.0;
                squash = 1.0;
            }
        } else if (this.jumpTimer > 1.3) {
            stretch = 0.7;
            squash = 1.3;
        }

        ctx.beginPath();
        ctx.ellipse(0, this.radius - (this.radius * stretch), this.radius * squash, this.radius * stretch, 0, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-3, -this.radius / 2, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -this.radius / 2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 105, 180, 0.6)';
        ctx.beginPath();
        ctx.arc(-4, -this.radius / 3, 1, 0, Math.PI * 2);
        ctx.arc(4, -this.radius / 3, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        this.renderLevelInfo(ctx);
    }
}