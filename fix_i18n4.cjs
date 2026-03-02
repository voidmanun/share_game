const fs = require('fs');
let file = 'src/i18n.ts';
let code = fs.readFileSync(file, 'utf8');

// The error is actually in the generic `t` function probably. Let's see what is on lines 187, 192, 197
console.log(code.split('\n').slice(180, 200).join('\n'));

