const fs = require('fs');

let knightTs = fs.readFileSync('src/entities/KnightPet.ts', 'utf8');
// Fix attack rate to attack instantly on act if needed or faster
knightTs = knightTs.replace('this.attackTimer = 10;', 'this.attackTimer = 1;');
knightTs = knightTs.replace('this.skillTimer = 15;', 'this.skillTimer = 5;');
knightTs = knightTs.replace('this.attackTimer = 10;', 'this.attackTimer = 1;');
knightTs = knightTs.replace('this.skillTimer = 15;', 'this.skillTimer = 5;');
fs.writeFileSync('src/entities/KnightPet.ts', knightTs);
console.log("KnightPet updated.");
