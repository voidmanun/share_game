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
    
    private state: 'chasing' | 'charging' | 'teleporting' | 'shooting' | 'spawning' | 'orbiting' = 'chasing';
    private stateTimer: number = 0;
    private skillCooldown: number = 2.5;
    private shootTimer: number = 0;
    private shootCount: number = 0;
    private orbitAngle: number = 0;
    private defenseBoost: number = 0; // Damage reduction when sibling is alive
    private lastDamage: number = 0;

    constructor(x: number, y: number, player: Player, game: Game, twinType: 'light' | 'dark') {
        super(x, y, player);
        this.game = game;
        this.twinType = twinType;
        
        this.radius = 30;
        this.hp = 350; // Very high HP for elite
        this.damage = twinType === 'dark' ? 8 : 6;
        this.speed = twinType === 'dark' ? 90 : 110;
        this.color = twinType === 'light' ? '#FFD700' : '#4B0082';
        
        this.skillCooldown = 2.5 + Math.random() * 1.5;
    }
    
    public override takeDamage(amount: number): void {
        // Apply defense boost (damage reduction)
        const actualDamage = amount * (1 - this.defenseBoost);
        this.lastDamage = actualDamage;
        this.hp -= actualDamage;
        if (this.hp <= 0) {
            this.isDead = true;
            // If sibling dies, the other one becomes enraged
            if (this.sibling && !this.sibling.isDead) {
                this.sibling.enrage();
            }
        }
    }
    
    private enrage(): void {
        // Become stronger when sibling dies
        this.damage *= 1.5;
        this.speed *= 1.3;
        this.hp += 100; // Bonus HP
        // Visual effect
        for (let i = 0; i < 20; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '#FF0000'));
        }
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        if (this.trappedInBubble) return;

        this.skillCooldown -= deltaTime;
        this.stateTimer -= deltaTime;
        
        // Update defense boost based on sibling status
        if (this.sibling && !this.sibling.isDead) {
            this.defenseBoost = 0.3; // 30% damage reduction when sibling alive
        } else {
            this.defenseBoost = 0;
        }
        
        // Orbit state - circle around player
        if (this.state === 'orbiting') {
            this.orbitAngle += deltaTime * 2;
            const orbitRadius = 180;
            this.x = this.player.x + Math.cos(this.orbitAngle) * orbitRadius;
            this.y = this.player.y + Math.sin(this.orbitAngle) * orbitRadius;
        }

        if (this.stateTimer <= 0 && this.state !== 'chasing' && this.state !== 'orbiting') {
            this.state = 'chasing';
            this.speed = this.twinType === 'dark' ? 90 : 110;
        }

        if (this.skillCooldown <= 0 && (this.state === 'chasing' || this.state === 'orbiting')) {
            this.useSkill();
            this.skillCooldown = 3 + Math.random() * 2.5; // 3-5.5 seconds cooldown
        }

        if (this.state === 'charging') {
            this.speed = 400;
            if (Math.random() < 0.4) {
                this.game.particles.push(new Particle(this.x, this.y, this.color));
            }
        } else if (this.state === 'shooting') {
            this.speed = 15; // Move slowly while shooting
            this.shootTimer -= deltaTime;
            if (this.shootTimer <= 0 && this.shootCount > 0) {
                this.shootBullet();
                this.shootTimer = 0.2; // 0.2s between bullets
                this.shootCount--;
            }
        }

        // Twins heal each other if close - ENHANCED
        if (this.sibling && !this.sibling.isDead) {
            const sdx = this.sibling.x - this.x;
            const sdy = this.sibling.y - this.y;
            const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
            if (sdist < 200) {
                // Enhanced heal over time
                this.hp += 3 * deltaTime; // 3 HP per second (was 1)
                this.sibling.hp += 3 * deltaTime;
                if (Math.random() < 0.08) {
                    this.game.particles.push(new Particle(this.x, this.y, '#00FF00'));
                }
            }
            // When both twins are close, they share damage (take 50% of sibling's damage)
            if (sdist < 100 && this.sibling.lastDamage > 0) {
                const sharedDamage = this.sibling.lastDamage * 0.5;
                this.hp -= sharedDamage;
            }
        }
        this.lastDamage = 0;
    }

    private useSkill(): void {
        const skills = ['teleport', 'charge', 'shoot', 'spawn', 'orbit', 'fusion'];
        let chosenSkill = skills[Math.floor(Math.random() * skills.length)];
        
        // Coordinate with sibling - if both use same skill, it becomes more powerful
        const siblingUsingSame = this.sibling && !this.sibling.isDead && 
            (this.sibling as TwinElite).state !== 'chasing';
        
        // If sibling is doing something similar, force coordination
        if (siblingUsingSame && Math.random() < 0.4) {
            const coordSkills = ['charge', 'shoot', 'fusion'];
            chosenSkill = coordSkills[Math.floor(Math.random() * coordSkills.length)];
        }
        
        if (chosenSkill === 'teleport') {
            for (let i = 0; i < 20; i++) {
                this.game.particles.push(new Particle(this.x, this.y, this.color));
            }
            const angle = Math.random() * Math.PI * 2;
            const dist = 120 + Math.random() * 180;
            this.x = this.player.x + Math.cos(angle) * dist;
            this.y = this.player.y + Math.sin(angle) * dist;
            for (let i = 0; i < 20; i++) {
                this.game.particles.push(new Particle(this.x, this.y, '#FFFFFF'));
            }
        } else if (chosenSkill === 'charge') {
            this.state = 'charging';
            this.stateTimer = 2.0; // Longer charge
            // If sibling is also charging, coordinate attack
            if (this.sibling && !this.sibling.isDead && Math.random() < 0.5) {
                (this.sibling as TwinElite).state = 'charging';
                (this.sibling as TwinElite).stateTimer = 2.0;
            }
        } else if (chosenSkill === 'shoot') {
            this.state = 'shooting';
            this.stateTimer = 2.5; // shoot phase lasts 2.5 seconds
            this.shootCount = this.twinType === 'light' ? 10 : 7; // More bullets (was 6/4)
            this.shootTimer = 0;
        } else if (chosenSkill === 'spawn') {
            // Spawn more minions
            for (let i = 0; i < 3; i++) {
                const offsetX = (Math.random() - 0.5) * 60;
                const offsetY = (Math.random() - 0.5) * 60;
                const minion = new Splitter(this.x + offsetX, this.y + offsetY, this.player, true);
                minion.hp *= 1.5; // Stronger minions
                this.game.getEnemies().push(minion);
            }
            for (let i = 0; i < 15; i++) {
                this.game.particles.push(new Particle(this.x, this.y, '#FF00FF'));
            }
        } else if (chosenSkill === 'orbit') {
            this.state = 'orbiting';
            this.stateTimer = 4; // Orbit for 4 seconds
            this.orbitAngle = Math.atan2(this.y - this.player.y, this.x - this.player.x);
        } else if (chosenSkill === 'fusion') {
            // Ultimate skill: both twins combine briefly for massive attack
            if (this.sibling && !this.sibling.isDead) {
                // Move closer to sibling
                const dx = this.sibling.x - this.x;
                const dy = this.sibling.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 80) {
                    this.x += dx * 0.3;
                    this.y += dy * 0.3;
                }
                // Fire a massive combined beam after short delay
                setTimeout(() => {
                    if (!this.isDead && this.sibling && !this.sibling.isDead) {
                        this.fireFusionBeam();
                    }
                }, 500);
            }
        }
    }
    
    private fireFusionBeam(): void {
        // Fire 8 bullets in all directions
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 280;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const bullet = new TwinProjectile(this.x, this.y, vx, vy, 5, '#FF00FF', this.player);
            this.game.getEnemies().push(bullet);
        }
        // Particle explosion
        for (let i = 0; i < 30; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '#FF00FF'));
        }
    }

    private shootBullet(): void {
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5; // slight spread
        const speed = this.twinType === 'light' ? 320 : 260; // Faster bullets
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const damage = this.twinType === 'light' ? 4 : 7; // Increased damage
        const bulletColor = this.twinType === 'light' ? '#FFFF00' : '#FF0000';
        
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
