import { Weapon } from './Weapon';
import { Projectile } from './Projectile';
import { Game } from '../Game';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export class PoisonProjectile extends Projectile {
    public onHit(enemy: Enemy): void {
        enemy.antiHealTimer = 5; // Apply anti-heal effect for 5 seconds
    }
}

export class PoisonGun extends Weapon {
    public name = 'Poison Gun';

    constructor(game: Game, owner: Player) {
        super(game, owner, 1.5, 2); // 1.5s fire rate, 2 damage
    }

    protected fire(): void {
        const target = this.game.getNearestEnemy(this.owner.x, this.owner.y);
        
        if (target) {
            const angle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
            const speed = 400;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const proj = new PoisonProjectile(this.owner.x, this.owner.y, vx, vy, this.damage);
            proj.color = '#800080'; // Purple for poison/anti-heal
            this.game.addProjectile(proj);
            this.game.soundManager.playShootSound();
        }
    }

    public upgrade(): { damage: number, fireRate: number } {
        const stats = super.upgrade();
        return stats;
    }
}
