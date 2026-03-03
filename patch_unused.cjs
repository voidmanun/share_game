const fs = require('fs');
let code = fs.readFileSync('src/main.ts', 'utf8');

code = code.replace("const changelogTitle = document.getElementById('changelog-title') as HTMLElement;\n", "");
code = code.replace("const changelogTitle = document.getElementById('changelog-title') as HTMLElement;", "");

fs.writeFileSync('src/main.ts', code);
console.log('src/main.ts unused vars removed');
