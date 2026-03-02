const fs = require('fs');
let gameTs = fs.readFileSync('src/Game.ts', 'utf8');

gameTs = gameTs.replace("import { Spirit } from './entities/Spirit';\n", "");

fs.writeFileSync('src/Game.ts', gameTs);
