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
    super(x, y, 20, '#FFFFFF'); // White - Handsome Horse Color
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

    // Majestic White Horse Render
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Horse Body (longer, more athletic)
    ctx.beginPath();
    ctx.ellipse(-5, 0, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Majestic Chest and Neck
    ctx.beginPath();
    ctx.moveTo(5, -5);
    ctx.lineTo(16, -18); // Top of neck / Ears
    ctx.lineTo(24, -14); // Snout
    ctx.lineTo(22, -9); // Jaw
    ctx.lineTo(10, 5); // Bottom of neck
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const time = Date.now() / 120; // slightly faster gallop
    const legSwing = (x !== 0 || y !== 0) ? Math.sin(time) * 8 : 0;
    const legSwingOffset = (x !== 0 || y !== 0) ? Math.cos(time) * 8 : 0;
    
    // Legs (Longer, heroic stride)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#111';
    ctx.beginPath();
    // Front legs
    ctx.moveTo(8, 7);
    ctx.lineTo(8 + legSwing, 20); // Knee
    ctx.lineTo(8 + legSwing + legSwingOffset * 0.5, 26); // Hoof
    
    ctx.moveTo(2, 7);
    ctx.lineTo(2 - legSwing, 20);
    ctx.lineTo(2 - legSwing - legSwingOffset * 0.5, 26);
    
    // Back legs
    ctx.moveTo(-10, 6);
    ctx.lineTo(-10 - legSwing, 18);
    ctx.lineTo(-10 - legSwing - legSwingOffset * 0.5, 26);
    
    ctx.moveTo(-16, 6);
    ctx.lineTo(-16 + legSwing, 18);
    ctx.lineTo(-16 + legSwing + legSwingOffset * 0.5, 26);
    ctx.stroke();

    // Majestic Mane (Silver/Ice Blue)
    ctx.fillStyle = '#E0F7FA'; // Icy silver blue
    ctx.beginPath();
    ctx.moveTo(16, -18);
    ctx.quadraticCurveTo(8, -20, 4, -8);
    ctx.quadraticCurveTo(10, -10, 12, -14);
    ctx.fill();

    // Flowing Tail
    ctx.fillStyle = '#E0F7FA';
    ctx.beginPath();
    ctx.moveTo(-20, -2);
    ctx.quadraticCurveTo(-32, -8, -35 + legSwing, 5);
    ctx.quadraticCurveTo(-26, 6, -21, 2);
    ctx.fill();

    // Heroic Eye (sharp, focused)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(16, -14);
    ctx.lineTo(19, -15);
    ctx.lineTo(18, -13);
    ctx.fill();
    ctx.fillStyle = '#00BFFF'; // Deep blue piercing eye
    ctx.beginPath();
    ctx.arc(17.5, -14, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Heroic Aura / Dust particles instead of cute sparkles
    if (x !== 0 || y !== 0) {
      ctx.fillStyle = 'rgba(200, 200, 200, 0.6)'; // Dust
      ctx.beginPath();
      ctx.arc(-26 + Math.random() * 4, 14 + Math.random() * 4, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(135, 206, 235, 0.4)'; // Light blue wind trail
      ctx.beginPath();
      ctx.arc(-22, 10 + Math.random() * 8, 1 + Math.random() * 4, 0, Math.PI * 2);
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
