import { Weapon } from './Weapon';
import { Projectile } from './Projectile';
import { Game } from '../Game';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export class SplitterProjectile extends Projectile {
    public penetration: number = 3; // penetrates 3 times
    public hitEnemies: Set<Enemy> = new Set();
    public game: Game;

    constructor(game: Game, x: number, y: number, vx: number, vy: number, damage: number) {
        super(x, y, vx, vy, damage);
        this.game = game;
        this.color = '#FF00FF'; // Magenta
        this.maxLife = 3;
    }

    public onHit(enemy: Enemy): void {
        // Split into 2 smaller projectiles on hit
        const speed = 400;
        const baseAngle = Math.random() * Math.PI * 2;
        const numSplits = 2;

        for (let i = 0; i < numSplits; i++) {
            const angle = baseAngle + (Math.PI * 2 / numSplits) * i;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const subProj = new Projectile(enemy.x, enemy.y, vx, vy, this.damage);
            subProj.color = '#FF88FF'; // Lighter magenta
            subProj.maxLife = 1.5;
            this.game.addProjectile(subProj);
        }
    }
}

export class SplitterGun extends Weapon {
    public name = 'Splitter Gun';

    constructor(game: Game, owner: Player) {
        super(game, owner, 1.0, 2); // 1.0s fire rate, 2 damage
    }

    protected fire(): void {
        const target = this.game.getNearestEnemy(this.owner.x, this.owner.y);
        let angle = this.owner.getFacingAngle?.() || 0;

        if (target) {
            angle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
        } else {
            angle = Math.random() * Math.PI * 2;
        }

        const speed = 500;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const proj = new SplitterProjectile(this.game, this.owner.x, this.owner.y, vx, vy, this.totalDamage);
        this.game.addProjectile(proj);
    }
}
