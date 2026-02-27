import { Pet } from './Pet';
import { Player } from './Player';
import { Game } from '../Game';
import { Pickup } from './Pickup';

import { WeaponPickup } from './WeaponPickup';
import { HealthPickup } from './HealthPickup';
import { LollipopPickup } from './LollipopPickup';
import { PetEggPickup } from './PetEggPickup';

export class GreedyDog extends Pet {
    private targetPickup: Pickup | WeaponPickup | HealthPickup | LollipopPickup | PetEggPickup | null = null;

    constructor(player: Player, game: Game) {
        super(player, game, 40, 250, 8, '#8B4513'); // Fast, small, SaddleBrown
    }

    public act(deltaTime: number): void {
        const pickups = this.game.getPickups();

        // If we don't have a target, or target is dead, find a new one
        if (!this.targetPickup || this.targetPickup.isDead) {
            this.targetPickup = null;
            let minDist = Infinity;

            for (const p of pickups) {
                // Ignore egg pickups to avoid recursion or confusing behaviors
                if (p.constructor.name === 'PetEggPickup') continue;

                const dx = p.x - this.x;
                const dy = p.y - this.y;
                const distSquared = dx * dx + dy * dy;

                // Only go for pickups reasonably close (e.g. 500 pixels)
                if (distSquared < 500 * 500 && distSquared < minDist) {
                    minDist = distSquared;
                    this.targetPickup = p;
                }
            }
        }

        // If we have a target, override standard hover behavior and chase it
        if (this.targetPickup) {
            const dx = this.targetPickup.x - this.x;
            const dy = this.targetPickup.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
                this.x += (dx / dist) * (this.speed * 1.5) * deltaTime; // Sprint to pickup
                this.y += (dy / dist) * (this.speed * 1.5) * deltaTime;
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        ctx.beginPath();
        // Dog head (simple)
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ears
        ctx.fillStyle = '#654321'; // Darker brown
        ctx.beginPath();
        ctx.ellipse(-5, -6, 3, 6, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(5, -6, 3, 6, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-3, -2, 2, 0, Math.PI * 2);
        ctx.arc(3, -2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-3, -2, 1, 0, Math.PI * 2);
        ctx.arc(3, -2, 1, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.beginPath();
        ctx.arc(0, 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
