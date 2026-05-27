const iconMap = {
  cpu:     { emoji: '🔲', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  memory:  { emoji: '🗄️', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  users:   { emoji: '👤', color: '#00d68f', bg: 'rgba(0,214,143,0.12)' },
  revenue: { emoji: '💲', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  error:   { emoji: '⚠️', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  network: { emoji: '📶', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
}

export function KPICard({ title, value, subtitle, trend, trendUp = true, type = 'users', barColor }) {
  const icon = iconMap[type] || iconMap.users
  const barW = Math.min(100, Math.abs(parseFloat(trend) || 50))

  return (
    <div className="fade-in" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minHeight: 140,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-sec)', textTransform: 'uppercase', margin: 0 }}>
            {title}
          </p>
          <p style={{ fontSize: 36, fontWeight: 800, margin: '4px 0 0', lineHeight: 1, letterSpacing: '-1px' }}>
            {value}
          </p>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: icon.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>{icon.emoji}</div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-sec)', margin: 0 }}>{subtitle}</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{
          flex: 1, height: 3, background: 'var(--bg-card2)',
          borderRadius: 2, overflow: 'hidden', marginRight: 12,
        }}>
          <div style={{
            width: `${barW}%`, height: '100%',
            background: barColor || icon.color,
            borderRadius: 2,
            transition: 'width 0.6s ease',
          }} />
        </div>
        {trend && (
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: trendUp ? 'var(--green)' : 'var(--red)',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            {trendUp ? '▲' : '▼'} {trend}
          </span>
        )}
      </div>
    </div>
  )
}