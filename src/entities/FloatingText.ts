import { Entity } from './Entity';

export type FloatingTextType = 'damage' | 'gold' | 'heal' | 'crit' | 'level' | 'buff' | 'combo';

export class FloatingText extends Entity {
    private text: string;
    private lifeTimer: number = 0;
    private maxLife: number = 1.5;
    private velocityY: number = -30;
    private velocityX: number = 0;
    private scale: number = 1;
    private targetScale: number = 1;
    private rotation: number = 0;
    private type: FloatingTextType;
    private showOutline: boolean = true;
    private fontSize: number = 20;

    constructor(x: number, y: number, text: string, color: string = '#FFFFFF', type: FloatingTextType = 'damage') {
        super(x, y, 0, color);
        this.text = text;
        this.type = type;
        this.initializeFromType();
    }

    private initializeFromType(): void {
        switch (this.type) {
            case 'crit':
                this.fontSize = 32;
                this.targetScale = 1.5;
                this.velocityY = -50;
                this.rotation = (Math.random() - 0.5) * 0.3;
                break;
            case 'gold':
                this.fontSize = 24;
                this.targetScale = 1.2;
                this.velocityY = -40;
                this.velocityX = (Math.random() - 0.5) * 30;
                break;
            case 'heal':
                this.fontSize = 26;
                this.targetScale = 1.1;
                this.velocityY = -35;
                this.color = '#00FF00';
                break;
            case 'level':
                this.fontSize = 36;
                this.targetScale = 1.8;
                this.maxLife = 2.0;
                this.velocityY = -60;
                this.showOutline = true;
                break;
            case 'buff':
                this.fontSize = 22;
                this.targetScale = 1.3;
                this.velocityY = -45;
                this.rotation = (Math.random() - 0.5) * 0.2;
                break;
            case 'combo':
                this.fontSize = 28;
                this.targetScale = 1.4;
                this.velocityY = -55;
                this.rotation = (Math.random() - 0.5) * 0.25;
                break;
            case 'damage':
            default:
                this.fontSize = 20;
                this.targetScale = 1;
                this.velocityY = -30;
                break;
        }
        this.scale = 0.3; // Start small for pop-in effect
    }

    public update(deltaTime: number): void {
        this.lifeTimer += deltaTime;

        // Smooth scale animation
        this.scale += (this.targetScale - this.scale) * 10 * deltaTime;

        // Float upwards with velocity
        this.y += this.velocityY * deltaTime;
        this.x += this.velocityX * deltaTime;

        // Apply gravity to vertical velocity
        this.velocityY += 20 * deltaTime;

        // Dampen horizontal velocity
        this.velocityX *= 0.95;

        // Rotate back to zero
        this.rotation *= 0.9;

        if (this.lifeTimer >= this.maxLife) {
            this.isDead = true;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        const alpha = Math.max(0, 1 - (this.lifeTimer / this.maxLife));
        const easeOut = alpha * (2 - alpha); // Smooth fade

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale * easeOut, this.scale * easeOut);
        ctx.rotate(this.rotation);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px "Fredoka One", cursive, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.showOutline) {
            // Glow effect
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            
            // Cartoon bold outline
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 5;
            ctx.strokeText(this.text, 0, 0);
            
            // Fill with gradient for extra pop
            const gradient = ctx.createLinearGradient(-30, -10, 30, 10);
            gradient.addColorStop(0, this.lightenColor(this.color, 30));
            gradient.addColorStop(0.5, this.color);
            gradient.addColorStop(1, this.darkenColor(this.color, 30));
            ctx.fillStyle = gradient;
            ctx.fillText(this.text, 0, 0);
        } else {
            ctx.fillText(this.text, 0, 0);
        }

        ctx.restore();
    }

    private lightenColor(color: string, percent: number): string {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }

    private darkenColor(color: string, percent: number): string {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }
}
