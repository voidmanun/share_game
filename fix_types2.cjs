const fs = require('fs');

let entityFile = 'src/entities/Entity.ts';
let entityCode = fs.readFileSync(entityFile, 'utf8');
entityCode = entityCode.replace('public update(deltaTime: number, game?: any): void', 'public update(deltaTime: number, _game?: any): void');
fs.writeFileSync(entityFile, entityCode);

let enemyFile = 'src/entities/Enemy.ts';
let enemyCode = fs.readFileSync(enemyFile, 'utf8');
enemyCode = enemyCode.replace('public update(deltaTime: number, game?: any): void', 'public update(deltaTime: number, _game?: any): void');
fs.writeFileSync(enemyFile, enemyCode);

let bossFile = 'src/entities/FusionBoss.ts';
let bossCode = fs.readFileSync(bossFile, 'utf8');
bossCode = bossCode.replace('public update(deltaTime: number, game?: any): void', 'public update(deltaTime: number, _game?: any): void');
fs.writeFileSync(bossFile, bossCode);

