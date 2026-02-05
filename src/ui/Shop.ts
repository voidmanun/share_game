import { Game } from '../Game';

export class Shop {
    private game: Game;
    private element: HTMLElement;
    private isVisible: boolean = false;

    constructor(game: Game) {
        this.game = game;
        this.element = document.getElementById('shop')!;

        document.getElementById('buy-damage')?.addEventListener('click', () => this.buyDamage());
        document.getElementById('buy-speed')?.addEventListener('click', () => this.buySpeed());
        document.getElementById('close-shop')?.addEventListener('click', () => this.toggle());

        // Toggle on 'P'
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyP') {
                this.toggle();
            }
        });
    }

    public toggle(): void {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.element.classList.remove('hidden');
            this.game.pause();
        } else {
            this.element.classList.add('hidden');
            this.game.resume();
        }
    }

    private buyDamage(): void {
        if (this.game.gold >= 10) {
            this.game.gold -= 10;
            // For now, let's just log as we need to implement damage upgrade on Weapon
            console.log('Bought Damage (Not implemented fully on weapons yet)');
        }
    }

    private buySpeed(): void {
        if (this.game.gold >= 10) {
            this.game.gold -= 10;
            this.game.player.upgradeSpeed();
            console.log('Bought Speed');
        }
    }
}
