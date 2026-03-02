const fs = require('fs');
let file = 'src/i18n.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/return translations\[currentLanguage\]\[key\] \|\| key;/g, "return (translations[currentLanguage] as any)[key] || key;");
code = code.replace(/return translations\[currentLanguage\]\[key\] \|\| name;/g, "return (translations[currentLanguage] as any)[key] || name;");

fs.writeFileSync(file, code);
