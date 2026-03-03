const fs = require('fs');
let code = fs.readFileSync('src/main.ts', 'utf8');

code = code.replace(
  "changelogList.innerHTML = '<div style=\\\"text-align: center; color: #ccc;\\\">暂无中文版本记录</div>';",
  "changelogList.innerHTML = \\\`<div style=\\\"text-align: center; color: #ccc;\\\">\\\${getLanguage() === 'zh' ? '暂无中文版本记录' : 'No Chinese version history found'}</div>\\\`;"
);

fs.writeFileSync('src/main.ts', code);
