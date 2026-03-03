const fs = require('fs');
const content = fs.readFileSync('vite.config.ts', 'utf-8');

const newContent = content.replace(
  "import sqlite3 from 'sqlite3'",
  "import sqlite3 from 'sqlite3'\nimport { exec } from 'child_process'"
).replace(
  "        } else if (req.url === '/api/leaderboard' && req.method === 'POST') {",
  `        } else if (req.url === '/api/changelog' && req.method === 'GET') {
          exec('git log --format="%cI|%s"', (error, stdout, stderr) => {
            if (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message }));
              return;
            }
            const logs = stdout.split('\\n')
              .filter(line => line.trim() !== '')
              .map(line => {
                const sepIndex = line.indexOf('|');
                if (sepIndex === -1) return null;
                const time = line.substring(0, sepIndex);
                const msg = line.substring(sepIndex + 1);
                return { time, msg };
              })
              .filter(item => item && /[\\u4e00-\\u9fa5]/.test(item.msg));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(logs));
          });
        } else if (req.url === '/api/leaderboard' && req.method === 'POST') {`
);

fs.writeFileSync('vite.config.ts', newContent);
console.log('vite.config.ts updated');
