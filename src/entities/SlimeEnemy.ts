import { Enemy } from './Enemy';
import { Player } from './Player';
import { Game } from '../Game';

export class SlimeEnemy extends Enemy {
    public maxHp: number;
    private state: 'normal' | 'dashing' = 'normal';
    private stateTimer: number = 0;
    private hasSplit: boolean = false;

    constructor(x: number, y: number, player: Player, _game: Game, _generation: number = 0) {
        super(x, y, player);

        this.radius = 24;
        this.color = '#32CD32';
        this.hp = 30;
        this.maxHp = this.hp;
        this.speed = 40;
        this.damage = 2;
        this.hasSplit = false;
    }

    public takeDamage(amount: number, game?: any): void {
        this.hp -= amount;
        if (this.hp <= 0 && !this.hasSplit) {
            this.hasSplit = true;
            this.isDead = false;
            this.hp = this.maxHp;
            if (game && game.enemies) {
                const gameRef = game as any;
                for (let i = 0; i < 3; i++) {
                    const angle = (Math.PI * 2 / 3) * i;
                    const sx = this.x + Math.cos(angle) * 30;
                    const sy = this.y + Math.sin(angle) * 30;
                    const split = new SlimeEnemy(sx, sy, this.player, gameRef, 1);
                    gameRef.enemies.push(split);
                }
            }
        } else if (this.hp <= 0) {
            this.isDead = true;
        }
    }

    public update(deltaTime: number, game?: any): void {
        super.update(deltaTime, game);
        
        if (this.trappedInBubble) return;

        this.stateTimer -= deltaTime;
        if (this.stateTimer <= 0 && this.state !== 'normal') {
            this.state = 'normal';
            this.speed = 40;
        }

        if (this.state === 'dashing') {
            this.speed = 200;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 1.1, this.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        const eyeOffset = this.radius * 0.4;
        const eyeRadius = this.radius * 0.15;
        ctx.arc(-eyeOffset, -this.radius * 0.2, eyeRadius, 0, Math.PI * 2);
        ctx.arc(eyeOffset, -this.radius * 0.2, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'red';
        ctx.fillRect(-this.radius, -this.radius - 10, this.radius * 2, 4);
        ctx.fillStyle = 'green';
        const hpPercent = Math.max(0, this.hp / this.maxHp);
        ctx.fillRect(-this.radius, -this.radius - 10, (this.radius * 2) * hpPercent, 4);

        ctx.restore();
    }
}
