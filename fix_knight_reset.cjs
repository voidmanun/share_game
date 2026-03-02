const fs = require('fs');
let code = fs.readFileSync('src/Game.ts', 'utf8');

if (!code.includes("this.knightSpawnTimer = 0;") && code.includes("this.spawnTimer = 0;")) {
    code = code.replace(/this\.spawnTimer = 0;/g, "this.knightSpawnTimer = 0;\n        this.spawnTimer = 0;");
}

fs.writeFileSync('src/Game.ts', code);
