const fs = require('fs');
const path = require('path');

const dir = 'src/entities';
const enemyFiles = [
    'Enemy.ts',
    'Boss.ts',
    'Charger.ts',
    'Scout.ts',
    'Splitter.ts',
    'StarEnemy.ts',
    'TankEnemy.ts',
    'Teleporter.ts',
    'TitanEnemy.ts',
    'SwarmEnemy.ts'
];

enemyFiles.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (file === 'Enemy.ts') {
        content = content.replace(/protected speed: number = (\d+);/, (match, p1) => {
            return `protected speed: number = ${parseInt(p1) / 2};`;
        });
        content = content.replace(/public hp: number = (\d+);/, (match, p1) => {
            return `public hp: number = ${parseInt(p1) * 2};`;
        });
    } else if (file === 'TitanEnemy.ts') {
        content = content.replace(/this\.speed\s*=\s*(\d+);/, (match, p1) => {
            return `this.speed = ${parseInt(p1) / 2};`;
        });
        content = content.replace(/this\.hp\s*=\s*(\d+);/, (match, p1) => {
            return `this.hp = 500;`; // biggest boss
        });
    } else {
        content = content.replace(/this\.speed\s*=\s*(\d+);/g, (match, p1) => {
            return `this.speed = ${parseInt(p1) / 2};`;
        });
        content = content.replace(/this\.hp\s*=\s*(\d+);/g, (match, p1) => {
            return `this.hp = ${parseInt(p1) * 2};`;
        });
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Modified ${file}`);
});
