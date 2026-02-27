import { Game } from '../Game';
import { Player } from '../entities/Player';

export abstract class Weapon {
    public abstract name: string;
    public level: number = 1;
    protected game: Game;
    protected owner: Player;
    protected cooldown: number = 0;
    protected fireRate: number; // Seconds between shots
    public damage: number;

    constructor(game: Game, owner: Player, fireRate: number, damage: number) {
        this.game = game;
        this.owner = owner;
        this.fireRate = fireRate;
        this.damage = damage;
    }

    public upgrade(): { damage: number, fireRate: number } {
        this.level++;
        const oldDamage = this.damage;
        const oldFireRate = this.fireRate;

        this.damage += 2.5;
        this.fireRate = Math.max(0.1, this.fireRate * 0.9); // Reduce fire rate slightly, maxes out at 0.1s

        console.log(`Upgraded ${this.name} to level ${this.level}`);
        return { damage: this.damage - oldDamage, fireRate: oldFireRate - this.fireRate };
    }

    public update(deltaTime: number): void {
        this.cooldown -= deltaTime;
        if (this.cooldown <= 0) {
            this.fire();
            this.cooldown = this.fireRate;
        }
    }

    public render(_ctx: CanvasRenderingContext2D): void { }

    protected abstract fire(): void;
}
