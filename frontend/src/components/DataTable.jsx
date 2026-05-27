import { useState } from 'react'
import { format } from 'date-fns'

const PAGE_SIZE = 8

const statusStyle = {
  completed: { color: '#00d68f', bg: 'rgba(0,214,143,0.1)',  label: 'success'  },
  pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'warning'  },
  failed:    { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'error'    },
}

export function DataTable({ rows }) {
  const [page, setPage]     = useState(1)
  const [filter, setFilter] = useState('Todos')
  const [search, setSearch] = useState('')

  const filters = ['Todos', 'Success', 'Warning', 'Error']

  const filtered = rows.filter(r => {
    const s = statusStyle[r.status]?.label || ''
    const matchFilter = filter === 'Todos' || s === filter.toLowerCase()
    const matchSearch = !search ||
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.country.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilter = (f) => { setFilter(f); setPage(1) }
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1) }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12, padding: 20,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>⊞ EVENT LOG</span>
        <span style={{
          fontSize: 11, color: 'var(--text-sec)',
          background: 'var(--bg-card2)', padding: '2px 8px', borderRadius: 20,
        }}>{filtered.length} eventos</span>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-sec)' }}>🔍</span>
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Buscar evento, fuente o región..."
            style={{
              width: '100%', background: 'var(--bg-card2)',
              border: '1px solid var(--border)', borderRadius: 8,
              padding: '8px 12px 8px 34px',
              color: 'var(--text-pri)', fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(f => (
            <button key={f} onClick={() => handleFilter(f)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: '1px solid var(--border)', cursor: 'pointer',
              background: filter === f ? 'var(--text-pri)' : 'var(--bg-card2)',
              color: filter === f ? 'var(--bg-base)' : 'var(--text-sec)',
              transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['ID', 'TIMESTAMP', 'EVENTO', 'FUENTE', 'REGIÓN', 'ESTADO', 'VALOR'].map(h => (
                <th key={h} style={{
                  padding: '8px 12px', textAlign: 'left',
                  fontSize: 11, letterSpacing: '0.06em',
                  color: 'var(--text-sec)', fontWeight: 600,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => {
              const s = statusStyle[row.status] || statusStyle.pending
              return (
                <tr key={row.id + i} style={{
                  borderBottom: '1px solid var(--bg-card2)',
                  transition: 'background 0.1s',
                }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="mono" style={{ padding: '12px', color: 'var(--text-sec)', fontSize: 11 }}>{row.id}</td>
                  <td className="mono" style={{ padding: '12px', color: 'var(--text-sec)', fontSize: 11 }}>
                    {format(new Date(row.date), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{row.product}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: 'var(--bg-card2)', padding: '2px 8px',
                      borderRadius: 4, fontSize: 11, fontFamily: 'monospace',
                      color: 'var(--text-sec)',
                    }}>{row.source}</span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-sec)' }}>{row.region}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: s.bg, color: s.color,
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700,
                    }}>● {s.label}</span>
                  </td>
                  <td className="mono" style={{ padding: '12px', textAlign: 'right', color: 'var(--text-pri)' }}>
                    {row.amount}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 16, fontSize: 12, color: 'var(--text-sec)',
      }}>
        <span>Mostrando {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} de {filtered.length}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setPage(1)} disabled={page === 1} style={pageBtn(page === 1)}>«</button>
          <button onClick={() => setPage(p => p-1)} disabled={page === 1} style={pageBtn(page === 1)}>‹</button>
          {Array.from({ length: Math.min(4, totalPages) }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} style={pageBtn(false, n === page)}>{n}</button>
          ))}
          <button onClick={() => setPage(p => p+1)} disabled={page === totalPages} style={pageBtn(page === totalPages)}>›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={pageBtn(page === totalPages)}>»</button>
        </div>
      </div>
    </div>
  )
}

const pageBtn = (disabled, active = false) => ({
  width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)',
  background: active ? 'var(--text-pri)' : 'var(--bg-card2)',
  color: active ? 'var(--bg-base)' : 'var(--text-sec)',
  fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.3 : 1, fontWeight: active ? 700 : 400,
})