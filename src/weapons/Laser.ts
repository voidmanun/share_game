import { Weapon } from './Weapon';
import { Game } from '../Game';
import { Player } from '../entities/Player';
import { Pickup } from '../entities/Pickup';

export class Laser extends Weapon {
    private isFiring: boolean = false;
    private durationTimer: number = 0;
    private readonly duration: number = 1.0;
    private angle: number = 0;
    private readonly length: number = 2000; // Long enough to cover screen
    private readonly width: number = 20; // 20 matches player radius (half diameter)

    constructor(game: Game, owner: Player) {
        super(game, owner, 20, 100); // 20s cooldown, 100 damage (high)
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        if (this.isFiring) {
            this.durationTimer += deltaTime;
            if (this.durationTimer >= this.duration) {
                this.isFiring = false;
            } else {
                this.checkCollisions(deltaTime);
            }
        }
    }

    protected fire(): void {
        const target = this.game.getNearestEnemy(this.owner.x, this.owner.y);
        if (target) {
            this.angle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
        } else {
            // Default to random angle or facing right
            this.angle = Math.random() * Math.PI * 2;
        }
        this.isFiring = true;
        this.durationTimer = 0;
        this.game.soundManager.playLaserSound();
        console.log("Laser Fired!");
    }

    private checkCollisions(deltaTime: number): void {
        const enemies = this.game.getEnemies();
        const laserEndX = this.owner.x + Math.cos(this.angle) * this.length;
        const laserEndY = this.owner.y + Math.sin(this.angle) * this.length;

        for (const enemy of enemies) {
            // Point (enemy) to Line Segment (laser) distance
            const px = enemy.x;
            const py = enemy.y;
            const x1 = this.owner.x;
            const y1 = this.owner.y;
            const x2 = laserEndX;
            const y2 = laserEndY;

            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;

            const dot = A * C + B * D;
            const len_sq = C * C + D * D;
            let param = -1;
            if (len_sq != 0) // in case of 0 length line
                param = dot / len_sq;

            let xx, yy;

            if (param < 0) {
                xx = x1;
                yy = y1;
            }
            else if (param > 1) {
                xx = x2;
                yy = y2;
            }
            else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }

            const dx = px - xx;
            const dy = py - yy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Laser width check (radius of enemy + laser thickness/2)
            if (dist < enemy.radius + (this.width / 2)) {
                enemy.takeDamage(this.damage * deltaTime * 10);
                if (enemy.isDead) {
                    // Logic duplication from Game.ts CheckCollisions, ideally refactor but for now inline
                    // Since Laser doesn't have access to createExplosion directly easily without refactor or public method
                    // Let's make createExplosion public or just ignore particles for laser for now? 
                    // Actually Game pass strictly, let's cast or better: make createExplosion public in Game.ts
                    // But waiting for that edit might be sync issue.
                    // For now, let's just play sound. Laser melts enemies so maybe no explosion?
                    // USER request: "Add sound and effect when enemy is destroyed".
                    // I should add effect. I need to make createExplosion public in Game.ts.
                    this.game.createExplosion(enemy.x, enemy.y, enemy.color);
                    this.game.soundManager.playExplosionSound();

                    // Drop gold
                    this.game.addPickup(new Pickup(enemy.x, enemy.y, 10));
                }
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.isFiring) return;

        const endX = this.owner.x + Math.cos(this.angle) * this.length;
        const endY = this.owner.y + Math.sin(this.angle) * this.length;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.owner.x, this.owner.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#FFFFFF'; // White
        ctx.lineWidth = this.width; // Match collision width
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'white';
        ctx.lineWidth = this.width / 4; // Inner core
        ctx.stroke();

        ctx.restore();
    }
}
