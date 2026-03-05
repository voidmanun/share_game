import { Weapon } from './Weapon';
import { Projectile } from './Projectile';
import { Game } from '../Game';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export class FreezeProjectile extends Projectile {
    public onHit(enemy: Enemy): void {
        enemy.freezeTimer = 3; // Freeze for 3 seconds
    }
}

export class FreezeGun extends Weapon {
    public name = 'Freeze Gun';

    constructor(game: Game, owner: Player) {
        super(game, owner, 1.2, 3); // 1.2s fire rate, 3 damage
    }

    protected fire(): void {
        const target = this.game.getNearestEnemy(this.owner.x, this.owner.y);

        if (target) {
            const angle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
            const speed = 450;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const proj = new FreezeProjectile(this.owner.x, this.owner.y, vx, vy, this.totalDamage);
            proj.color = '#00FFFF'; // Cyan for freeze
            this.game.addProjectile(proj);
            this.game.soundManager.playShootSound();
        }
    }

    public upgrade(): { damage: number, fireRate: number } {
        const stats = super.upgrade();
        return stats;
    }
}
