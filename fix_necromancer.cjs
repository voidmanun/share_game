const fs = require('fs');
let gameTs = fs.readFileSync('src/Game.ts', 'utf8');

// Fix spawnEnemy hp multiplier
gameTs = gameTs.replace(
  'newEnemy.hp *= hpMultiplier;',
  'newEnemy.hp *= hpMultiplier;\n        if ((newEnemy as any).maxHp !== undefined) {\n            (newEnemy as any).maxHp = newEnemy.hp;\n        }'
);

fs.writeFileSync('src/Game.ts', gameTs);

let necromancerTs = fs.readFileSync('src/entities/Necromancer.ts', 'utf8');

// Add hpMultiplier logic for spirits
necromancerTs = necromancerTs.replace(
  'this.game.getEnemies().push(spirit);',
  'const hpMultiplier = 1 + (Math.floor(this.game.gameTime / 30) * 0.5);\n            spirit.hp *= hpMultiplier;\n            spirit.maxHp = spirit.hp;\n            this.game.getEnemies().push(spirit);'
);

fs.writeFileSync('src/entities/Necromancer.ts', necromancerTs);
