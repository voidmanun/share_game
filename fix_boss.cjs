const fs = require('fs');
let file = 'src/entities/FusionBoss.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/public update\(deltaTime: number\): void \{/g, 'public update(deltaTime: number, game?: any): void {');
fs.writeFileSync(file, code);
