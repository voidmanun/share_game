const fs = require('fs');

let gamePath = 'src/Game.ts';
let gameContent = fs.readFileSync(gamePath, 'utf8');

gameContent = gameContent.replace(/\{ name: "Basic", hp: 3, dmg: 1 \}/, '{ name: "Basic", hp: 6, dmg: 1 }');
gameContent = gameContent.replace(/\{ name: "Scout", hp: 2, dmg: 1 \}/, '{ name: "Scout", hp: 4, dmg: 1 }');
gameContent = gameContent.replace(/\{ name: "Swarm", hp: 1, dmg: 1 \}/, '{ name: "Swarm", hp: 2, dmg: 1 }');
gameContent = gameContent.replace(/\{ name: "Tank", hp: 15, dmg: 2 \}/, '{ name: "Tank", hp: 30, dmg: 2 }');
gameContent = gameContent.replace(/\{ name: "Splitter", hp: 4, dmg: 1 \}/, '{ name: "Splitter", hp: 8, dmg: 1 }');
gameContent = gameContent.replace(/\{ name: "Charger", hp: 5, dmg: 2 \}/, '{ name: "Charger", hp: 10, dmg: 2 }');
gameContent = gameContent.replace(/\{ name: "Teleporter", hp: 2, dmg: 1 \}/, '{ name: "Teleporter", hp: 4, dmg: 1 }');
gameContent = gameContent.replace(/\{ name: "Star", hp: 2, dmg: 1 \}/, '{ name: "Star", hp: 4, dmg: 1 }');
gameContent = gameContent.replace(/\{ name: "Boss", hp: 10, dmg: 3 \}/, '{ name: "Boss", hp: 20, dmg: 3 }');
gameContent = gameContent.replace(/\{ name: "Titan", hp: 100, dmg: 5 \}/, '{ name: "Titan", hp: 500, dmg: 5 }');

fs.writeFileSync(gamePath, gameContent, 'utf8');
console.log('Game.ts updated');
