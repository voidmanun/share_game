import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';

export class HolyLightTurtle extends Pet {
    private healTimer: number = 0;
    private shieldTimer: number = 0;
    private readonly HEAL_INTERVAL: number = 10; // Heal every 10 seconds
    private readonly SHIELD_INTERVAL: number = 10; // Shield every 10 seconds
    private readonly HEAL_AMOUNT: number = 1; // Small heal each second
    private readonly SHIELD_HITS: number = 3; // Shield blocks 3 attacks

    constructor(player: Player, game: Game) {
        // Golden/white turtle - holy theme
        super(player, game, 70, 60, 14, '#FFD700'); // Gold color
        this.healTimer = this.HEAL_INTERVAL;
        this.shieldTimer = this.SHIELD_INTERVAL;
    }

    public act(deltaTime: number): void {
        this.healTimer -= deltaTime;
        this.shieldTimer -= deltaTime;

        // Continuous healing
        if (this.healTimer <= 0) {
            this.heal();
            this.healTimer = this.HEAL_INTERVAL;
        }

        // Shield generation every 5 seconds
        if (this.shieldTimer <= 0) {
            this.generateShield();
            this.shieldTimer = this.SHIELD_INTERVAL;
        }
    }

    private heal(): void {
        if (this.player.hp < this.player.maxHp) {
            const healed = this.player.heal(this.HEAL_AMOUNT);
            if (healed > 0) {
                // Visual feedback - small holy particles
                this.game.createExplosion(this.x, this.y, '#FFD700');
            }
        }
    }

    private generateShield(): void {
        // Add shield (max 3 hits)
        this.player.addShield(this.SHIELD_HITS);
        // Visual feedback - holy shield effect
        this.game.createExplosion(this.player.x, this.player.y, '#87CEEB'); // Light blue
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#DAA520'; // GoldenRod
        ctx.lineWidth = 3;

        // Shell - golden dome
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius + 4, this.radius, this.hoverAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Holy glow effect on shell
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius + 8, this.radius + 4, this.hoverAngle, 0, Math.PI * 2);
        ctx.stroke();

        // Shell pattern - cross symbol (holy)
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.save();
        ctx.rotate(this.hoverAngle);
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.moveTo(0, -6);
        ctx.lineTo(0, 6);
        ctx.stroke();
        ctx.restore();

        // Head
        ctx.fillStyle = '#FFFACD'; // LemonChiffon - light holy color
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 3;
        const headX = Math.cos(this.hoverAngle) * (this.radius + 4);
        const headY = Math.sin(this.hoverAngle) * (this.radius + 4);
        ctx.beginPath();
        ctx.arc(headX, headY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Holy light indicator
        const time = Date.now() / 500;
        const glowAlpha = 0.3 + Math.sin(time) * 0.2;
        ctx.strokeStyle = `rgba(255, 255, 224, ${glowAlpha})`; // Light yellow glow
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}
