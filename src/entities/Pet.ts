import { Entity } from './Entity';
import { Player } from './Player';
import { Game } from '../Game';

export abstract class Pet extends Entity {
    protected player: Player;
    protected game: Game;
    protected speed: number;
    protected hoverAngle: number = 0;
    protected hoverDistance: number;
    public isTemporary: boolean = false;
    public lifeTimer: number = 0;
    public damageMultiplier: number = 1.0;
    public isDead: boolean = false;

    constructor(player: Player, game: Game, hoverDistance: number, speed: number, radius: number, color: string) {
        // Init exactly on player
        super(player.x, player.y, radius, color);
        this.player = player;
        this.game = game;
        this.hoverDistance = hoverDistance;
        this.speed = speed;
        // Random start angle so multiple pets don't overlap immediately
        this.hoverAngle = Math.random() * Math.PI * 2;
    }

    public abstract act(deltaTime: number): void;

    public update(deltaTime: number): void {
        super.update(deltaTime);

        // Base behavior: follow player
        this.hoverAngle += deltaTime; // slowly orbit or drift

        // Target position is a point near the player
        const targetX = this.player.x + Math.cos(this.hoverAngle) * this.hoverDistance;
        const targetY = this.player.y + Math.sin(this.hoverAngle) * this.hoverDistance;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) { // Deadzone to stop jittering
            this.x += (dx / dist) * this.speed * deltaTime;
            this.y += (dy / dist) * this.speed * deltaTime;
        }

        // Life timer for temporary pets
        if (this.isTemporary) {
            this.lifeTimer -= deltaTime;
            if (this.lifeTimer <= 0) {
                this.isDead = true;
            }
        }

        // Perform specific pet actions
        this.act(deltaTime);
    }
}
