import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a2235', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-sec)', marginBottom: 6 }}>{label}</p>
      <div style={{ color: '#00d68f' }}>Requests: <strong>{payload[0]?.value?.toLocaleString()}</strong></div>
      <div style={{ color: '#f97316' }}>Errors: <strong>{payload[1]?.value}</strong></div>
    </div>
  )
}

export function AnalyticsCharts({ hourlyRequests = [], trafficSources = [] }) {
  const total = hourlyRequests.reduce((s, d) => s + d.requests, 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ color: 'var(--green)', fontSize: 14 }}>▐</span>
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Gráficas Analíticas
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, marginBottom: 24 }}>

        {/* Bar Chart */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Requests por Hora</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-sec)' }}>
                Últimas 24h · Total: {total.toLocaleString()} req
              </p>
            </div>
            <button style={{
              background: 'var(--bg-card2)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '4px 12px', fontSize: 11,
              color: 'var(--text-sec)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>📅 Hoy</button>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hourlyRequests} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="requests" fill="#00d68f" radius={[3, 3, 0, 0]} maxBarSize={32} />
              <Bar dataKey="errors"   fill="#f97316" radius={[3, 3, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 20,
        }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14 }}>Fuentes de Tráfico</p>
          <p style={{ margin: '0 0 12px', fontSize: 11, color: 'var(--text-sec)' }}>Distribución por canal</p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <PieChart width={180} height={180}>
              <Pie
                data={trafficSources}
                cx={90} cy={90}
                innerRadius={55} outerRadius={85}
                paddingAngle={3} dataKey="value"
                strokeWidth={0}
              >
                {trafficSources.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {trafficSources.map(item => (
              <div key={item.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: item.color, display: 'inline-block', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, color: 'var(--text-sec)' }}>{item.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 48, height: 3, borderRadius: 2,
                    background: 'var(--bg-card2)', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${item.value * 3}%`, height: '100%',
                      background: item.color, borderRadius: 2,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-pri)', minWidth: 32, textAlign: 'right' }}>
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}