import { Entity } from './Entity';
import { Game } from '../Game';
import { FloatingText } from './FloatingText';
import { Particle } from './Particle';

export type TrapType = 'spike' | 'swamp' | 'fire';

export class Trap extends Entity {
    private game: Game;
    private trapType: TrapType;
    private damage: number = 5;
    private fireDamagePerSecond: number = 3;
    private triggerRadius: number;
    private isActive: boolean = false;
    private cooldown: number = 0;
    private readonly COOLDOWN_TIME: number = 2.0;
    private animationTimer: number = 0;

    constructor(x: number, y: number, game: Game, trapType: TrapType) {
        const colors: Record<TrapType, string> = {
            spike: '#808080',
            swamp: '#556B2F',
            fire: '#FF4500'
        };
        super(x, y, 30, colors[trapType]);
        this.game = game;
        this.trapType = trapType;
        this.triggerRadius = 25;
    }

    public update(deltaTime: number): void {
        this.animationTimer += deltaTime;
        
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
            if (this.cooldown <= 0) {
                this.isActive = false;
            }
        }
    }

    public checkTrigger(): void {
        if (this.cooldown > 0) return;

        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.triggerRadius + player.radius) {
            this.trigger(player);
            return;
        }

        // 检查敌人碰撞
        for (const enemy of this.game.getEnemies()) {
            const edx = enemy.x - this.x;
            const edy = enemy.y - this.y;
            const edist = Math.sqrt(edx * edx + edy * edy);
            if (edist < this.triggerRadius + enemy.radius) {
                this.triggerOnEnemy(enemy);
                return;
            }
        }
    }

    private trigger(player: any): void {
        this.isActive = true;
        this.cooldown = this.COOLDOWN_TIME;

        switch (this.trapType) {
            case 'spike':
                if (!player.isInvincible) {
                    player.takeDamage(this.damage);
                    this.game.floatingTexts.push(new FloatingText(player.x, player.y - 20, `- ${this.damage} HP`, '#FF0000'));
                }
                // 地刺升起动画
                for (let i = 0; i < 5; i++) {
                    this.game.particles.push(new Particle(this.x + (Math.random() - 0.5) * 20, this.y, '#808080'));
                }
                break;
            case 'swamp':
                player.slowTimer = 3; // 3秒减速
                this.game.floatingTexts.push(new FloatingText(player.x, player.y - 20, `减速!`, '#556B2F'));
                // 沼泽气泡
                for (let i = 0; i < 8; i++) {
                    this.game.particles.push(new Particle(this.x + (Math.random() - 0.5) * 40, this.y + (Math.random() - 0.5) * 40, '#2E8B57'));
                }
                break;
            case 'fire':
                player.fireTrapTimer = 5; // 5秒燃烧
                this.game.floatingTexts.push(new FloatingText(player.x, player.y - 20, `燃烧!`, '#FF4500'));
                // 火焰粒子
                for (let i = 0; i < 10; i++) {
                    this.game.particles.push(new Particle(this.x + (Math.random() - 0.5) * 30, this.y, '#FF4500'));
                }
                break;
        }
    }

    private triggerOnEnemy(enemy: any): void {
        this.isActive = true;
        this.cooldown = this.COOLDOWN_TIME;

        switch (this.trapType) {
            case 'spike':
                enemy.takeDamage(this.damage);
                break;
            case 'swamp':
                enemy.slowTimer = 3;
                break;
            case 'fire':
                enemy.poisonTimer = 5;
                enemy.poisonDamage = this.fireDamagePerSecond;
                break;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        const pulse = Math.sin(this.animationTimer * 3) * 3;

        switch (this.trapType) {
            case 'spike':
                // 地刺 - 三角形尖刺
                ctx.fillStyle = this.isActive ? '#A0A0A0' : '#606060';
                ctx.strokeStyle = '#404040';
                ctx.lineWidth = 2;
                
                for (let i = 0; i < 3; i++) {
                    ctx.save();
                    ctx.rotate((i * Math.PI * 2) / 3 + this.animationTimer * 0.5);
                    ctx.beginPath();
                    ctx.moveTo(0, -15 - pulse);
                    ctx.lineTo(-10, 10);
                    ctx.lineTo(10, 10);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
                break;

            case 'swamp':
                // 沼泽 - 圆形泥潭
                const swampGradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
                swampGradient.addColorStop(0, this.isActive ? '#3D5A3D' : '#556B2F');
                swampGradient.addColorStop(1, this.isActive ? '#2E4A2E' : '#3D5A3D');
                ctx.fillStyle = swampGradient;
                ctx.beginPath();
                ctx.arc(0, 0, 25 + pulse * 0.5, 0, Math.PI * 2);
                ctx.fill();
                
                // 气泡
                ctx.fillStyle = 'rgba(100, 150, 100, 0.5)';
                for (let i = 0; i < 3; i++) {
                    const bubbleAngle = (this.animationTimer + i * 2) % (Math.PI * 2);
                    const bubbleR = 15 + Math.sin(bubbleAngle * 2) * 5;
                    ctx.beginPath();
                    ctx.arc(Math.cos(bubbleAngle) * bubbleR, Math.sin(bubbleAngle) * bubbleR, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;

            case 'fire':
                // 火焰陷阱 - 火焰图示
                ctx.fillStyle = this.isActive ? '#FF6B35' : '#FF4500';
                ctx.globalAlpha = this.isActive ? 1 : 0.7;
                
                // 火焰形状
                for (let i = 0; i < 5; i++) {
                    const flameHeight = 15 + Math.sin(this.animationTimer * 5 + i) * 5;
                    ctx.beginPath();
                    ctx.moveTo(-20 + i * 10, 10);
                    ctx.quadraticCurveTo(-15 + i * 10, -flameHeight, -10 + i * 10, 10);
                    ctx.fill();
                }
                
                // 发光效果
                if (this.isActive) {
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(0, 0, 30, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
        }

        ctx.restore();
    }
}