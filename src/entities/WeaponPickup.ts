import { Entity } from './Entity';

export class WeaponPickup extends Entity {
    public weaponType: string;

    constructor(x: number, y: number, weaponType: string) {
        let color = '#00FFFF'; // Default cyan
        if (weaponType === 'Laser') {
            color = '#FF0000'; // Red
        } else if (weaponType === 'Magic Wand') {
            color = '#FFD700'; // Gold
        } else if (weaponType === 'Missile Launcher') {
            color = '#8A2BE2'; // Purple
        } else if (weaponType === 'Shotgun') {
            color = '#FFA500'; // Orange
        } else if (weaponType === 'Orbit Shield') {
            color = '#FFFFFF'; // White
        }

        super(x, y, 12, color);
        this.weaponType = weaponType;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();

        // Different shapes based on type
        if (this.weaponType === 'Laser') {
            // Rectangle
            ctx.rect(-10, -10, 20, 20);
        } else if (this.weaponType === 'Magic Wand') {
            // Triangle / Diamond
            ctx.moveTo(0, -12);
            ctx.lineTo(12, 0);
            ctx.lineTo(0, 12);
            ctx.lineTo(-12, 0);
        } else if (this.weaponType === 'Shotgun') {
            // Triangle Pointing Right
            ctx.moveTo(12, 0);
            ctx.lineTo(-10, -10);
            ctx.lineTo(-10, 10);
        } else if (this.weaponType === 'Orbit Shield') {
            // Hollow Ring
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            // Draw inner cutout
            ctx.arc(0, 0, this.radius - 5, 0, Math.PI * 2);
        } else {
            // Circle (Missile or default)
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        }
        ctx.closePath();

        // Fill and stroke
        ctx.fillStyle = this.color;
        // In Orbit Shield, the fill-rule "evenodd" makes the inner arc hollow
        ctx.fill('evenodd');

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Optional: little white icon in center to represent a "weapon crate" or star
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        if (this.weaponType !== 'Orbit Shield') {
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
