const fs = require('fs');
let file = 'src/i18n.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/Boss: 'ボス',/g, "Boss: 'ボス',\n        FusionBoss: '融合ボス',");
fs.writeFileSync(file, code);
