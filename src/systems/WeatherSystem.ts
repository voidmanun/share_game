import { Game } from '../Game';
import { FloatingText } from '../entities/FloatingText';
import { Particle } from '../entities/Particle';

export type WeatherType = 'sunny' | 'rain' | 'blizzard' | 'sandstorm' | 'bloodmoon';

export interface WeatherConfig {
    name: string;
    nameZh: string;
    duration: number; // 持续时间(秒)
    playerSpeedMod: number;
    enemySpeedMod: number;
    damageMod: number;
    goldMod: number;
    spawnMod: number;
    backgroundColor: string;
    particleColor: string;
    icon: string;
}

export class WeatherSystem {
    private game: Game;
    private currentWeather: WeatherType = 'sunny';
    private weatherTimer: number = 0;
    private particles: { x: number; y: number; speed: number; size: number }[] = [];
    
    private readonly WEATHER_CONFIGS: Record<WeatherType, WeatherConfig> = {
        sunny: {
            name: 'Sunny',
            nameZh: '晴天',
            duration: 60,
            playerSpeedMod: 1.0,
            enemySpeedMod: 1.0,
            damageMod: 1.0,
            goldMod: 1.0,
            spawnMod: 1.0,
            backgroundColor: '#8ced73',
            particleColor: '#FFFFFF',
            icon: '☀️'
        },
        rain: {
            name: 'Rain',
            nameZh: '雨天',
            duration: 45,
            playerSpeedMod: 0.85,
            enemySpeedMod: 0.9,
            damageMod: 1.0,
            goldMod: 1.0,
            spawnMod: 1.2,
            backgroundColor: '#5a7a6a',
            particleColor: '#4a9fea',
            icon: '🌧️'
        },
        blizzard: {
            name: 'Blizzard',
            nameZh: '暴风雪',
            duration: 40,
            playerSpeedMod: 0.9,
            enemySpeedMod: 0.6,
            damageMod: 1.1,
            goldMod: 1.2,
            spawnMod: 0.8,
            backgroundColor: '#d0e8f0',
            particleColor: '#FFFFFF',
            icon: '❄️'
        },
        sandstorm: {
            name: 'Sandstorm',
            nameZh: '沙尘暴',
            duration: 35,
            playerSpeedMod: 0.8,
            enemySpeedMod: 0.85,
            damageMod: 0.9,
            goldMod: 1.3,
            spawnMod: 1.1,
            backgroundColor: '#c9a86c',
            particleColor: '#d4a656',
            icon: '🌪️'
        },
        bloodmoon: {
            name: 'Blood Moon',
            nameZh: '血月',
            duration: 60,
            playerSpeedMod: 1.1,
            enemySpeedMod: 1.3,
            damageMod: 1.5,
            goldMod: 2.0,
            spawnMod: 1.5,
            backgroundColor: '#4a1a2a',
            particleColor: '#ff3366',
            icon: '🩸'
        }
    };

    constructor(game: Game) {
        this.game = game;
        this.initParticles();
    }

    private initParticles(): void {
        this.particles = [];
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * 2000,
                y: Math.random() * 2000,
                speed: 100 + Math.random() * 200,
                size: 2 + Math.random() * 3
            });
        }
    }

    public update(deltaTime: number): void {
        this.weatherTimer += deltaTime;
        
        // 检查是否需要切换天气
        const config = this.WEATHER_CONFIGS[this.currentWeather];
        if (this.weatherTimer >= config.duration) {
            this.changeWeather();
        }
        
        // 更新粒子
        this.updateParticles(deltaTime);
    }

    private changeWeather(): void {
        const weathers: WeatherType[] = ['sunny', 'rain', 'blizzard', 'sandstorm', 'bloodmoon'];
        
        // 血月只在游戏时间>60秒后出现
        const availableWeathers = this.game.gameTime > 60 ? weathers : weathers.filter(w => w !== 'bloodmoon');
        
        // 随机选择新天气(不选当前天气)
        const otherWeathers = availableWeathers.filter(w => w !== this.currentWeather);
        const newWeather = otherWeathers[Math.floor(Math.random() * otherWeathers.length)];
        
        this.currentWeather = newWeather;
        this.weatherTimer = 0;
        
        const config = this.WEATHER_CONFIGS[newWeather];
        
        // 显示天气变化提示
        this.game.floatingTexts.push(new FloatingText(
            this.game.player.x,
            this.game.player.y - 80,
            `${config.icon} ${config.nameZh}`,
            config.particleColor,
            'level'
        ));
        
        // 播放提示音
        this.game.soundManager.playPickupSound();
        
        // 触发粒子效果
        for (let i = 0; i < 15; i++) {
            this.game.particles.push(new Particle(
                this.game.player.x + (Math.random() - 0.5) * 100,
                this.game.player.y + (Math.random() - 0.5) * 100,
                config.particleColor
            ));
        }
    }

    private updateParticles(deltaTime: number): void {
        if (this.currentWeather === 'sunny') return;
        
        for (const p of this.particles) {
            switch (this.currentWeather) {
                case 'rain':
                    p.y += p.speed * deltaTime;
                    p.x += 20 * deltaTime;
                    if (p.y > 2000) {
                        p.y = -10;
                        p.x = Math.random() * 2000;
                    }
                    break;
                case 'blizzard':
                    p.x += p.speed * deltaTime;
                    p.y += p.speed * 0.3 * deltaTime;
                    if (p.x > 2000) p.x = -10;
                    if (p.y > 2000) p.y = -10;
                    break;
                case 'sandstorm':
                    p.x += p.speed * deltaTime;
                    if (p.x > 2000) p.x = -10;
                    break;
                case 'bloodmoon':
                    p.y += p.speed * 0.2 * deltaTime;
                    if (p.y > 2000) {
                        p.y = -10;
                        p.x = Math.random() * 2000;
                    }
                    break;
            }
        }
    }

    public getCurrentWeather(): WeatherType {
        return this.currentWeather;
    }

    public getConfig(): WeatherConfig {
        return this.WEATHER_CONFIGS[this.currentWeather];
    }

    public getPlayerSpeedMod(): number {
        return this.WEATHER_CONFIGS[this.currentWeather].playerSpeedMod;
    }

    public getEnemySpeedMod(): number {
        return this.WEATHER_CONFIGS[this.currentWeather].enemySpeedMod;
    }

    public getDamageMod(): number {
        return this.WEATHER_CONFIGS[this.currentWeather].damageMod;
    }

    public getGoldMod(): number {
        return this.WEATHER_CONFIGS[this.currentWeather].goldMod;
    }

    public getSpawnMod(): number {
        return this.WEATHER_CONFIGS[this.currentWeather].spawnMod;
    }

    public getBackgroundColor(): string {
        return this.WEATHER_CONFIGS[this.currentWeather].backgroundColor;
    }

    public render(ctx: CanvasRenderingContext2D, camX: number, camY: number, canvasWidth: number, canvasHeight: number): void {
        if (this.currentWeather === 'sunny') return;
        
        const config = this.WEATHER_CONFIGS[this.currentWeather];
        ctx.save();
        
        // 渲染天气粒子
        ctx.fillStyle = config.particleColor;
        ctx.globalAlpha = this.currentWeather === 'bloodmoon' ? 0.3 : 0.6;
        
        for (const p of this.particles) {
            const screenX = p.x - camX;
            const screenY = p.y - camY;
            
            // 只渲染屏幕内的粒子
            if (screenX >= -20 && screenX <= canvasWidth + 20 && screenY >= -20 && screenY <= canvasHeight + 20) {
                ctx.beginPath();
                
                switch (this.currentWeather) {
                    case 'rain':
                        // 雨滴
                        ctx.fillRect(screenX, screenY, 2, 8);
                        break;
                    case 'blizzard':
                        // 雪花
                        ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 'sandstorm':
                        // 沙尘
                        ctx.globalAlpha = 0.3;
                        ctx.fillRect(screenX, screenY, p.size * 2, p.size);
                        break;
                    case 'bloodmoon':
                        // 血滴
                        ctx.arc(screenX, screenY, p.size * 0.5, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                }
            }
        }
        
        // 血月特殊效果 - 红色覆盖层
        if (this.currentWeather === 'bloodmoon') {
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#ff0033';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        
        // 沙尘暴特殊效果 - 黄色覆盖层
        if (this.currentWeather === 'sandstorm') {
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = '#d4a656';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        
        ctx.restore();
        
        // 渲染天气UI指示器
        this.renderWeatherUI(ctx, canvasWidth);
    }

    private renderWeatherUI(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
        const config = this.WEATHER_CONFIGS[this.currentWeather];
        const remainingTime = config.duration - this.weatherTimer;
        
        ctx.save();
        ctx.font = '24px "Fredoka One", cursive';
        ctx.textAlign = 'left';
        ctx.fillStyle = config.particleColor;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // 天气图标和时间
        const text = `${config.icon} ${config.nameZh} ${Math.ceil(remainingTime)}s`;
        ctx.strokeText(text, 20, canvasWidth > 600 ? 150 : 130);
        ctx.fillText(text, 20, canvasWidth > 600 ? 150 : 130);
        
        ctx.restore();
    }
}