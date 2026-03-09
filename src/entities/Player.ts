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
    const time = Date.now() / 1000;
    
    ctx.save();
    
    const auraGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 30);
    auraGradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
    auraGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.2)');
    auraGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowOffsetY = 4;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#2C3E50';

    const bodyGradient = ctx.createLinearGradient(-12, -12, 12, 12);
    bodyGradient.addColorStop(0, '#E8E8E8');
    bodyGradient.addColorStop(0.5, '#C0C0C0');
    bodyGradient.addColorStop(1, '#A0A0A0');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(-12, -12, 24, 24, 3);
    ctx.fill();
    ctx.stroke();

    const helmGradient = ctx.createRadialGradient(-3, -8, 0, 0, -5, 12);
    helmGradient.addColorStop(0, '#C8C8C8');
    helmGradient.addColorStop(1, '#808080');
    ctx.fillStyle = helmGradient;
    ctx.beginPath();
    ctx.arc(0, -5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#FFD700';
    ctx.fillRect(-2, -12, 4, 10);
    ctx.fillRect(-5, -9, 10, 4);
    ctx.shadowBlur = 0;

    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    
    const shieldGradient = ctx.createLinearGradient(-16, -10, -10, 10);
    shieldGradient.addColorStop(0, '#4169E1');
    shieldGradient.addColorStop(0.5, '#1E3A8A');
    shieldGradient.addColorStop(1, '#0F1E4A');
    ctx.fillStyle = shieldGradient;
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-10, 10);
    ctx.lineTo(-16, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-14, -5, 3, 10);
    ctx.fillRect(-15, -1, 5, 3);

    const bladeGradient = ctx.createLinearGradient(11, 0, 13, -18);
    bladeGradient.addColorStop(0, '#E5E4E2');
    bladeGradient.addColorStop(0.5, '#FFFFFF');
    bladeGradient.addColorStop(1, '#C0C0C0');
    ctx.fillStyle = bladeGradient;
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(13, 0);
    ctx.lineTo(13, -15);
    ctx.lineTo(12, -18);
    ctx.lineTo(11, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(10, 0, 4, 10);
    
    ctx.shadowBlur = 0;

    const { x, y } = this.input.getAxis();
    const legSwing = (x !== 0 || y !== 0) ? Math.sin(time * 8) * 5 : 0;

    const legGradient = ctx.createLinearGradient(-8, 12, -8, 20 + legSwing);
    legGradient.addColorStop(0, '#606060');
    legGradient.addColorStop(1, '#404040');
    ctx.fillStyle = legGradient;
    ctx.fillRect(-8, 12, 6, 8 + legSwing);
    ctx.fillRect(2, 12, 6, 8 - legSwing);
    
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 1;
    ctx.strokeRect(-8, 12, 6, 8 + legSwing);
    ctx.strokeRect(2, 12, 6, 8 - legSwing);

    ctx.restore();
  }

  private renderWarrior(ctx: CanvasRenderingContext2D): void {
    const time = Date.now() / 1000;
    
    ctx.save();
    
    const auraColor = this.isRaging ? 'rgba(255, 50, 0, 0.5)' : 'rgba(220, 20, 60, 0.25)';
    const auraGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 30);
    auraGradient.addColorStop(0, auraColor);
    auraGradient.addColorStop(0.6, this.isRaging ? 'rgba(255, 100, 0, 0.3)' : 'rgba(139, 0, 0, 0.15)');
    auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowOffsetY = 4;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1A1A1A';

    const bodyGradient = ctx.createLinearGradient(-14, -10, 14, 10);
    const bodyColor = this.isRaging ? '#FF3333' : '#8B0000';
    bodyGradient.addColorStop(0, this.lightenColor(bodyColor, 20));
    bodyGradient.addColorStop(0.5, bodyColor);
    bodyGradient.addColorStop(1, this.darkenColor(bodyColor, 30));
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(-14, -10, 28, 20, 2);
    ctx.fill();
    ctx.stroke();

    const helmGradient = ctx.createRadialGradient(-3, -11, 0, 0, -8, 12);
    helmGradient.addColorStop(0, '#888888');
    helmGradient.addColorStop(1, '#505050');
    ctx.fillStyle = helmGradient;
    ctx.beginPath();
    ctx.arc(0, -8, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const hornGradient = ctx.createLinearGradient(-12, -22, -6, -16);
    hornGradient.addColorStop(0, '#333333');
    hornGradient.addColorStop(1, '#555555');
    ctx.fillStyle = hornGradient;
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

    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(139, 69, 19, 0.5)';
    
    const handleGradient = ctx.createLinearGradient(12, -2, 15, 12);
    handleGradient.addColorStop(0, '#A0522D');
    handleGradient.addColorStop(1, '#5D2E0E');
    ctx.fillStyle = handleGradient;
    ctx.fillRect(12, -2, 3, 14);
    
    const axeGradient = ctx.createLinearGradient(15, -8, 22, 4);
    axeGradient.addColorStop(0, '#A0A0A0');
    axeGradient.addColorStop(0.5, '#C0C0C0');
    axeGradient.addColorStop(1, '#707070');
    ctx.fillStyle = axeGradient;
    ctx.beginPath();
    ctx.moveTo(15, -8);
    ctx.lineTo(22, -4);
    ctx.lineTo(22, 4);
    ctx.lineTo(15, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    
    const shieldGradient = ctx.createRadialGradient(-14, 0, 0, -14, 0, 10);
    shieldGradient.addColorStop(0, '#B22222');
    shieldGradient.addColorStop(0.7, '#8B0000');
    shieldGradient.addColorStop(1, '#4A0000');
    ctx.fillStyle = shieldGradient;
    ctx.beginPath();
    ctx.arc(-14, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(-14, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    const { x, y } = this.input.getAxis();
    const legSwing = (x !== 0 || y !== 0) ? Math.sin(time * 8) * 5 : 0;

    const legGradient = ctx.createLinearGradient(-8, 10, -8, 18 + legSwing);
    legGradient.addColorStop(0, '#6A0000');
    legGradient.addColorStop(1, '#3A0000');
    ctx.fillStyle = legGradient;
    ctx.fillRect(-8, 10, 6, 8 + legSwing);
    ctx.fillRect(2, 10, 6, 8 - legSwing);
    
    ctx.strokeStyle = '#2A0000';
    ctx.lineWidth = 1;
    ctx.strokeRect(-8, 10, 6, 8 + legSwing);
    ctx.strokeRect(2, 10, 6, 8 - legSwing);

    ctx.restore();
  }

  private renderMage(ctx: CanvasRenderingContext2D): void {
    const time = Date.now() / 1000;
    
    ctx.save();
    
    const auraGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 30);
    auraGradient.addColorStop(0, 'rgba(153, 50, 204, 0.4)');
    auraGradient.addColorStop(0.5, 'rgba(147, 112, 219, 0.2)');
    auraGradient.addColorStop(1, 'rgba(75, 0, 130, 0)');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowOffsetY = 4;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1A0A2E';

    const robeGradient = ctx.createLinearGradient(-12, -8, 14, 14);
    robeGradient.addColorStop(0, '#6B238E');
    robeGradient.addColorStop(0.5, '#4B0082');
    robeGradient.addColorStop(1, '#2E0854');
    ctx.fillStyle = robeGradient;
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(12, -8);
    ctx.lineTo(14, 14);
    ctx.lineTo(-14, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const headGradient = ctx.createRadialGradient(-2, -12, 0, 0, -10, 10);
    headGradient.addColorStop(0, '#E6B8E6');
    headGradient.addColorStop(1, '#B88EB8');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const hatGradient = ctx.createLinearGradient(0, -28, 0, -12);
    hatGradient.addColorStop(0, '#6B238E');
    hatGradient.addColorStop(1, '#4B0082');
    ctx.fillStyle = hatGradient;
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(-10, -12);
    ctx.lineTo(10, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, -20, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(139, 69, 19, 0.5)';
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(14, -16, 3, 30);

    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(153, 50, 204, 0.8)';
    
    const orbGradient = ctx.createRadialGradient(15, -18, 0, 15, -18, 8);
    orbGradient.addColorStop(0, '#DA70D6');
    orbGradient.addColorStop(0.5, '#9932CC');
    orbGradient.addColorStop(1, '#4B0082');
    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(15, -18, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(147, 112, 219, 0.8)';
    const orbGradient2 = ctx.createRadialGradient(-12, 0, 0, -12, 0, 7);
    orbGradient2.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    orbGradient2.addColorStop(0.5, 'rgba(147, 112, 219, 0.7)');
    orbGradient2.addColorStop(1, 'rgba(153, 50, 204, 0.3)');
    ctx.fillStyle = orbGradient2;
    ctx.beginPath();
    ctx.arc(-12, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    const { x, y } = this.input.getAxis();
    const legSwing = (x !== 0 || y !== 0) ? Math.sin(time * 8) * 3 : 0;

    const footGradient = ctx.createLinearGradient(-8, 14, -8, 18 + legSwing);
    footGradient.addColorStop(0, '#4A0070');
    footGradient.addColorStop(1, '#2A0050');
    ctx.fillStyle = footGradient;
    ctx.fillRect(-8, 14, 5, 4 + legSwing);
    ctx.fillRect(3, 14, 5, 4 - legSwing);

    ctx.restore();
  }

  private renderHunter(ctx: CanvasRenderingContext2D): void {
    const time = Date.now() / 1000;
    
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowOffsetY = 4;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#2F1810';

    const bodyGradient = ctx.createLinearGradient(-10, -8, 10, 10);
    bodyGradient.addColorStop(0, '#A0522D');
    bodyGradient.addColorStop(0.5, '#8B4513');
    bodyGradient.addColorStop(1, '#5D2E0E');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(-10, -8, 20, 18, 2);
    ctx.fill();
    ctx.stroke();

    const hoodGradient = ctx.createLinearGradient(0, -22, 0, -8);
    hoodGradient.addColorStop(0, '#3A8A5E');
    hoodGradient.addColorStop(0.5, '#2E8B57');
    hoodGradient.addColorStop(1, '#1E6B47');
    ctx.fillStyle = hoodGradient;
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(12, -8);
    ctx.lineTo(0, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const headGradient = ctx.createRadialGradient(-2, -10, 0, 0, -8, 9);
    headGradient.addColorStop(0, '#FFE8D0');
    headGradient.addColorStop(1, '#D4A574');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(0, -8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(-2, -8, 1.5, 0, Math.PI * 2);
    ctx.arc(2, -8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';

    ctx.strokeStyle = '#C4A663';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(15, 0, 12, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.strokeStyle = '#E8E8E8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, -12);
    ctx.lineTo(15, 12);
    ctx.stroke();

    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    
    const quiverGradient = ctx.createLinearGradient(-15, -5, -9, 10);
    quiverGradient.addColorStop(0, '#5D2E0E');
    quiverGradient.addColorStop(1, '#3A1E08');
    ctx.fillStyle = quiverGradient;
    ctx.beginPath();
    ctx.roundRect(-15, -5, 6, 15, 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -5);
    ctx.lineTo(-12, -10);
    ctx.moveTo(-14, -5);
    ctx.lineTo(-14, -8);
    ctx.moveTo(-10, -5);
    ctx.lineTo(-10, -9);
    ctx.stroke();

    ctx.shadowBlur = 0;

    const { x, y } = this.input.getAxis();
    const legSwing = (x !== 0 || y !== 0) ? Math.sin(time * 8) * 4 : 0;

    const legGradient = ctx.createLinearGradient(-7, 10, -7, 18 + legSwing);
    legGradient.addColorStop(0, '#5A3627');
    legGradient.addColorStop(1, '#3A2017');
    ctx.fillStyle = legGradient;
    ctx.fillRect(-7, 10, 5, 8 + legSwing);
    ctx.fillRect(2, 10, 5, 8 - legSwing);
    
    ctx.strokeStyle = '#2A1810';
    ctx.lineWidth = 1;
    ctx.strokeRect(-7, 10, 5, 8 + legSwing);
    ctx.strokeRect(2, 10, 5, 8 - legSwing);

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
