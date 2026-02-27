import { Entity } from './Entity';

export class FloatingText extends Entity {
    private text: string;
    private lifeTimer: number = 0;
    private maxLife: number = 1.5; // Seconds

    constructor(x: number, y: number, text: string, color: string = '#FFFFFF') {
        super(x, y, 0, color);
        this.text = text;
    }

    public update(deltaTime: number): void {
        this.lifeTimer += deltaTime;

        // Float upwards
        this.y -= 30 * deltaTime;

        if (this.lifeTimer >= this.maxLife) {
            this.isDead = true;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        const alpha = Math.max(0, 1 - (this.lifeTimer / this.maxLife));

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = '20px "Fredoka One", cursive, sans-serif'; // Playful font
        ctx.textAlign = 'center';

        // Cartoon bold outline
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);

        ctx.restore();
    }
}
