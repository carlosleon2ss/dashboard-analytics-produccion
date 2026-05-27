require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const { initWebSocket } = require('./websocket')
const apiRoutes = require('./routes/api')
const { runMigrations } = require('./migrations')
const authRoutes = require('./routes/auth')
const { authMiddleware } = require('./middleware/auth')


const app  = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/metrics', authMiddleware, apiRoutes)


// Rutas REST
app.use('/api', apiRoutes)
app.use('/api/auth', authRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Servidor HTTP + WebSocket comparten el mismo puerto
const server = http.createServer(app)
initWebSocket(server)

const path = require('path')

// Sirve el frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')))

  app.get('*path', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'))
  })
}

// Inicia el servidor después de crear las tablas
runMigrations().then(() => {
server.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`)
  console.log(` WebSocket disponible en ws://localhost:${PORT}`)
    })
})