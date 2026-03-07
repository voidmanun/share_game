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
    private teleportCooldown: number = 0;

    constructor(player: Player, game: Game) {
        super(player, game, 40, 250, 8, '#8B4513'); // Fast, small, SaddleBrown
    }

    public act(deltaTime: number): void {
        this.teleportCooldown -= deltaTime;

        // Stage 2: Auto-teleport to player when far away
        if (this.evolutionStage >= 2 && this.teleportCooldown <= 0) {
            const distToPlayer = Math.sqrt(
                (this.x - this.player.x) ** 2 + (this.y - this.player.y) ** 2
            );
            if (distToPlayer > 500) {
                this.x = this.player.x;
                this.y = this.player.y;
                this.teleportCooldown = 30;
                this.game.createExplosion(this.x, this.y, '#FFD700');
            }
        }

        const pickups = this.game.getPickups();

        if (!this.targetPickup || this.targetPickup.isDead) {
            this.targetPickup = null;
            let minDist = Infinity;

            for (const p of pickups) {
                const dx = p.x - this.x;
                const dy = p.y - this.y;
                const distSquared = dx * dx + dy * dy;

                const range = 800 + this.evolutionStage * 200;
                if (distSquared < range * range && distSquared < minDist) {
                    // Stage 1+: Prioritize rare pickups
                    if (this.evolutionStage >= 1 && p instanceof PetEggPickup) {
                        minDist = 0;
                        this.targetPickup = p;
                        break;
                    }
                    minDist = distSquared;
                    this.targetPickup = p;
                }
            }
        }

        if (this.targetPickup) {
            const dx = this.targetPickup.x - this.x;
            const dy = this.targetPickup.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
                const speedMult = this.evolutionStage >= 1 ? 3.0 : 2.5;
                this.x += (dx / dist) * (this.speed * speedMult) * deltaTime;
                this.y += (dy / dist) * (this.speed * speedMult) * deltaTime;
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
