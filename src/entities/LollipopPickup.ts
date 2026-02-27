import { Pickup } from './Pickup';

export class LollipopPickup extends Pickup {
    private angle: number = 0;

    constructor(x: number, y: number) {
        super(x, y, 0); // No gold value
        this.radius = 15; // Bigger than normal pickups
    }

    public render(ctx: CanvasRenderingContext2D): void {
        this.angle += 0.05;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Stick
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(-2, 0, 4, 20);
        ctx.fill();
        ctx.stroke();

        // Candy swirl
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);

        // Rainbow colors
        const gradient = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
        gradient.addColorStop(0, '#ff3366');
        gradient.addColorStop(0.3, '#ffcc00');
        gradient.addColorStop(0.6, '#00ccff');
        gradient.addColorStop(1, '#9933ff');

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.stroke();

        // White swirl highlight
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI, false);
        ctx.stroke();

        ctx.restore();
    }
}
