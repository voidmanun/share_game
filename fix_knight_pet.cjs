const fs = require('fs');
let gameTs = fs.readFileSync('src/Game.ts', 'utf8');

if (!gameTs.includes("import { KnightPet } from './entities/KnightPet';")) {
    gameTs = "import { KnightPet } from './entities/KnightPet';\n" + gameTs;
}

if (!gameTs.includes("private knightSpawnTimer: number = 0;")) {
    gameTs = gameTs.replace(
        "private spawnTimer: number = 0;",
        "private knightSpawnTimer: number = 0;\n    private spawnTimer: number = 0;"
    );
}

if (!gameTs.includes("this.knightSpawnTimer += deltaTime;")) {
    gameTs = gameTs.replace(
        "this.player.update(deltaTime);",
        `this.player.update(deltaTime);

        // Auto spawn Knight Pet every 10 seconds
        this.knightSpawnTimer += deltaTime;
        if (this.knightSpawnTimer >= 10) {
            this.knightSpawnTimer = 0;
            const knight = new KnightPet(this.player, this);
            this.pets.push(knight);
            // Limit knights if needed, or let them stack
        }`
    );
}

fs.writeFileSync('src/Game.ts', gameTs);
console.log("Game.ts updated with KnightPet auto-spawn.");
