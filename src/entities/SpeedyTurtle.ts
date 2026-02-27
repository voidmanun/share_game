import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';

export class SpeedyTurtle extends Pet {
    private buffActive: boolean = false;
    private buffTimer: number = 0;

    constructor(player: Player, game: Game) {
        // Very slow pet, green color
        super(player, game, 60, 80, 12, '#2E8B57'); // SeaGreen
        this.buffTimer = 5 + Math.random() * 5; // Starts buff in 5-10s
    }

    public act(deltaTime: number): void {
        this.buffTimer -= deltaTime;

        if (this.buffTimer <= 0) {
            if (!this.buffActive) {
                // Activate buff
                this.buffActive = true;
                this.buffTimer = 5; // Buff lasts 5 seconds
                this.player.speedMultiplier = 1.5; // Let's add this property to Player

                // Visual feedback on player
                this.player.color = '#00FF7F'; // SpringGreen temporarily
            } else {
                // Deactivate buff
                this.buffActive = false;
                this.buffTimer = 15 + Math.random() * 10; // 15-25s cooldown
                this.player.speedMultiplier = 1.0;
                this.player.color = '#006994'; // Revert to Sea Blue
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        // Shell
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius + 4, this.radius, this.hoverAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Shell pattern
        ctx.strokeStyle = '#006400'; // DarkGreen
        ctx.lineWidth = 2;
        ctx.save();
        ctx.rotate(this.hoverAngle);
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.stroke();
        ctx.restore();

        // Head
        ctx.fillStyle = '#3CB371'; // MediumSeaGreen
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const headX = Math.cos(this.hoverAngle) * (this.radius + 4);
        const headY = Math.sin(this.hoverAngle) * (this.radius + 4);
        ctx.arc(headX, headY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Buff indicator
        if (this.buffActive) {
            ctx.strokeStyle = 'rgba(0, 255, 127, 0.8)'; // Glowing SpringGreen
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}
