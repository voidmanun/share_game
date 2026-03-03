const fs = require('fs');

let i18n = fs.readFileSync('src/i18n.ts', 'utf8');

if (!i18n.includes("saveDesktop: 'Save to Desktop',")) {
    i18n = i18n.replace(
        "gameOver: 'Game Over',",
        "saveDesktop: 'Save to Desktop',\n    gameOver: 'Game Over',"
    );
    i18n = i18n.replace(
        "gameOver: '游戏结束',",
        "saveDesktop: '保存到桌面',\n    gameOver: '游戏结束',"
    );
}

fs.writeFileSync('src/i18n.ts', i18n);

let mainTs = fs.readFileSync('src/main.ts', 'utf8');

if (!mainTs.includes("installText.textContent = t('saveDesktop');")) {
    const updateUiTextBlock = "  function updateUIText() {";
    if (mainTs.includes(updateUiTextBlock)) {
        mainTs = mainTs.replace(
            updateUiTextBlock,
            updateUiTextBlock + "\n    const installText = document.getElementById('install-text');\n    if (installText) installText.textContent = t('saveDesktop');"
        );
    }
}

fs.writeFileSync('src/main.ts', mainTs);
console.log('patched i18n');
