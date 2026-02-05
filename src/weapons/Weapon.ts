import { Game } from '../Game';
import { Player } from '../entities/Player';

export abstract class Weapon {
    protected game: Game;
    protected owner: Player;
    protected cooldown: number = 0;
    protected fireRate: number; // Seconds between shots
    protected damage: number;

    constructor(game: Game, owner: Player, fireRate: number, damage: number) {
        this.game = game;
        this.owner = owner;
        this.fireRate = fireRate;
        this.damage = damage;
    }

    public update(deltaTime: number): void {
        this.cooldown -= deltaTime;
        if (this.cooldown <= 0) {
            this.fire();
            this.cooldown = this.fireRate;
        }
    }

    protected abstract fire(): void;
}
