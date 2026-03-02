import { Enemy } from './Enemy';
import { Player } from './Player';

export class TwinProjectile extends Enemy {
    public vx: number;
    public vy: number;
    private lifeTime: number = 3;

    constructor(x: number, y: number, vx: number, vy: number, damage: number, color: string, player: Player) {
        super(x, y, player);
        this.radius = 6;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.hp = 1; // Dies in 1 hit by player bullets
        this.speed = 0; 
    }

    public update(deltaTime: number): void {
        if (this.trappedInBubble) {
            this.isDead = true;
            return;
        }

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        this.lifeTime -= deltaTime;
        if (this.lifeTime <= 0) {
            this.isDead = true;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
