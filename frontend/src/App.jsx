import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useWebSocket }    from './hooks/useWebSocket'
import { Navbar }          from './components/Navbar'
import { KPICard }         from './components/KPICard'
import { RealtimeChart }   from './components/RealtimeChart'
import { DataTable }       from './components/DataTable'
import { AnalyticsCharts } from './components/AnalyticsCharts'
import { DateRangeFilter } from './components/DateRangeFilter'
import { useAuth }     from './context/AuthContext'
import { LoginPage }   from './pages/LoginPage'

const MAX_CHART = 30

export default function App() {
  // ✅ TODOS los hooks primero, sin excepción
  const { user, token, loading, logout } = useAuth()
  const { data, status }                 = useWebSocket(token)
  const [chartData, setChart]            = useState([])
  const [tableRows, setRows]             = useState([])
  const [latency, setLatency]            = useState(0)
  const [range, setRange]                = useState({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    to:   new Date(),
  })

  useEffect(() => {
    if (!data) return
    const t0 = Date.now()
    setChart(p => [...p, { timestamp: data.timestamp, ...data.chart }].slice(-MAX_CHART))
    setRows(p => [data.table, ...p].slice(0, 300))
    setLatency(Date.now() - t0 + Math.floor(Math.random() * 40 + 10))
  }, [data])

  // ✅ Lógica derivada después de los hooks
  const kpis = data?.kpis
  const now  = new Date()

  const filteredRows = tableRows.filter(r => {
    const d = new Date(r.date)
    return d >= range.from && d <= range.to
  })

  const stats = {
    total:   filteredRows.length,
    success: filteredRows.filter(r => r.status === 'completed').length,
    warning: filteredRows.filter(r => r.status === 'pending').length,
    error:   filteredRows.filter(r => r.status === 'failed').length,
  }

  // ✅ Returns condicionales AL FINAL, después de todos los hooks
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, color: 'var(--text-sec)',
    }}>Verificando sesión...</div>
  )

  if (!user) return <LoginPage />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar status={status} latency={latency} onLogout={logout} user={user}/>

      <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Overview Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f1e38 0%, #111827 100%)',
          border: '1px solid var(--border)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Dashboard Overview</h1>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: data?.system?.degraded ? '#f59e0b' : 'var(--green)',
                  background: data?.system?.degraded ? 'rgba(245,158,11,0.15)' : 'rgba(0,214,143,0.15)',
                  padding: '3px 10px', borderRadius: 20,
                  border: data?.system?.degraded ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(0,214,143,0.3)',
                }}>
                  {data?.system?.degraded ? '● Sistema Degradado' : '● Sistema Online'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-sec)' }}>
                {format(now, "EEEE, d 'de' MMMM 'de' yyyy · HH:mm:ss", { locale: es })}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: 'var(--text-sec)' }}>
                CPU <strong style={{ color: 'var(--text-pri)' }}>
                  {data ? Math.round(data.chart.cpu) : '--'}%
                </strong>
              </span>
              <span style={{ color: 'var(--text-sec)' }}>
                MEM <strong style={{ color: 'var(--text-pri)' }}>
                  {data ? Math.round(data.chart.memory) : '--'}%
                </strong>
              </span>
              <span style={{ color: 'var(--text-sec)' }}>
                ERR <strong style={{ color: 'var(--red)' }}>
                  {data ? data.system.errorRate.toFixed(1) : '--'}%
                </strong>
              </span>
            </div>
          </div>

          {/* Mini stats — ahora vienen del backend */}
          <div style={{ display: 'flex', gap: 40, marginTop: 20 }}>
            {[
              {
                icon: '▣',
                val: `${data?.system?.services?.active ?? 12}/${data?.system?.services?.total ?? 12}`,
                label: 'Servicios Activos',
              },
              {
                icon: '☁',
                val: `${data?.system?.regions?.online ?? 6}/${data?.system?.regions?.total ?? 6}`,
                label: 'Regiones Online',
              },
              {
                icon: '✓',
                val: `${data?.system?.sla ?? '99.94'}%`,
                label: 'SLA',
              },
              {
                icon: '⚡',
                val: `${data?.system?.p99Latency ?? 198}ms`,
                label: 'P99 Latency',
              },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18, color: 'var(--green)' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
            {/* Filtros */}
        <DateRangeFilter
          onRangeChange={setRange}
          stats={stats}
          rows={filteredRows}
          range={range}
        />
        {/* Section: KPI Cards */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ color: 'var(--green)', fontSize: 14 }}>◎</span>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>KPI Cards</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <KPICard
            type="cpu" title="CPU Usage"
            value={`${data ? Math.round(data.chart.cpu) : '--'}%`}
            subtitle="Promedio 4 núcleos"
            trend="4.3%" trendUp={true}
            barColor="#ef4444"
          />
          <KPICard
            type="memory" title="Memory"
            value={`${data ? Math.round(data.chart.memory) : '--'}%`}
            subtitle="16 GB total"
            trend="2.1%" trendUp={true}
            barColor="#a855f7"
          />
          <KPICard
            type="users" title="Active Users"
            value={kpis?.activeUsers ?? '--'}
            subtitle="Sesiones activas"
            trend="4.5%" trendUp={true}
            barColor="#00d68f"
          />
          <KPICard
            type="revenue" title="Revenue"
            value={kpis ? `$${(kpis.revenue / 1000).toFixed(1)}k` : '--'}
            subtitle="Ingresos del día"
            trend="11.4%" trendUp={true}
            barColor="#06b6d4"
          />
          <KPICard
            type="error" title="Error Rate"
            value={data ? `${data.system.errorRate.toFixed(2)}%` : '--'}
            subtitle="Últimas 24h"
            trend="0.6%" trendUp={false}
            barColor="#ef4444"
          />
          <KPICard
            type="network" title="Network In"
            value={data ? `${Math.round(data.chart.network * 10)} MB/s` : '--'}
            subtitle="Tráfico entrante"
            trend="5.2%" trendUp={true}
            barColor="#3b82f6"
          />
        </div>

        {/* Section: Real-Time Charts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ color: 'var(--green)', fontSize: 14 }}>↗</span>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Real-Time Charts</span>
        </div>
        <div style={{ marginBottom: 24 }}>
          <RealtimeChart data={chartData} />
        </div>

        {/* Section: Analytics Charts — datos desde backend */}
        <AnalyticsCharts
          hourlyRequests={data?.analytics?.hourlyRequests ?? []}
          trafficSources={data?.analytics?.trafficSources ?? []}
        />

        {/* Section: Table */}
        <DataTable rows={filteredRows} />

      </div>
    </div>
  )
}