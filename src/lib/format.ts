// INR / date / percent formatters (Indian locale)

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatMoney(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '—'
  return inr.format(amount)
}

/** Compact Indian notation: ₹2.4 Cr, ₹58.5 L, ₹95K */
export function formatMoneyCompact(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '—'
  const abs = Math.abs(amount)
  if (abs >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(abs >= 10_00_00_000 ? 0 : 1)} Cr`
  if (abs >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(abs >= 10_00_000 ? 1 : 2)} L`
  if (abs >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`
  return `₹${Math.round(amount)}`
}

export function formatQty(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—'
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)
}

const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const dateTimeFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (isNaN(d.getTime())) return '—'
  return dateFmt.format(d)
}

export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (isNaN(d.getTime())) return '—'
  return dateTimeFmt.format(d)
}

export function formatPct(n: number | null | undefined, digits = 1): string {
  if (n == null || isNaN(n)) return '—'
  return `${n > 0 ? '+' : ''}${n.toFixed(digits)}%`
}

/** '2026-02' -> 'Feb' */
export function monthLabel(month: string): string {
  const d = new Date(`${month}-01T00:00:00`)
  return isNaN(d.getTime()) ? month : d.toLocaleString('en-IN', { month: 'short' })
}

export function relativeTime(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (isNaN(d.getTime())) return '—'
  const diffMs = Date.now() - d.getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(d)
}

export function toDateInputValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
