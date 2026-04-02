import { Entity } from './Entity';
import { Player } from './Player';

export class Enemy extends Entity {
    protected player: Player;
    public speed: number = 50; // pixels per second
    public hp: number = 10; // Increased from 6 for better pacing
    public damage: number = 1;
    public trappedInBubble: boolean = false;
    private floatDistance: number = 0;
    public antiHealTimer: number = 0;
    public poisonTimer: number = 0;
    public poisonDamage: number = 0;
    public poisonTickTimer: number = 0;
    public freezeTimer: number = 0;
    public slowTimer: number = 0;
    public charmed: boolean = false;
    public charmTimer: number = 0;
    public charmTarget: Enemy | null = null;
    private attackCooldown: number = 0;
    public noDrop: boolean = false;

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

        if (this.freezeTimer > 0) {
            this.freezeTimer -= deltaTime;
            if (this.freezeTimer <= 0) {
                this.slowTimer = 4;
            }
            return; // Skip normal movement while frozen
        }

        if (this.slowTimer > 0) {
            this.slowTimer -= deltaTime;
        }

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
            let currentSpeed = this.speed;
            if (this.slowTimer > 0) {
                currentSpeed *= 0.5;
            }
            // 应用天气速度修正
            if (game && game.weatherSystem) {
                currentSpeed *= game.weatherSystem.getEnemySpeedMod();
            }
            this.x += (dx / dist) * currentSpeed * deltaTime;
            this.y += (dy / dist) * currentSpeed * deltaTime;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        let angle = Math.atan2(dy, dx);
        if (this.trappedInBubble) angle = -Math.PI / 2;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        const bodyGradient = ctx.createRadialGradient(0, -this.radius * 0.3, 0, 0, 0, this.radius);
        bodyGradient.addColorStop(0, this.lightenColor(this.color, 40));
        bodyGradient.addColorStop(0.5, this.color);
        bodyGradient.addColorStop(1, this.darkenColor(this.color, 40));

        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowOffsetY = 3;

        ctx.strokeStyle = this.darkenColor(this.color, 60);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-15, -15, -10, -25);
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(15, -15, 10, -25);
        ctx.stroke();

        const antennaGlow = ctx.createRadialGradient(-10, -25, 0, -10, -25, 6);
        antennaGlow.addColorStop(0, '#FF6666');
        antennaGlow.addColorStop(0.5, '#FF3333');
        antennaGlow.addColorStop(1, '#CC0000');
        ctx.fillStyle = antennaGlow;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FF0000';
        ctx.beginPath();
        ctx.arc(-10, -25, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(10, -25, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.fillStyle = bodyGradient;
        ctx.strokeStyle = this.darkenColor(this.color, 50);
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, Math.PI, 0);
        ctx.quadraticCurveTo(this.radius * 0.75, this.radius * 0.5, this.radius * 0.5, 0);
        ctx.quadraticCurveTo(0, this.radius * 0.8, -this.radius * 0.5, 0);
        ctx.quadraticCurveTo(-this.radius * 0.75, this.radius * 0.5, -this.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = this.darkenColor(this.color, 70);
        ctx.lineWidth = 2;
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

        const eyeGradient = ctx.createRadialGradient(-2, -this.radius * 0.35, 0, 0, -this.radius * 0.3, this.radius * 0.6);
        eyeGradient.addColorStop(0, '#FFFFFF');
        eyeGradient.addColorStop(0.7, '#EEEEEE');
        eyeGradient.addColorStop(1, '#CCCCCC');
        ctx.fillStyle = eyeGradient;
        ctx.beginPath();
        ctx.arc(0, -this.radius * 0.3, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, -this.radius * 0.3, this.radius * 0.15, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        const irisGradient = ctx.createRadialGradient(0, -this.radius * 0.3, 0, 0, -this.radius * 0.3, this.radius * 0.12);
        irisGradient.addColorStop(0, '#FF3333');
        irisGradient.addColorStop(1, '#CC0000');
        ctx.fillStyle = irisGradient;
        ctx.beginPath();
        ctx.arc(0, -this.radius * 0.3, this.radius * 0.1, 0, Math.PI * 2);
        ctx.fill();

        if (this.trappedInBubble) {
            const bubbleGradient = ctx.createRadialGradient(-this.radius * 0.3, -this.radius * 0.3, 0, 0, 0, this.radius + 15);
            bubbleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            bubbleGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)');
            bubbleGradient.addColorStop(1, 'rgba(0, 200, 255, 0.1)');
            
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 15, 0, Math.PI * 2);
            ctx.fillStyle = bubbleGradient;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(-this.radius * 0.5, -this.radius * 0.5, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }

        if (this.poisonTimer > 0) {
            const poisonGlow = ctx.createRadialGradient(0, 0, this.radius, 0, 0, this.radius + 10);
            poisonGlow.addColorStop(0, 'rgba(0, 255, 0, 0)');
            poisonGlow.addColorStop(1, 'rgba(0, 255, 0, 0.5)');
            
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(10, -10, 3, 0, Math.PI * 2);
            ctx.arc(-5, -15, 2, 0, Math.PI * 2);
            ctx.arc(8, 5, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.antiHealTimer > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(128, 0, 128, 0.8)';
            ctx.lineWidth = 4;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(-10, -10);
            ctx.lineTo(10, 10);
            ctx.moveTo(10, -10);
            ctx.lineTo(-10, 10);
            ctx.strokeStyle = '#800080';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        if (this.charmed) {
            const time = Date.now() / 500;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 105, 180, 0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();

            for (let i = 0; i < 3; i++) {
                const heartAngle = time + (i * Math.PI * 2 / 3);
                const hx = Math.cos(heartAngle) * (this.radius + 12);
                const hy = Math.sin(heartAngle) * (this.radius + 12);
                
                ctx.fillStyle = '#FF69B4';
                ctx.shadowBlur = 4;
                ctx.shadowColor = '#FF69B4';
                ctx.beginPath();
                ctx.arc(hx, hy, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        }

        if (this.freezeTimer > 0) {
            const freezeGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius + 5);
            freezeGradient.addColorStop(0, 'rgba(0, 191, 255, 0.3)');
            freezeGradient.addColorStop(1, 'rgba(0, 191, 255, 0.1)');
            
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
            ctx.fillStyle = freezeGradient;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 3;
            ctx.shadowColor = '#00BFFF';
            for (let i = 0; i < 4; i++) {
                const iceAngle = (i * Math.PI) / 2;
                const ix = Math.cos(iceAngle) * this.radius;
                const iy = Math.sin(iceAngle) * this.radius;
                ctx.beginPath();
                ctx.arc(ix, iy, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        } else if (this.slowTimer > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 4;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

ctx.restore();
    }
}
