import { Entity } from './Entity';
import { Player } from './Player';

export class Enemy extends Entity {
    protected player: Player;
    protected speed: number = 50; // pixels per second
    public hp: number = 6;
    public damage: number = 1;
    public trappedInBubble: boolean = false;
    private floatDistance: number = 0;
    public antiHealTimer: number = 0;
    public poisonTimer: number = 0;
    public poisonDamage: number = 0;
    public poisonTickTimer: number = 0;
    public charmed: boolean = false;
    public charmTimer: number = 0;
    public charmTarget: Enemy | null = null;
    private attackCooldown: number = 0;

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

    public heal(amount: number): void {
        if (this.antiHealTimer <= 0) {
            this.hp += amount;
        }
    }

    public applyCharm(duration: number): void {
        this.charmed = true;
        this.charmTimer = duration;
        this.color = '#FF69B4'; // Hot pink when charmed
    }

    private findNearestEnemy(allEnemies: Enemy[]): Enemy | null {
        let nearest: Enemy | null = null;
        let minDist = Infinity;

        for (const enemy of allEnemies) {
            if (enemy === this || enemy.charmed) continue; // Don't target self or other charmed enemies
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        }
        return nearest;
    }

    public update(deltaTime: number, game?: any): void {
        super.update(deltaTime);

        if (this.poisonTimer > 0) {
            this.poisonTimer -= deltaTime;
            this.poisonTickTimer -= deltaTime;
            if (this.poisonTickTimer <= 0) {
                this.takeDamage(this.poisonDamage);
                this.poisonTickTimer = 1.0; // 1 tick per second
            }
        }

        if (this.antiHealTimer > 0) {
            this.antiHealTimer -= deltaTime;
        }

        // Handle charm timer
        if (this.charmed) {
            this.charmTimer -= deltaTime;
            if (this.charmTimer <= 0) {
                this.charmed = false;
                this.color = '#39FF14'; // Revert to original color
                this.charmTarget = null;
            } else if (game && game.getEnemies) {
                // Find nearest enemy to attack
                const enemies = game.getEnemies();
                this.charmTarget = this.findNearestEnemy(enemies);

                if (this.charmTarget) {
                    const dx = this.charmTarget.x - this.x;
                    const dy = this.charmTarget.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 0) {
                        // Move towards target
                        this.x += (dx / dist) * this.speed * deltaTime;
                        this.y += (dy / dist) * this.speed * deltaTime;
                    }

                    // Attack target if close enough
                    if (dist < this.radius + this.charmTarget.radius) {
                        this.attackCooldown -= deltaTime;
                        if (this.attackCooldown <= 0) {
                            this.charmTarget.takeDamage(this.damage);
                            this.attackCooldown = 1.0; // Attack once per second
                        }
                    }
                }
            }
            return; // Skip normal movement
        }

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

        // Draw poison effect
        if (this.poisonTimer > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'; // Green border indicating poison
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Bubbles
            ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(10, -10, 3, 0, Math.PI * 2);
            ctx.arc(-5, -15, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw anti-heal icon or color effect
        if (this.antiHealTimer > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(128, 0, 128, 0.8)'; // Purple border indicating anti-heal
            ctx.lineWidth = 4;
            ctx.stroke();
            
            // Small cross out mark
            ctx.beginPath();
            ctx.moveTo(-10, -10);
            ctx.lineTo(10, 10);
            ctx.moveTo(10, -10);
            ctx.lineTo(-10, 10);
            ctx.strokeStyle = '#800080';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Draw charm effect (hearts around enemy)
        if (this.charmed) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 105, 180, 0.8)'; // Hot pink border
            ctx.lineWidth = 3;
            ctx.stroke();

            // Floating hearts
            const time = Date.now() / 500;
            for (let i = 0; i < 3; i++) {
                const heartAngle = time + (i * Math.PI * 2 / 3);
                const hx = Math.cos(heartAngle) * (this.radius + 12);
                const hy = Math.sin(heartAngle) * (this.radius + 12);
                ctx.fillStyle = '#FF69B4';
                ctx.beginPath();
                ctx.arc(hx, hy, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}
