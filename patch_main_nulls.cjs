const fs = require('fs');
let code = fs.readFileSync('src/main.ts', 'utf8');

code = code.replace("settingsModal.classList.add('hidden');\n      changelogModal.classList.remove('hidden');", "if (settingsModal) settingsModal.classList.add('hidden');\n      changelogModal.classList.remove('hidden');");
code = code.replace("changelogModal.classList.add('hidden');\n    settingsModal.classList.remove('hidden');", "changelogModal.classList.add('hidden');\n    if (settingsModal) settingsModal.classList.remove('hidden');");

fs.writeFileSync('src/main.ts', code);
console.log('src/main.ts nulls patched');
