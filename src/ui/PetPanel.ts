// Pet Panel UI
// 宠物管理面板：查看属性、装备、进化

import { Game } from '../Game';
import type { PetData, PetEquipment } from '../systems/PetNurtureSystem';
import { FloatingText } from '../entities/FloatingText';

export class PetPanel {
    private game: Game;
    private element: HTMLElement;
    private isVisible: boolean = false;
    private selectedPetIndex: number = 0;

    constructor(game: Game) {
        this.game = game;
        this.element = document.getElementById('pet-panel')!;

        // 绑定事件
        document.getElementById('close-pet-panel')?.addEventListener('click', () => this.toggle());
        document.getElementById('prev-pet-btn')?.addEventListener('click', () => this.selectPrevPet());
        document.getElementById('next-pet-btn')?.addEventListener('click', () => this.selectNextPet());
        document.getElementById('evolve-pet-btn')?.addEventListener('click', () => this.evolvePet());

        // 装备槽位点击事件
        ['collar', 'accessory', 'badge'].forEach(slot => {
            document.getElementById(`equip-${slot}`)?.addEventListener('click', () => this.openEquipmentSelector(slot as 'collar' | 'accessory' | 'badge'));
        });

        // 快捷键 P 打开
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyO') { // O for Pet
                this.toggle();
            }
        });

        // 移动端按钮
        document.getElementById('mobile-pet-btn')?.addEventListener('click', () => {
            this.toggle();
        });

        // Settings 面板中的宠物按钮
        document.getElementById('pet-panel-btn')?.addEventListener('click', () => {
            this.toggle();
            // 关闭 settings 面板
            document.getElementById('settings-modal')?.classList.add('hidden');
        });
    }

    public toggle(): void {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.element.classList.remove('hidden');
            this.updateUI();
            this.game.pause();
        } else {
            this.element.classList.add('hidden');
            this.game.resume();
        }
    }

    private updateUI(): void {
        const pets = this.game.pets;
        if (pets.length === 0) return;

        // 确保选中的索引有效
        if (this.selectedPetIndex >= pets.length) {
            this.selectedPetIndex = pets.length - 1;
        }

        const pet = pets[this.selectedPetIndex];
        const petData = this.game.petNurtureSystem?.getPetData(pet) || this.getSimplePetData(pet);

        // 更新宠物信息
        this.updateElement('pet-name', petData?.nameZh || pet.constructor.name);
        this.updateElement('pet-level', `Lv.${pet.level}`);
        this.updateElement('pet-exp', `${pet.experience}/${pet.maxExperience}`);
        this.updateElement('pet-intimacy', `${pet.intimacy}/100 ♥`);
        this.updateElement('pet-stage', this.getEvolutionStageText(pet.evolutionStage));

        // 更新属性显示
        this.updateElement('pet-damage', `${((pet.damageMultiplier - 1) * 100).toFixed(0)}%`);
        this.updateElement('pet-speed', `${((petData?.stats.speedMultiplier || 1) - 1) * 100 | 0}%`);

        // 更新经验条
        const expBar = document.getElementById('pet-exp-bar') as HTMLElement;
        if (expBar) {
            const expPercent = (pet.experience / pet.maxExperience) * 100;
            expBar.style.width = `${expPercent}%`;
        }

        // 更新亲密度条
        const intimacyBar = document.getElementById('pet-intimacy-bar') as HTMLElement;
        if (intimacyBar) {
            intimacyBar.style.width = `${pet.intimacy}%`;
        }

        // 进化按钮状态
        const evolveBtn = document.getElementById('evolve-pet-btn') as HTMLButtonElement;
        if (evolveBtn) {
            evolveBtn.disabled = !pet.canEvolve;
            evolveBtn.textContent = pet.canEvolve ? '进化!' : `进化 (Lv.${pet.evolutionStage < 1 ? 15 : 30})`;
        }

        // 更新装备槽位
        this.updateEquipmentSlot('collar', petData?.equipment.collar);
        this.updateEquipmentSlot('accessory', petData?.equipment.accessory);
        this.updateEquipmentSlot('badge', petData?.equipment.badge);

        // 更新技能点
        this.updateElement('pet-skill-points', `${pet.skillPoints}`);
    }

    private getSimplePetData(pet: any): PetData {
        return {
            id: '',
            name: pet.constructor.name,
            nameZh: pet.constructor.name,
            level: pet.level,
            experience: pet.experience,
            maxExperience: pet.maxExperience,
            intimacy: pet.intimacy,
            intimacyLevel: pet.intimacyLevel,
            evolutionStage: pet.evolutionStage,
            canEvolve: pet.canEvolve,
            skillPoints: pet.skillPoints,
            unlockedSkills: [],
            equipment: { collar: null, accessory: null, badge: null },
            stats: {
                damageMultiplier: pet.damageMultiplier,
                speedMultiplier: 1.0,
                healthMultiplier: 1.0,
            },
        };
    }

    private updateElement(id: string, text: string): void {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    private updateEquipmentSlot(slot: string, equipment: PetEquipment | null): void {
        const slotEl = document.getElementById(`equip-${slot}`);
        if (slotEl) {
            if (equipment) {
                slotEl.innerHTML = `
                    <div class="equip-item ${equipment.rarity}">
                        <div class="equip-name">${equipment.nameZh}</div>
                        <div class="equip-stats">${this.formatEquipmentStats(equipment.effects)}</div>
                    </div>
                `;
            } else {
                slotEl.innerHTML = `<div class="equip-empty">空</div>`;
            }
        }
    }

    private formatEquipmentStats(effects: Map<string, number>): string {
        const statNames: Record<string, string> = {
            'damage': '攻击',
            'speed': '速度',
            'health': '生命',
            'gold': '金币',
            'critChance': '暴击',
        };
        return Array.from(effects.entries())
            .map(([key, value]) => `${statNames[key] || key}+${value}%`)
            .join(' ');
    }

    private getEvolutionStageText(stage: number): string {
        const stages = ['基础形态', '进阶形态', '终极形态'];
        return stages[stage] || '未知';
    }

    private selectPrevPet(): void {
        if (this.selectedPetIndex > 0) {
            this.selectedPetIndex--;
            this.updateUI();
        }
    }

    private selectNextPet(): void {
        if (this.selectedPetIndex < this.game.pets.length - 1) {
            this.selectedPetIndex++;
            this.updateUI();
        }
    }

    private evolvePet(): void {
        const pet = this.game.pets[this.selectedPetIndex];
        if (pet && pet.canEvolve) {
            const success = pet.evolve();
            if (success) {
                this.game.floatingTexts.push(
                    new FloatingText(pet.x, pet.y - 50, '进化成功!', '#FFD700')
                );
                this.updateUI();
            }
        }
    }

    private openEquipmentSelector(slot: 'collar' | 'accessory' | 'badge'): void {
        // TODO: 打开装备选择器
        console.log('Opening equipment selector for slot:', slot);
    }
}
