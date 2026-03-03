import { Enemy } from './Enemy';
import { Player } from './Player';
import { Game } from '../Game';
import { Particle } from './Particle';
import { TwinProjectile } from './TwinProjectile';
import { Splitter } from './Splitter';

export class HealerEnemy extends Enemy {
    private game: Game;
    public auraRadius: number = 400; // 超大光环
    private skillCooldown: number = 1.5; // 超多技能 (short cooldown)
    private skillTimer: number = 0;

    constructor(x: number, y: number, player: Player, game: Game) {
        super(x, y, player);
        this.game = game;
        this.radius = 30; // Bigger than normal
        this.hp = 150; // Very high HP to give it survivability while healing
        this.damage = 1;
        this.speed = 35; // Slow moving
        this.color = '#FF1493'; // Deep Pink
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        if (this.trappedInBubble) return;

        // 超强回血能力 (Super strong self healing)
        this.heal(30 * deltaTime); // 30 HP per second

        const enemies = this.game.getEnemies();
        
        // 在超大光环里的其他类型的小怪可以持续治疗生命
        for (const enemy of enemies) {
            // Cannot heal self here (already done above), or dead enemies
            if (enemy === this || enemy.isDead) continue;
            
            // Only other TYPES of monsters
            if (enemy instanceof HealerEnemy) continue;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // 超大光环
            if (dist <= this.auraRadius) {
                enemy.heal(15 * deltaTime); // continuous healing
                
                // Random green particle for healing effect
                if (Math.random() < 0.05) {
                    this.game.particles.push(new Particle(enemy.x, enemy.y, '#00FF00'));
                }
            }
        }

        // 超多技能 (Super many skills)
        this.skillTimer += deltaTime;
        if (this.skillTimer >= this.skillCooldown) {
            this.skillTimer = 0;
            this.useRandomSkill();
        }
    }

    private useRandomSkill(): void {
        const skills = ['nova', 'summon', 'repel', 'burstHeal'];
        const chosenSkill = skills[Math.floor(Math.random() * skills.length)];

        if (chosenSkill === 'nova') {
            // Shoot 8 projectiles in a circle
            const bulletCount = 8;
            for (let i = 0; i < bulletCount; i++) {
                const angle = (i / bulletCount) * Math.PI * 2;
                const vx = Math.cos(angle) * 120;
                const vy = Math.sin(angle) * 120;
                const bullet = new TwinProjectile(this.x, this.y, vx, vy, 2, '#FF00FF', this.player);
                this.game.getEnemies().push(bullet);
            }
        } else if (chosenSkill === 'summon') {
            // Spawn 2 splitters
            for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 50 + Math.random() * 50;
                const sx = this.x + Math.cos(angle) * dist;
                const sy = this.y + Math.sin(angle) * dist;
                const minion = new Splitter(sx, sy, this.player);
                this.game.getEnemies().push(minion);
                for (let p = 0; p < 5; p++) {
                    this.game.particles.push(new Particle(sx, sy, '#FF00FF'));
                }
            }
        } else if (chosenSkill === 'repel') {
            // Repel player if close
            const dx = this.player.x - this.x;
            const dy = this.player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0 && dist < this.auraRadius) {
                const angle = Math.atan2(dy, dx);
                this.player.x += Math.cos(angle) * 150;
                this.player.y += Math.sin(angle) * 150;
                for (let i = 0; i < 20; i++) {
                    this.game.particles.push(new Particle(this.player.x, this.player.y, '#FF0000'));
                }
            }
        } else if (chosenSkill === 'burstHeal') {
            // Burst heal allies in aura by 50
            const enemies = this.game.getEnemies();
            for (const enemy of enemies) {
                if (enemy !== this && !(enemy instanceof HealerEnemy)) {
                    const dx = enemy.x - this.x;
                    const dy = enemy.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= this.auraRadius) {
                        enemy.heal(50);
                        for (let p = 0; p < 10; p++) {
                            this.game.particles.push(new Particle(enemy.x, enemy.y, '#00FF00'));
                        }
                    }
                }
            }
            // Self burst heal
            this.heal(50);
            for (let p = 0; p < 20; p++) {
                this.game.particles.push(new Particle(this.x, this.y, '#00FF00'));
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Render Aura
        if (!this.trappedInBubble) {
            ctx.beginPath();
            ctx.arc(0, 0, this.auraRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 0, 0.08)'; // faint green aura
            ctx.fill();

            // Animated pulsing edge
            ctx.beginPath();
            const pulseRadius = this.auraRadius * (0.9 + 0.1 * Math.sin(Date.now() / 200));
            ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.restore();

        // Render base enemy (handles rotation)
        super.render(ctx);

        // Overlay Healer Cross
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#FFFFFF';
        // Horizontal bar
        ctx.fillRect(-this.radius * 0.4, -this.radius * 0.15, this.radius * 0.8, this.radius * 0.3);
        // Vertical bar
        ctx.fillRect(-this.radius * 0.15, -this.radius * 0.4, this.radius * 0.3, this.radius * 0.8);
        ctx.restore();
    }
}
