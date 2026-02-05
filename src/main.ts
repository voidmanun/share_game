import './style.css'
import { Game } from './Game'

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game('game-canvas');
  game.start();
});
