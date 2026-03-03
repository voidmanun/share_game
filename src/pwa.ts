import { getLanguage } from './i18n';

export function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('SW registered: ', registration);
      }).catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }

  let deferredPrompt: any;
  const installBtn = document.getElementById('install-btn');

  // Check if app is already running as PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
  if (isStandalone && installBtn) {
    installBtn.style.display = 'none';
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    if (installBtn && !isStandalone) {
      if (installBtn && !isStandalone) installBtn.style.display = 'inline-flex';
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      // Show the install prompt
      if (deferredPrompt) {
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
        if (outcome === 'accepted') {
          installBtn.style.display = 'none';
        }
      } else {
        const lang = getLanguage();
        const msg = lang === 'zh' 
          ? '您的浏览器环境当前无法触发一键安装（可能由于不在HTTPS/localhost下，或iOS Safari限制，或者您已经安装过）。\n\n请使用浏览器的“添加到主屏幕”或“安装应用”功能手动保存到桌面。'
          : 'Your browser environment cannot trigger 1-click install right now (might not be HTTPS/localhost, iOS Safari limitation, or already installed).\n\nPlease use your browser menu "Add to Home Screen" or "Install App" manually.';
        alert(msg);
      }
    });
  }

  window.addEventListener('appinstalled', () => {
    // Hide the app-provided install promotion
    if (installBtn) {
      installBtn.style.display = 'none';
    }
    // Clear the deferredPrompt so it can be garbage collected
    deferredPrompt = null;
    console.log('PWA was installed');
  });
}
