import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function Navbar({ status, latency, onLogout, user}) {
  const [time, setTime] = useState(new Date())
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date())
      setUptime(s => s + 1)
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const fmtUptime = (s) => {
    const m = Math.floor(s / 60), sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  return (
    <nav style={{
      background: '#0d1424',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'linear-gradient(135deg, var(--green), var(--blue))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800,
        }}>P</div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>PulseMetrics</span>
        <span style={{ color: 'var(--text-sec)', fontSize: 12, marginLeft: 4 }}>Analytics Dashboard</span>
      </div>

      {/* Status pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 12, color: 'var(--text-sec)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: status === 'open' ? 'var(--green)' : 'var(--red)',
            display: 'inline-block',
          }} className={status === 'open' ? 'pulse' : ''} />
          <span style={{ color: status === 'open' ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
            {status === 'open' ? 'Live' : 'Offline'}
          </span>
        </div>
        <span>Latency <strong className="mono" style={{ color: 'var(--text-pri)' }}>{latency}ms</strong></span>
        <span>Uptime <strong className="mono" style={{ color: 'var(--text-pri)' }}>{fmtUptime(uptime)}</strong></span>
        <span>Heartbeat <strong className="mono" style={{ color: 'var(--text-pri)' }}>
          {format(time, 'HH:mm:ss')}
        </strong></span>
      </div>

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--blue), var(--purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {user?.name ?? 'Usuario'}
        </span>
        <button onClick={onLogout} style={{
          padding: '4px 12px', borderRadius: 6, border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--text-sec)',
          fontSize: 12, cursor: 'pointer',
        }}>Salir</button>
      </div>
    </nav>
  )
}