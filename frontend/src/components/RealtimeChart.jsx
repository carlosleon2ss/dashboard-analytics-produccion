import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { format } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a2235', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-sec)', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}%</strong>
        </div>
      ))}
    </div>
  )
}

export function RealtimeChart({ data }) {
  const formatted = data.map(d => ({
    ...d,
    time: format(new Date(d.timestamp), 'HH:mm:ss'),
  }))

  const latest = formatted[formatted.length - 1]

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12, padding: 20,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>⚡ Métricas en Tiempo Real</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--green)',
              background: 'rgba(0,214,143,0.12)', padding: '2px 8px',
              borderRadius: 20, letterSpacing: '0.05em',
            }}>● LIVE</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-sec)', margin: '4px 0 0' }}>
            Actualización cada 2 segundos · {data.length} puntos
          </p>
        </div>
        {latest && (
          <div style={{ fontSize: 11, display: 'flex', gap: 16 }}>
            <span style={{ color: '#f97316' }}>
              <strong className="mono">{latest.cpu}%</strong> CPU
            </span>
            <span style={{ color: '#a855f7' }}>
              <strong className="mono">{latest.memory}%</strong> MEM
            </span>
            <span style={{ color: '#06b6d4' }}>
              <strong className="mono">{latest.network}</strong> MB/s NET
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={true} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 120]} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            formatter={(v) => <span style={{ color: 'var(--text-sec)' }}>{v}</span>} />
          <Line type="monotone" dataKey="cpu"     stroke="#f97316" dot={false} strokeWidth={2} name="CPU %"     />
          <Line type="monotone" dataKey="memory"  stroke="#a855f7" dot={false} strokeWidth={2} name="Memory %"  />
          <Line type="monotone" dataKey="network" stroke="#06b6d4" dot={false} strokeWidth={2} name="Network MB/s" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}