import { Enemy } from './Enemy';
import { Player } from './Player';
import { Game } from '../Game';
import { Particle } from './Particle';
import { TwinProjectile } from './TwinProjectile';

export class SlimeEnemy extends Enemy {
    public generation: number;
    public maxHp: number;
    private game: Game;
    private skillTimer: number = 0;
    private skillInterval: number = 2; // Casts skill every 2 seconds
    private state: 'normal' | 'dashing' = 'normal';
    private stateTimer: number = 0;

    constructor(x: number, y: number, player: Player, game: Game, generation: number = 0) {
        super(x, y, player);
        this.game = game;
        this.generation = generation;

        // Base color: #32CD32 (LimeGreen), smaller as generation increases
        this.radius = 24 - this.generation * 5; 
        
        // Green gets brighter as they get smaller
        const colors = ['#006400', '#228B22', '#32CD32', '#ADFF2F'];
        this.color = colors[Math.min(generation, 3)] || '#ADFF2F';

        // Base HP starts high, decreases per generation
        const baseHPs = [30, 15, 8, 4];
        this.hp = baseHPs[Math.min(generation, 3)] || 4;
        this.maxHp = this.hp;

        // They get faster as they get smaller
        this.speed = 40 + this.generation * 20;
        this.damage = 2;
    }

    public update(deltaTime: number, game?: any): void {
        super.update(deltaTime, game);
        
        if (this.trappedInBubble) return;

        this.stateTimer -= deltaTime;
        if (this.stateTimer <= 0 && this.state !== 'normal') {
            this.state = 'normal';
            this.speed = 40 + this.generation * 20; // reset speed
        }

        if (this.state === 'dashing') {
            this.speed = 300;
            if (Math.random() < 0.3) {
                this.game.particles.push(new Particle(this.x, this.y, this.color));
            }
        }

        // Super strong health regen for small slimes
        if (this.hp < this.maxHp && this.hp > 0 && this.generation > 0) {
            this.hp += (this.maxHp * 0.3) * deltaTime; // Regen 30% max HP per second
            if (this.hp > this.maxHp) {
                this.hp = this.maxHp;
            }
        }

        // Skills (smaller slimes cast faster)
        this.skillTimer += deltaTime;
        const currentInterval = Math.max(0.5, this.skillInterval - this.generation * 0.4);
        
        if (this.skillTimer >= currentInterval && this.state === 'normal') {
            this.skillTimer = 0;
            this.castSkill();
        }
    }

    private castSkill(): void {
        if (!this.game) return;

        // Small slimes have more skills
        const skills = ['shoot', 'dash'];
        if (this.generation > 0) skills.push('teleport');
        if (this.generation > 1) skills.push('burst');

        const chosenSkill = skills[Math.floor(Math.random() * skills.length)];

        if (chosenSkill === 'shoot') {
            const dx = this.player.x - this.x;
            const dy = this.player.y - this.y;
            const angle = Math.atan2(dy, dx);
            const speed = 150 + this.generation * 50;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const bullet = new TwinProjectile(this.x, this.y, vx, vy, 1, this.color, this.player);
            this.game.getEnemies().push(bullet);
        } else if (chosenSkill === 'dash') {
            this.state = 'dashing';
            this.stateTimer = 0.5;
        } else if (chosenSkill === 'teleport') {
            for (let i = 0; i < 10; i++) {
                this.game.particles.push(new Particle(this.x, this.y, this.color));
            }
            const angle = Math.random() * Math.PI * 2;
            const dist = 80 + Math.random() * 100;
            this.x = this.player.x + Math.cos(angle) * dist;
            this.y = this.player.y + Math.sin(angle) * dist;
            for (let i = 0; i < 10; i++) {
                this.game.particles.push(new Particle(this.x, this.y, '#FFFFFF'));
            }
        } else if (chosenSkill === 'burst') {
            const bulletCount = 8;
            const speed = 100 + this.generation * 20;
            for (let i = 0; i < bulletCount; i++) {
                const angle = (Math.PI * 2 / bulletCount) * i;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                const bullet = new TwinProjectile(this.x, this.y, vx, vy, 1, this.color, this.player);
                this.game.getEnemies().push(bullet);
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Slime body
        ctx.beginPath();
        // Slightly squished ellipse
        ctx.ellipse(0, 0, this.radius * 1.1, this.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        const eyeOffset = this.radius * 0.4;
        const eyeRadius = this.radius * 0.15;
        ctx.arc(-eyeOffset, -this.radius * 0.2, eyeRadius, 0, Math.PI * 2);
        ctx.arc(eyeOffset, -this.radius * 0.2, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // HP Bar
        ctx.fillStyle = 'red';
        ctx.fillRect(-this.radius, -this.radius - 10, this.radius * 2, 4);
        ctx.fillStyle = 'green';
        const hpPercent = Math.max(0, this.hp / this.maxHp);
        ctx.fillRect(-this.radius, -this.radius - 10, (this.radius * 2) * hpPercent, 4);

        ctx.restore();
    }
}