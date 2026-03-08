import { Entity } from './Entity';

export interface PowerUpOption {
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  color: string;
  apply: () => void;
}

export class Chest extends Entity {
  public isOpen: boolean = false;
  public options: PowerUpOption[] = [];
  private game: any;
  private openTimer: number = 0;

  constructor(x: number, y: number, game: any) {
    super(x, y, 25, '#8B4513'); // Brown chest
    this.game = game;
    this.generateOptions();
  }

  private generateOptions(): void {
    const allPowerUps = this.getAllPowerUps();
    // Shuffle and pick 3
    const shuffled = allPowerUps.sort(() => Math.random() - 0.5);
    this.options = shuffled.slice(0, 3);
  }

  private getAllPowerUps(): PowerUpOption[] {
    const player = this.game.player;
    
    return [
      {
        name: 'Attack Up',
        nameZh: '攻击提升',
        description: '+20% damage',
        descriptionZh: '+20% 伤害',
        icon: '⚔️',
        color: '#FF4444',
        apply: () => {
          player.damageMultiplier += 0.2;
        }
      },
      {
        name: 'Max HP Up',
        nameZh: '生命提升',
        description: '+15 max HP',
        descriptionZh: '+15 最大生命',
        icon: '❤️',
        color: '#FF69B4',
        apply: () => {
          player.maxHp += 15;
          player.hp += 15;
        }
      },
      {
        name: 'Speed Up',
        nameZh: '速度提升',
        description: '+15% speed',
        descriptionZh: '+15% 移动速度',
        icon: '👟',
        color: '#00CED1',
        apply: () => {
          player.speedMultiplier += 0.15;
        }
      },
{
        name: 'Attack Speed Up',
        nameZh: '攻速提升',
        description: '+4% attack speed',
        descriptionZh: '+4% 攻击速度',
        icon: '⚡',
        color: '#FFD700',
        apply: () => {
          player.attackSpeedMultiplier += 0.04;
        }
      },
      {
        name: 'Shield',
        nameZh: '护盾',
        description: '+3 shield hits',
        descriptionZh: '+3 护盾层数',
        icon: '🛡️',
        color: '#4169E1',
        apply: () => {
          player.addShield(3);
        }
      },
      {
        name: 'Weapon Power',
        nameZh: '武器强化',
        description: 'All weapons +5 damage',
        descriptionZh: '所有武器 +5 伤害',
        icon: '🗡️',
        color: '#9932CC',
        apply: () => {
          player.weapons.forEach((w: any) => {
            w.damage += 5;
          });
        }
      },
      {
        name: 'Heal',
        nameZh: '治疗',
        description: 'Restore 50% HP',
        descriptionZh: '恢复 50% 生命',
        icon: '💚',
        color: '#32CD32',
        apply: () => {
          const healAmount = Math.floor(player.maxHp * 0.5);
          player.heal(healAmount);
        }
      },
      {
        name: 'Golden Touch',
        nameZh: '黄金之手',
        description: '+100 gold',
        descriptionZh: '+100 金币',
        icon: '💰',
        color: '#FFD700',
        apply: () => {
          this.game.gold += 100;
        }
      },
      {
        name: 'Giant',
        nameZh: '巨人',
        description: '+30% HP, +10% size',
        descriptionZh: '+30% 生命, +10% 体型',
        icon: '🗿',
        color: '#8B4513',
        apply: () => {
          const hpGain = Math.floor(player.maxHp * 0.3);
          player.maxHp += hpGain;
          player.hp += hpGain;
          player.radius += 2;
        }
      },
      {
        name: 'Pet Power',
        nameZh: '宠物强化',
        description: 'Pets deal +50% damage',
        descriptionZh: '宠物造成 +50% 伤害',
        icon: '🐾',
        color: '#FF6347',
        apply: () => {
          player.petDamageMultiplier += 0.5;
          this.game.pets.forEach((pet: any) => {
            pet.damageMultiplier = player.petDamageMultiplier;
          });
        }
      }
    ];
  }

  public selectOption(index: number): void {
    if (index >= 0 && index < this.options.length) {
      const option = this.options[index];
      option.apply();
      
      // Show floating text
      if (this.game.addFloatingText) {
        const text = option.nameZh || option.name;
        this.game.addFloatingText({
          x: this.game.player.x,
          y: this.game.player.y - 40,
          text: text + '!',
          color: option.color,
          update: function(this: any) { this.timer -= 0.016; if (this.timer <= 0) this.isDead = true; },
          render: function(this: any, ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = this.color;
            ctx.textAlign = 'center';
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
          },
          isDead: false,
          timer: 2
        });
      }
      
      this.isDead = true;
    }
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);
    if (this.isOpen) {
      this.openTimer += deltaTime;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FFD700';

    // Chest body
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    
    // Draw chest base
    ctx.fillRect(-this.radius, -this.radius * 0.6, this.radius * 2, this.radius * 1.2);
    ctx.strokeRect(-this.radius, -this.radius * 0.6, this.radius * 2, this.radius * 1.2);
    
    // Chest lid
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.ellipse(0, -this.radius * 0.6, this.radius, this.radius * 0.4, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    
    // Gold trim
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-this.radius, 0);
    ctx.lineTo(this.radius, 0);
    ctx.stroke();
    
    // Lock
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Sparkle effect
    const time = Date.now() / 200;
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 3; i++) {
      const angle = time + (i * Math.PI * 2 / 3);
      const sparkleX = Math.cos(angle) * (this.radius + 5);
      const sparkleY = Math.sin(angle) * (this.radius + 5) - 5;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}