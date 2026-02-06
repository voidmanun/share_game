export class Entity {
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    public isDead: boolean = false;
    protected sprite: HTMLImageElement | null = null;
    protected frames: HTMLImageElement[] = []; // Array of individual frames

    // Animation properties
    protected frameCount: number = 1;
    protected currentFrame: number = 0;
    protected frameTimer: number = 0;
    protected frameInterval: number = 0.1; // 100ms per frame

    constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    public update(deltaTime: number): void {
        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            // Use frames length if available, otherwise manual frameCount
            const count = this.frames.length > 0 ? this.frames.length : this.frameCount;
            if (count > 0) {
                this.currentFrame = (this.currentFrame + 1) % count;
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Individual frames rendering
        if (this.frames.length > 0 && this.frames[this.currentFrame] && this.frames[this.currentFrame].complete && this.frames[this.currentFrame].naturalWidth > 0) {
            const img = this.frames[this.currentFrame];
            ctx.drawImage(
                img,
                this.x - this.radius,
                this.y - this.radius,
                this.radius * 2,
                this.radius * 2
            );
        }
        // Sprite sheet rendering
        else if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            const frameWidth = this.sprite.width / this.frameCount;
            const frameHeight = this.sprite.height;

            ctx.drawImage(
                this.sprite,
                this.currentFrame * frameWidth, 0, frameWidth, frameHeight, // Source
                this.x - this.radius,
                this.y - this.radius,
                this.radius * 2,
                this.radius * 2 // Destination
            );
        }
        // Fallback rendering
        else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }
}
