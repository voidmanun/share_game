import { Enemy } from './Enemy';
import { Player } from './Player';

export class Spirit extends Enemy {
    public maxHp: number;

    constructor(x: number, y: number, player: Player) {
        super(x, y, player);
        this.radius = 12;
        this.color = '#AAAAAA'; // Ghostly grey
        this.hp = 10;
        this.maxHp = 10;
        this.speed = 80;
        this.damage = 1;
    }

    public takeDamage(amount: number): void {
        this.hp -= amount;
        if (this.hp <= 0) {
            if (Math.random() < 0.5) {
                // 50% chance to revive
                this.hp = this.maxHp;
            } else {
                this.isDead = true;
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.7; // Ghostly transparency

        ctx.beginPath();
        // Simple ghost shape
        ctx.arc(0, -2, this.radius, Math.PI, 0);
        ctx.lineTo(this.radius, this.radius);
        ctx.lineTo(this.radius * 0.5, this.radius * 0.5);
        ctx.lineTo(0, this.radius);
        ctx.lineTo(-this.radius * 0.5, this.radius * 0.5);
        ctx.lineTo(-this.radius, this.radius);
        ctx.closePath();
        
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-4, -4, 2, 0, Math.PI * 2);
        ctx.arc(4, -4, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
}
