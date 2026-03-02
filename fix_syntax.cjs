const fs = require('fs');
let gameTs = fs.readFileSync('src/Game.ts', 'utf8');

gameTs = gameTs.replace(
  "} else if (this.gameTime > 30) {",
  "}\n        } else if (this.gameTime > 30) {"
);

fs.writeFileSync('src/Game.ts', gameTs);
