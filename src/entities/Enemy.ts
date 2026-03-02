import { Entity } from './Entity';
import { Player } from './Player';

export class Enemy extends Entity {
    protected player: Player;
    protected speed: number = 50; // pixels per second
    public hp: number = 6;
    public damage: number = 1;
    public trappedInBubble: boolean = false;
    private floatDistance: number = 0;

    constructor(x: number, y: number, player: Player) {
        super(x, y, 15, '#39FF14'); // Neon Green
        this.player = player;
        // Removed sprite loading
    }

    public takeDamage(amount: number): void {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.isDead = true;
        }
    }

    public update(deltaTime: number, _game?: any): void {
        super.update(deltaTime);

        if (this.trappedInBubble) {
            // Float upwards slowly
            this.y -= 50 * deltaTime;
            this.floatDistance += 50 * deltaTime;

            // Disappear after floating far enough
            if (this.floatDistance > 300) {
                this.isDead = true;
            }
            return; // Skip normal movement
        }

        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.x += (dx / dist) * this.speed * deltaTime;
            this.y += (dy / dist) * this.speed * deltaTime;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        let angle = Math.atan2(dy, dx);
        if (this.trappedInBubble) angle = -Math.PI / 2; // Look up if trapped

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        // --- NEW MORE DETAILED ALIEN DESIGN ---

        // Antennae
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-15, -15, -10, -25); // Left antenna
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(15, -15, 10, -25); // Right antenna
        ctx.stroke();

        // Antenna Balls (Glowing Red)
        ctx.fillStyle = '#FF3333';
        ctx.beginPath();
        ctx.arc(-10, -25, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(10, -25, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Main Body (Squid/Jellyfish shape)
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        ctx.beginPath();
        // Top dome
        ctx.arc(0, 0, this.radius, Math.PI, 0); 
        // Bottom wavy edge
        ctx.quadraticCurveTo(this.radius * 0.75, this.radius * 0.5, this.radius * 0.5, 0);
        ctx.quadraticCurveTo(0, this.radius * 0.8, -this.radius * 0.5, 0);
        ctx.quadraticCurveTo(-this.radius * 0.75, this.radius * 0.5, -this.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tentacles
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.6, 0);
        ctx.lineTo(-this.radius * 0.8, this.radius * 1.2);
        
        ctx.moveTo(-this.radius * 0.2, 0);
        ctx.lineTo(-this.radius * 0.3, this.radius * 1.5);

        ctx.moveTo(this.radius * 0.2, 0);
        ctx.lineTo(this.radius * 0.3, this.radius * 1.5);

        ctx.moveTo(this.radius * 0.6, 0);
        ctx.lineTo(this.radius * 0.8, this.radius * 1.2);
        ctx.stroke();

        // Giant Single Cyclops Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(0, -this.radius * 0.3, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pupil (Slit like a cat/reptile)
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.ellipse(0, -this.radius * 0.3, this.radius * 0.15, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Iris detail (Red center glow)
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(0, -this.radius * 0.3, this.radius * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Draw bubble if trapped
        if (this.trappedInBubble) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 15, 0, Math.PI * 2); // Larger bubble for tentacles
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Bubble shine
            ctx.beginPath();
            ctx.arc(-this.radius * 0.5, -this.radius * 0.5, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }

        ctx.restore();
    }
}
