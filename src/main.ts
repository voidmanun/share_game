import './style.css'
import { Game } from './Game'
import { getLanguage, setLanguage, t } from './i18n'

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game('game-canvas');

  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar');
  const startBtn = document.getElementById('start-btn');
  const muteBtn = document.getElementById('mute-btn');
  const langBtn = document.getElementById('lang-btn');
  const loadingText = loadingScreen?.querySelector('h1');

  muteBtn?.addEventListener('click', () => {
    game.soundManager.toggleMute();
    if (muteBtn) {
      const soundOnText = getLanguage() === 'zh' ? '🔊 声音: 开' : '🔊 Sound: ON';
      const soundOffText = getLanguage() === 'zh' ? '🔇 声音: 关' : '🔇 Sound: OFF';
      muteBtn.textContent = game.soundManager.isMuted ? soundOffText : soundOnText;
    }
  });

  const handleLangToggle = (e?: Event) => {
    if (e) e.preventDefault();
    const newLang = getLanguage() === 'en' ? 'zh' : 'en';
    setLanguage(newLang);

    // Update mute button text based on new language
    if (muteBtn) {
      const soundOnText = newLang === 'zh' ? '🔊 声音: 开' : '🔊 Sound: ON';
      const soundOffText = newLang === 'zh' ? '🔇 声音: 关' : '🔇 Sound: OFF';
      muteBtn.textContent = game.soundManager.isMuted ? soundOffText : soundOnText;
    }
  };

  langBtn?.addEventListener('click', handleLangToggle);

  // Simulate asset loading
  let progress = 0;
  // Speed up loading: from 100ms interval to 30ms interval
  const loadInterval = setInterval(() => {
    progress += Math.random() * 25 + 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      if (loadingBar) loadingBar.style.width = '100%';
      if (loadingText) loadingText.textContent = t('ready');

      setTimeout(() => {
        if (loadingBar?.parentElement) {
          loadingBar.parentElement.style.display = 'none';
        }
        if (startBtn) {
          startBtn.classList.remove('hidden');
          startBtn.style.pointerEvents = 'auto';
        }
      }, 100);
    } else {
      if (loadingBar) loadingBar.style.width = `${progress}%`;
    }
  }, 30);

  startBtn?.addEventListener('click', () => {
    if (loadingScreen) loadingScreen.style.display = 'none';
    document.getElementById('game-canvas')?.classList.remove('hidden');
    document.getElementById('ui-layer')?.classList.remove('hidden');
    game.soundManager.playStartSound(); // Play game start sound
    game.start();
  });
});
