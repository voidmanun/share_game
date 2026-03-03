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
  public shieldHits: number = 0; // Shield can block X attacks
  private maxShieldHits: number = 3;
  private mercyTimer: number = 0;

  constructor(x: number, y: number, input: Input, worldWidth: number, worldHeight: number) {
    super(x, y, 20, '#FFFFFF'); // Paladin
    this.input = input;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    // Removed sprite loading to enforce geometric shape
  }

  public takeDamage(amount: number): void {
    if (this.isInvincible || this.mercyTimer > 0) {
      return;
    }
    if (this.shieldHits > 0) {
      this.shieldHits--;
      return; // Shield blocks the damage
    }
    this.hp -= amount;
    this.mercyTimer = 1.0; // 1 second mercy invincibility
    if (this.hp <= 0) {
      this.isDead = true;
    }
  }

  public addShield(hits: number): void {
    this.shieldHits = Math.min(this.shieldHits + hits, this.maxShieldHits);
  }

  public getShieldHits(): number {
    return this.shieldHits;
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

    if (this.mercyTimer > 0) {
      this.mercyTimer -= deltaTime;
    }

    // Constrain to world bounds
    this.x = Math.max(this.radius, Math.min(this.worldWidth - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(this.worldHeight - this.radius, this.y));

    this.weapons.forEach(w => w.update(deltaTime));
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Draw Weapons Over Player? Under usually.
    this.weapons.forEach(w => w.render(ctx));

    ctx.save();
    ctx.translate(this.x, this.y);

    const { x, y } = this.input.getAxis();
    let angle = -Math.PI / 2; // Default Up
    if (x !== 0 || y !== 0) {
      angle = Math.atan2(y, x);
    }

    ctx.rotate(angle);

    if (this.isInvincible) {
      ctx.scale(1.5, 1.5);
    }

    if (this.mercyTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Paladin Render
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';

    // Aura
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'; // Golden aura
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    // Body / Armor
    ctx.fillStyle = '#C0C0C0'; // Silver armor
    ctx.beginPath();
    ctx.rect(-12, -12, 24, 24);
    ctx.fill();
    ctx.stroke();

    // Head / Helm
    ctx.fillStyle = '#A9A9A9'; // Darker silver helm
    ctx.beginPath();
    ctx.arc(0, -5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cross on helm (Golden)
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.fillRect(-2, -12, 4, 10);
    ctx.fillRect(-5, -9, 10, 4);

    // Shield (Left side)
    ctx.fillStyle = '#1E90FF'; // Blue shield
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-10, 10);
    ctx.lineTo(-16, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Shield Cross
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-14, -5, 3, 10);
    ctx.fillRect(-15, -1, 5, 3);

    // Sword (Right side)
    ctx.fillStyle = '#FFD700'; // Gold hilt
    ctx.fillRect(10, 0, 4, 10);
    ctx.fillStyle = '#E5E4E2'; // Platinum blade
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(13, 0);
    ctx.lineTo(13, -15);
    ctx.lineTo(12, -18);
    ctx.lineTo(11, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Walk animation
    const time = Date.now() / 150;
    const legSwing = (x !== 0 || y !== 0) ? Math.sin(time) * 5 : 0;
    
    // Legs
    ctx.fillStyle = '#808080';
    ctx.fillRect(-8, 12, 6, 8 + legSwing);
    ctx.fillRect(2, 12, 6, 8 - legSwing);

    // Draw shield aura if shield is active
    if (this.shieldHits > 0) {
      ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 + this.shieldHits * 0.2})`; // Gold, more opaque with more hits
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
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
    if (this.isInvincible) return;
    this.isInvincible = true;
    this.invincibilityTimer = duration;
    this.radius = this.originalRadius * 3; // Increase collision radius 3x
  }
}
