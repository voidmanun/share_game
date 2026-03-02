import { Enemy } from './Enemy';
import { Player } from './Player';
import { Game } from '../Game';
import { Particle } from './Particle';
import { FloatingText } from './FloatingText';
import { Boss } from './Boss';

export class DevourerElite extends Enemy {
    private game: Game;
    private devourCooldown: number = 0;
    private devourRange: number = 60;
    private consumeCount: number = 0;
    private maxHp: number;
    private growthMultiplier: number = 1;
    private pulseTimer: number = 0;

    constructor(x: number, y: number, player: Player, game: Game) {
        super(x, y, player);
        this.game = game;
        
        this.radius = 30;
        this.hp = 150;
        this.maxHp = this.hp;
        this.damage = 3;
        this.speed = 55;
        this.color = '#FF4500'; // Orange-Red
        
        this.devourCooldown = 0.5;
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        if (this.trappedInBubble) return;

        this.devourCooldown -= deltaTime;
        this.pulseTimer += deltaTime;

        // Look for nearby enemies to devour
        if (this.devourCooldown <= 0) {
            this.devourNearbyEnemy();
        }

        // Update visual size based on growth
        this.radius = 30 * this.growthMultiplier;

        // Spawn particles while moving
        if (Math.random() < 0.1) {
            this.game.particles.push(new Particle(this.x, this.y, this.color));
        }
    }

    private devourNearbyEnemy(): void {
        const enemies = this.game.getEnemies();
        let closestEnemy: Enemy | null = null;
        let closestDist = this.devourRange;

        for (const enemy of enemies) {
            if (enemy === this) continue;
            if (enemy instanceof DevourerElite) continue; // Don't devour other devourers
            if (enemy instanceof Boss) continue; // Don't devour bosses

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < closestDist) {
                closestDist = dist;
                closestEnemy = enemy;
            }
        }

        if (closestEnemy) {
            this.devourEnemy(closestEnemy);
        }
    }

    private devourEnemy(enemy: Enemy): void {
        // Calculate stats gained from devoured enemy
        const hpGain = enemy.hp * 0.3; // Gain 30% of enemy HP
        const damageGain = enemy.damage * 0.2; // Gain 20% of enemy damage

        // Apply gains
        this.hp += hpGain;
        this.maxHp += hpGain * 0.5;
        this.damage += damageGain;
        this.growthMultiplier += 0.08;
        this.consumeCount++;

        // Speed up slightly with each consume (cap at 100)
        this.speed = Math.min(100, this.speed + 0.5);

        // Create effects
        for (let i = 0; i < 12; i++) {
            this.game.particles.push(new Particle(enemy.x, enemy.y, '#FF4500'));
            this.game.particles.push(new Particle(enemy.x, enemy.y, '#FFD700'));
        }

        // Floating text
        this.game.addFloatingText(new FloatingText(
            this.x, 
            this.y - this.radius - 20, 
            `+${Math.floor(hpGain)} HP`, 
            '#00FF00'
        ));

        // Kill the devoured enemy
        enemy.takeDamage(enemy.hp + 999);

        // Reset cooldown
        this.devourCooldown = 0.8;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Pulsing glow effect
        const pulse = Math.sin(this.pulseTimer * 5) * 5 + 25;
        ctx.shadowBlur = pulse;
        ctx.shadowColor = this.color;

        // Draw body - layered circles for organic look
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 4;

        // Outer layer
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner core that pulses
        const coreRadius = this.radius * 0.5 * (1 + Math.sin(this.pulseTimer * 3) * 0.1);
        ctx.fillStyle = '#FFD700'; // Gold core
        ctx.beginPath();
        ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Draw mouth - dark oval
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 0.4, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Teeth
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Top teeth
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 6 - 2, -this.radius * 0.2);
            ctx.lineTo(i * 6, -this.radius * 0.4);
            ctx.lineTo(i * 6 + 2, -this.radius * 0.2);
            ctx.fill();
            ctx.stroke();
        }

        // Eyes
        const eyeOffsetX = this.radius * 0.35;
        const eyeOffsetY = -this.radius * 0.25;
        
        ctx.fillStyle = '#FF0'; // Yellow eyes
        ctx.beginPath();
        ctx.arc(-eyeOffsetX, eyeOffsetY, 6, 0, Math.PI * 2);
        ctx.arc(eyeOffsetX, eyeOffsetY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-eyeOffsetX, eyeOffsetY, 3, 0, Math.PI * 2);
        ctx.arc(eyeOffsetX, eyeOffsetY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Show consume count
        if (this.consumeCount > 0) {
            ctx.fillStyle = '#FFF';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.strokeText(`${this.consumeCount}`, 0, this.radius + 15);
            ctx.fillText(`${this.consumeCount}`, 0, this.radius + 15);
        }

        // Health bar
        const barWidth = this.radius * 2;
        const barHeight = 6;
        const barY = -this.radius - 15;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
        
        const hpPercent = Math.min(1, this.hp / this.maxHp);
        ctx.fillStyle = hpPercent > 0.5 ? '#00FF00' : hpPercent > 0.25 ? '#FFFF00' : '#FF0000';
        ctx.fillRect(-barWidth / 2, barY, barWidth * hpPercent, barHeight);
        
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);

        ctx.restore();
    }
}
