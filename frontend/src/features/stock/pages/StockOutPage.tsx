import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowUpFromLine, PackageCheck, RefreshCw } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { useProjects } from '../../projects/useProjects'
import { ApiError } from '../../../lib/api'
import { createStockTransaction, fetchProjectInventory, fetchTransactions, type InventoryRow, type StockTransaction, type OutReason } from '../data/inventoryApi'
import { formatQty, todayISO } from '../data/formatting'

const reasons: { value: OutReason; label: string; hint: string }[] = [
  { value: 'USED', label: 'Used on site', hint: 'Consumed for construction work' },
  { value: 'DAMAGED', label: 'Damaged', hint: 'Recorded as wastage' },
  { value: 'LOST', label: 'Lost / Missing', hint: 'Recorded as wastage' },
]
const initialForm = { materialId: '', quantity: '', outReason: 'USED' as OutReason, txnDate: todayISO(), remarks: '' }

export function StockOutPage() {
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
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
      fetchTransactions(selectedProjectId, { includeVoided: true }, controller.signal),
    ]).then(([rows, history]) => {
      if (!controller.signal.aborted) {
        setInventory(rows)
        setTransactions(history)
        setError(null)
      }
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load project stock.')
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [selectedProjectId, retry])

  const availableRows = inventory.filter((row) => row.availableStock > 0)
  const material = inventory.find((row) => row.materialId === Number(form.materialId))
  const recentOut = transactions.filter((transaction) => transaction.txnType === 'OUT').slice(0, 10)
  const quantity = Number(form.quantity)
  const canSubmit = Boolean(selectedProjectId && material && quantity > 0 && quantity <= (material?.availableStock ?? 0))
  const historyCount = useMemo(() => transactions.length, [transactions])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedProjectId || !material) return
    setSaving(true)
    setError(null)
    setSuccess('')
    try {
      await createStockTransaction(selectedProjectId, {
        materialId: material.materialId,
        txnType: 'OUT',
        quantity: Number(form.quantity),
        txnDate: form.txnDate,
        outReason: form.outReason,
        ...(form.remarks.trim() ? { remarks: form.remarks.trim() } : {}),
      })
      setSuccess(`Stock OUT recorded for ${material.materialName}.`)
      setForm({ ...initialForm, txnDate: todayISO() })
      refresh()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Unable to record stock consumption.')
    } finally {
      setSaving(false)
    }
  }

  return <AppShell currentPath="/app/stock-out">
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-[#8E827A]">Workspace / Stock / OUT</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Record Stock OUT</h1><p className="mt-2 text-sm text-[#8E827A]">Record consumption, damaged stock, or lost stock against the selected project.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-[#F5EDE1] px-4 py-2 text-sm font-medium text-[#9A7950]"><ArrowUpFromLine size={16} /> Stock issued</span></header>
      <div className="flex flex-wrap gap-3"><select aria-label="Project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || !projects.length} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm">{projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}</select><button type="button" onClick={refresh} className="rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm"><RefreshCw className="mr-1 inline h-4 w-4" />Refresh</button></div>
      {projectsError && <Banner message={projectsError} retry={retryProjects} />}
      {error && <Banner message={error} retry={refresh} />}
      {success && <p role="status" className="rounded-xl bg-[#E8EFE5] px-4 py-3 text-sm text-[#617858]">{success}</p>}
      {selectedProject && <p className="text-sm text-[#8E827A]">Selected project: {selectedProject.code} · {selectedProject.name}</p>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.35fr]">
        <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-[#323232]">Issue Details</h2><p className="mt-1 text-xs text-[#8E827A]">The backend rejects quantities greater than available stock.</p>
          <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-[#595552]">Material<select required value={form.materialId} onChange={(event) => setForm({ ...form, materialId: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal"><option value="">Select material with stock</option>{availableRows.map((row) => <option key={row.materialId} value={row.materialId}>{row.materialName} ({row.unit})</option>)}</select></label>
            {material && <p className="rounded-xl bg-[#F7F3EE] px-4 py-3 text-sm text-[#595552]">Available balance: <strong>{formatQty(material.availableStock)} {material.unit}</strong></p>}
            <div className="grid grid-cols-2 gap-4"><label className="text-sm font-medium text-[#595552]">Quantity {material && `(${material.unit})`}<input required type="number" min="0.001" step="0.001" max={material?.availableStock} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label><label className="text-sm font-medium text-[#595552]">Issue Date<input required type="date" max={todayISO()} value={form.txnDate} onChange={(event) => setForm({ ...form, txnDate: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label></div>
            {material && Number(form.quantity) > material.availableStock && <p role="alert" className="rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]">Requested quantity exceeds available stock ({formatQty(material.availableStock)} {material.unit}). The backend also validates the balance when posting.</p>}
            <fieldset className="space-y-2"><legend className="text-sm font-medium text-[#595552]">Reason</legend>{reasons.map((reason) => <label key={reason.value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${form.outReason === reason.value ? 'border-[#323232] bg-[#F7F3EE]' : 'border-[#C8BCB4]'}`}><input type="radio" name="outReason" checked={form.outReason === reason.value} onChange={() => setForm({ ...form, outReason: reason.value })} className="mt-1" /><span><span className="block text-sm font-medium text-[#323232]">{reason.label}</span><span className="block text-xs text-[#8E827A]">{reason.hint}</span></span></label>)}</fieldset>
            <label className="block text-sm font-medium text-[#595552]">Remarks (optional)<textarea maxLength={1000} value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} rows={2} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
            <button disabled={saving || loading || !canSubmit} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"><ArrowUpFromLine size={16} />{saving ? 'Recording…' : 'Record Stock OUT'}</button>
          </form>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 font-semibold text-[#323232]"><PackageCheck size={18} />Available at this site</h2><div className="mt-4 flex flex-wrap gap-2">{inventory.map((row) => <span key={row.materialId} className="rounded-full border border-[#E8DCD4] bg-[#F7F3EE] px-3 py-1.5 text-xs text-[#595552]">{row.materialName}: <strong>{formatQty(row.availableStock)} {row.unit}</strong></span>)}{!loading && availableRows.length === 0 && <p className="text-sm text-[#8E827A]">{inventory.length ? 'No positive stock balances are available to issue.' : 'No project inventory records.'}</p>}</div></section>
          <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white"><div className="border-b border-[#E8DCD4] p-5"><h2 className="font-semibold text-[#323232]">Recent Stock OUT</h2><p className="mt-1 text-xs text-[#8E827A]">Showing recent issues · {historyCount} transactions loaded</p></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Date</th><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Qty</th><th className="px-5 py-4 font-medium">Reason</th><th className="px-5 py-4 font-medium">Recorded By</th></tr></thead><tbody className="divide-y divide-[#E8DCD4]">{recentOut.map((transaction) => <tr key={transaction.id}><td className="px-5 py-4 text-sm">{transaction.txnDate.slice(0, 10)}</td><td className="px-5 py-4 text-sm font-medium">{transaction.material.name}{transaction.remarks && <span className="block text-xs font-normal text-[#8E827A]">{transaction.remarks}</span>}</td><td className="px-5 py-4 text-sm text-[#9A7950]">−{formatQty(Number(transaction.quantity))} {transaction.material.unit}</td><td className="px-5 py-4 text-sm">{transaction.outReason ?? '—'}</td><td className="px-5 py-4 text-sm">{transaction.createdBy.name}</td></tr>)}{loading && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading transactions…</td></tr>}{!loading && recentOut.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#8E827A]">No stock issues returned for this project.</td></tr>}</tbody></table></div></section>
        </div>
      </div>
    </div>
  </AppShell>
}

function Banner({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{message}</span><button type="button" onClick={retry} className="font-semibold underline">Retry</button></div>
}
