const fs = require('fs');
const path = require('path');

const gamePath = path.join(__dirname, 'src', 'Game.ts');
let code = fs.readFileSync(gamePath, 'utf8');

// Add import
const importKnight = `import { KnightPet } from './entities/KnightPet';\n`;
if (!code.includes('KnightPet')) {
    code = code.replace(`import { LuckyCat } from './entities/LuckyCat';`, `import { LuckyCat } from './entities/LuckyCat';\n${importKnight}`);
}

// Ensure the knight is added on initialize
code = code.replace(
    /this\.player\.addWeapon\(new MagicWand\(this, this\.player\)\);/,
    `this.player.addWeapon(new MagicWand(this, this.player));\n        this.pets.push(new KnightPet(this.player, this));`
);

fs.writeFileSync(gamePath, code);
