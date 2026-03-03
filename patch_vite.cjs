const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');
code = code.replace(
  "import path from 'path'",
  "import path from 'path'\nimport { exec } from 'child_process'"
);

const apiCode = `
        } else if (req.url === '/api/changelog' && req.method === 'GET') {
          exec('git log --format="%cI|%s"', (err, stdout) => {
            if (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
              return
            }
            const lines = stdout.trim().split('\\n')
            const logs = lines
              .filter(line => /[\\u4e00-\\u9fa5]/.test(line))
              .map(line => {
                const parts = line.split('|')
                return { date: parts[0], message: parts.slice(1).join('|') }
              })
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(logs))
          })
`;

code = code.replace("        } else {", apiCode + "        } else {");
fs.writeFileSync('vite.config.ts', code);
