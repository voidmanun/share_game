const fs = require('fs');

let mainTs = fs.readFileSync('src/main.ts', 'utf8');
mainTs = mainTs.replace(
  "const installText = document.getElementById('install-text');\n    if (installText) {\n      installText.textContent = newLang === 'zh' ? '保存到桌面' : 'Save to Desktop';\n    }",
  ""
);
mainTs = mainTs.replace(
  "const settingsText = document.getElementById('settings-text');\n    if (settingsText) {\n      settingsText.textContent = newLang === 'zh' ? '设置' : 'Settings';\n    }",
  ""
);
fs.writeFileSync('src/main.ts', mainTs);

let i18nTs = fs.readFileSync('src/i18n.ts', 'utf8');
i18nTs = i18nTs.replace(
  "installText: document.getElementById('install-text'),",
  ""
);
i18nTs = i18nTs.replace(
  "settingsText: document.getElementById('settings-text'),",
  ""
);
i18nTs = i18nTs.replace(
  "if (elements.installText) elements.installText.textContent = t('saveDesktop');",
  ""
);
i18nTs = i18nTs.replace(
  "if (elements.settingsText) elements.settingsText.textContent = t('settings');",
  ""
);

fs.writeFileSync('src/i18n.ts', i18nTs);
console.log('patched ts files to remove text bindings');
