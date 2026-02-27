import { Weapon } from './Weapon';
import { BubbleProjectile } from './BubbleProjectile';
import { Player } from '../entities/Player';
import { Game } from '../Game';

export class BubbleGun extends Weapon {
    public override name: string = 'Bubble Gun';

    constructor(game: Game, player: Player) {
        super(game, player, 1, 1.5); // Fires every 1.5 seconds, damage 1 (doesn't matter much)
    }

    public update(deltaTime: number): void {
        this.cooldown -= deltaTime;
        if (this.cooldown <= 0) {
            this.fire();
            // Upgrades reduce cooldown slightly or add more bubbles
            this.cooldown = Math.max(0.5, this.fireRate - (this.level * 0.15));
        }
    }

    protected fire(): void {
        const nearestEnemy = this.game.getNearestEnemy(this.owner.x, this.owner.y);

        let dirX = 0;
        let dirY = -1; // Default up

        if (nearestEnemy) {
            const dx = nearestEnemy.x - this.owner.x;
            const dy = nearestEnemy.y - this.owner.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                dirX = dx / dist;
                dirY = dy / dist;
            }
        } else {
            const angle = this.owner.getFacingAngle();
            dirX = Math.cos(angle);
            dirY = Math.sin(angle);
        }

        // Base level shoots 1 bubble, higher levels shoot more in an arc
        const numBubbles = Math.min(6, 1 + Math.floor(this.level / 2));
        const spreadFunc = (i: number, total: number) => {
            if (total === 1) return 0;
            return (i - (total - 1) / 2) * 0.3; // 0.3 radians spread
        };

        for (let i = 0; i < numBubbles; i++) {
            const angleOffset = spreadFunc(i, numBubbles);
            const baseAngle = Math.atan2(dirY, dirX);
            const finalAngle = baseAngle + angleOffset;

            const pDirX = Math.cos(finalAngle);
            const pDirY = Math.sin(finalAngle);

            this.game.addProjectile(new BubbleProjectile(
                this.owner.x,
                this.owner.y,
                pDirX,
                pDirY,
                this.damage
            ));
        }
    }

    public render(_ctx: CanvasRenderingContext2D): void {
        // Bubble gun visual (optional)
    }
}
