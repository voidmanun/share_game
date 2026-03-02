import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { Projectile } from '../weapons/Projectile';

export class KnightPet extends Pet {
    private attackTimer: number = 0;
    private skillTimer: number = 0;
    
    constructor(player: Player, game: Game) {
        super(player, game, 60, 150, 15, '#C0C0C0'); // Silver color
        this.attackTimer = 1;
        this.skillTimer = 5;
    }

    public get hp(): number {
        return this.player.maxHp / 2;
    }

    public get damage(): number {
        // Calculate total player damage roughly (or just use a base if needed)
        let totalDmg = 0;
        if (this.player.weapons.length > 0) {
             totalDmg = this.player.weapons.reduce((acc, w) => acc + w.damage, 0);
        } else {
             totalDmg = 2; // Default
        }
        return totalDmg / 2;
    }

    public act(deltaTime: number): void {
        this.attackTimer -= deltaTime;
        this.skillTimer -= deltaTime;

        if (this.attackTimer <= 0) {
            this.attack();
            this.attackTimer = 1;
        }

        if (this.skillTimer <= 0) {
            this.useSkill();
            this.skillTimer = 5;
        }
    }

    private attack(): void {
        const target = this.game.getNearestEnemy(this.x, this.y);
        if (!target) return;

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const speed = 400;
            const vx = (dx / distance) * speed;
            const vy = (dy / distance) * speed;
            
            // Create a sword slash or projectile
            const proj = new Projectile(this.x, this.y, vx, vy, this.damage);
            proj.color = '#C0C0C0';
            this.game.addProjectile(proj);
        }
    }

    private useSkill(): void {
        // 50% shield, 50% heal
        if (Math.random() < 0.5) {
            // Skill 1: Shield
            this.player.becomeInvincible(3);
            this.game.createExplosion(this.player.x, this.player.y, '#ADD8E6'); // Light blue explosion
        } else {
            // Skill 2: Heal
            this.player.heal(5);
            this.game.createExplosion(this.player.x, this.player.y, '#00FF00'); // Green explosion
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Helmet/Body
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Visor slit
        ctx.fillStyle = '#000';
        ctx.fillRect(-8, -4, 16, 4);

        // Sword
        ctx.fillStyle = '#A9A9A9';
        ctx.fillRect(this.radius, -this.radius, 4, this.radius * 2);

        // Shield
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(-this.radius, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
