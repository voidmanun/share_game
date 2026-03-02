const fs = require('fs');

// Fix Game.ts
let gameCode = fs.readFileSync('src/Game.ts', 'utf8');
gameCode = gameCode.replace(/enemy\.update\(deltaTime, this\);/g, 'enemy.update(deltaTime);');
gameCode = gameCode.replace(/if \(enemy instanceof FusionBoss\)/g, 'if (enemy.name === "FusionBoss")');
fs.writeFileSync('src/Game.ts', gameCode);

// Fix FusionBoss.ts
let fbCode = fs.readFileSync('src/entities/FusionBoss.ts', 'utf8');
fbCode = fbCode.replace(/public update\(deltaTime: number, game: any\): void \{/, 'public update(deltaTime: number): void {');
fbCode = fbCode.replace(/if \(game && game\.getEnemies\) \{/, 'if ((window as any).game && (window as any).game.getEnemies) {');
fbCode = fbCode.replace(/const enemies = game\.getEnemies\(\);/, 'const enemies = (window as any).game.getEnemies();');
fs.writeFileSync('src/entities/FusionBoss.ts', fbCode);

// Expose game to window in main.ts
let mainCode = fs.readFileSync('src/main.ts', 'utf8');
if (!mainCode.includes('(window as any).game = game;')) {
    mainCode = mainCode.replace('const game = new Game();', 'const game = new Game();\n(window as any).game = game;');
}
fs.writeFileSync('src/main.ts', mainCode);

