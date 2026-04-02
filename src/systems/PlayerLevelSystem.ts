import { Game } from '../Game';

export interface LevelUpChoice {
    id: string;
    name: string;
    nameZh: string;
    description: string;
    icon: string;
    color: string;
    effect: (game: Game) => void;
}

export class PlayerLevelSystem {
    private game: Game;
    private level: number = 1;
    private experience: number = 0;
    private readonly BASE_EXP_REQUIRED: number = 100;
    private isShowingLevelUp: boolean = false;
    private overlayEl: HTMLElement | null = null;

    constructor(game: Game) {
        this.game = game;
        this.createOverlay();
    }

    private createOverlay(): void {
        const overlay = document.createElement('div');
        overlay.id = 'level-up-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 6000;
            font-family: 'Fredoka One', cursive;
        `;

        const container = document.createElement('div');
        container.style.cssText = `
            text-align: center;
            color: white;
        `;

        const title = document.createElement('h2');
        title.id = 'level-up-title';
        title.style.cssText = `
            font-size: 42px;
            margin-bottom: 10px;
            text-shadow: 3px 3px 0 #000, 0 0 30px #FFD700;
            color: #FFD700;
        `;

        const subtitle = document.createElement('p');
        subtitle.textContent = '选择一项永久增强';
        subtitle.style.cssText = `
            font-size: 20px;
            margin-bottom: 30px;
            color: #aaa;
        `;

        const choicesContainer = document.createElement('div');
        choicesContainer.id = 'level-up-choices';
        choicesContainer.style.cssText = `
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        `;

        container.appendChild(title);
        container.appendChild(subtitle);
        container.appendChild(choicesContainer);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        this.overlayEl = overlay;
    }

    public addExperience(amount: number): void {
        if (this.isShowingLevelUp) return;

        this.experience += amount;

        const expRequired = this.getExpRequiredForLevel();
        if (this.experience >= expRequired) {
            this.experience -= expRequired;
            this.levelUp();
        }
    }

    private getExpRequiredForLevel(): number {
        return Math.floor(this.BASE_EXP_REQUIRED * Math.pow(1.5, this.level - 1));
    }

    private levelUp(): void {
        this.level++;
        this.isShowingLevelUp = true;
        this.game.pause();
        this.showLevelUpUI();
    }

    private showLevelUpUI(): void {
        if (!this.overlayEl) return;

        const titleEl = this.overlayEl.querySelector('#level-up-title') as HTMLElement;
        if (titleEl) {
            titleEl.textContent = `🎉 升级! 等级 ${this.level}`;
        }

        const choicesContainer = this.overlayEl.querySelector('#level-up-choices') as HTMLElement;
        if (!choicesContainer) return;

        choicesContainer.innerHTML = '';

        const choices = this.generateChoices();
        choices.forEach((choice, index) => {
            const card = this.createChoiceCard(choice, index);
            choicesContainer.appendChild(card);
        });

        this.overlayEl.style.display = 'flex';
    }

    private generateChoices(): LevelUpChoice[] {
        const allChoices: LevelUpChoice[] = [
            {
                id: 'damage',
                name: 'Damage Up',
                nameZh: '伤害提升',
                description: '所有武器伤害+15%',
                icon: '💥',
                color: '#FF4444',
                effect: (game) => {
                    game.player.weapons.forEach(w => w.damage *= 1.15);
                }
            },
            {
                id: 'speed',
                name: 'Speed Up',
                nameZh: '速度提升',
                description: '移动速度+20%',
                icon: '👟',
                color: '#00BFFF',
                effect: (game) => {
                    game.player.speedMultiplier *= 1.2;
                }
            },
            {
                id: 'maxHp',
                name: 'Max HP Up',
                nameZh: '最大生命',
                description: '最大生命+20',
                icon: '💚',
                color: '#00FF00',
                effect: (game) => {
                    game.player.maxHp += 20;
                    game.player.hp += 20;
                }
            },
            {
                id: 'attackSpeed',
                name: 'Attack Speed',
                nameZh: '攻速提升',
                description: '攻击速度+15%',
                icon: '⚡',
                color: '#FFFF00',
                effect: (game) => {
                    game.player.attackSpeedMultiplier = Math.min(2.0, game.player.attackSpeedMultiplier * 1.15);
                }
            },
            {
                id: 'armor',
                name: 'Armor Up',
                nameZh: '护甲提升',
                description: '减少受到伤害+10%',
                icon: '🛡️',
                color: '#808080',
                effect: (game) => {
                    game.player.armor = Math.min(0.7, game.player.armor + 0.1);
                }
            },
            {
                id: 'heal',
                name: 'Full Heal',
                nameZh: '完全治愈',
                description: '恢复全部生命值',
                icon: '❤️',
                color: '#FF69B4',
                effect: (game) => {
                    game.player.hp = game.player.maxHp;
                }
            },
            {
                id: 'gold',
                name: 'Gold Bonus',
                nameZh: '金币奖励',
                description: '获得50金币',
                icon: '🪙',
                color: '#FFD700',
                effect: (game) => {
                    game.gold += 50;
                }
            },
            {
                id: 'crit',
                name: 'Critical Up',
                nameZh: '暴击提升',
                description: '暴击几率+5%',
                icon: '🎯',
                color: '#FF6B6B',
                effect: (game) => {
                    const player = game.player as any;
                    player.critChance = (player.critChance || 0) + 0.05;
                }
            }
        ];

        // 随机选择3个
        const shuffled = allChoices.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    }

    private createChoiceCard(choice: LevelUpChoice, _index: number): HTMLElement {
        const card = document.createElement('div');
        card.style.cssText = `
            width: 180px;
            padding: 20px;
            background: linear-gradient(145deg, ${choice.color}22, ${choice.color}44);
            border: 3px solid ${choice.color};
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 4px 4px 0 #000, 0 0 15px ${choice.color}66;
        `;

        card.onmouseenter = () => {
            card.style.transform = 'translateY(-5px) scale(1.05)';
        };
        card.onmouseleave = () => {
            card.style.transform = 'translateY(0) scale(1)';
        };

        const icon = document.createElement('div');
        icon.textContent = choice.icon;
        icon.style.cssText = `
            font-size: 48px;
            margin-bottom: 10px;
        `;

        const name = document.createElement('h3');
        name.textContent = choice.nameZh;
        name.style.cssText = `
            font-size: 18px;
            margin: 0 0 8px 0;
            color: ${choice.color};
            text-shadow: 1px 1px 0 #000;
        `;

        const desc = document.createElement('p');
        desc.textContent = choice.description;
        desc.style.cssText = `
            font-size: 14px;
            color: #ccc;
            margin: 0;
        `;

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(desc);

        card.onclick = () => {
            this.selectChoice(choice);
        };
        card.ontouchstart = (e) => {
            e.preventDefault();
            this.selectChoice(choice);
        };

        return card;
    }

    private selectChoice(choice: LevelUpChoice): void {
        choice.effect(this.game);
        this.hideLevelUpUI();
        this.isShowingLevelUp = false;
        this.game.resume();
    }

    private hideLevelUpUI(): void {
        if (this.overlayEl) {
            this.overlayEl.style.display = 'none';
        }
    }

    public getLevel(): number {
        return this.level;
    }

    public getExperience(): number {
        return this.experience;
    }

    public getExpRequired(): number {
        return this.BASE_EXP_REQUIRED * Math.pow(1.5, this.level - 1);
    }

    public getExpPercent(): number {
        return this.experience / this.getExpRequired();
    }

    public isShowingLevelUpUI(): boolean {
        return this.isShowingLevelUp;
    }

    public render(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
        if (this.isShowingLevelUp) return;

        ctx.save();
        
        // 经验条位置 - 屏幕左上角
        const barX = 20;
        const barY = canvasWidth > 600 ? 180 : 160;
        const barWidth = 150;
        const barHeight = 12;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 经验条
        const expPercent = this.getExpPercent();
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(barX, barY, barWidth * expPercent, barHeight);
        
        // 边框
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // 等级文字
        ctx.font = 'bold 16px "Fredoka One", cursive';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.strokeText(`Lv.${this.level}`, barX, barY - 5);
        ctx.fillText(`Lv.${this.level}`, barX, barY - 5);
        
        ctx.restore();
    }
}