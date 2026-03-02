const fs = require('fs');

let file = 'src/i18n.ts';
let code = fs.readFileSync(file, 'utf8');

// The error is because the types of translations objects are implicitly defined and one of them is missing FusionBoss
if (!code.includes("FusionBoss: '融合头目'")) {
    code = code.replace("Boss: '头目',", "Boss: '头目',\n    FusionBoss: '融合头目',");
}
if (!code.includes("FusionBoss: '融合ボス'")) {
    code = code.replace("Boss: 'ボス',", "Boss: 'ボス',\n    FusionBoss: '融合ボス',");
}

// Add the name property to FusionBoss class
let bossFile = 'src/entities/FusionBoss.ts';
let bossCode = fs.readFileSync(bossFile, 'utf8');
if (!bossCode.includes('public name: string')) {
    bossCode = bossCode.replace('public maxHp: number;', 'public maxHp: number;\n    public name: string = "FusionBoss";');
    fs.writeFileSync(bossFile, bossCode);
}

// We need to just tell tEnemy to return the key if it's not found or we can add it properly
let typeStr = `export type TranslationKey = keyof typeof translations.en | 'FusionBoss';`;
if (!code.includes("'FusionBoss'")) {
    code = code.replace('export type TranslationKey = keyof typeof translations.en;', typeStr);
}

code = code.replace('export function tEnemy(key: TranslationKey): string {', 'export function tEnemy(key: any): string {\n    if (key === "FusionBoss") return translations[currentLanguage].FusionBoss || "Fusion Boss";');

fs.writeFileSync(file, code);

