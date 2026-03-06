import { Entity } from './Entity';
import type { PetEquipment } from '../systems/PetNurtureSystem';

export class PetEquipmentPickup extends Entity {
    public equipment: PetEquipment;
    public rarity: string;

    constructor(x: number, y: number, equipment: PetEquipment) {
        let color = '#FFFFFF';
        switch (equipment.rarity) {
            case 'common':
                color = '#B0B0B0';
                break;
            case 'rare':
                color = '#0070DD';
                break;
            case 'epic':
                color = '#A335EE';
                break;
            case 'legendary':
                color = '#FF8000';
                break;
        }

        super(x, y, 10, color);
        this.equipment = equipment;
        this.rarity = equipment.rarity;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw a box/chest shape
        ctx.beginPath();
        ctx.rect(-10, -10, 20, 20);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Draw equipment icon based on slot
        ctx.fillStyle = '#FFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let icon = '📦';
        if (this.equipment.slot === 'collar') {
            icon = '🎗️';
        } else if (this.equipment.slot === 'accessory') {
            icon = '💎';
        } else if (this.equipment.slot === 'badge') {
            icon = '🏅';
        }
        ctx.fillText(icon, 0, 0);

        // Shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-3, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
