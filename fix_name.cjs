const fs = require('fs');
let file = 'src/entities/FusionBoss.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/public maxHp: number;/, 'public maxHp: number;\n    public name: string = "FusionBoss";');
fs.writeFileSync(file, code);
