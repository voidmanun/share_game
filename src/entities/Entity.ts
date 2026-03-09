export class Entity {
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    public isDead: boolean = false;
    protected sprite: HTMLImageElement | null = null;
    protected frames: HTMLImageElement[] = [];

    protected frameCount: number = 1;
    protected currentFrame: number = 0;
    protected frameTimer: number = 0;
    protected frameInterval: number = 0.1;

    protected glowIntensity: number = 0;
    protected glowColor: string = '';
    protected shadowEnabled: boolean = false;
    protected shadowOffsetY: number = 3;
    protected shadowBlur: number = 4;
    protected pulseTime: number = 0;
    protected hoverOffset: number = 0;
    protected hoverSpeed: number = 2;

    constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    public setGlow(intensity: number, color: string): void {
        this.glowIntensity = intensity;
        this.glowColor = color;
    }

    public setShadow(enabled: boolean, offsetY: number = 3, blur: number = 4): void {
        this.shadowEnabled = enabled;
        this.shadowOffsetY = offsetY;
        this.shadowBlur = blur;
    }

    public update(deltaTime: number, _game?: any): void {
        this.frameTimer += deltaTime;
        this.pulseTime += deltaTime;
        
        this.hoverOffset = Math.sin(this.pulseTime * this.hoverSpeed) * 2;
        
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            const count = this.frames.length > 0 ? this.frames.length : this.frameCount;
            if (count > 0) {
                this.currentFrame = (this.currentFrame + 1) % count;
            }
        }
    }

    protected applyGlow(ctx: CanvasRenderingContext2D): void {
        if (this.glowIntensity > 0 && this.glowColor) {
            ctx.shadowBlur = this.glowIntensity;
            ctx.shadowColor = this.glowColor;
        }
    }

    protected applyShadow(ctx: CanvasRenderingContext2D): void {
        if (this.shadowEnabled) {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = this.shadowOffsetY;
            ctx.shadowBlur = this.shadowBlur;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        }
    }

    protected clearEffects(ctx: CanvasRenderingContext2D): void {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    protected drawGradientCircle(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number,
        centerColor: string,
        edgeColor: string
    ): void {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, centerColor);
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, edgeColor);
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    protected drawHighlight(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number
    ): void {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.restore();
    }

    protected drawOutline(
        ctx: CanvasRenderingContext2D,
        lineWidth: number = 2,
        color: string = 'rgba(0, 0, 0, 0.5)'
    ): void {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        if (this.frames.length > 0 && this.frames[this.currentFrame] && this.frames[this.currentFrame].complete && this.frames[this.currentFrame].naturalWidth > 0) {
            const img = this.frames[this.currentFrame];
            this.applyShadow(ctx);
            ctx.drawImage(
                img,
                this.x - this.radius,
                this.y - this.radius,
                this.radius * 2,
                this.radius * 2
            );
        }
        else if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            const frameWidth = this.sprite.width / this.frameCount;
            const frameHeight = this.sprite.height;

            this.applyShadow(ctx);
            ctx.drawImage(
                this.sprite,
                this.currentFrame * frameWidth, 0, frameWidth, frameHeight,
                this.x - this.radius,
                this.y - this.radius,
                this.radius * 2,
                this.radius * 2
            );
        }
        else {
            this.applyShadow(ctx);
            this.applyGlow(ctx);
            
            this.drawGradientCircle(
                ctx,
                this.x,
                this.y + this.hoverOffset,
                this.radius,
                this.lightenColor(this.color, 30),
                this.darkenColor(this.color, 30)
            );
            
            this.clearEffects(ctx);
            
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.hoverOffset, this.radius, 0, Math.PI * 2);
            this.drawOutline(ctx);
            ctx.stroke();
            
            this.drawHighlight(ctx, this.x, this.y + this.hoverOffset, this.radius);
        }
        
        ctx.restore();
    }

    protected lightenColor(color: string, percent: number): string {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    protected darkenColor(color: string, percent: number): string {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }
}
