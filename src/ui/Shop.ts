import { Game } from '../Game';

export class Shop {
    private game: Game;
    private element: HTMLElement;
    private isVisible: boolean = false;

    private costDamage: number = 20;
    private costSpeed: number = 15;
    private costHp: number = 15;
    private costPet: number = 50;

    private btnDamage: HTMLButtonElement;
    private btnSpeed: HTMLButtonElement;
    private btnHp: HTMLButtonElement;
    private btnPet: HTMLButtonElement;

    public updatePlayerRef(): void {
        this.costDamage = 20;
        this.costSpeed = 15;
        this.costHp = 15;
        this.costPet = 50;
        this.updateUI();
    }

    constructor(game: Game) {
        this.game = game;
        this.element = document.getElementById('shop')!;

        this.btnDamage = document.getElementById('buy-damage') as HTMLButtonElement;
        this.btnSpeed = document.getElementById('buy-speed') as HTMLButtonElement;
        this.btnHp = document.getElementById('buy-hp') as HTMLButtonElement;
        this.btnPet = document.getElementById('buy-pet') as HTMLButtonElement;

        this.btnDamage?.addEventListener('click', () => this.buyDamage());
        this.btnSpeed?.addEventListener('click', () => this.buySpeed());
        this.btnHp?.addEventListener('click', () => this.buyHp());
        this.btnPet?.addEventListener('click', () => this.buyPet());
        document.getElementById('close-shop')?.addEventListener('click', () => this.toggle());

        // Toggle on 'P'
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyP') {
                this.toggle();
            }
        });

        // Mobile shop button
        const mobileShopBtn = document.getElementById('mobile-shop-btn');
        mobileShopBtn?.addEventListener('click', () => {
            this.toggle();
        });
        mobileShopBtn?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggle();
        }, { passive: false });
    }

    public toggle(): void {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.updateUI();
            this.element.classList.remove('hidden');
            this.game.pause();
        } else {
            this.element.classList.add('hidden');
            this.game.resume();
        }
    }

    private updateUI(): void {
        const spanDamage = document.getElementById('cost-damage');
        const spanSpeed = document.getElementById('cost-speed');
        const spanHp = document.getElementById('cost-hp');
        const spanPet = document.getElementById('cost-pet');

        if (spanDamage) spanDamage.textContent = this.costDamage.toString();
        if (spanSpeed) spanSpeed.textContent = this.costSpeed.toString();
        if (spanHp) spanHp.textContent = this.costHp.toString();
        if (spanPet) spanPet.textContent = this.costPet.toString();

        this.btnDamage.disabled = this.game.gold < this.costDamage;
        this.btnSpeed.disabled = this.game.gold < this.costSpeed;
        this.btnHp.disabled = this.game.gold < this.costHp;
        this.btnPet.disabled = this.game.gold < this.costPet;
    }

    private buyDamage(): void {
        if (this.game.gold >= this.costDamage) {
            this.game.gold -= this.costDamage;
            this.game.player.upgradeDamage();
            this.costDamage = this.costDamage * 2;
            this.game.soundManager.playPickupSound(); // Success sound
            this.updateUI();
        }
    }

    private buySpeed(): void {
        if (this.game.gold >= this.costSpeed) {
            this.game.gold -= this.costSpeed;
            this.game.player.upgradeSpeed();
            this.costSpeed = this.costSpeed * 2;
            this.game.soundManager.playPickupSound(); // Success sound
            this.updateUI();
        }
    }

    private buyHp(): void {
        if (this.game.gold >= this.costHp) {
            this.game.gold -= this.costHp;
            this.game.player.upgradeMaxHp();
            this.costHp = this.costHp * 2;
            this.game.soundManager.playPickupSound(); // Success sound
            this.updateUI();
        }
    }
    private buyPet(): void {
        if (this.game.gold >= this.costPet) {
            this.game.gold -= this.costPet;
            this.game.hatchRandomPet();
            this.costPet = Math.floor(this.costPet * 1.5); // Increase cost for next pet
            this.game.soundManager.playPickupSound(); // Success sound
            this.updateUI();
        }
    }
}
