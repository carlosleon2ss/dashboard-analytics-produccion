import { useState } from 'react'
import { subHours, subDays, startOfDay, endOfDay, format } from 'date-fns'
import { ExportButtons } from './ExportButtons'

const PRESETS = [
  { label: 'Última hora',  value: '1h'  },
  { label: 'Últimas 6h',  value: '6h'  },
  { label: 'Últimas 24h', value: '24h' },
  { label: '7 días',      value: '7d'  },
  { label: '30 días',     value: '30d' },
  { label: 'Personalizado', value: 'custom' },
]

function getRange(preset) {
  const now = new Date()
  switch (preset) {
    case '1h':  return { from: subHours(now, 1),   to: now }
    case '6h':  return { from: subHours(now, 6),   to: now }
    case '24h': return { from: subHours(now, 24),  to: now }
    case '7d':  return { from: subDays(now, 7),    to: now }
    case '30d': return { from: subDays(now, 30),   to: now }
    default:    return { from: subHours(now, 24),  to: now }
  }
}

export function DateRangeFilter({ onRangeChange, stats, rows, range }) {
  const [active, setActive]     = useState('24h')
  const [showCustom, setCustom] = useState(false)
  const [customFrom, setFrom]   = useState('')
  const [customTo, setTo]       = useState('')

  const handlePreset = (preset) => {
    setActive(preset)
    if (preset === 'custom') {
      setCustom(true)
      return
    }
    setCustom(false)
    onRangeChange(getRange(preset))
  }

  const handleApplyCustom = () => {
    if (!customFrom || !customTo) return
    onRangeChange({
      from: new Date(customFrom),
      to:   new Date(customTo),
    })
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12, padding: 20, marginBottom: 24,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--green)', fontSize: 14 }}>▼</span>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Filtros y Exportación
          </span>
        </div>
        <ExportButtons rows={rows} range={range} />
      </div>

      {/* Presets + inputs en una fila */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-sec)', whiteSpace: 'nowrap' }}>
          🕐 Rango:
        </span>

        {/* Botones preset */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => handlePreset(p.value)}
              style={{
                padding: '6px 14px', borderRadius: 8,
                fontSize: 12, fontWeight: active === p.value ? 700 : 400,
                border: '1px solid var(--border)', cursor: 'pointer',
                background: active === p.value ? 'var(--text-pri)' : 'var(--bg-card2)',
                color:      active === p.value ? 'var(--bg-base)'  : 'var(--text-sec)',
                transition: 'all 0.15s',
              }}
            >{p.label}</button>
          ))}
        </div>

        {/* Inputs fecha personalizada */}
        {showCustom && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input
              type="datetime-local"
              value={customFrom}
              onChange={e => setFrom(e.target.value)}
              style={inputStyle}
            />
            <span style={{ color: 'var(--text-sec)', fontSize: 12 }}>→</span>
            <input
              type="datetime-local"
              value={customTo}
              onChange={e => setTo(e.target.value)}
              style={inputStyle}
            />
            <button onClick={handleApplyCustom} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'var(--green)', color: '#000',
              border: 'none', cursor: 'pointer',
            }}>Aplicar</button>
          </div>
        )}
      </div>

      {/* Stats de eventos filtrados */}
      {stats && (
        <div style={{
          display: 'flex', gap: 32, marginTop: 16,
          paddingTop: 16, borderTop: '1px solid var(--border)',
        }}>
          {[
            { icon: '◈', label: 'Total Eventos', value: stats.total,   color: 'var(--text-pri)' },
            { icon: '✓', label: 'Exitosos',       value: stats.success, color: 'var(--green)'    },
            { icon: '△', label: 'Advertencias',   value: stats.warning, color: '#f59e0b'         },
            { icon: '✕', label: 'Errores',        value: stats.error,   color: 'var(--red)'      },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, color: s.color }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  background: 'var(--bg-card2)',
  border: '1px solid var(--border)',
  borderRadius: 8, padding: '6px 10px',
  color: 'var(--text-pri)', fontSize: 12,
  outline: 'none',
  colorScheme: 'dark',
}