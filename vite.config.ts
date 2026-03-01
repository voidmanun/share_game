import { defineConfig } from 'vite'
import sqlite3 from 'sqlite3'
import path from 'path'

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
