const fs = require('fs');
let mainTs = fs.readFileSync('src/main.ts', 'utf8');

const targetStr = "if (closeEncyclopediaBtn) {\n      closeEncyclopediaBtn.innerHTML = newLang === 'zh' ? '关闭' : 'Close';\n    }";
const insertion = "\n    const installText = document.getElementById('install-text');\n    if (installText) {\n      installText.textContent = newLang === 'zh' ? '保存到桌面' : 'Save to Desktop';\n    }";

if (mainTs.includes(targetStr) && !mainTs.includes("installText.textContent")) {
    mainTs = mainTs.replace(targetStr, targetStr + insertion);
    fs.writeFileSync('src/main.ts', mainTs);
    console.log('patched handleLangToggle');
} else {
    console.log('could not find target string or already patched');
}
