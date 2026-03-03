import { Weapon } from './Weapon';
import { Projectile } from './Projectile';

export class MagicWand extends Weapon {
    public name = 'Magic Wand';

    constructor(game: import('../Game').Game, owner: import('../entities/Player').Player) {
        super(game, owner, 0.5, 8);
    }

    protected fire(): void {
        const target = this.game.getNearestEnemy(this.owner.x, this.owner.y);
        if (!target) return;

        const dx = target.x - this.owner.x;
        const dy = target.y - this.owner.y;
        const baseAngle = Math.atan2(dy, dx);
        
        const speed = 600;
        const spreadAngle = 0.2; // small spread between the two bullets
        
        const angles = [baseAngle - spreadAngle/2, baseAngle + spreadAngle/2];
        
        for (const angle of angles) {
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.game.addProjectile(new Projectile(this.owner.x, this.owner.y, vx, vy, this.damage));
        }

        this.game.soundManager.playShootSound();
    }
}
