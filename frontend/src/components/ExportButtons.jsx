import { format } from 'date-fns'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function prepareData(rows) {
  return rows.map(r => ({
    ID:        r.id,
    Fecha:     format(new Date(r.date), 'yyyy-MM-dd HH:mm:ss'),
    Evento:    r.product,
    Fuente:    r.source,
    Region:    r.region,
    Estado:    r.status,
    Valor:     r.amount,
  }))
}

function exportCSV(rows) {
  const data     = prepareData(rows)
  const csv      = Papa.unparse(data)
  const blob     = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url      = URL.createObjectURL(blob)
  const link     = document.createElement('a')
  const filename = `dashboard_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`
  link.href      = url
  link.download  = filename
  link.click()
  URL.revokeObjectURL(url)
}

function exportPDF(rows, range) {
  const doc  = new jsPDF({ orientation: 'landscape' })
  const now  = format(new Date(), 'dd/MM/yyyy HH:mm:ss')
  const from = range?.from ? format(range.from, 'dd/MM/yyyy HH:mm') : '—'
  const to   = range?.to   ? format(range.to,   'dd/MM/yyyy HH:mm') : '—'

  // Header
  doc.setFillColor(10, 14, 26)
  doc.rect(0, 0, 297, 40, 'F')

  doc.setTextColor(0, 214, 143)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('PulseMetrics', 14, 16)

  doc.setTextColor(180, 180, 180)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Analytics Dashboard — Reporte de Eventos', 14, 25)
  doc.text(`Generado: ${now}`, 14, 32)
  doc.text(`Rango: ${from} → ${to}`, 100, 32)
  doc.text(`Total registros: ${rows.length}`, 220, 32)

  // Stats summary
  const success = rows.filter(r => r.status === 'completed').length
  const warning = rows.filter(r => r.status === 'pending').length
  const error   = rows.filter(r => r.status === 'failed').length

  doc.setFillColor(17, 24, 39)
  doc.rect(0, 40, 297, 22, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  doc.setTextColor(0, 214, 143)
  doc.text(`✓ Exitosos: ${success}`, 14, 54)

  doc.setTextColor(245, 158, 11)
  doc.text(`△ Advertencias: ${warning}`, 80, 54)

  doc.setTextColor(239, 68, 68)
  doc.text(`✕ Errores: ${error}`, 160, 54)

  // Tabla
  autoTable(doc, {
    startY: 66,
    head: [['ID', 'Fecha', 'Evento', 'Fuente', 'Región', 'Estado', 'Valor']],
    body: prepareData(rows).map(r => Object.values(r)),
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: [226, 232, 240],
      fillColor: [17, 24, 39],
      lineColor: [30, 45, 69],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [15, 30, 56],
      textColor: [100, 116, 139],
      fontStyle: 'bold',
      fontSize: 8,
      letterSpacing: 1,
    },
    alternateRowStyles: {
      fillColor: [26, 34, 53],
    },
    columnStyles: {
      0: { cellWidth: 28, textColor: [100, 116, 139] },
      1: { cellWidth: 42, textColor: [100, 116, 139] },
      2: { cellWidth: 50, fontStyle: 'bold' },
      3: { cellWidth: 35 },
      4: { cellWidth: 28 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25, halign: 'right' },
    },
    didDrawCell: (data) => {
  if (data.column.index === 5 && data.section === 'body') {
    const val = data.cell.raw
    const color = val === 'completed' ? [0, 214, 143]
                : val === 'pending'   ? [245, 158, 11]
                : [239, 68, 68]
    const label = val === 'completed' ? 'success'
                : val === 'pending'   ? 'warning'
                : 'error'

    // Borra el texto original tapándolo con el color de fondo
    const fillColor = data.row.index % 2 === 0
      ? [17, 24, 39]   // fila normal
      : [26, 34, 53]   // fila alterna

    doc.setFillColor(...fillColor)
    doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F')

    // Dibuja solo el texto con color correcto
    doc.setTextColor(...color)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(
      label,
      data.cell.x + 2,
      data.cell.y + data.cell.height / 2 + 1
    )
  }
},
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(
      `PulseMetrics Analytics · Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.height - 8
    )
  }

  doc.save(`dashboard_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`)
}

export function ExportButtons({ rows, range }) {
  const disabled = !rows || rows.length === 0

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {/* CSV */}
      <button
        onClick={() => exportCSV(rows)}
        disabled={disabled}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 16px', borderRadius: 8,
          fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
          background: 'var(--bg-card2)', border: '1px solid var(--border)',
          color: disabled ? 'var(--text-muted)' : 'var(--text-pri)',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = 'var(--text-sec)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        ⬇ Exportar CSV
      </button>

      {/* PDF */}
      <button
        onClick={() => exportPDF(rows, range)}
        disabled={disabled}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 16px', borderRadius: 8,
          fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? 'var(--bg-card2)' : 'var(--green)',
          border: '1px solid transparent',
          color: disabled ? 'var(--text-muted)' : '#000',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        ⬇ Exportar PDF
      </button>
    </div>
  )
}