// Pet Panel UI
// 宠物管理面板：查看属性、装备、进化

import { Game } from '../Game';
import type { PetEquipment } from '../systems/PetNurtureSystem';
import { FloatingText } from '../entities/FloatingText';
import { getPetChineseName } from '../systems/PetConstants';

export class PetPanel {
    private game: Game;
    private element: HTMLElement;
    private isVisible: boolean = false;
    private selectedPetIndex: number = 0;

    constructor(game: Game) {
        this.game = game;
        this.element = document.getElementById('pet-panel')!;

        // 等待 DOM 加载完成后绑定事件
        setTimeout(() => this.bindEvents(), 100);
    }

    private bindEvents(): void {
        document.getElementById('close-pet-panel')?.addEventListener('click', () => this.toggle());
        document.getElementById('prev-pet-btn')?.addEventListener('click', () => this.selectPrevPet());
        document.getElementById('next-pet-btn')?.addEventListener('click', () => this.selectNextPet());
        document.getElementById('evolve-pet-btn')?.addEventListener('click', () => this.evolvePet());

        ['collar', 'accessory', 'badge'].forEach(slot => {
            document.getElementById(`equip-${slot}`)?.addEventListener('click', () => this.openEquipmentSelector(slot as 'collar' | 'accessory' | 'badge'));
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyO') {
                this.toggle();
            }
        });

        document.getElementById('mobile-pet-btn')?.addEventListener('click', () => {
            this.toggle();
        });

        document.getElementById('pet-panel-btn')?.addEventListener('click', () => {
            this.toggle();
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

    public updateUI(): void {
        const pets = this.game.pets;
        if (pets.length === 0) {
            return;
        }

        // 确保选中的索引有效
        if (this.selectedPetIndex >= pets.length) {
            this.selectedPetIndex = pets.length - 1;
        }

        const pet = pets[this.selectedPetIndex];
        const petData = this.game.petNurtureSystem?.getPetData(pet);

        // 更新宠物信息
        this.updateElement('pet-name', petData?.nameZh || getPetChineseName(pet.constructor.name));
        this.updateElement('pet-level', `Lv.${pet.level}`);
        this.updateElement('pet-exp', `${pet.experience}/${pet.maxExperience}`);
        this.updateElement('pet-intimacy', `${pet.intimacy}/100 ♥`);
        this.updateElement('pet-stage', this.getEvolutionStageText(pet.evolutionStage));

        // 更新属性显示 - 从 petData 或 pet 对象获取
        const damageBonus = petData 
            ? (petData.stats.damageMultiplier - 1) * 100 
            : (pet.damageMultiplier - 1) * 100;
        const speedBonus = petData 
            ? (petData.stats.speedMultiplier - 1) * 100 
            : 0;
            
        this.updateElement('pet-damage', `+${damageBonus.toFixed(0)}%`);
        this.updateElement('pet-speed', `+${speedBonus.toFixed(0)}%`);

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
        this.updateEquipmentSlot('collar', petData?.equipment.collar ?? null);
        this.updateEquipmentSlot('accessory', petData?.equipment.accessory ?? null);
        this.updateEquipmentSlot('badge', petData?.equipment.badge ?? null);

        // 更新技能点
        this.updateElement('pet-skill-points', `${pet.skillPoints}`);
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
        const pets = this.game.pets;
        if (pets.length === 0) return;
        
        this.selectedPetIndex = (this.selectedPetIndex - 1 + pets.length) % pets.length;
        this.updateUI();
    }

    private selectNextPet(): void {
        const pets = this.game.pets;
        if (pets.length === 0) return;
        
        this.selectedPetIndex = (this.selectedPetIndex + 1) % pets.length;
        this.updateUI();
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
        const pet = this.game.pets[this.selectedPetIndex];
        if (!pet) return;

        const equipmentDb = this.game.petNurtureSystem?.getEquipmentDatabase();
        if (!equipmentDb) return;

        const availableEquipment = Array.from(equipmentDb.values()).filter(
            eq => eq.slot === slot
        );

        if (availableEquipment.length === 0) {
            this.game.floatingTexts.push(
                new FloatingText(pet.x, pet.y - 30, '没有可用装备', '#FF6666')
            );
            return;
        }

        const petData = this.game.petNurtureSystem?.getPetData(pet);
        const currentEquip = petData?.equipment[slot];

        const slotNames: Record<string, string> = {
            'collar': '项圈',
            'accessory': '饰品',
            'badge': '徽章'
        };

        let message = `${slotNames[slot]}槽位:\n`;
        message += currentEquip ? `当前: ${currentEquip.nameZh}\n` : '当前: 空\n';
        message += '\n选择装备:\n';
        availableEquipment.forEach((eq, i) => {
            const stats = Array.from(eq.effects.entries())
                .map(([k, v]) => `${k}+${v}%`)
                .join(' ');
            message += `${i + 1}. ${eq.nameZh} (${eq.rarity}) - ${stats}\n`;
        });

        const choice = prompt(message);
        if (choice) {
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < availableEquipment.length) {
                const selectedEquip = availableEquipment[index];
                this.game.petNurtureSystem?.equipItem(pet, selectedEquip.id);
                this.game.floatingTexts.push(
                    new FloatingText(pet.x, pet.y - 30, `装备 ${selectedEquip.nameZh}`, '#00FF00')
                );
                this.updateUI();
            }
        }
    }
}
