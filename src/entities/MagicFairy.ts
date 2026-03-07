import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { HealthPickup } from './HealthPickup';
import { Pickup } from './Pickup';
import { Particle } from './Particle';
import { PetEggPickup } from './PetEggPickup';
import { PetProjectile } from './PetProjectile';

export class MagicFairy extends Pet {
    private spawnTimer: number = 0;
    private dropType: 'health' | 'coin' = 'coin';

    constructor(player: Player, game: Game) {
        super(player, game, 50, 150, 6, '#FFB6C1');
        this.spawnTimer = 10 + Math.random() * 5;
        this.attackInterval = 1.0;
        this.attackRange = 200;
        this.attackDamage = 2;
        this.projectileColor = '#FF69B4';
    }

    public setDropType(type: 'health' | 'coin'): void {
        this.dropType = type;
    }

    public act(deltaTime: number): void {
        this.spawnTimer -= deltaTime;
        this.updateAttackCooldown(deltaTime);

        if (Math.random() < 0.1) {
            this.game.particles.push(new Particle(this.x, this.y, '#FFD700'));
        }

        const spawnInterval = this.evolutionStage >= 2 ? 8 : (this.evolutionStage >= 1 ? 12 : 15);
        if (this.spawnTimer <= 0) {
            this.spawnAbility();
            this.spawnTimer = spawnInterval + Math.random() * 5;
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
            this.constructor.name, this.game, this.projectileColor, 'homing'
        );
        projectile.radius = 6;
        
        this.game.addPetProjectile(projectile);
        
        for (let i = 0; i < 2; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '#FF69B4'));
        }
        
        this.attackCooldown = this.attackInterval;
    }

    private spawnAbility(): void {
        const dropX = this.x;
        const dropY = this.y;

        const dropCount = this.evolutionStage >= 2 ? 2 : 1;

        for (let i = 0; i < dropCount; i++) {
            if (this.dropType === 'health' || (this.evolutionStage < 1 && Math.random() < 0.5)) {
                const h = new HealthPickup(dropX + (i - 0.5) * 20, dropY, 20);
                h.radius = 16;
                this.game.addPickup(h);
            } else {
                const c = new Pickup(dropX + (i - 0.5) * 20, dropY, 10);
                c.radius = 14;
                this.game.addPickup(c);
            }
        }

        if (this.evolutionStage >= 2 && Math.random() < 0.1) {
            this.game.addPickup(new PetEggPickup(dropX, dropY));
        }

        this.game.createExplosion(this.x, this.y, '#FF69B4');
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(this.radius, 0);
        ctx.lineTo(0, this.radius);
        ctx.lineTo(-this.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const wingFlap = Math.sin(Date.now() / 50) * Math.PI / 8;
        ctx.fillStyle = 'white';

        ctx.beginPath();
        ctx.ellipse(-6, -4, 6, 3, -Math.PI / 6 + wingFlap, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(6, -4, 6, 3, Math.PI / 6 - wingFlap, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-2, 0, 1, 0, Math.PI * 2);
        ctx.arc(2, 0, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        this.renderLevelInfo(ctx);
    }
}