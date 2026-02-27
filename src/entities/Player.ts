import { Entity } from './Entity';
import { Input } from '../systems/Input';
import { Weapon } from '../weapons/Weapon';

export class Player extends Entity {
  private input: Input;
  private speed: number = 200; // pixels per second
  public weapons: Weapon[] = [];
  public hp: number = 30; // Increased base HP to survive scaling
  public maxHp: number = 30;
  private worldWidth: number;
  private worldHeight: number;
  private facingAngle: number = -Math.PI / 2; // Default up
  public isInvincible: boolean = false;
  private invincibilityTimer: number = 0;
  private originalRadius: number = 20;
  public speedMultiplier: number = 1.0;

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
    this.weapons.forEach(w => {
      if (w.name === 'Magic Wand') {
        w.damage += 2;
      }
    });
  }

  public upgradeMaxHp(): void {
    this.maxHp += 10;
    this.heal(10);
  }

  public update(deltaTime: number): void {
    super.update(deltaTime); // Update animation
    const { x, y } = this.input.getAxis();

    // Apply movement
    this.x += x * (this.speed * this.speedMultiplier) * deltaTime;
    this.y += y * (this.speed * this.speedMultiplier) * deltaTime;

    // Update facing angle if moving
    if (x !== 0 || y !== 0) {
      this.facingAngle = Math.atan2(y, x);
    }

    if (this.isInvincible) {
      this.invincibilityTimer -= deltaTime;
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
        this.radius = this.originalRadius;
      }
    }

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

    if (this.isInvincible) {
      // Scale up the drawing of the ship by 3x
      ctx.scale(3, 3);
    }

    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(15, 0); // Tip
    ctx.lineTo(-10, 10); // Back Right
    ctx.lineTo(-5, 0); // Engine Checkpoint
    ctx.lineTo(-10, -10); // Back Left
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Googly Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(4, -4, 3, 0, Math.PI * 2); // Left eye
    ctx.arc(4, 4, 3, 0, Math.PI * 2);  // Right eye
    ctx.fill();
    ctx.stroke();

    // Pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(5, -4, 1.5, 0, Math.PI * 2);
    ctx.arc(5, 4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Engine Flame
    if (x !== 0 || y !== 0) {
      ctx.fillStyle = '#ff9900';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(-15, 5);
      ctx.lineTo(-25, 0); // Flame tip
      ctx.lineTo(-15, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Draw rainbow aura if invincible
    if (this.isInvincible) {
      ctx.beginPath();
      // Since radius scales, we draw an aura slightly bigger than the ship
      // The ship drawing logic uses fixed numbers (15, -10, etc.)
      // We should scale the context if invincible so the ship actually looks bigger!
    }

    ctx.restore();
  }

  public getFacingAngle(): number {
    return this.facingAngle;
  }

  public heal(amount: number): number {
    const oldHp = this.hp;
    this.hp = Math.min(this.hp + amount, this.maxHp);
    return this.hp - oldHp; // Return actual healed amount
  }

  public becomeInvincible(duration: number): void {
    this.isInvincible = true;
    this.invincibilityTimer = duration;
    this.radius = this.originalRadius * 3; // Increase collision radius 3x
  }
}
