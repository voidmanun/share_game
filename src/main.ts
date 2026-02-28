import './style.css'
import { Game } from './Game'

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game('game-canvas');

  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar');
  const startBtn = document.getElementById('start-btn');
  const loadingText = loadingScreen?.querySelector('h1');

  // Simulate asset loading
  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      if (loadingBar) loadingBar.style.width = '100%';
      if (loadingText) loadingText.textContent = 'Ready!';
      
      setTimeout(() => {
        if (loadingBar?.parentElement) {
          loadingBar.parentElement.style.display = 'none';
        }
        if (startBtn) {
          startBtn.classList.remove('hidden');
          startBtn.style.pointerEvents = 'auto';
        }
      }, 300);
    } else {
      if (loadingBar) loadingBar.style.width = `${progress}%`;
    }
  }, 100);

  startBtn?.addEventListener('click', () => {
    if (loadingScreen) loadingScreen.style.display = 'none';
    game.soundManager.playStartSound(); // Play game start sound
    game.start();
  });

  startBtn?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (loadingScreen) loadingScreen.style.display = 'none';
    game.soundManager.playStartSound(); // Play game start sound
    game.start();
  }, { passive: false });
});
