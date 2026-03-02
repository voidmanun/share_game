import { Enemy } from './Enemy';
import { Player } from './Player';
import { Game } from '../Game';
import { Spirit } from './Spirit';

export class Necromancer extends Enemy {
    private game: Game;
    public lives: number = 3;
    public maxHp: number = 500;
    private summonTimer: number = 4; // summons every 4 seconds

    constructor(x: number, y: number, player: Player, game: Game) {
        super(x, y, player);
        this.game = game;
        this.radius = 25;
        this.color = '#4B0082'; // Indigo/dark purple
        this.hp = 500;
        this.maxHp = 500;
        this.speed = 30; // Slow moving
        this.damage = 5;
    }

    public takeDamage(amount: number): void {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.lives--;
            if (this.lives > 0) {
                this.hp = this.maxHp;
            } else {
                this.isDead = true;
            }
        }
    }

    public update(deltaTime: number, game?: any): void {
        super.update(deltaTime, game);

        if (this.trappedInBubble) return;

        // Summon Spirits every 4 seconds
        this.summonTimer -= deltaTime;
        if (this.summonTimer <= 0) {
            this.summonTimer = 4;
            this.summonSpirits();
        }
    }

    private summonSpirits(): void {
        const numSpawns = 6;
        for (let i = 0; i < numSpawns; i++) {
            const angle = (Math.PI * 2 / numSpawns) * i;
            const sx = this.x + Math.cos(angle) * 40;
            const sy = this.y + Math.sin(angle) * 40;
            const spirit = new Spirit(sx, sy, this.player);
            
            // Can apply current HP multiplier if desired, but we keep it simple
            const hpMultiplier = 1 + (Math.floor(this.game.gameTime / 30) * 0.5);
            spirit.hp *= hpMultiplier;
            spirit.maxHp = spirit.hp;
            this.game.getEnemies().push(spirit);
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Render Necromancer
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        // A cloaked figure shape
        ctx.arc(0, -5, this.radius, Math.PI, 0); // Hood
        ctx.lineTo(this.radius, this.radius);
        ctx.lineTo(-this.radius, this.radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing red eyes
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(-8, -10, 4, 0, Math.PI * 2);
        ctx.arc(8, -10, 4, 0, Math.PI * 2);
        ctx.fill();

        // HP Bar
        ctx.fillStyle = 'red';
        ctx.fillRect(-this.radius, -this.radius - 15, this.radius * 2, 4);
        ctx.fillStyle = 'green';
        const hpPercent = Math.max(0, this.hp / this.maxHp);
        ctx.fillRect(-this.radius, -this.radius - 15, (this.radius * 2) * hpPercent, 4);

        // Draw lives indicator
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Lives: ${this.lives}`, 0, -this.radius - 20);

        ctx.restore();
    }
}
