import { Enemy } from './Enemy';
import { Player } from './Player';

export class EnemyBullet extends Enemy {
    private vx: number;
    private vy: number;
    private lifespan: number = 3;

    constructor(x: number, y: number, vx: number, vy: number, damage: number, color: string, player: Player) {
        super(x, y, player);
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.color = color;
        this.radius = 6;
        this.hp = 1; // Can be destroyed by player bullets
        this.speed = 0; // Handled by vx/vy
    }

    public update(deltaTime: number): void {
        // We do NOT call super.update() because we don't want it to chase the player
        if (this.trappedInBubble) {
            this.isDead = true; // bullets pop in bubbles
            return;
        }

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        this.lifespan -= deltaTime;
        if (this.lifespan <= 0) {
            this.isDead = true;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
}
