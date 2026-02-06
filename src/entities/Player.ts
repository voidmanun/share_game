import { Entity } from './Entity';
import { Input } from '../systems/Input';
import { Weapon } from '../weapons/Weapon';

export class Player extends Entity {
  private input: Input;
  private speed: number = 200; // pixels per second
  private weapons: Weapon[] = [];
  public hp: number = 20;
  private worldWidth: number;
  private worldHeight: number;

  constructor(x: number, y: number, input: Input, worldWidth: number, worldHeight: number) {
    super(x, y, 20, '#006994'); // Sea Blue
    this.input = input;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    // Removed sprite loading to enforce geometric shape
  }

  public takeDamage(amount: number): void {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.isDead = true;
    }
  }

  public addWeapon(weapon: Weapon): void {
    this.weapons.push(weapon);
  }

  public upgradeSpeed(): void {
    this.speed += 20;
  }

  public upgradeDamage(): void {
    // This requires Weapon to have setDamage or modify damage
  }

  public update(deltaTime: number): void {
    super.update(deltaTime); // Update animation
    const { x, y } = this.input.getAxis();

    // Apply movement
    this.x += x * this.speed * deltaTime;
    this.y += y * this.speed * deltaTime;

    // Constrain to world bounds
    this.x = Math.max(this.radius, Math.min(this.worldWidth - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(this.worldHeight - this.radius, this.y));

    this.weapons.forEach(w => w.update(deltaTime));
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Draw Weapons Over Player? Under usually.
    this.weapons.forEach(w => w.render(ctx));

    // Spaceship Render
    ctx.save();
    ctx.translate(this.x, this.y);

    // Rotate towards mouse (Input needs to provide mouse pos relative to screen center or world pos)
    // The Input system currently gives axis. Game.ts handles camera.
    // For now, let's assume facing movement direction or just Up/Right? 
    // Usually top-down shooters face mouse.
    // Let's check Input.ts to see if we have mouse info.
    // Actually, Input.ts usually just has keys. 
    // Let's assume standard "face movement" for now if no mouse info, OR just face UP as default and rotate if moving.

    // Better: Simple Triangle pointing UP
    const { x, y } = this.input.getAxis();
    let angle = -Math.PI / 2; // Default Up
    if (x !== 0 || y !== 0) {
      angle = Math.atan2(y, x);
    }

    ctx.rotate(angle);

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(15, 0); // Tip
    ctx.lineTo(-10, 10); // Back Right
    ctx.lineTo(-5, 0); // Engine Checkpoint
    ctx.lineTo(-10, -10); // Back Left
    ctx.closePath();
    ctx.fill();

    // Engine Flame
    if (x !== 0 || y !== 0) {
      ctx.fillStyle = 'orange';
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(-15, 5);
      ctx.lineTo(-25, 0); // Flame tip
      ctx.lineTo(-15, -5);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
