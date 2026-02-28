import { Game } from '../Game';

export class Shop {
    private game: Game;
    private element: HTMLElement;
    private isVisible: boolean = false;

    private costDamage: number = 20;
    private costSpeed: number = 15;
    private costHp: number = 15;

    private btnDamage: HTMLButtonElement;
    private btnSpeed: HTMLButtonElement;
    private btnHp: HTMLButtonElement;

    private spanDamage: HTMLElement;
    private spanSpeed: HTMLElement;
    private spanHp: HTMLElement;

    constructor(game: Game) {
        this.game = game;
        this.element = document.getElementById('shop')!;

        this.btnDamage = document.getElementById('buy-damage') as HTMLButtonElement;
        this.btnSpeed = document.getElementById('buy-speed') as HTMLButtonElement;
        this.btnHp = document.getElementById('buy-hp') as HTMLButtonElement;

        this.spanDamage = document.getElementById('cost-damage')!;
        this.spanSpeed = document.getElementById('cost-speed')!;
        this.spanHp = document.getElementById('cost-hp')!;

        this.btnDamage?.addEventListener('click', () => this.buyDamage());
        this.btnSpeed?.addEventListener('click', () => this.buySpeed());
        this.btnHp?.addEventListener('click', () => this.buyHp());
        document.getElementById('close-shop')?.addEventListener('click', () => this.toggle());

        // Toggle on 'P'
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyP') {
                this.toggle();
            }
        });

        // Mobile shop button
        document.getElementById('mobile-shop-btn')?.addEventListener('click', () => {
            this.toggle();
        });
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
        this.spanDamage.textContent = this.costDamage.toString();
        this.spanSpeed.textContent = this.costSpeed.toString();
        this.spanHp.textContent = this.costHp.toString();

        this.btnDamage.disabled = this.game.gold < this.costDamage;
        this.btnSpeed.disabled = this.game.gold < this.costSpeed;
        this.btnHp.disabled = this.game.gold < this.costHp;
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
}
