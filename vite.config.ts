import { defineConfig } from 'vite'
import sqlite3 from 'sqlite3'
import path from 'path'
import { exec } from 'child_process'

const dbPath = path.resolve(process.cwd(), 'leaderboard.db')
const db = new sqlite3.Database(dbPath)

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS leaderboard (name TEXT, score INTEGER)")
})

export default defineConfig({
  server: {
    hmr: false,
    watch: {
      ignored: ['**/*']
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor dependencies into separate chunks
          'vendor': ['vite']
        }
      }
    },
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  },
  plugins: [{
    name: 'remove-vite-client',
    transformIndexHtml(html) {
      return html.replace(/<script type="module" src="\/@vite\/client"><\/script>/, '');
    }
  },
  {
    name: 'leaderboard-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/leaderboard' && req.method === 'GET') {
          db.all("SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 10", (err, rows) => {
            if (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
              return
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(rows || []))
          })
        } else if (req.url === '/api/changelog' && req.method === 'GET') {
          exec('git log --format="%cI|%s"', (error, stdout, stderr) => {
            if (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message }));
              return;
            }
            const logs = stdout.split('\n')
              .filter(line => line.trim() !== '')
              .map(line => {
                const sepIndex = line.indexOf('|');
                if (sepIndex === -1) return null;
                const time = line.substring(0, sepIndex);
                const msg = line.substring(sepIndex + 1);
                return { time, msg };
              })
              .filter(item => item && /[\u4e00-\u9fa5]/.test(item.msg));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(logs));
          });
        } else if (req.url === '/api/leaderboard' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              if (data.name && typeof data.score === 'number') {
                const stmt = db.prepare("INSERT INTO leaderboard (name, score) VALUES (?, ?)")
                stmt.run([data.name, data.score], (err) => {
                  if (err) {
                    res.statusCode = 500
                    res.end(JSON.stringify({ error: err.message }))
                    return
                  }
                  
                  db.all("SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 10", (err, rows) => {
                    if (err) {
                      res.statusCode = 500
                      res.end(JSON.stringify({ error: err.message }))
                      return
                    }
                    res.setHeader('Content-Type', 'application/json')
                    res.statusCode = 200
                    res.end(JSON.stringify(rows || []))
                  })
                })
                stmt.finalize()
              } else {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid data' }))
              }
            } catch (e) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Invalid JSON' }))
            }
          })
        } else {
          next()
        }
      })
    }
  }]
})
