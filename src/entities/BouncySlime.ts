import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { Particle } from './Particle';

export class BouncySlime extends Pet {
    private jumpTimer: number = 0;
    private isJumping: boolean = false;
    private jumpHeight: number = 0;
    private maxJumpHeight: number = 20;

    constructor(player: Player, game: Game) {
        // Hover distance 40, Speed 120, Radius 8, Color Slime Green
        super(player, game, 40, 120, 8, '#32CD32'); 
    }

    public act(deltaTime: number): void {
        this.jumpTimer += deltaTime;

        // Slime jumps every 1.5 seconds
        if (!this.isJumping && this.jumpTimer > 1.5) {
            this.isJumping = true;
            this.jumpTimer = 0;
            
            // Visual effect when jumping
            for (let i = 0; i < 3; i++) {
                this.game.particles.push(new Particle(this.x, this.y, '#98FB98')); // Light green
            }
        }

        // Handle jump animation logic
        if (this.isJumping) {
            // A simple parabolic jump (up then down)
            if (this.jumpTimer < 0.25) { // Going up
                this.jumpHeight = (this.jumpTimer / 0.25) * this.maxJumpHeight;
            } else if (this.jumpTimer < 0.5) { // Going down
                this.jumpHeight = this.maxJumpHeight - ((this.jumpTimer - 0.25) / 0.25) * this.maxJumpHeight;
            } else { // Landed
                this.isJumping = false;
                this.jumpHeight = 0;
                this.jumpTimer = 0; // Reset timer for next cycle
                
                // Area of Effect damage when landing
                this.dealLandingDamage();
            }
        }
    }

    private dealLandingDamage(): void {
        // Visual effect for landing impact
        for (let i = 0; i < 8; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '#32CD32')); // Slime green splash
        }

        // Find enemies near the landing spot
        const enemies = this.game.getEnemies();
        const splashRadius = 40;
        const damage = 2; // Moderate splash damage

        for (const enemy of enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= splashRadius) {
                enemy.takeDamage(damage);
                this.game.createExplosion(enemy.x, enemy.y, enemy.color);
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Apply jump height offset for rendering
        const renderY = this.y - this.jumpHeight;
        ctx.translate(this.x, renderY);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#006400'; // Dark green border
        ctx.lineWidth = 2;

        // Slime body (squishy look)
        let stretch = 1;
        let squash = 1;

        if (this.isJumping) {
            if (this.jumpTimer < 0.25) {
                // Stretching up
                stretch = 1.3;
                squash = 0.8;
            } else {
                // Falling down (normalish)
                stretch = 1.0;
                squash = 1.0;
            }
        } else if (this.jumpTimer > 1.3) {
            // Squashing down right before jumping
            stretch = 0.7;
            squash = 1.3;
        }

        ctx.beginPath();
        // Base of slime (flat bottom, rounded top)
        ctx.ellipse(0, this.radius - (this.radius * stretch), this.radius * squash, this.radius * stretch, 0, Math.PI, 0); 
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Slime eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-3, -this.radius / 2, 1.5, 0, Math.PI * 2); // Left eye
        ctx.arc(3, -this.radius / 2, 1.5, 0, Math.PI * 2);  // Right eye
        ctx.fill();

        // Slime blush/cheeks
        ctx.fillStyle = 'rgba(255, 105, 180, 0.6)'; // Hot pink translucent
        ctx.beginPath();
        ctx.arc(-4, -this.radius / 3, 1, 0, Math.PI * 2);
        ctx.arc(4, -this.radius / 3, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}