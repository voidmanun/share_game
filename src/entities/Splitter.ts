import { Enemy } from './Enemy';
import { Player } from './Player';
import { Particle } from './Particle';
import { TwinProjectile } from './TwinProjectile';

export class Splitter extends Enemy {
    public isSplitterling: boolean = false;
    public surviveTime: number = 0;
    public isEvolved: boolean = false;
    private skillTimer: number = 0;
    private skillState: string = 'normal';
    private stateTimer: number = 0;

    constructor(x: number, y: number, player: Player, isSplitterling: boolean = false) {
        super(x, y, player);
        this.isSplitterling = isSplitterling;

        if (isSplitterling) {
            this.radius = 8;
            this.color = '#FF69B4'; // Hot Pink
            this.hp = 3;
            this.speed = 85;
            this.damage = 1;
        } else {
            this.radius = 18;
            this.color = '#8A2BE2'; // Blue Violet
            this.hp = 12;
            this.speed = 50;
            this.damage = 2;
        }
    }

    public update(deltaTime: number, game?: any): void {
        super.update(deltaTime, game);

        if (this.trappedInBubble) return;

        this.stateTimer -= deltaTime;
        if (this.stateTimer <= 0 && this.skillState !== 'normal') {
            this.skillState = 'normal';
            this.speed = this.isEvolved ? 65 : (this.isSplitterling ? 85 : 50);
        }

        if (this.skillState === 'dash') {
            this.speed = 300;
            if (Math.random() < 0.3 && game) {
                game.particles.push(new Particle(this.x, this.y, this.color));
            }
        }

        if (this.isSplitterling) {
            this.surviveTime += deltaTime;
            if (this.surviveTime >= 5) {
                this.isSplitterling = false;
                this.isEvolved = true;
                this.radius = 24;
                this.color = '#FF4500'; // OrangeRed
                this.hp = 35; // boss like health
                this.speed = 65;
                this.damage = 3;
                if (game) {
                    for (let i = 0; i < 20; i++) {
                        game.particles.push(new Particle(this.x, this.y, '#FFD700'));
                    }
                }
            }
        }

        if (this.isEvolved) {
            this.skillTimer += deltaTime;
            if (this.skillTimer >= 2.0 && this.skillState === 'normal') {
                this.skillTimer = 0;
                this.castSkill(game);
            }
        }
    }

    private castSkill(game: any): void {
        if (!game) return;

        const skills = ['shoot_circle', 'dash', 'spawn_minion', 'teleport'];
        const skill = skills[Math.floor(Math.random() * skills.length)];

        if (skill === 'shoot_circle') {
            const bulletCount = 8;
            const speed = 150;
            for (let i = 0; i < bulletCount; i++) {
                const angle = (Math.PI * 2 / bulletCount) * i;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                const bullet = new TwinProjectile(this.x, this.y, vx, vy, 1, this.color, this.player);
                game.getEnemies().push(bullet);
            }
        } else if (skill === 'dash') {
            this.skillState = 'dash';
            this.stateTimer = 0.5;
        } else if (skill === 'spawn_minion') {
            const minion = new Splitter(this.x + 20, this.y, this.player, true);
            minion.surviveTime = -5; // Needs extra time to evolve
            game.getEnemies().push(minion);
        } else if (skill === 'teleport') {
            for (let i = 0; i < 15; i++) {
                game.particles.push(new Particle(this.x, this.y, this.color));
            }
            const angle = Math.random() * Math.PI * 2;
            const dist = 100 + Math.random() * 150;
            this.x = this.player.x + Math.cos(angle) * dist;
            this.y = this.player.y + Math.sin(angle) * dist;
            for (let i = 0; i < 15; i++) {
                game.particles.push(new Particle(this.x, this.y, '#FFFFFF'));
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        // draw bubble if trapped (already handled in Enemy.render, but we override so we must do it or not. Actually, Enemy.render is overridden entirely, let's just make sure it draws properly.)
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        ctx.beginPath();
        if (this.isSplitterling) {
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        } else if (this.isEvolved) {
            // Evolved shape: Spike or three circles
            ctx.arc(0, -this.radius * 0.4, this.radius * 0.8, 0, Math.PI * 2);
            ctx.arc(-this.radius * 0.4, this.radius * 0.4, this.radius * 0.8, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.4, this.radius * 0.4, this.radius * 0.8, 0, Math.PI * 2);
        } else {
            ctx.arc(-this.radius * 0.3, 0, this.radius * 0.7, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.3, 0, this.radius * 0.7, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        if (this.isSplitterling) {
            ctx.arc(-3, -2, 2, 0, Math.PI * 2);
            ctx.arc(3, -2, 2, 0, Math.PI * 2);
        } else if (this.isEvolved) {
            // Three eyes
            ctx.arc(0, -this.radius * 0.4 - 2, 4, 0, Math.PI * 2);
            ctx.arc(-this.radius * 0.4, this.radius * 0.4 - 2, 4, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.4, this.radius * 0.4 - 2, 4, 0, Math.PI * 2);
        } else {
            ctx.arc(-this.radius * 0.3 - 3, -2, 3, 0, Math.PI * 2);
            ctx.arc(-this.radius * 0.3 + 3, -2, 3, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.3 - 3, -2, 3, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.3 + 3, -2, 3, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        if (this.isSplitterling) {
            ctx.arc(-3, -2, 1, 0, Math.PI * 2);
            ctx.arc(3, -2, 1, 0, Math.PI * 2);
        } else if (this.isEvolved) {
            ctx.arc(0, -this.radius * 0.4 - 2, 2, 0, Math.PI * 2);
            ctx.arc(-this.radius * 0.4, this.radius * 0.4 - 2, 2, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.4, this.radius * 0.4 - 2, 2, 0, Math.PI * 2);
        } else {
            ctx.arc(-this.radius * 0.3 - 3, -2, 1.5, 0, Math.PI * 2);
            ctx.arc(-this.radius * 0.3 + 3, -2, 1.5, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.3 - 3, -2, 1.5, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.3 + 3, -2, 1.5, 0, Math.PI * 2);
        }
        ctx.fill();

        if (this.trappedInBubble) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 15, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(-this.radius * 0.5, -this.radius * 0.5, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }

        ctx.restore();
    }
}
