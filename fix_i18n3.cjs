const fs = require('fs');
let file = 'src/i18n.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/export function tEnemy\(key: any\): string \{/, `export function tEnemy(key: any): string {
    if (key === 'FusionBoss') {
        if (currentLanguage === 'zh') return '融合头目';
        if (currentLanguage === 'ja') return '融合ボス';
        return 'Fusion Boss';
    }
`);
fs.writeFileSync(file, code);
