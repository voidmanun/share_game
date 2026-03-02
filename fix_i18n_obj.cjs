const fs = require('fs');
let file = 'src/i18n.ts';
let code = fs.readFileSync(file, 'utf8');

// There are duplicates from my multiple attempts
let enMatch = code.match(/enemyFusionBoss: 'Fusion Boss'/g);
if (enMatch && enMatch.length > 1) {
    code = code.replace(/enemyFusionBoss: 'Fusion Boss',\n/, '');
}

let zhMatch = code.match(/enemyFusionBoss: '融合头目'/g);
if (zhMatch && zhMatch.length > 1) {
    code = code.replace(/enemyFusionBoss: '融合头目',\n/, '');
}

let jaMatch = code.match(/enemyFusionBoss: '融合ボス'/g);
if (jaMatch && jaMatch.length > 1) {
    code = code.replace(/enemyFusionBoss: '融合ボス',\n/, '');
}

fs.writeFileSync(file, code);
