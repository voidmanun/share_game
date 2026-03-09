import { Entity } from '../entities/Entity';

export class Projectile extends Entity {
    public velocityX: number;
    public velocityY: number;
    public damage: number;
    public lifeTimer: number = 0;
    public maxLife: number = 2;
    private trailPositions: { x: number; y: number; alpha: number }[] = [];
    private maxTrailLength: number = 8;

    constructor(x: number, y: number, vx: number, vy: number, damage: number) {
        super(x, y, 5, '#FFA500');
        this.velocityX = vx;
        this.velocityY = vy;
        this.damage = damage;
        this.setGlow(10, 'rgba(255, 165, 0, 0.6)');
        this.setShadow(true, 2, 3);
    }

    public update(deltaTime: number): void {
        this.trailPositions.unshift({ x: this.x, y: this.y, alpha: 1 });
        
        if (this.trailPositions.length > this.maxTrailLength) {
            this.trailPositions.pop();
        }
        
        this.trailPositions.forEach(pos => {
            pos.alpha *= 0.85;
        });

        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        this.lifeTimer += deltaTime;
        if (this.lifeTimer >= this.maxLife) {
            this.isDead = true;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        this.renderTrail(ctx);
        
        const angle = Math.atan2(this.velocityY, this.velocityX);
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        const stretchFactor = 1 + Math.min(speed / 500, 0.5);

        this.applyGlow(ctx);
        this.applyShadow(ctx);

        const gradient = ctx.createLinearGradient(-12 * stretchFactor, 0, 8, 0);
        gradient.addColorStop(0, this.darkenColor(this.color, 30));
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(0.7, this.lightenColor(this.color, 20));
        gradient.addColorStop(1, '#FFFFFF');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10 * stretchFactor, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.darkenColor(this.color, 40);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(4, -1, 3, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        this.clearEffects(ctx);
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(-12 * stretchFactor, 0);
        ctx.lineTo(-20 * stretchFactor, 0);
        ctx.moveTo(-14 * stretchFactor, -3);
        ctx.lineTo(-18 * stretchFactor, -4);
        ctx.moveTo(-14 * stretchFactor, 3);
        ctx.lineTo(-18 * stretchFactor, 4);
        ctx.stroke();

        ctx.restore();
    }

    private renderTrail(ctx: CanvasRenderingContext2D): void {
        if (this.trailPositions.length < 2) return;

        ctx.save();
        
        for (let i = 1; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const prevPos = this.trailPositions[i - 1];
            
            const gradient = ctx.createLinearGradient(prevPos.x, prevPos.y, pos.x, pos.y);
            gradient.addColorStop(0, `rgba(255, 165, 0, ${pos.alpha * 0.6})`);
            gradient.addColorStop(1, `rgba(255, 100, 0, ${pos.alpha * 0.3})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 4 * pos.alpha;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(prevPos.x, prevPos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }

        ctx.restore();
    }
}
