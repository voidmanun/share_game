import { Enemy } from './Enemy';
import { Player } from './Player';

export class FusionBoss extends Enemy {
    public fusions: number = 0;
    public maxHp: number;
    public name: string = "FusionBoss";
    
    // Skills
    public canTeleport: boolean = false;
    public canShoot: boolean = false;
    public canSpawnMinions: boolean = false;
    public canDash: boolean = false;
    public canHeal: boolean = false;
    
        private dashTimer: number = 0;
    private healTimer: number = 0;
    private teleportTimer: number = 0;
    
    private dashTarget: {x: number, y: number} | null = null;
    private isDashing: boolean = false;

    constructor(x: number, y: number, player: Player) {
        super(x, y, player);
        this.color = '#FF00FF'; // Magenta
        this.speed = 40;       
        this.damage = 3;        
        this.hp = 100;
        this.maxHp = 100;
        this.radius = 30;
    }

    public fuse(other: Enemy) {
        this.fusions++;
        this.maxHp += other.hp * 2;
        this.hp += other.hp * 2;
        this.damage += other.damage;
        this.speed += 5;
        this.radius = Math.min(80, this.radius + 2);
        
        // Gain skills based on what we ate or randomly
        const rand = Math.random();
        if (rand < 0.2) this.canTeleport = true;
        else if (rand < 0.4) this.canShoot = true;
        else if (rand < 0.6) this.canSpawnMinions = true;
        else if (rand < 0.8) this.canDash = true;
        else this.canHeal = true;
        
        // Change color based on fusions
        const hue = (this.fusions * 30) % 360;
        this.color = `hsl(${hue}, 100%, 50%)`;
    }

    public update(deltaTime: number, _game?: any): void {
        super.update(deltaTime);
        
        if (this.isDead) return;
        
        // Heal skill
        if (this.canHeal) {
            this.healTimer += deltaTime;
            if (this.healTimer > 5) {
                this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.1);
                this.healTimer = 0;
            }
        }
        
        // Dash skill
        if (this.canDash) {
            if (this.isDashing) {
                if (this.dashTarget) {
                    const dx = this.dashTarget.x - this.x;
                    const dy = this.dashTarget.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 10) {
                        this.isDashing = false;
                    } else {
                        this.x += (dx / dist) * 400 * deltaTime;
                        this.y += (dy / dist) * 400 * deltaTime;
                    }
                }
            } else {
                this.dashTimer += deltaTime;
                if (this.dashTimer > 4) {
                    this.isDashing = true;
                    this.dashTimer = 0;
                    this.dashTarget = {x: this.player.x, y: this.player.y};
                }
            }
        }
        
        // Teleport skill
        if (this.canTeleport) {
            this.teleportTimer += deltaTime;
            if (this.teleportTimer > 6) {
                this.x = this.player.x + (Math.random() - 0.5) * 300;
                this.y = this.player.y + (Math.random() - 0.5) * 300;
                this.teleportTimer = 0;
            }
        }
        
        // Try to fuse with nearby enemies
        if ((window as any).game && (window as any).game.getEnemies) {
            const enemies = (window as any).game.getEnemies();
            for (const enemy of enemies) {
                if (enemy !== this && !enemy.isDead && !(enemy instanceof FusionBoss)) {
                    const dx = enemy.x - this.x;
                    const dy = enemy.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < this.radius + enemy.radius) {
                        this.fuse(enemy);
                        enemy.hp = 0;
                        enemy.isDead = true;
                    } else if (dist < 300) {
                        // Pull them in
                        enemy.x -= (dx / dist) * 50 * deltaTime;
                        enemy.y -= (dy / dist) * 50 * deltaTime;
                    }
                }
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.shadowBlur = 15 + this.fusions * 2;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;

        // Draw many-sided polygon based on fusions
        const sides = Math.min(12, 4 + Math.floor(this.fusions / 2));
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const px = Math.cos(angle) * this.radius;
            const py = Math.sin(angle) * this.radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw fusion count
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.fusions.toString(), 0, 0);

        ctx.restore();
    }
}
