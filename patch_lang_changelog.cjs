const fs = require('fs');
let code = fs.readFileSync('src/main.ts', 'utf8');

const target = "    if (langBtn) {";
const insert = `
    const changelogBtnElem = document.getElementById('changelog-btn');
    if (changelogBtnElem) {
      changelogBtnElem.innerHTML = newLang === 'zh' ? '📜 版本列表' : '📜 Changelog';
    }
    const changelogTitleElem = document.getElementById('changelog-title');
    if (changelogTitleElem) {
      changelogTitleElem.innerHTML = newLang === 'zh' ? '📜 版本列表' : '📜 Changelog';
    }
    const closeChangelogBtnElem = document.getElementById('close-changelog-btn');
    if (closeChangelogBtnElem) {
      closeChangelogBtnElem.innerHTML = newLang === 'zh' ? '关闭' : 'Close';
    }
`;

code = code.replace(target, insert + target);

fs.writeFileSync('src/main.ts', code);
console.log('src/main.ts lang patched');
