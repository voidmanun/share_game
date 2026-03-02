import { Enemy } from './Enemy';
import { Player } from './Player';
import { Game } from '../Game';
import { Particle } from './Particle';
import { Splitter } from './Splitter';
import { TwinProjectile } from './TwinProjectile';

export class TwinElite extends Enemy {
    private game: Game;
    public twinType: 'light' | 'dark';
    public sibling: TwinElite | null = null;
    
    private state: 'chasing' | 'charging' | 'teleporting' | 'shooting' | 'spawning' = 'chasing';
    private stateTimer: number = 0;
    private skillCooldown: number = 3;
    private shootTimer: number = 0;
    private shootCount: number = 0;

    constructor(x: number, y: number, player: Player, game: Game, twinType: 'light' | 'dark') {
        super(x, y, player);
        this.game = game;
        this.twinType = twinType;
        
        this.radius = 25;
        this.hp = 200; // Very high HP for elite
        this.damage = twinType === 'dark' ? 5 : 3;
        this.speed = twinType === 'dark' ? 65 : 85;
        this.color = twinType === 'light' ? '#FFFF00' : '#8B008B';
        
        this.skillCooldown = 3 + Math.random() * 2;
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        if (this.trappedInBubble) return;

        this.skillCooldown -= deltaTime;
        this.stateTimer -= deltaTime;
        
        if (this.stateTimer <= 0 && this.state !== 'chasing') {
            this.state = 'chasing';
            this.speed = this.twinType === 'dark' ? 65 : 85;
        }

        if (this.skillCooldown <= 0 && this.state === 'chasing') {
            this.useSkill();
            this.skillCooldown = 4 + Math.random() * 3; // 4-7 seconds cooldown
        }

        if (this.state === 'charging') {
            this.speed = 300;
            if (Math.random() < 0.3) {
                this.game.particles.push(new Particle(this.x, this.y, this.color));
            }
        } else if (this.state === 'shooting') {
            this.speed = 20; // Move slowly while shooting
            this.shootTimer -= deltaTime;
            if (this.shootTimer <= 0 && this.shootCount > 0) {
                this.shootBullet();
                this.shootTimer = 0.25; // 0.25s between bullets
                this.shootCount--;
            }
        }

        // Twins heal each other if close
        if (this.sibling && !this.sibling.isDead) {
            const sdx = this.sibling.x - this.x;
            const sdy = this.sibling.y - this.y;
            const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
            if (sdist < 150) {
                // Heal over time
                this.hp += 1 * deltaTime; // 1 HP per second
                if (Math.random() < 0.05) {
                    this.game.particles.push(new Particle(this.x, this.y, '#00FF00'));
                }
            }
        }
    }

    private useSkill(): void {
        const skills = ['teleport', 'charge', 'shoot', 'spawn'];
        const chosenSkill = skills[Math.floor(Math.random() * skills.length)];
        
        if (chosenSkill === 'teleport') {
            for (let i = 0; i < 15; i++) {
                this.game.particles.push(new Particle(this.x, this.y, this.color));
            }
            const angle = Math.random() * Math.PI * 2;
            const dist = 100 + Math.random() * 150;
            this.x = this.player.x + Math.cos(angle) * dist;
            this.y = this.player.y + Math.sin(angle) * dist;
            for (let i = 0; i < 15; i++) {
                this.game.particles.push(new Particle(this.x, this.y, '#FFFFFF'));
            }
        } else if (chosenSkill === 'charge') {
            this.state = 'charging';
            this.stateTimer = 1.5;
        } else if (chosenSkill === 'shoot') {
            this.state = 'shooting';
            this.stateTimer = 2.0; // shoot phase lasts 2 seconds
            this.shootCount = this.twinType === 'light' ? 6 : 4; // Light shoots more
            this.shootTimer = 0;
        } else if (chosenSkill === 'spawn') {
            const minion = new Splitter(this.x, this.y, this.player, true);
            this.game.getEnemies().push(minion);
            for (let i = 0; i < 10; i++) {
                this.game.particles.push(new Particle(this.x, this.y, '#FF00FF'));
            }
        }
    }

    private shootBullet(): void {
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4; // slight spread
        const speed = this.twinType === 'light' ? 250 : 200; // Light bullets are faster
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const damage = this.twinType === 'light' ? 2 : 4;
        const bulletColor = this.twinType === 'light' ? '#FFFFFF' : '#FF0000';
        
        const bullet = new TwinProjectile(this.x, this.y, vx, vy, damage, bulletColor, this.player);
        this.game.getEnemies().push(bullet);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Twin link visual drawn before transforming ctx
        if (this.sibling && !this.sibling.isDead) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.sibling.x, this.sibling.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.translate(this.x, this.y);

        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;

        // Draw shape
        ctx.beginPath();
        if (this.twinType === 'light') {
            // Star/Sun shape
            for (let i = 0; i < 10; i++) {
                const angle = (i * Math.PI) / 5;
                const r = i % 2 === 0 ? this.radius : this.radius / 2;
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
        } else {
            // Dark moon shape
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Eyes
        ctx.fillStyle = '#000';
        if (this.twinType === 'light') {
            ctx.beginPath();
            ctx.arc(-8, -5, 4, 0, Math.PI * 2);
            ctx.arc(8, -5, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(-12, -10);
            ctx.lineTo(-4, -5);
            ctx.lineTo(-12, 0);
            ctx.moveTo(12, -10);
            ctx.lineTo(4, -5);
            ctx.lineTo(12, 0);
            ctx.stroke();
        }

        ctx.restore();
    }
}
