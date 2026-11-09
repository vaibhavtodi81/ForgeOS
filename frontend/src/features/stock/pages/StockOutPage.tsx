import { useEffect, useMemo, useState } from 'react'
import { ArrowUpFromLine, X, Ban, PackageCheck } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { getCurrentUser, isAdmin } from '../../authentication/utils/permissions'
import type { Material } from '../../materials/types/material'
import { getStoredMaterials } from '../../materials/data/materialStore'
import type { StockOutReason, StockTransaction } from '../types/stock'
import {
  addStockOut,
  formatDate,
  formatQty,
  getAvailableBalance,
  getStoredStockTransactions,
  todayISO,
  voidStockTransaction,
} from '../data/stockStore'

type Project = {
  id: number
  code: string
  name: string
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
}

const REASONS: { value: StockOutReason; label: string; hint: string }[] = [
  { value: 'USED', label: 'Used on site', hint: 'Consumed for construction work' },
  { value: 'DAMAGED', label: 'Damaged', hint: 'Counted as recorded wastage' },
  { value: 'LOST', label: 'Lost / Missing', hint: 'Counted as recorded wastage' },
]

const emptyForm = {
  projectId: '',
  materialId: '',
  quantity: '',
  reason: 'USED' as StockOutReason,
  date: '',
  notes: '',
}

export function StockOutPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [materials] = useState<Material[]>(() => getStoredMaterials())
  const [transactions, setTransactions] = useState<StockTransaction[]>(() => getStoredStockTransactions())
  const [form, setForm] = useState(emptyForm)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [voidTarget, setVoidTarget] = useState<StockTransaction | null>(null)
  const [voidReason, setVoidReason] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('forgeos_projects')
      setProjects(saved ? JSON.parse(saved) : [])
    } catch {
      setProjects([])
    }
  }, [])

  const selectedMaterial = materials.find((m) => m.id === form.materialId)

  const balance = useMemo(() => {
    if (!form.projectId || !form.materialId) return null
    return getAvailableBalance(transactions, form.projectId, form.materialId)
  }, [transactions, form.projectId, form.materialId])

  const projectBalances = useMemo(() => {
    if (!form.projectId) return []
    return materials
      .map((material) => ({
        material,
        balance: getAvailableBalance(transactions, form.projectId, material.id),
      }))
      .filter((row) => row.balance > 0)
  }, [materials, transactions, form.projectId])

  const recentOut = useMemo(
    () => transactions.filter((tx) => tx.type === 'OUT').slice(0, 10),
    [transactions]
  )

  const submitStockOut = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)

    const project = projects.find((p) => String(p.id) === form.projectId)
    if (!project || !selectedMaterial) return

    const quantity = Number(form.quantity)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFeedback({ type: 'error', message: 'Quantity must be greater than 0.' })
      return
    }
    if (!form.date) {
      setFeedback({ type: 'error', message: 'Please pick an issue date.' })
      return
    }
    if (form.date > todayISO()) {
      setFeedback({ type: 'error', message: 'Date cannot be in the future.' })
      return
    }

    const user = getCurrentUser()
    const recordedBy = `${user?.name ?? 'User'} (${isAdmin() ? 'Admin' : 'PM'})`

    const result = addStockOut({
      projectId: String(project.id),
      projectCode: project.code,
      projectName: project.name,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      materialUnit: selectedMaterial.unit,
      quantity,
      date: form.date,
      reason: form.reason,
      notes: form.notes || undefined,
      recordedBy,
    })

    if (!result.ok) {
      setFeedback({ type: 'error', message: result.error })
      return
    }

    setTransactions(getStoredStockTransactions())
    setForm({ ...emptyForm, projectId: form.projectId })
    setFeedback({
      type: 'success',
      message: `Recorded Stock OUT of ${formatQty(quantity)} ${selectedMaterial.unit} ${selectedMaterial.name} (${form.reason}) for ${project.code}.`,
    })
  }

  const confirmVoid = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!voidTarget) return
    const result = voidStockTransaction(voidTarget.id, voidReason, isAdmin())
    if (result.ok) {
      setTransactions(getStoredStockTransactions())
      setFeedback({ type: 'success', message: `Entry ${voidTarget.id} has been voided.` })
    } else {
      setFeedback({ type: 'error', message: result.error })
    }
    setVoidTarget(null)
    setVoidReason('')
  }

  return (
    <AppShell currentPath="/app/stock-out">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[#8E827A]">Workspace / Stock / OUT</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Record Stock OUT</h1>
            <p className="mt-2 text-sm text-[#8E827A]">Issue materials for site use. Damaged and lost quantities feed wastage tracking.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F5EDE1] px-4 py-2 text-sm font-medium text-[#9A7950]">
            <ArrowUpFromLine size={16} /> Stock issued
          </span>
        </section>

        {feedback && (
          <p className={`rounded-xl px-4 py-3 text-sm ${feedback.type === 'success' ? 'bg-[#E8EFE5] text-[#617858]' : 'bg-[#F8ECEA] text-[#9B625A]'}`}>
            {feedback.message}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.35fr]">
          <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#323232]">Issue Details</h2>
            <p className="mt-1 text-xs text-[#8E827A]">Stock OUT is rejected automatically if it exceeds the available balance.</p>
            <form onSubmit={submitStockOut} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-[#595552]">Project
                <select required value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value, materialId: '' })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal outline-none">
                  <option value="" disabled>Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-[#595552]">Material
                <select required value={form.materialId} onChange={(e) => setForm({ ...form, materialId: e.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal outline-none">
                  <option value="" disabled>Select material</option>
                  {materials.filter((m) => m.status === 'Active').map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.unit})
                    </option>
                  ))}
                </select>
              </label>

              {balance !== null && (
                <p className={`rounded-xl px-4 py-3 text-sm ${balance > 0 ? 'bg-[#F7F3EE] text-[#595552]' : 'bg-[#F8ECEA] text-[#9B625A]'}`}>
                  Available balance: <span className="font-semibold">{formatQty(balance)} {selectedMaterial?.unit ?? ''}</span> of {selectedMaterial?.name ?? ''}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-medium text-[#595552]">Quantity {selectedMaterial ? `(${selectedMaterial.unit})` : ''}
                  <input required type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 120" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
                </label>
                <label className="text-sm font-medium text-[#595552]">Issue Date
                  <input required type="date" max={todayISO()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
                </label>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-[#595552]">Reason</legend>
                {REASONS.map((reason) => (
                  <label key={reason.value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${form.reason === reason.value ? 'border-[#323232] bg-[#F7F3EE]' : 'border-[#C8BCB4]'}`}>
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={form.reason === reason.value}
                      onChange={() => setForm({ ...form, reason: reason.value })}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-[#323232]">{reason.label}</span>
                      <span className="block text-xs text-[#8E827A]">{reason.hint}</span>
                    </span>
                  </label>
                ))}
              </fieldset>

              <label className="block text-sm font-medium text-[#595552]">Notes (optional)
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="e.g. Slab 4 casting" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setForm({ ...emptyForm })} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Reset</button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1E1E1E]">
                  <ArrowUpFromLine size={16} /> Record Stock OUT
                </button>
              </div>
            </form>
          </section>

          <div className="space-y-6">
            {form.projectId && (
              <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-semibold text-[#323232]"><PackageCheck size={18} /> Available at this site</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {projectBalances.map(({ material, balance: qty }) => (
                    <span key={material.id} className="rounded-full border border-[#E8DCD4] bg-[#F7F3EE] px-3 py-1.5 text-xs text-[#595552]">
                      {material.name}: <span className="font-semibold text-[#323232]">{formatQty(qty)} {material.unit}</span>
                    </span>
                  ))}
                  {projectBalances.length === 0 && (
                    <p className="text-sm text-[#8E827A]">No stock available at this site yet. Record a Stock IN first.</p>
                  )}
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
              <div className="border-b border-[#E8DCD4] p-5">
                <h2 className="font-semibold text-[#323232]">Recent Stock OUT</h2>
                <p className="mt-1 text-xs text-[#8E827A]">Latest {recentOut.length} issues across projects</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                    <tr>
                      <th className="px-5 py-4 font-medium">Date</th>
                      <th className="px-5 py-4 font-medium">Project</th>
                      <th className="px-5 py-4 font-medium">Material</th>
                      <th className="px-5 py-4 font-medium">Qty</th>
                      <th className="px-5 py-4 font-medium">Reason</th>
                      <th className="px-5 py-4 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DCD4]">
                    {recentOut.map((tx) => (
                      <tr key={tx.id} className={`hover:bg-[#F7F3EE]/60 ${tx.voided ? 'opacity-50' : ''}`}>
                        <td className="px-5 py-4 text-sm text-[#595552]">{formatDate(tx.date)}</td>
                        <td className="px-5 py-4 text-sm text-[#595552]">{tx.projectCode}</td>
                        <td className="px-5 py-4 text-sm font-medium text-[#323232]">
                          <span className={tx.voided ? 'line-through' : ''}>{tx.materialName}</span>
                          {tx.notes && <span className="block text-xs font-normal text-[#8E827A]">{tx.notes}</span>}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#595552]">−{formatQty(tx.quantity)} {tx.materialUnit}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tx.reason === 'USED' ? 'bg-[#E8EFE5] text-[#617858]' : 'bg-[#F8ECEA] text-[#9B625A]'}`}>
                            {tx.reason}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {tx.voided ? (
                              <span className="rounded-full bg-[#F8ECEA] px-2.5 py-1 text-xs font-medium text-[#9B625A]" title={tx.voidReason}>Void</span>
                            ) : (
                              <>
                                <span className="rounded-full bg-[#E8EFE5] px-2.5 py-1 text-xs font-medium text-[#617858]">Active</span>
                                <button onClick={() => { setVoidTarget(tx); setVoidReason('') }} title="Void entry" className="rounded-lg p-2 text-[#9B625A] hover:bg-[#F8ECEA]"><Ban size={15} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {recentOut.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8E827A]">No stock OUT entries yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      {voidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form onSubmit={confirmVoid} className="my-6 w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#323232]">Void Stock OUT Entry</h2>
                <p className="mt-1 text-sm text-[#8E827A]">{voidTarget.id} · {formatQty(voidTarget.quantity)} {voidTarget.materialUnit} {voidTarget.materialName} · {voidTarget.projectCode}</p>
              </div>
              <button type="button" onClick={() => setVoidTarget(null)} className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]"><X size={19} /></button>
            </div>
            <p className="rounded-xl bg-[#F5EDE1] px-4 py-3 text-xs text-[#9A7950]">
              Voiding returns the quantity to the available balance. Admin can void anytime; PM entries only within 48 hours.
            </p>
            <label className="block text-sm font-medium text-[#595552]">Reason (required)
              <input required value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="e.g. Wrong quantity entered" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setVoidTarget(null)} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Cancel</button>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#9B625A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#84504A]"><Ban size={15} /> Void Entry</button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  )
}
