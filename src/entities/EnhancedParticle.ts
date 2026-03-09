import { Entity } from './Entity';
import { VisualEffects } from '../systems/VisualEffects';

export type ParticleType = 
  | 'default' 
  | 'spark' 
  | 'smoke' 
  | 'fire' 
  | 'ice' 
  | 'magic' 
  | 'bubble'
  | 'star'
  | 'trail'
  | 'explosion'
  | 'heal'
  | 'poison';

export class EnhancedParticle extends Entity {
  private vx: number;
  private vy: number;
  private life: number;
  private initialLife: number;
  private particleType: ParticleType;
  private rotation: number = 0;
  private rotationSpeed: number = 0;
  private scale: number = 1;
  private gravity: number = 0;
  private friction: number = 1;
  private secondaryColor: string;
  private time: number = 0;

  constructor(
    x: number, 
    y: number, 
    color: string, 
    type: ParticleType = 'default',
    options: {
      size?: number;
      life?: number;
      vx?: number;
      vy?: number;
      secondaryColor?: string;
      gravity?: number;
      friction?: number;
    } = {}
  ) {
    const size = options.size ?? 3;
    super(x, y, size, color);
    
    this.particleType = type;
    this.life = options.life ?? 0.5;
    this.initialLife = this.life;
    this.secondaryColor = options.secondaryColor ?? color;
    this.gravity = options.gravity ?? 0;
    this.friction = options.friction ?? 1;

    const speed = Math.random() * 200 + 50;
    const angle = Math.random() * Math.PI * 2;
    
    this.vx = options.vx ?? Math.cos(angle) * speed;
    this.vy = options.vy ?? Math.sin(angle) * speed;
    
    this.rotationSpeed = (Math.random() - 0.5) * 10;
    this.scale = 0.5 + Math.random() * 0.5;

    this.applyTypeDefaults();
  }

  private applyTypeDefaults(): void {
    switch (this.particleType) {
      case 'fire':
        this.gravity = -50;
        this.friction = 0.98;
        break;
      case 'smoke':
        this.gravity = -30;
        this.friction = 0.95;
        this.scale *= 1.5;
        break;
      case 'ice':
        this.gravity = 100;
        this.friction = 0.99;
        break;
      case 'bubble':
        this.gravity = -40;
        this.friction = 0.99;
        this.scale *= 1.2;
        break;
      case 'trail':
        this.friction = 0.92;
        break;
      case 'explosion':
        this.life = 0.3;
        this.initialLife = 0.3;
        break;
      case 'heal':
        this.gravity = -60;
        this.friction = 0.97;
        break;
      case 'poison':
        this.gravity = 20;
        this.friction = 0.96;
        break;
    }
  }

  public update(deltaTime: number): void {
    this.life -= deltaTime;
    this.time += deltaTime;
    
    if (this.life <= 0) {
      this.isDead = true;
      return;
    }

    this.vy += this.gravity * deltaTime;
    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    this.rotation += this.rotationSpeed * deltaTime;

    const lifeRatio = this.life / this.initialLife;
    if (this.particleType === 'fire' || this.particleType === 'smoke') {
      this.scale = (0.5 + Math.random() * 0.5) * lifeRatio;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const lifeRatio = this.life / this.initialLife;
    const alpha = Math.min(1, lifeRatio * 1.5);
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    switch (this.particleType) {
      case 'spark':
        this.renderSpark(ctx);
        break;
      case 'fire':
        this.renderFire(ctx, lifeRatio);
        break;
      case 'smoke':
        this.renderSmoke(ctx, lifeRatio);
        break;
      case 'ice':
        this.renderIce(ctx);
        break;
      case 'magic':
        this.renderMagic(ctx);
        break;
      case 'bubble':
        this.renderBubble(ctx);
        break;
      case 'star':
        this.renderStar(ctx);
        break;
      case 'trail':
        this.renderTrail(ctx, lifeRatio);
        break;
      case 'explosion':
        this.renderExplosion(ctx, lifeRatio);
        break;
      case 'heal':
        this.renderHeal(ctx, lifeRatio);
        break;
      case 'poison':
        this.renderPoison(ctx);
        break;
      default:
        this.renderDefault(ctx);
    }

    ctx.restore();
  }

  private renderDefault(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, -this.radius * 2);
    ctx.lineTo(this.radius, -this.radius);
    ctx.lineTo(this.radius * 2, 0);
    ctx.lineTo(this.radius, this.radius);
    ctx.lineTo(0, this.radius * 2);
    ctx.lineTo(-this.radius, this.radius);
    ctx.lineTo(-this.radius * 2, 0);
    ctx.lineTo(-this.radius, -this.radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private renderSpark(ctx: CanvasRenderingContext2D): void {
    const length = this.radius * 3;
    
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(-length, 0);
    ctx.lineTo(length, 0);
    ctx.moveTo(0, -length);
    ctx.lineTo(0, length);
    ctx.stroke();

    VisualEffects.drawGlowingCircle(ctx, 0, 0, this.radius * 0.5, '#FFF', this.color, 5);
  }

  private renderFire(ctx: CanvasRenderingContext2D, lifeRatio: number): void {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2);
    gradient.addColorStop(0, `rgba(255, 255, 200, ${lifeRatio})`);
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(0.7, this.secondaryColor);
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderSmoke(ctx: CanvasRenderingContext2D, lifeRatio: number): void {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2);
    gradient.addColorStop(0, `rgba(100, 100, 100, ${lifeRatio * 0.5})`);
    gradient.addColorStop(0.5, `rgba(80, 80, 80, ${lifeRatio * 0.3})`);
    gradient.addColorStop(1, 'rgba(50, 50, 50, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 2 * (1 + (1 - lifeRatio) * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }

  private renderIce(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;

    const points = 6;
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? this.radius * 2 : this.radius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private renderMagic(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    
    const points = 5;
    const outerRadius = this.radius * 2;
    const innerRadius = this.radius * 0.8;

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    VisualEffects.applyGlow(ctx, { color: this.color, blur: 8, intensity: 1 });
    ctx.fill();
  }

  private renderBubble(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createRadialGradient(
      -this.radius * 0.3, -this.radius * 0.3, 0,
      0, 0, this.radius * 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private renderStar(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.secondaryColor;
    ctx.lineWidth = 1;

    const points = 5;
    const outerRadius = this.radius * 2;
    const innerRadius = this.radius;

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    VisualEffects.applyGlow(ctx, { color: this.color, blur: 5, intensity: 0.5 });
    ctx.fill();
  }

  private renderTrail(ctx: CanvasRenderingContext2D, lifeRatio: number): void {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 2 * lifeRatio, this.radius * lifeRatio, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderExplosion(ctx: CanvasRenderingContext2D, lifeRatio: number): void {
    const radius = this.radius * 3 * (1 - lifeRatio);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(0.6, this.secondaryColor);
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderHeal(ctx: CanvasRenderingContext2D, lifeRatio: number): void {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;

    const size = this.radius * 2;
    ctx.fillRect(-size * 0.3, -size, size * 0.6, size * 2);
    ctx.fillRect(-size, -size * 0.3, size * 2, size * 0.6);

    VisualEffects.applyGlow(ctx, { color: this.color, blur: 10, intensity: lifeRatio });
    ctx.fillRect(-size * 0.3, -size, size * 0.6, size * 2);
    ctx.fillRect(-size, -size * 0.3, size * 2, size * 0.6);
  }

  private renderPoison(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(0.5, this.secondaryColor);
    gradient.addColorStop(1, 'rgba(0, 100, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export class ParticleEmitter {
  private x: number;
  private y: number;
  private particleType: ParticleType;
  private color: string;
  private secondaryColor: string;
  private rate: number;
  private spread: number;
  private speed: number;
  private particleLife: number;
  private particleSize: number;
  private gravity: number;
  private active: boolean = true;
  private accumulator: number = 0;

  constructor(
    x: number,
    y: number,
    config: {
      type: ParticleType;
      color: string;
      secondaryColor?: string;
      rate?: number;
      spread?: number;
      speed?: number;
      life?: number;
      size?: number;
      gravity?: number;
    }
  ) {
    this.x = x;
    this.y = y;
    this.particleType = config.type;
    this.color = config.color;
    this.secondaryColor = config.secondaryColor ?? config.color;
    this.rate = config.rate ?? 10;
    this.spread = config.spread ?? Math.PI * 2;
    this.speed = config.speed ?? 100;
    this.particleLife = config.life ?? 0.5;
    this.particleSize = config.size ?? 3;
    this.gravity = config.gravity ?? 0;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public setActive(active: boolean): void {
    this.active = active;
  }

  public update(deltaTime: number, addParticle: (p: EnhancedParticle) => void): void {
    if (!this.active) return;

    this.accumulator += deltaTime;
    const interval = 1 / this.rate;

    while (this.accumulator >= interval) {
      this.accumulator -= interval;
      
      const angle = Math.random() * this.spread - this.spread / 2;
      const speed = this.speed * (0.5 + Math.random() * 0.5);
      
      const particle = new EnhancedParticle(
        this.x,
        this.y,
        this.color,
        this.particleType,
        {
          size: this.particleSize * (0.5 + Math.random() * 0.5),
          life: this.particleLife * (0.7 + Math.random() * 0.6),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          secondaryColor: this.secondaryColor,
          gravity: this.gravity
        }
      );
      
      addParticle(particle);
    }
  }
}