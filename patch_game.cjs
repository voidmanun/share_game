const fs = require('fs');
const file = 'src/Game.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { FusionBoss }')) {
    code = code.replace("import { Boss } from './entities/Boss';", "import { Boss } from './entities/Boss';\nimport { FusionBoss } from './entities/FusionBoss';");
}

if (!code.includes('spawnFusionBoss')) {
    const spawnTwinEliteStr = "private spawnTwinElite(): void {";
    const spawnFusionBossCode = `
    private spawnFusionBoss(): void {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        const x = this.player.x + Math.cos(angle) * radius;
        const y = this.player.y + Math.sin(angle) * radius;

        const hpMultiplier = 1 + (Math.floor(this.gameTime / 30) * 0.5);
        console.log(\`Spawning Fusion Boss with HP Multiplier: \${hpMultiplier}\`);
        const boss = new FusionBoss(x, y, this.player);
        boss.hp *= hpMultiplier;
        boss.maxHp = boss.hp;
        this.enemies.push(boss);
    }
    `;
    code = code.replace(spawnTwinEliteStr, spawnFusionBossCode + "\n    " + spawnTwinEliteStr);
}

// Update game loop
if (!code.includes('this.fusionBossSpawnTimer')) {
    code = code.replace('private bossSpawnTimer: number = 0;', 'private bossSpawnTimer: number = 0;\n    private fusionBossSpawnTimer: number = 0;');
    
    const spawnTwinEliteTimer = `        // Spawn twin elite
        this.twinEliteSpawnTimer += deltaTime;
        if (this.twinEliteSpawnTimer >= 30 && this.gameTime > 40) {
            this.twinEliteSpawnTimer = 0;
            this.spawnTwinElite();
        }`;
    
    const fusionBossTimer = `        // Spawn fusion boss
        this.fusionBossSpawnTimer += deltaTime;
        if (this.fusionBossSpawnTimer >= 50 && this.gameTime > 80) {
            this.fusionBossSpawnTimer = 0;
            this.spawnFusionBoss();
        }

` + spawnTwinEliteTimer;

    code = code.replace(spawnTwinEliteTimer, fusionBossTimer);
}

// Update loop for FusionBoss
if (!code.includes('enemy.update(deltaTime, this);')) {
    code = code.replace(/enemy\.update\(deltaTime\);/g, 'enemy.update(deltaTime, this);');
}

// Fix FusionBoss instanceof Boss
if (!code.includes('|| enemy instanceof FusionBoss')) {
    code = code.replace(/if \(enemy instanceof Boss \|\| enemy instanceof TitanEnemy\)/g, 'if (enemy instanceof Boss || enemy instanceof TitanEnemy || enemy instanceof FusionBoss)');
}
if (!code.includes('!(enemy instanceof FusionBoss)')) {
    code = code.replace(/!\(enemy instanceof Boss\)/g, '!(enemy instanceof Boss) && !(enemy instanceof FusionBoss)');
}

fs.writeFileSync(file, code);
