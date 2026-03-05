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
        
        const speed = 300;
        const vx = Math.cos(baseAngle) * speed;
        const vy = Math.sin(baseAngle) * speed;
        this.game.addProjectile(new Projectile(this.owner.x, this.owner.y, vx, vy, this.damage));

        this.game.soundManager.playShootSound();
    }
}
