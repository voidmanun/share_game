import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { Particle } from './Particle';
import { PetProjectile } from './PetProjectile';

export class LuckyCat extends Pet {
    private attackTimer: number = 0;

constructor(player: Player, game: Game) {
        super(player, game, 45, 160, 8, '#FFD700');
        this.attackInterval = 1.2;
        this.attackRange = 200;
        this.attackDamage = 3;
        this.projectileColor = '#FFD700';
    }

    public act(deltaTime: number): void {
        this.attackTimer += deltaTime;
        this.updateAttackCooldown(deltaTime);

        if (this.attackTimer > 2.0) {
            this.attackTimer = 0;
            this.swipeAttack();
        }
        
        const target = this.findNearestEnemy();
        if (target) {
            this.performAttack(target.x, target.y);
        }
    }
    
    protected performAttack(targetX: number, targetY: number): void {
        if (this.attackCooldown > 0) return;
        
        const isLucky = Math.random() < 0.3;
        const damage = isLucky 
            ? this.attackDamage * this.damageMultiplier * 2 
            : this.attackDamage * this.damageMultiplier;
        
        const projectile = new PetProjectile(
            this.x, this.y, targetX, targetY,
            damage,
            this.constructor.name, this.game, 
            isLucky ? '#FF4500' : this.projectileColor, 
            'normal'
        );
        projectile.radius = isLucky ? 8 : 5;
        
        this.game.addPetProjectile(projectile);
        
        if (isLucky) {
            for (let i = 0; i < 5; i++) {
                this.game.particles.push(new Particle(this.x, this.y, '#FFD700'));
            }
            this.game.createExplosion(this.x, this.y, '#FFD700');
        }
        
        this.attackCooldown = this.attackInterval;
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
                enemy.takeDamage(damage * this.damageMultiplier);
                this.game.createExplosion(enemy.x, enemy.y, '#FFD700');

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
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

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

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-3, -2, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'pink';
        ctx.beginPath();
        ctx.arc(0, 1, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-2, 1); ctx.lineTo(-8, 0);
        ctx.moveTo(-2, 2); ctx.lineTo(-8, 3);
        ctx.moveTo(2, 1); ctx.lineTo(8, 0);
        ctx.moveTo(2, 2); ctx.lineTo(8, 3);
        ctx.stroke();

        ctx.restore();
        this.renderLevelInfo(ctx);
    }
}