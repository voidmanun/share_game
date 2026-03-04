import { Enemy } from './Enemy';
import { Player } from './Player';

export class Spirit extends Enemy {
    public maxHp: number;
    private summonCount: number = 0;
    private static MAX_SUMMONS = 8;

    constructor(x: number, y: number, player: Player) {
        super(x, y, player);
        this.radius = 12;
        this.color = '#AAAAAA';
        this.hp = 10;
        this.maxHp = 10;
        this.speed = 80;
        this.damage = 1;
        this.summonCount = 0;
    }

    public takeDamage(amount: number, game?: any): void {
        this.hp -= amount;
        if (this.hp <= 0) {
            if (this.summonCount < Spirit.MAX_SUMMONS && game && game.enemies) {
                this.summonCount++;
                this.isDead = false;
                this.hp = this.maxHp;
                const gameRef = game as any;
                const babySpirit = new Spirit(this.x, this.y, this.player);
                babySpirit.hp = this.maxHp;
                babySpirit.maxHp = this.maxHp;
                gameRef.enemies.push(babySpirit);
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
