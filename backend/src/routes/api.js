const express = require('express')
const router = express.Router()
const { generateMetrics } = require('../metricsSimulator')

// Historial simulado en memoria
let history = []

// Genera 50 registros históricos al arrancar
for (let i = 50; i >= 0; i--) {
  const metric = generateMetrics()
  const date = new Date(Date.now() - i * 2 * 60 * 1000) // cada 2 min hacia atrás
  metric.timestamp = date.toISOString()
  history.push(metric)
}

// GET /api/metrics/history — historial completo
router.get('/metrics/history', (req, res) => {
  const { from, to } = req.query

  let data = history

  if (from) data = data.filter(m => new Date(m.timestamp) >= new Date(from))
  if (to)   data = data.filter(m => new Date(m.timestamp) <= new Date(to))

  res.json({ success: true, count: data.length, data })
})

// GET /api/metrics/latest — snapshot actual
router.get('/metrics/latest', (req, res) => {
  res.json({ success: true, data: generateMetrics() })
})

// Agrega nuevas métricas al historial cada 2 minutos
setInterval(() => {
  history.push(generateMetrics())
  if (history.length > 500) history.shift() // límite de 500 registros
}, 2 * 60 * 1000)

module.exports = router