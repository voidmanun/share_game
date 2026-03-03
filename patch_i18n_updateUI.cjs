const fs = require('fs');
let i18nTs = fs.readFileSync('src/i18n.ts', 'utf8');

const targetStr = "closeShop: document.getElementById('close-shop'),";
const insertion = "\n    installText: document.getElementById('install-text'),";

if (i18nTs.includes(targetStr) && !i18nTs.includes("installText:")) {
    i18nTs = i18nTs.replace(targetStr, targetStr + insertion);
}

const updateStr = "if (elements.closeShop) elements.closeShop.textContent = t('closeShop');";
const updateInsertion = "\n  if (elements.installText) elements.installText.textContent = t('saveDesktop');";

if (i18nTs.includes(updateStr) && !i18nTs.includes("elements.installText.textContent")) {
    i18nTs = i18nTs.replace(updateStr, updateStr + updateInsertion);
}

fs.writeFileSync('src/i18n.ts', i18nTs);
console.log('patched i18n updateUI');
