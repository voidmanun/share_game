const fs = require('fs');
let file = 'src/i18n.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace the return statements with any type assertions
code = code.replace(/return translations\[currentLanguage\]\[key\];/g, 'return (translations[currentLanguage] as any)[key] || key;');

fs.writeFileSync(file, code);
