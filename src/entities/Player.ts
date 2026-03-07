import { Entity } from './Entity';
import { Input } from '../systems/Input';
import { Weapon } from '../weapons/Weapon';
import type { SkillTreeManager } from '../systems/SkillTree';
import type { Game } from '../Game';

export type CharacterClass = 'knight' | 'warrior' | 'mage' | 'hunter';

export interface CharacterSkill {
  name: string;
  nameZh: string;
  cooldown: number;
  currentCooldown: number;
  duration: number;
  isActive: boolean;
  icon: string;
}

export class Player extends Entity {
  private input: Input;
  private baseSpeed: number = 100; // pixels per second
  private speed: number = 100;
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
  private skillTreeManager: SkillTreeManager | null = null;

  // Class and Skill properties
  public characterClass: CharacterClass;
  public skill: CharacterSkill;
  public damageMultiplier: number = 1.0;
  public attackSpeedMultiplier: number = 1.0;
  public skillCooldownMultiplier: number = 1.0;
  public armor: number = 0; // Damage reduction percentage (0-1)
  public game: Game | null = null;

  // Skill states
  public isRaging: boolean = false;
  private rageTimer: number = 0;
  public isHasting: boolean = false;
  private hasteTimer: number = 0;
  public petDamageMultiplier: number = 1.0;
  private petBuffTimer: number = 0;

  constructor(x: number, y: number, input: Input, worldWidth: number, worldHeight: number, characterClass: CharacterClass = 'knight') {
    super(x, y, 20, '#FFFFFF'); // Paladin
    this.input = input;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.characterClass = characterClass;

    // Initialize skill based on class
    this.skill = this.initSkill(characterClass);

    // Apply class-specific base stats
    this.applyClassStats(characterClass);
    // Removed sprite loading to enforce geometric shape
  }

  private initSkill(characterClass: CharacterClass): CharacterSkill {
    switch (characterClass) {
      case 'knight':
        return {
          name: 'Invincibility',
          nameZh: '无敌',
          cooldown: 20,
          currentCooldown: 0,
          duration: 2,
          isActive: false,
          icon: '🛡️'
        };
      case 'warrior':
        return {
          name: 'Rage',
          nameZh: '狂暴',
          cooldown: 20,
          currentCooldown: 0,
          duration: 5,
          isActive: false,
          icon: '⚔️'
        };
      case 'mage':
        return {
          name: 'Haste',
          nameZh: '急速',
          cooldown: 12,
          currentCooldown: 0,
          duration: 5,
          isActive: false,
          icon: '⚡'
        };
      case 'hunter':
        return {
          name: 'Call of the Wild',
          nameZh: '野性呼唤',
          cooldown: 8,
          currentCooldown: 0,
          duration: 20,
          isActive: false,
          icon: '🏹'
        };
    }
  }

  private applyClassStats(characterClass: CharacterClass): void {
    switch (characterClass) {
      case 'knight':
        // Knight: more HP, normal speed
        this.maxHp = 40;
        this.hp = 40;
        this.color = '#4169E1'; // Royal Blue
        break;
      case 'warrior':
        // Warrior: normal HP, slightly more damage
        this.maxHp = 30;
        this.hp = 30;
        this.color = '#DC143C'; // Crimson
        break;
      case 'mage':
        // Mage: less HP, faster speed
        this.maxHp = 25;
        this.hp = 25;
        this.baseSpeed = 100;
        this.speed = 100;
        this.color = '#9932CC'; // Purple
        break;
      case 'hunter':
        // Hunter: balanced stats
        this.maxHp = 30;
        this.hp = 30;
        this.baseSpeed = 90;
        this.speed = 90;
        this.color = '#2E8B57'; // Green
        break;
    }
  }

  public setGame(game: Game): void {
    this.game = game;
  }

  public useSkill(): void {
    if (this.skill.currentCooldown > 0 || this.skill.isActive) return;

    this.skill.isActive = true;
    this.skill.currentCooldown = this.skill.cooldown * this.skillCooldownMultiplier;

    switch (this.characterClass) {
      case 'knight':
        // Knight: 2 seconds invincibility
        this.becomeInvincible(this.skill.duration);
        break;
      case 'warrior':
        // Warrior: 5 seconds double damage
        this.isRaging = true;
        this.damageMultiplier = 2.0;
        this.rageTimer = this.skill.duration;
        break;
      case 'mage':
        // Mage: Haste - double attack speed
        this.isHasting = true;
        this.attackSpeedMultiplier = 2.0;
        this.hasteTimer = this.skill.duration;
        break;
      case 'hunter':
        // Hunter: Summon Pet & Buff Pets
        if (this.game) {
          this.game.hatchRandomPet(true, 20); // Summon a temporary pet for 20s
        }
        this.petDamageMultiplier = 2.0;
        this.petBuffTimer = this.skill.duration;
        break;
    }
  }

  public setSkillTreeManager(manager: SkillTreeManager) {
    this.skillTreeManager = manager;
    this.applySkillBonuses();
    manager.onChange(() => this.applySkillBonuses());
  }

  private applySkillBonuses() {
    if (!this.skillTreeManager) return;

    const bonuses = this.skillTreeManager.getSkillBonuses();

    // Movement speed
    const speedBonus = bonuses.get('speed') || 0;
    this.speed = this.baseSpeed * (1 + speedBonus / 100);

    // Health
    const healthBonus = bonuses.get('health') || 0;
    const oldMaxHp = this.maxHp;
    this.maxHp = 30 + Math.floor(healthBonus);
    if (this.maxHp > oldMaxHp) {
      this.hp += this.maxHp - oldMaxHp;
    }

    // Skill cooldown reduction (stored as negative percentage)
    const cooldownBonus = bonuses.get('skillCooldown') || 0;
    this.skillCooldownMultiplier = 1 + (cooldownBonus / 100);

    // Armor (damage reduction)
    const armorBonus = bonuses.get('armor') || 0;
    this.armor = armorBonus / 100;

    // Damage multiplier (from class bonuses)
    const damageBonus = bonuses.get('damage') || 0;
    this.damageMultiplier *= (1 + damageBonus / 100);

    // Attack speed
    const attackSpeedBonus = bonuses.get('attackSpeed') || 0;
    this.attackSpeedMultiplier *= (1 + attackSpeedBonus / 100);
  }

  public getSkillBonuses() {
    if (!this.skillTreeManager) return new Map<string, number>();
    return this.skillTreeManager.getSkillBonuses();
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
    this.mercyTimer = 0.2; // 0.2 second mercy invincibility
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

  public getSpeed(): number {
    return this.speed;
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
        // End knight skill
        if (this.characterClass === 'knight' && this.skill.isActive) {
          this.skill.isActive = false;
        }
      }
    }

    // Warrior rage timer
    if (this.isRaging) {
      this.rageTimer -= deltaTime;
      if (this.rageTimer <= 0) {
        this.isRaging = false;
        this.damageMultiplier = 1.0;
        this.skill.isActive = false;
      }
    }

    // Mage haste timer
    if (this.isHasting) {
      this.hasteTimer -= deltaTime;
      if (this.hasteTimer <= 0) {
        this.isHasting = false;
        this.attackSpeedMultiplier = 1.0;
        this.skill.isActive = false;
      }
    }

    // Hunter pet buff timer
    if (this.petBuffTimer > 0) {
      this.petBuffTimer -= deltaTime;
      if (this.petBuffTimer <= 0) {
        this.petDamageMultiplier = 1.0;
        this.skill.isActive = false;
      }

      // Update all pets damage multiplier during the buff
      if (this.game) {
        this.game.pets.forEach(pet => {
          pet.damageMultiplier = this.petDamageMultiplier;
        });
      }
    } else {
      // Reset to normal if no buff is active (to handle new pets)
      if (this.game) {
        this.game.pets.forEach(pet => {
          pet.damageMultiplier = 1.0;
        });
      }
    }

    // Skill cooldown
    if (this.skill.currentCooldown !== 0) {
      this.skill.currentCooldown -= deltaTime;
      if (this.skill.currentCooldown <= 0) {
        this.skill.currentCooldown = 0;
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

    // Draw based on character class
    switch (this.characterClass) {
      case 'knight':
        this.renderKnight(ctx);
        break;
      case 'warrior':
        this.renderWarrior(ctx);
        break;
      case 'mage':
        this.renderMage(ctx);
        break;
      case 'hunter':
        this.renderHunter(ctx);
        break;
      default:
        this.renderKnight(ctx);
    }

    // Draw shield aura if shield is active
    if (this.shieldHits > 0) {
      ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 + this.shieldHits * 0.2})`; // Gold, more opaque with more hits
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw rage aura for warrior
    if (this.isRaging) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 100, 0, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 18, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw haste aura for mage
    if (this.isHasting) {
      ctx.strokeStyle = 'rgba(153, 50, 204, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  private renderKnight(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';

    // Aura - Golden
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    // Body / Armor - Silver
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.rect(-12, -12, 24, 24);
    ctx.fill();
    ctx.stroke();

    // Head / Helm
    ctx.fillStyle = '#A9A9A9';
    ctx.beginPath();
    ctx.arc(0, -5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cross on helm (Golden)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-2, -12, 4, 10);
    ctx.fillRect(-5, -9, 10, 4);

    // Shield (Left side) - Blue
    ctx.fillStyle = '#1E90FF';
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
    const { x, y } = this.input.getAxis();
    const time = Date.now() / 150;
    const legSwing = (x !== 0 || y !== 0) ? Math.sin(time) * 5 : 0;

    // Legs
    ctx.fillStyle = '#808080';
    ctx.fillRect(-8, 12, 6, 8 + legSwing);
    ctx.fillRect(2, 12, 6, 8 - legSwing);
  }

  private renderWarrior(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';

    // Aura - Red when raging
    ctx.fillStyle = this.isRaging ? 'rgba(255, 0, 0, 0.4)' : 'rgba(220, 20, 60, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    // Body - Dark red armor
    ctx.fillStyle = this.isRaging ? '#FF3333' : '#8B0000';
    ctx.beginPath();
    ctx.rect(-14, -10, 28, 20);
    ctx.fill();
    ctx.stroke();

    // Head - Horned helm
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(0, -8, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Horns
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.lineTo(-12, -22);
    ctx.lineTo(-6, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(8, -14);
    ctx.lineTo(12, -22);
    ctx.lineTo(6, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Big Axe (Right side)
    ctx.fillStyle = '#8B4513'; // Brown handle
    ctx.fillRect(12, -2, 3, 14);
    ctx.fillStyle = '#888'; // Axe head
    ctx.beginPath();
    ctx.moveTo(15, -8);
    ctx.lineTo(22, -4);
    ctx.lineTo(22, 4);
    ctx.lineTo(15, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shield (Left side) - Round shield
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(-14, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(-14, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Walk animation
    const { x, y } = this.input.getAxis();
    const time = Date.now() / 150;
    const legSwing = (x !== 0 || y !== 0) ? Math.sin(time) * 5 : 0;

    // Legs
    ctx.fillStyle = '#4a0000';
    ctx.fillRect(-8, 10, 6, 8 + legSwing);
    ctx.fillRect(2, 10, 6, 8 - legSwing);
  }

  private renderMage(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';

    // Aura - Magical purple
    ctx.fillStyle = 'rgba(153, 50, 204, 0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    // Body - Robe
    ctx.fillStyle = '#4B0082';
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(12, -8);
    ctx.lineTo(14, 14);
    ctx.lineTo(-14, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = '#DDA0DD'; // Light purple skin
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wizard Hat
    ctx.fillStyle = '#4B0082';
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(-10, -12);
    ctx.lineTo(10, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Star on hat
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, -20, 3, 0, Math.PI * 2);
    ctx.fill();

    // Staff (Right side)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(14, -16, 3, 30);
    ctx.fillStyle = '#9932CC';
    ctx.beginPath();
    ctx.arc(15, -18, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // Magic orb (Left hand)
    ctx.fillStyle = 'rgba(147, 112, 219, 0.8)';
    ctx.beginPath();
    ctx.arc(-12, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Walk animation
    const { x, y } = this.input.getAxis();
    const time = Date.now() / 150;
    const legSwing = (x !== 0 || y !== 0) ? Math.sin(time) * 3 : 0;

    // Feet
    ctx.fillStyle = '#2E0854';
    ctx.fillRect(-8, 14, 5, 4 + legSwing);
    ctx.fillRect(3, 14, 5, 4 - legSwing);
  }

  private renderHunter(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';

    // Body - Leather Armor
    ctx.fillStyle = '#8B4513'; // Saddle Brown
    ctx.beginPath();
    ctx.rect(-10, -8, 20, 18);
    ctx.fill();
    ctx.stroke();

    // Hood / Cloak (Green)
    ctx.fillStyle = '#2E8B57'; // Sea Green
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(12, -8);
    ctx.lineTo(0, -22); // Pointy hood top
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = '#FFE4C4'; // Bisque skin tone
    ctx.beginPath();
    ctx.arc(0, -8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes (Focused)
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-2, -8, 1, 0, Math.PI * 2);
    ctx.arc(2, -8, 1, 0, Math.PI * 2);
    ctx.fill();

    // Bow (Right side)
    ctx.strokeStyle = '#DEB887'; // Wood color
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(15, 0, 12, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    // Bow string
    ctx.strokeStyle = '#EEE';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, -12);
    ctx.lineTo(15, 12);
    ctx.stroke();

    // Quiver (Left side on back)
    ctx.fillStyle = '#5D2E0E'; // Dark brown
    ctx.beginPath();
    ctx.rect(-15, -5, 6, 15);
    ctx.fill();
    ctx.stroke();
    // Arrows sticking out
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(-12, -5); ctx.lineTo(-12, -10);
    ctx.moveTo(-14, -5); ctx.lineTo(-14, -8);
    ctx.stroke();

    // Walk animation
    const { x, y } = this.input.getAxis();
    const time = Date.now() / 150;
    const legSwing = (x !== 0 || y !== 0) ? Math.sin(time) * 4 : 0;

    // Legs
    ctx.fillStyle = '#4D3627';
    ctx.fillRect(-7, 10, 5, 8 + legSwing);
    ctx.fillRect(2, 10, 5, 8 - legSwing);
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
