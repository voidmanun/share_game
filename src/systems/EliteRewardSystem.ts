import { Game } from '../Game';
import { FloatingText } from '../entities/FloatingText';

export type RewardType = 
    | 'health'
    | 'speed'
    | 'damage'
    | 'attackSpeed'
    | 'maxHp'
    | 'gold'
    | 'shield'
    | 'critChance'
    | 'critDamage'
    | 'lifesteal'
    | 'piercing'
    | 'multishot'
    | 'cooldownReduction'
    | 'movementSpeed'
    | 'armor'
    | 'regen'
    | 'explosive'
    | 'frostNova'
    | 'thorns'
    | 'vampiric';

export interface RewardOption {
    type: RewardType;
    value: number;
    name: string;
    description: string;
    icon: string;
    color: string;
}

export class EliteRewardSystem {
    private game: Game;
    private isShowing: boolean = false;
    private selectedCardIndex: number = -1;
    private cards: RewardOption[] = [];
    private overlayEl: HTMLElement | null = null;
    private cardsEl: HTMLElement | null = null;
    private rewardUseCount: Map<RewardType, number> = new Map(); // 追踪每种强化的使用次数
    private readonly MAX_USE_COUNT = 10; // 每种强化最多使用 10 次

    private readonly allRewards: Omit<RewardOption, 'value'>[] = [
        { type: 'health', name: '生命恢复', description: '恢复生命值', icon: '❤️', color: '#00FF00' },
        { type: 'speed', name: '攻击速度', description: '提升攻击速度', icon: '⚡', color: '#FFFF00' },
        { type: 'damage', name: '伤害提升', description: '增加所有武器伤害', icon: '💥', color: '#FF4444' },
        { type: 'maxHp', name: '最大生命', description: '增加最大生命值', icon: '💚', color: '#FF69B4' },
        { type: 'gold', name: '金币奖励', description: '获得金币', icon: '🪙', color: '#FFD700' },
        { type: 'shield', name: '无敌护盾', description: '短暂无敌', icon: '🛡️', color: '#8A2BE2' },
        { type: 'critChance', name: '暴击几率', description: '提升暴击率', icon: '🎯', color: '#FF6B6B' },
        { type: 'critDamage', name: '暴击伤害', description: '提升暴击伤害', icon: '💢', color: '#FF0000' },
        { type: 'lifesteal', name: '生命偷取', description: '攻击回复生命', icon: '🩸', color: '#DC143C' },
        { type: 'piercing', name: '穿透射击', description: '子弹可穿透敌人', icon: '🏹', color: '#00CED1' },
        { type: 'multishot', name: '多重射击', description: '额外发射子弹', icon: '🔱', color: '#4169E1' },
        { type: 'cooldownReduction', name: '冷却缩减', description: '减少技能冷却', icon: '⏱️', color: '#9370DB' },
        { type: 'movementSpeed', name: '移动速度', description: '提升移动速度', icon: '👟', color: '#00BFFF' },
        { type: 'armor', name: '护甲提升', description: '减少受到的伤害', icon: '🔰', color: '#708090' },
        { type: 'regen', name: '生命回复', description: '持续回复生命', icon: '💧', color: '#20B2AA' },
        { type: 'explosive', name: '爆炸射击', description: '子弹爆炸造成范围伤害', icon: '💣', color: '#FF4500' },
        { type: 'frostNova', name: '冰霜新星', description: '冻结周围敌人', icon: '❄️', color: '#00BFFF' },
        { type: 'thorns', name: '荆棘护甲', description: '反弹近战伤害', icon: '🌵', color: '#228B22' },
        { type: 'vampiric', name: '吸血鬼之力', description: '击杀敌人回复生命', icon: '🧛', color: '#8B0000' },
        { type: 'attackSpeed', name: '急速', description: '大幅提升攻速', icon: '💨', color: '#FFD700' }
    ];

    constructor(game: Game) {
        this.game = game;
        this.createOverlay();
    }

    private createOverlay(): void {
        const overlay = document.createElement('div');
        overlay.id = 'elite-reward-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 5000;
            font-family: 'Fredoka One', cursive;
        `;

        const container = document.createElement('div');
        container.style.cssText = `
            text-align: center;
            color: white;
        `;

        const title = document.createElement('h2');
        title.textContent = '🎁 精英掉落 - 选择强化';
        title.style.cssText = `
            font-size: 24px;
            margin-bottom: 20px;
            text-shadow: 3px 3px 0 #000, 0 0 20px #FFD700;
            color: #FFD700;
            padding: 0 10px;
        `;

        const cardsContainer = document.createElement('div');
        cardsContainer.id = 'elite-reward-cards';
        cardsContainer.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            max-width: 90vw;
        `;

        container.appendChild(title);
        container.appendChild(cardsContainer);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        this.overlayEl = overlay;
        this.cardsEl = cardsContainer;

        // Click outside to close (fallback)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && this.isShowing) {
                this.hide();
                this.game.resume();
            }
        });

        // Keyboard selection
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (!this.isShowing) return;
        
        if (e.code === 'Digit1' || e.code === 'Numpad1') {
            this.selectReward(0);
        } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
            this.selectReward(1);
        } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
            this.selectReward(2);
        }
    }

    public show(): void {
        this.isShowing = true;
        this.selectedCardIndex = -1;
        this.cards = this.generateThreeRewards();
        
        // 如果没有可用强化，给予金币奖励并关闭
        if (this.cards.length === 0) {
            this.game.gold += 50;
            this.game.floatingTexts.push(new FloatingText(this.game.player.x, this.game.player.y - 40, `强化已满！获得 50 金币`, '#FFD700'));
            this.hide();
            this.game.resume();
            return;
        }
        
        this.renderCards();
        
        if (this.overlayEl) {
            this.overlayEl.style.display = 'flex';
        }
    }

    public hide(): void {
        this.isShowing = false;
        if (this.overlayEl) {
            this.overlayEl.style.display = 'none';
        }
    }

    private generateThreeRewards(): RewardOption[] {
        // 过滤掉已达到使用上限的强化类型
        const availableRewards = this.allRewards.filter(reward => {
            const count = this.rewardUseCount.get(reward.type) || 0;
            return count < this.MAX_USE_COUNT;
        });
        
        // 如果所有强化都已达到上限，返回空数组
        if (availableRewards.length === 0) {
            return [];
        }
        
        const shuffled = [...availableRewards].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);
        
        return selected.map(reward => ({
            ...reward,
            value: this.getRewardValue(reward.type)
        }));
    }

    private getRewardValue(type: RewardType): number {
        switch (type) {
            case 'health': return 25;
            case 'speed': return 0.12;
            case 'damage': return 0.15;
            case 'attackSpeed': return 0.04;
            case 'maxHp': return 15;
            case 'gold': return 30;
            case 'shield': return 3;
            case 'critChance': return 0.1;
            case 'critDamage': return 0.3;
            case 'lifesteal': return 0.08;
            case 'piercing': return 1;
            case 'multishot': return 1;
            case 'cooldownReduction': return 0.15;
            case 'movementSpeed': return 0.15;
            case 'armor': return 0.1;
            case 'regen': return 2;
            case 'explosive': return 0.5;
            case 'frostNova': return 1;
            case 'thorns': return 0.15;
            case 'vampiric': return 5;
            default: return 1;
        }
    }

    private renderCards(): void {
        if (!this.cardsEl) return;

        this.cardsEl.innerHTML = '';

        this.cards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.style.cssText = `
                width: 140px;
                padding: 15px 10px;
                background: linear-gradient(145deg, ${card.color}22, ${card.color}44);
                border: 3px solid ${card.color};
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 4px 4px 0 #000, 0 0 15px ${card.color}66;
                position: relative;
                overflow: hidden;
                flex-shrink: 0;
            `;

            cardEl.onmouseenter = () => {
                cardEl.style.transform = 'translateY(-10px) scale(1.05)';
                cardEl.style.boxShadow = `8px 8px 0 #000, 0 0 30px ${card.color}`;
            };
            cardEl.onmouseleave = () => {
                cardEl.style.transform = 'translateY(0) scale(1)';
                cardEl.style.boxShadow = `6px 6px 0 #000, 0 0 20px ${card.color}66`;
            };
            cardEl.onclick = () => this.selectReward(index);
            cardEl.ontouchstart = (e) => {
                e.preventDefault();
                this.selectReward(index);
            };

            const icon = document.createElement('div');
            icon.textContent = card.icon;
            icon.style.cssText = `
                font-size: 36px;
                margin-bottom: 8px;
                filter: drop-shadow(2px 2px 0 #000);
            `;

            const name = document.createElement('h3');
            name.textContent = card.name;
            name.style.cssText = `
                font-size: 14px;
                margin: 0 0 5px 0;
                color: ${card.color};
                text-shadow: 2px 2px 0 #000;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;

            const value = document.createElement('div');
            value.textContent = this.formatValue(card.type, card.value);
            value.style.cssText = `
                font-size: 18px;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 2px 2px 0 #000;
                margin-bottom: 5px;
            `;

            const desc = document.createElement('p');
            desc.textContent = card.description;
            desc.style.cssText = `
                font-size: 11px;
                color: #ccc;
                margin: 0;
                text-shadow: 1px 1px 0 #000;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;

            cardEl.appendChild(icon);
            cardEl.appendChild(name);
            cardEl.appendChild(value);
            cardEl.appendChild(desc);
            if (this.cardsEl) {
                this.cardsEl.appendChild(cardEl);
            }
        });
    }

    private formatValue(type: RewardType, value: number): string {
        switch (type) {
            case 'health': return `+${value} HP`;
            case 'speed': return `+${(value * 100).toFixed(0)}%`;
            case 'damage': return `+${(value * 100).toFixed(0)}%`;
            case 'attackSpeed': return `+${(value * 100).toFixed(0)}%`;
            case 'maxHp': return `+${value}`;
            case 'gold': return `+${value}`;
            case 'shield': return `${value}秒`;
            case 'critChance': return `+${(value * 100).toFixed(0)}%`;
            case 'critDamage': return `+${(value * 100).toFixed(0)}%`;
            case 'lifesteal': return `+${(value * 100).toFixed(0)}%`;
            case 'piercing': return `+${value}`;
            case 'multishot': return `+${value}`;
            case 'cooldownReduction': return `-${(value * 100).toFixed(0)}%`;
            case 'movementSpeed': return `+${(value * 100).toFixed(0)}%`;
            case 'armor': return `+${(value * 100).toFixed(0)}%`;
            case 'regen': return `+${value}/秒`;
            case 'explosive': return `${(value * 100).toFixed(0)}伤害`;
            case 'frostNova': return `冻结`;
            case 'thorns': return `反弹${(value * 100).toFixed(0)}%`;
            case 'vampiric': return `+${value} HP`;
            default: return `+${value}`;
        }
    }

    private selectReward(index: number): void {
        if (this.selectedCardIndex !== -1) return;
        this.selectedCardIndex = index;
        
        const reward = this.cards[index];
        this.applyReward(reward);
        
        // Visual feedback
        if (this.cardsEl) {
            const selectedCard = this.cardsEl.children[index] as HTMLElement | null;
            if (selectedCard) {
                selectedCard.style.transform = 'scale(1.1)';
                selectedCard.style.boxShadow = `0 0 40px ${reward.color}`;
            }
        }

        setTimeout(() => {
            this.hide();
            this.game.resume();
        }, 500);
    }

    private applyReward(reward: RewardOption): void {
        // 增加使用计数
        const currentCount = this.rewardUseCount.get(reward.type) || 0;
        this.rewardUseCount.set(reward.type, currentCount + 1);
        this.game.eliteRewardUseCount++;
        
        const player = this.game.player;
        const floatingTexts = this.game.floatingTexts;

        // 显示剩余次数
        const remaining = this.MAX_USE_COUNT - (currentCount + 1);
        floatingTexts.push(new FloatingText(player.x, player.y - 60, `剩余：${remaining}次`, '#FFFFFF', 'level'));

        switch (reward.type) {
            case 'health':
                const healed = player.heal(reward.value);
                floatingTexts.push(new FloatingText(player.x, player.y - 30, `+${healed} HP`, '#00FF00'));
                break;
            case 'speed':
                (player as any).attackSpeedMultiplier *= (1 + reward.value);
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `攻速 +${(reward.value * 100).toFixed(0)}%`, '#FFFF00'));
                break;
            case 'damage':
                player.weapons.forEach(w => {
                    w.damage *= (1 + reward.value);
                });
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `伤害 +${(reward.value * 100).toFixed(0)}%`, '#FF4444'));
                break;
            case 'attackSpeed':
                (player as any).attackSpeedMultiplier *= (1 + reward.value);
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `急速 +${(reward.value * 100).toFixed(0)}%`, '#FFD700'));
                break;
            case 'maxHp':
                (player as any).maxHp += reward.value;
                (player as any).hp += reward.value;
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `最大生命 +${reward.value}`, '#FF69B4'));
                break;
            case 'gold':
                (this.game as any).gold += reward.value;
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `+${reward.value} 金币`, '#FFD700'));
                break;
            case 'shield':
                (player as any).becomeInvincible(reward.value);
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `护盾 ${reward.value}秒`, '#8A2BE2'));
                break;
            case 'critChance':
                (player as any).critChance = ((player as any).critChance || 0) + reward.value;
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `暴击 +${(reward.value * 100).toFixed(0)}%`, '#FF6B6B'));
                break;
            case 'critDamage':
                (player as any).critDamage = ((player as any).critDamage || 1.5) + reward.value;
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `暴伤 +${(reward.value * 100).toFixed(0)}%`, '#FF0000'));
                break;
            case 'lifesteal':
                (player as any).lifesteal = ((player as any).lifesteal || 0) + reward.value;
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `吸血 +${(reward.value * 100).toFixed(0)}%`, '#DC143C'));
                break;
            case 'piercing':
                player.weapons.forEach(w => {
                    (w as any).penetration = ((w as any).penetration || 0) + reward.value;
                });
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `穿透 +${reward.value}`, '#00CED1'));
                break;
            case 'multishot':
                player.weapons.forEach(w => {
                    (w as any).projectiles = ((w as any).projectiles || 1) + reward.value;
                });
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `多重 +${reward.value}`, '#4169E1'));
                break;
            case 'cooldownReduction':
                (player as any).skillCooldownMultiplier *= (1 - reward.value);
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `冷却 -${(reward.value * 100).toFixed(0)}%`, '#9370DB'));
                break;
            case 'movementSpeed':
                (player as any).speed *= (1 + reward.value);
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `移速 +${(reward.value * 100).toFixed(0)}%`, '#00BFFF'));
                break;
            case 'armor':
                (player as any).armor = ((player as any).armor || 0) + reward.value;
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `护甲 +${(reward.value * 100).toFixed(0)}%`, '#708090'));
                break;
            case 'regen':
                (player as any).regen = ((player as any).regen || 0) + reward.value;
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `回复 +${reward.value}/秒`, '#20B2AA'));
                break;
            case 'explosive':
                player.weapons.forEach(w => {
                    (w as any).explosive = true;
                    (w as any).explosionRadius = ((w as any).explosionRadius || 0) + reward.value * 20;
                });
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `爆炸射击!`, '#FF4500'));
                break;
            case 'frostNova':
                (player as any).frostNova = true;
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `冰霜新星!`, '#00BFFF'));
                break;
            case 'thorns':
                (player as any).thorns = ((player as any).thorns || 0) + reward.value;
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `荆棘 +${(reward.value * 100).toFixed(0)}%`, '#228B22'));
                break;
            case 'vampiric':
                (player as any).vampiricHeal = ((player as any).vampiricHeal || 0) + reward.value;
                floatingTexts.push(new FloatingText(player.x, player.y - 40, `吸血鬼之力!`, '#8B0000'));
                break;
        }

        this.game.createExplosion(player.x, player.y, reward.color);
    }

    public isShowingRewards(): boolean {
        return this.isShowing;
    }
}
