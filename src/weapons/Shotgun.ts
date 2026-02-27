import { Weapon } from './Weapon';
import { Projectile } from './Projectile';
import { Game } from '../Game';
import { Player } from '../entities/Player';

export class Shotgun extends Weapon {
    public name = 'Shotgun';
    private spreadAngle = Math.PI / 4; // 45 degrees spread
    private numProjectiles = 5;

    constructor(game: Game, owner: Player) {
        super(game, owner, 1.2, 1); // 1.2s fire rate, 1 damage per pellet (can hit multiple times)
    }

    protected fire(): void {
        const target = this.game.getNearestEnemy(this.owner.x, this.owner.y);
        let baseAngle = this.owner.getFacingAngle?.() || 0; // fallback to rotation or 0

        if (target) {
            baseAngle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
        } else {
            // If no targets, maybe shoot forward relative to player movement, or random
            baseAngle = Math.random() * Math.PI * 2;
        }

        const startAngle = baseAngle - (this.spreadAngle / 2);
        const angleStep = this.spreadAngle / (this.numProjectiles - 1);
        const speed = 600;

        for (let i = 0; i < this.numProjectiles; i++) {
            const angle = startAngle + (angleStep * i);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const proj = new Projectile(this.owner.x, this.owner.y, vx, vy, this.damage);
            proj.maxLife = 0.5; // Short range!
            proj.color = '#FFA500'; // Orange
            this.game.addProjectile(proj);
        }

        this.game.soundManager.playShootSound(); // Reusing shoot
    }

    public upgrade(): { damage: number, fireRate: number } {
        const stats = super.upgrade();
        // Shotgun uniquely gains more pellets on some level ups
        if (this.level % 2 === 0) {
            this.numProjectiles += 2;
            this.spreadAngle += Math.PI / 12; // Spread slightly wider
        }
        return stats;
    }
}
