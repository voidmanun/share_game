const fs = require('fs');
let gameTs = fs.readFileSync('src/Game.ts', 'utf8');

// 1. Add imports
gameTs = gameTs.replace(
  "import { Enemy } from './entities/Enemy';",
  "import { Enemy } from './entities/Enemy';\nimport { Necromancer } from './entities/Necromancer';\nimport { Spirit } from './entities/Spirit';"
);

// 2. Add to enemyData
gameTs = gameTs.replace(
  '{ name: "Titan", hp: 500, dmg: 5 }',
  '{ name: "Titan", hp: 500, dmg: 5 },\n            { name: "Necromancer", hp: 1500, dmg: 5 },\n            { name: "Spirit", hp: 10, dmg: 1 }'
);

// 3. Add to spawn pool
// Find the block for `if (this.gameTime > 60)`
const spawnBlock = `
        if (this.gameTime > 60) {
            // 60s+: Tank(10%), Charger(10%), Teleporter(10%), Splitter(10%), Swarm(15%), Scout(10%), Slime(10%), Star(10%), Basic(15%)
            if (rand < 0.10) {
                newEnemy = new TankEnemy(x, y, this.player);
            } else if (rand < 0.20) {
                newEnemy = new Charger(x, y, this.player, this);
            } else if (rand < 0.30) {
                newEnemy = new Teleporter(x, y, this.player, this);
            } else if (rand < 0.40) {
                newEnemy = new Splitter(x, y, this.player);
            } else if (rand < 0.50) {
                newEnemy = new SlimeEnemy(x, y, this.player, this, 0);
            } else if (rand < 0.60) {
                newEnemy = new SwarmEnemy(x, y, this.player, this);
            } else if (rand < 0.70) {
                newEnemy = new Scout(x, y, this.player);
            } else if (rand < 0.80) {
                newEnemy = new StarEnemy(x, y, this.player);
            } else if (rand < 0.85) {
                newEnemy = new HealerEnemy(x, y, this.player, this);
            } else if (rand < 0.90) {
                newEnemy = new Necromancer(x, y, this.player, this);
            } else {
                newEnemy = new Enemy(x, y, this.player);
            }
`;

gameTs = gameTs.replace(/        if \(this\.gameTime > 60\) \{[\s\S]*?\} else if \(this\.gameTime > 30\)/, spawnBlock.trim() + ' else if (this.gameTime > 30)');

fs.writeFileSync('src/Game.ts', gameTs);

let i18nTs = fs.readFileSync('src/i18n.ts', 'utf8');
i18nTs = i18nTs.replace(
  "enemyTitan: 'Titan',",
  "enemyTitan: 'Titan',\n    enemyNecromancer: 'Necromancer',\n    enemySpirit: 'Spirit',"
);
i18nTs = i18nTs.replace(
  "enemyTitan: '泰坦',",
  "enemyTitan: '泰坦',\n    enemyNecromancer: '死灵法师',\n    enemySpirit: '死灵',"
);
fs.writeFileSync('src/i18n.ts', i18nTs);
console.log('Patched');
