import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ScrollText, ArrowDownToLine, ArrowUpFromLine, Scale, RefreshCw } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { useProjects } from '../../projects/useProjects'
import { ApiError } from '../../../lib/api'
import {
  createStockTransaction,
  fetchProjectInventory,
  fetchTransactions,
  type InventoryRow,
  type StockTransaction,
  type TransactionType,
  type AdjustmentDirection,
} from '../data/inventoryApi'
import { formatQty, todayISO } from '../data/formatting'

const initialForm = { materialId: '', quantity: '', direction: 'INCREASE' as AdjustmentDirection, txnDate: todayISO(), remarks: '' }

export function StockLedgerPage() {
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [typeFilter, setTypeFilter] = useState<'All' | TransactionType>('All')
  const [materialFilter, setMaterialFilter] = useState('All')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [includeVoided, setIncludeVoided] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdjustment, setShowAdjustment] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [retry, setRetry] = useState(0)
  const refresh = () => setRetry((value) => value + 1)

  useEffect(() => {
    if (!selectedProjectId) {
      setInventory([])
      setTransactions([])
      return
    }
    const controller = new AbortController()
    setLoading(true)
    Promise.all([
      fetchProjectInventory(selectedProjectId, controller.signal),
      fetchTransactions(selectedProjectId, {
        ...(materialFilter === 'All' ? {} : { materialId: Number(materialFilter) }),
        ...(typeFilter === 'All' ? {} : { txnType: typeFilter }),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        includeVoided,
      }, controller.signal),
    ]).then(([rows, history]) => {
      if (!controller.signal.aborted) {
        setInventory(rows)
        setTransactions(history)
        setError(null)
      }
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load the stock ledger.')
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [selectedProjectId, materialFilter, typeFilter, from, to, includeVoided, retry])

  const filtered = useMemo(() => transactions.filter((transaction) => {
    const query = search.trim().toLowerCase()
    return !query || `${transaction.material.name} ${transaction.challanNumber ?? ''} ${transaction.remarks ?? ''} ${transaction.createdBy.name} ${transaction.id}`.toLowerCase().includes(query)
  }), [transactions, search])
  const activeTransactions = filtered.filter((transaction) => !transaction.isVoided)
  const totalIn = activeTransactions.filter((transaction) => transaction.txnType === 'IN').reduce((sum, transaction) => sum + Number(transaction.quantity), 0)
  const totalOut = activeTransactions.filter((transaction) => transaction.txnType === 'OUT').reduce((sum, transaction) => sum + Number(transaction.quantity), 0)
  const adjustmentNet = activeTransactions.filter((transaction) => transaction.txnType === 'ADJUSTMENT').reduce(
    (sum, transaction) => sum + (transaction.adjustmentDirection === 'INCREASE' ? 1 : -1) * Number(transaction.quantity),
    0,
  )
  const selectedMaterial = inventory.find((row) => row.materialId === Number(form.materialId))

  const postAdjustment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedProjectId || !selectedMaterial) return
    setSaving(true)
    setError(null)
    setSuccess('')
    try {
      await createStockTransaction(selectedProjectId, {
        materialId: selectedMaterial.materialId,
        txnType: 'ADJUSTMENT',
        quantity: Number(form.quantity),
        txnDate: form.txnDate,
        adjustmentDirection: form.direction,
        ...(form.remarks.trim() ? { remarks: form.remarks.trim() } : {}),
      })
      setSuccess(`Stock adjustment recorded for ${selectedMaterial.materialName}.`)
      setForm({ ...initialForm, txnDate: todayISO() })
      setShowAdjustment(false)
      refresh()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Unable to record the adjustment.')
    } finally {
      setSaving(false)
    }
  }

  return <AppShell currentPath="/app/stock-ledger">
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-[#8E827A]">Workspace / Stock / Ledger</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Stock Ledger</h1><p className="mt-2 text-sm text-[#8E827A]">Project stock transaction history from the backend.</p></div><div className="flex gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-[#F1EAF6] px-4 py-2 text-sm font-medium text-[#806B96]"><ScrollText size={16} />{filtered.length} entries</span><button type="button" onClick={() => { setShowAdjustment(true); setError(null); setSuccess('') }} disabled={!selectedProjectId} className="rounded-xl bg-[#323232] px-4 py-2 text-sm text-white disabled:opacity-50"><Scale className="mr-1 inline h-4 w-4" />Adjustment</button></div></header>
      <div className="flex flex-wrap gap-3"><select aria-label="Project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || !projects.length} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm">{projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}</select><button type="button" onClick={refresh} className="rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm"><RefreshCw className="mr-1 inline h-4 w-4" />Refresh</button></div>
      {projectsError && <Banner message={projectsError} retry={retryProjects} />}{error && <Banner message={error} retry={refresh} />}{success && <p role="status" className="rounded-xl bg-[#E8EFE5] px-4 py-3 text-sm text-[#617858]">{success}</p>}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Total IN (filtered)', value: formatQty(totalIn), icon: ArrowDownToLine }, { label: 'Total OUT (filtered)', value: formatQty(totalOut), icon: ArrowUpFromLine }, { label: 'Net movement incl. adjustments', value: formatQty(totalIn - totalOut + adjustmentNet), icon: ScrollText }, { label: 'Transactions', value: String(filtered.length), icon: Scale }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5"><p className="text-sm text-[#8E827A]">{label}</p><div className="mt-3 flex items-center justify-between"><strong className="text-2xl text-[#323232]">{loading ? '—' : value}</strong><Icon size={20} className="text-[#595552]" /></div></div>)}</section>

      <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
        <div className="grid gap-3 border-b border-[#E8DCD4] p-5 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-xs font-medium text-[#8E827A]">Material<select value={materialFilter} onChange={(event) => setMaterialFilter(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm"><option>All</option>{inventory.map((row) => <option key={row.materialId} value={row.materialId}>{row.materialName}</option>)}</select></label>
          <label className="text-xs font-medium text-[#8E827A]">Transaction type<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'All' | TransactionType)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm"><option>All</option><option value="IN">IN</option><option value="OUT">OUT</option><option value="ADJUSTMENT">ADJUSTMENT</option></select></label>
          <label className="text-xs font-medium text-[#8E827A]">From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] px-3 py-2 text-sm" /></label>
          <label className="text-xs font-medium text-[#8E827A]">To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] px-3 py-2 text-sm" /></label>
          <div className="flex flex-col justify-end gap-2"><label className="flex items-center gap-2 text-xs text-[#8E827A]"><input type="checkbox" checked={includeVoided} onChange={(event) => setIncludeVoided(event.target.checked)} />Include voided</label><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, remarks…" className="rounded-xl border border-[#C8BCB4] px-3 py-2 text-sm" /></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left"><thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Date</th><th className="px-5 py-4 font-medium">Type</th><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Quantity</th><th className="px-5 py-4 font-medium">Details</th><th className="px-5 py-4 font-medium">Rate</th><th className="px-5 py-4 font-medium">Recorded By</th><th className="px-5 py-4 font-medium">State</th></tr></thead><tbody className="divide-y divide-[#E8DCD4]">
          {filtered.map((transaction) => <tr key={transaction.id} className={transaction.isVoided ? 'opacity-60' : ''}><td className="px-5 py-4 text-sm">{transaction.txnDate.slice(0, 10)}<span className="block text-xs text-[#8E827A]">#{transaction.id}</span></td><td className="px-5 py-4 text-sm">{transaction.txnType}</td><td className="px-5 py-4 text-sm font-medium">{transaction.material.name}</td><td className="px-5 py-4 text-sm">{transaction.txnType === 'IN' || transaction.adjustmentDirection === 'INCREASE' ? '+' : '−'}{formatQty(Number(transaction.quantity))} {transaction.material.unit}</td><td className="px-5 py-4 text-sm">{transaction.outReason ?? transaction.adjustmentDirection ?? transaction.challanNumber ?? '—'}{transaction.remarks ? ` · ${transaction.remarks}` : ''}</td><td className="px-5 py-4 text-sm">{transaction.unitRate == null ? '—' : Number(transaction.unitRate).toLocaleString('en-IN')}</td><td className="px-5 py-4 text-sm">{transaction.createdBy.name}</td><td className="px-5 py-4 text-sm">{transaction.isVoided ? `Voided${transaction.voidReason ? `: ${transaction.voidReason}` : ''}` : 'Active'}</td></tr>)}
          {loading && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading transactions…</td></tr>}
          {!loading && !error && filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#8E827A]">No ledger entries match these filters.</td></tr>}
        </tbody></table></div>
        {!loading && <p className="border-t border-[#E8DCD4] p-4 text-xs text-[#8E827A]">Transaction voiding is not exposed by the current API; entries cannot be voided here.</p>}
      </section>
    </div>
    {showAdjustment && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form onSubmit={(event) => void postAdjustment(event)} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Stock Adjustment</h2><p className="mt-1 text-sm text-[#8E827A]">{selectedProject?.code} · adjust a planned material balance</p></div><button type="button" onClick={() => setShowAdjustment(false)} className="text-sm">Close</button></div>
      {error && <p role="alert" className="rounded-lg bg-[#F8ECEA] p-3 text-sm text-[#9B625A]">{error}</p>}
      <label className="block text-sm">Material<select required value={form.materialId} onChange={(event) => setForm({ ...form, materialId: event.target.value })} className="mt-1 w-full rounded-lg border p-3"><option value="">Select material</option>{inventory.map((row) => <option key={row.materialId} value={row.materialId}>{row.materialName} · {formatQty(row.availableStock)} {row.unit} available</option>)}</select></label>
      {selectedMaterial && <p className="text-xs text-[#8E827A]">Current balance: {formatQty(selectedMaterial.availableStock)} {selectedMaterial.unit}</p>}
      <div className="grid grid-cols-2 gap-3"><label className="block text-sm">Direction<select value={form.direction} onChange={(event) => setForm({ ...form, direction: event.target.value as AdjustmentDirection })} className="mt-1 w-full rounded-lg border p-3"><option value="INCREASE">Increase</option><option value="DECREASE">Decrease</option></select></label><label className="block text-sm">Quantity<input required type="number" min="0.001" step="0.001" max={form.direction === 'DECREASE' ? selectedMaterial?.availableStock : undefined} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label></div>
      {selectedMaterial && form.direction === 'DECREASE' && Number(form.quantity) > selectedMaterial.availableStock && <p role="alert" className="rounded-lg bg-[#F8ECEA] p-3 text-sm text-[#9B625A]">Adjustment exceeds available stock ({formatQty(selectedMaterial.availableStock)} {selectedMaterial.unit}).</p>}
      <label className="block text-sm">Date<input required type="date" max={todayISO()} value={form.txnDate} onChange={(event) => setForm({ ...form, txnDate: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
      <label className="block text-sm">Remarks (optional)<textarea maxLength={1000} value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
      <button disabled={saving || !selectedMaterial || Number(form.quantity) <= 0 || (form.direction === 'DECREASE' && Number(form.quantity) > (selectedMaterial?.availableStock ?? 0))} type="submit" className="rounded-xl bg-[#323232] px-4 py-2.5 text-sm text-white disabled:opacity-50">{saving ? 'Posting…' : 'Post adjustment'}</button>
    </form></div>}
  </AppShell>
}

function Banner({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{message}</span><button type="button" onClick={retry} className="font-semibold underline">Retry</button></div>
}
