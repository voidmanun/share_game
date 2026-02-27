import { Weapon } from './Weapon';
import { Missile } from './Missile';
import { Game } from '../Game';
import { Player } from '../entities/Player';

export class MissileWeapon extends Weapon {
    public name = 'Missile Launcher';

    constructor(game: Game, owner: Player) {
        super(game, owner, 2.0, 7); // Slower fire rate initially, medium damage
    }

    protected fire(): void {
        const target = this.game.getNearestEnemy(this.owner.x, this.owner.y);

        // Even if no target right now, shoot it slowly in random direction so it can find target later
        let angle = Math.random() * Math.PI * 2;
        if (target) {
            angle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
        }

        const initialSpeed = 150;
        const vx = Math.cos(angle) * initialSpeed;
        const vy = Math.sin(angle) * initialSpeed;

        this.game.addProjectile(new Missile(this.owner.x, this.owner.y, vx, vy, this.damage, this.game));
        this.game.soundManager.playShootSound(); // Reusing shoot sound for now
    }
}
