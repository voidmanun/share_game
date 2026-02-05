import { Weapon } from './Weapon';
import { Projectile } from './Projectile';

export class MagicWand extends Weapon {
    protected fire(): void {
        const target = this.game.getNearestEnemy(this.owner.x, this.owner.y);
        if (!target) return;

        const dx = target.x - this.owner.x;
        const dy = target.y - this.owner.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const speed = 400;
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;

        this.game.addProjectile(new Projectile(this.owner.x, this.owner.y, vx, vy, this.damage));
    }
}
