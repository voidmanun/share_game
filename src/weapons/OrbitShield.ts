import { Weapon } from './Weapon';
import { Game } from '../Game';
import { Player } from '../entities/Player';
import { Entity } from '../entities/Entity';
import { Particle } from '../entities/Particle';

export class OrbitSphere extends Entity {
    private game: Game;
    private owner: Player;
    public damage: number;
    private angle: number;
    private orbitRadius: number;
    private rotationSpeed: number;

    constructor(game: Game, owner: Player, angle: number, radius: number, speed: number, damage: number) {
        super(0, 0, 8, '#FFFFFF'); // White orbs
        this.game = game;
        this.owner = owner;
        this.angle = angle;
        this.orbitRadius = radius;
        this.rotationSpeed = speed;
        this.damage = damage;
    }

    public update(deltaTime: number): void {
        this.angle += this.rotationSpeed * deltaTime;
        this.x = this.owner.x + Math.cos(this.angle) * this.orbitRadius;
        this.y = this.owner.y + Math.sin(this.angle) * this.orbitRadius;

        // Collision logic (constant active hitboxes)
        const enemies = this.game.getEnemies();
        for (const enemy of enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < enemy.radius + this.radius) {
                // To prevent infinite instant damage, we apply per tick or push back
                enemy.takeDamage(this.damage * deltaTime * 10);

                if (enemy.isDead) {
                    this.game.handleEnemyDeath(enemy);
                }

                // Add particle effect on hit
                if (Math.random() < 0.2) {
                    this.game.particles.push(new Particle(this.x, this.y, '#FFFFFF'));
                }
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Shiny reflection
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

export class OrbitShield extends Weapon {
    public name = 'Orbit Shield';
    private spheres: OrbitSphere[] = [];
    private numSpheres = 1;
    private orbitRadius = 60;
    private rotationSpeed = Math.PI; // Half-rotation per second

    constructor(game: Game, owner: Player) {
        // High cooldown because it doesn't fire projectiles normally
        super(game, owner, 9999, 5);
        this.recreateSpheres();
    }

    public update(deltaTime: number): void {
        // Orbit shield doesn't use standard cooldown/fire logic
        // It just updates its spheres
        this.spheres.forEach(s => s.update(deltaTime));
    }

    public render(ctx: CanvasRenderingContext2D): void {
        this.spheres.forEach(s => s.render(ctx));
    }

    protected fire(): void {
        // Do nothing
    }

    public upgrade(): { damage: number, fireRate: number } {
        const stats = super.upgrade();

        // Every other level adds a sphere and speeds them up
        if (this.level % 2 === 0) {
            this.numSpheres++;
        }
        this.rotationSpeed += 0.5;
        this.orbitRadius = Math.min(100, this.orbitRadius + 5);

        this.recreateSpheres();
        return stats;
    }

    private recreateSpheres(): void {
        this.spheres = [];
        const angleStep = (Math.PI * 2) / this.numSpheres;
        for (let i = 0; i < this.numSpheres; i++) {
            this.spheres.push(new OrbitSphere(
                this.game,
                this.owner,
                i * angleStep,
                this.orbitRadius,
                this.rotationSpeed,
                this.damage
            ));
        }
    }
}
