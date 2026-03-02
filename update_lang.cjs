const fs = require('fs');
let code = fs.readFileSync('src/main.ts', 'utf8');

const additionalTranslations = `
    // Update settings buttons
    if (settingsBtn) {
      const settingsTextSpan = document.getElementById('settings-text');
      if (settingsTextSpan) {
        settingsTextSpan.textContent = newLang === 'zh' ? '设置' : 'Settings';
      }
    }
    const settingsTitle = document.getElementById('settings-title');
    if (settingsTitle) {
      settingsTitle.innerHTML = newLang === 'zh' ? '⚙️ 设置' : '⚙️ Settings';
    }
    if (closeSettingsBtn) {
      closeSettingsBtn.textContent = newLang === 'zh' ? '关闭' : 'Close';
    }
    if (mobileShopBtn) {
      mobileShopBtn.textContent = newLang === 'zh' ? '🛒 商店' : '🛒 Shop';
    }
    if (langBtn) {
      langBtn.innerHTML = newLang === 'zh' ? '🌐 中文' : '🌐 English';
    }
    const desktopHint = document.getElementById('desktop-hint');
    if (desktopHint) {
      desktopHint.textContent = newLang === 'zh' ? 'WASD 移动 | P 打开商店' : 'WASD to Move | P to Shop';
    }
`;

code = code.replace("if (closeEncyclopediaBtn) {", additionalTranslations + "    if (closeEncyclopediaBtn) {");

fs.writeFileSync('src/main.ts', code);
console.log('Updated handleLangToggle');
