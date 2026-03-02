const fs = require('fs');

// Fix Entity.ts update signature
let entityFile = 'src/entities/Entity.ts';
let entityCode = fs.readFileSync(entityFile, 'utf8');
if (!entityCode.includes('update(deltaTime: number, game?: any): void')) {
    entityCode = entityCode.replace('public update(deltaTime: number): void', 'public update(deltaTime: number, game?: any): void');
    fs.writeFileSync(entityFile, entityCode);
}

// Fix Enemy.ts update signature
let enemyFile = 'src/entities/Enemy.ts';
let enemyCode = fs.readFileSync(enemyFile, 'utf8');
if (!enemyCode.includes('update(deltaTime: number, game?: any): void')) {
    enemyCode = enemyCode.replace('public update(deltaTime: number): void', 'public update(deltaTime: number, game?: any): void');
    fs.writeFileSync(enemyFile, enemyCode);
}

// Fix FusionBoss.ts update signature and unused vars
let bossFile = 'src/entities/FusionBoss.ts';
let bossCode = fs.readFileSync(bossFile, 'utf8');
if (bossCode.includes('shootTimer')) {
    bossCode = bossCode.replace('private shootTimer: number = 0;\n    private minionTimer: number = 0;\n', '');
    bossCode = bossCode.replace('public update(deltaTime: number, game: any): void', 'public update(deltaTime: number, game?: any): void');
    fs.writeFileSync(bossFile, bossCode);
}
