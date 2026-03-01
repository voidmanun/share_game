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
    super(x, y, 20, '#DDA0DD'); // Plum - Pony Color
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
      // Scale up the drawing of the horse by 3x
      ctx.scale(3, 3);
    }

    // Pony Render
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // Pony Body (rounder, shorter)
    ctx.beginPath();
    ctx.ellipse(-5, 2, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pony Head/Neck
    ctx.beginPath();
    ctx.moveTo(2, -2);
    ctx.lineTo(12, -12); // Ear/Top of head
    ctx.lineTo(16, -6); // Snout
    ctx.lineTo(6, 4); // Bottom of neck
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const time = Date.now() / 150;
    const legSwing = (x !== 0 || y !== 0) ? Math.sin(time) * 5 : 0;
    
    // Legs (Animated)
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Front legs
    ctx.moveTo(4, 8);
    ctx.lineTo(4 + legSwing, 16);
    ctx.moveTo(-1, 8);
    ctx.lineTo(-1 - legSwing, 16);
    // Back legs
    ctx.moveTo(-8, 8);
    ctx.lineTo(-8 - legSwing, 16);
    ctx.moveTo(-13, 8);
    ctx.lineTo(-13 + legSwing, 16);
    ctx.stroke();

    // Mane (Pink/Colorful)
    ctx.fillStyle = '#FF69B4'; // Hot Pink
    ctx.beginPath();
    ctx.moveTo(12, -12);
    ctx.quadraticCurveTo(8, -16, 2, -6);
    ctx.quadraticCurveTo(6, -2, 8, -6);
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(-17, 2);
    ctx.quadraticCurveTo(-24, -2, -26 + legSwing/2, 6);
    ctx.quadraticCurveTo(-20, 8, -17, 4);
    ctx.fill();

    // Big Cute Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(10, -8, 4, 0, Math.PI * 2); // Eye
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pupil
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(11, -8, 2, 0, Math.PI * 2);
    ctx.fill();

    // Cutie Mark (Star)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(-8, 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle dust particles instead of flame when moving
    if (x !== 0 || y !== 0) {
      ctx.fillStyle = 'rgba(255, 105, 180, 0.7)'; // Hot pink sparkles
      ctx.beginPath();
      ctx.arc(-22, 12 + Math.random() * 5, 1.5 + Math.random() * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 215, 0, 0.7)'; // Gold sparkles
      ctx.beginPath();
      ctx.arc(-25, 8 + Math.random() * 6, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw rainbow aura if invincible
    if (this.isInvincible) {
      ctx.beginPath();
      // Since radius scales, we draw an aura slightly bigger than the horse
      // The horse drawing logic uses fixed numbers (15, -10, etc.)
      // We should scale the context if invincible so the horse actually looks bigger!
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
