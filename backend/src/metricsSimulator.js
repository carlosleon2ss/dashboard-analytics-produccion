const random = (min, max) => Math.random() * (max - min) + min

let state = {
  users:          1200,
  revenue:        45000,
  orders:         340,
  conversionRate: 3.2,
  p99Latency:     180,
  sla:            99.94,
  cpu:            55,
  memory:         68,
  network:        45,
}

function updateState() {
  state.users          = Math.max(800,   state.users          + random(-20, 25))
  state.revenue        = Math.max(0,     state.revenue        + random(-500, 800))
  state.orders         = Math.max(100,   state.orders         + random(-5, 10))
  state.conversionRate = Math.min(10,    Math.max(1,  state.conversionRate + random(-0.2, 0.2)))
  state.p99Latency     = Math.min(500,   Math.max(80, state.p99Latency     + random(-15, 20)))
  state.sla            = Math.min(99.99, Math.max(98, state.sla            + random(-0.02, 0.01)))
  state.cpu            = Math.min(95,    Math.max(15, state.cpu            + random(-5, 6)))
  state.memory         = Math.min(95,    Math.max(30, state.memory         + random(-3, 4)))
  state.network        = Math.min(95,    Math.max(10, state.network        + random(-6, 7)))
}

function generateHourlyRequests() {
  return Array.from({ length: 12 }, (_, i) => {
    const hour  = i * 2
    const label = `${String(hour).padStart(2, '0')}:00`
    const isDay = hour >= 8 && hour <= 20
    return {
      hour,
      label,
      requests: isDay
        ? Math.floor(random(1500, 5800))
        : Math.floor(random(80,   600)),
      errors: Math.floor(random(5, 90)),
    }
  })
}

function generateTrafficSources() {
  // Genera porcentajes que sumen 100
  const base   = [32, 28, 18, 14, 8]
  const noise  = base.map(v => Math.max(2, Math.round(v + random(-3, 3))))
  const total  = noise.reduce((a, b) => a + b, 0)
  const norm   = noise.map(v => Math.round((v / total) * 100))
  // Ajusta el último para que sume exactamente 100
  norm[norm.length - 1] += 100 - norm.reduce((a, b) => a + b, 0)

  return [
    { name: 'Direct',   value: norm[0], color: '#00d68f' },
    { name: 'Organic',  value: norm[1], color: '#f59e0b' },
    { name: 'Referral', value: norm[2], color: '#a855f7' },
    { name: 'Social',   value: norm[3], color: '#ec4899' },
    { name: 'Email',    value: norm[4], color: '#06b6d4' },
  ]
}

function generateServices() {
  const total   = 12
  const failing = Math.random() < 0.1 ? Math.floor(random(1, 3)) : 0
  return { active: total - failing, total, failing }
}

function generateRegions() {
  const total  = 6
  const down   = Math.random() < 0.05 ? 1 : 0
  return { online: total - down, total, down }
}

function generateMetrics() {
  updateState()

  const services = generateServices()
  const regions  = generateRegions()
  const degraded = services.failing > 0 || regions.down > 0 || state.cpu > 80

  return {
    timestamp: new Date().toISOString(),

    kpis: {
      activeUsers:     Math.round(state.users),
      revenue:         parseFloat(state.revenue.toFixed(2)),
      orders:          Math.round(state.orders),
      conversionRate:  parseFloat(state.conversionRate.toFixed(2)),
    },

    chart: {
      cpu:     parseFloat(state.cpu.toFixed(1)),
      memory:  parseFloat(state.memory.toFixed(1)),
      network: parseFloat(state.network.toFixed(1)),
    },

    system: {
      services,
      regions,
      sla:        parseFloat(state.sla.toFixed(2)),
      p99Latency: Math.round(state.p99Latency),
      degraded,
      errorRate:  parseFloat((random(1.5, 4.5)).toFixed(2)),
    },

    analytics: {
      hourlyRequests:  generateHourlyRequests(),
      trafficSources:  generateTrafficSources(),
    },

    table: generateTableRow(),
  }
}

function generateTableRow() {
  const products  = ['Plan Pro', 'Plan Basic', 'Plan Enterprise', 'Add-on Storage', 'Add-on API']
  const statuses  = ['completed', 'pending', 'failed']
  const countries = ['Ecuador', 'México', 'Colombia', 'Argentina', 'Chile']
  const sources   = ['auth-service', 'billing-api', 'monitoring', 'db-pool', 'cache-layer', 'gateway', 'ci-cd']
  const regions   = ['US-East', 'US-West', 'EU-West', 'EU-Central', 'AP-South']

  return {
    id:      'EVT-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    product: products[Math.floor(random(0, products.length))],
    amount:  parseFloat(random(9.99, 499.99).toFixed(2)),
    status:  statuses[Math.floor(random(0, statuses.length))],
    country: countries[Math.floor(random(0, countries.length))],
    source:  sources[Math.floor(random(0, sources.length))],
    region:  regions[Math.floor(random(0, regions.length))],
    date:    new Date().toISOString(),
  }
}

module.exports = { generateMetrics }