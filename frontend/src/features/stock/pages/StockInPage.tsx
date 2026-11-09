import { useEffect, useMemo, useState } from 'react'
import { ArrowDownToLine, X, Ban } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { getCurrentUser, isAdmin } from '../../authentication/utils/permissions'
import type { Material } from '../../materials/types/material'
import { getStoredMaterials } from '../../materials/data/materialStore'
import { getStoredVendors } from '../../vendors/data/vendorStore'
import type { StockTransaction } from '../types/stock'
import {
  addStockIn,
  formatDate,
  formatINR,
  formatQty,
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

const emptyForm = {
  projectId: '',
  materialId: '',
  quantity: '',
  date: '',
  vendorName: '',
  challanNumber: '',
  rate: '',
  billReference: '',
  notes: '',
}

export function StockInPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [materials] = useState<Material[]>(() => getStoredMaterials())
  const [vendors, setVendors] = useState<string[]>([])
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
    setVendors(getStoredVendors().map((vendor) => vendor.name))
  }, [])

  const selectedMaterial = materials.find((m) => m.id === form.materialId)

  const recentIn = useMemo(
    () => transactions.filter((tx) => tx.type === 'IN').slice(0, 10),
    [transactions]
  )

  const submitStockIn = (event: React.FormEvent<HTMLFormElement>) => {
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
      setFeedback({ type: 'error', message: 'Please pick a delivery date.' })
      return
    }
    if (form.date > todayISO()) {
      setFeedback({ type: 'error', message: 'Date cannot be in the future.' })
      return
    }

    const user = getCurrentUser()
    const recordedBy = `${user?.name ?? 'User'} (${isAdmin() ? 'Admin' : 'PM'})`

    addStockIn({
      projectId: String(project.id),
      projectCode: project.code,
      projectName: project.name,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      materialUnit: selectedMaterial.unit,
      quantity,
      date: form.date,
      vendorName: form.vendorName || undefined,
      challanNumber: form.challanNumber || undefined,
      rate: form.rate.trim() ? Number(form.rate) : undefined,
      billReference: form.billReference || undefined,
      notes: form.notes || undefined,
      recordedBy,
    })

    setTransactions(getStoredStockTransactions())
    setForm({ ...emptyForm, projectId: form.projectId })
    setFeedback({
      type: 'success',
      message: `Recorded Stock IN of ${formatQty(quantity)} ${selectedMaterial.unit} ${selectedMaterial.name} for ${project.code}.`,
    })
  }

  const confirmVoid = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!voidTarget) return
    const result = voidStockTransaction(voidTarget.id, voidReason, isAdmin())
    if (result.ok) {
      setTransactions(getStoredStockTransactions())
      setVoidTarget(null)
      setVoidReason('')
      setFeedback({ type: 'success', message: `Entry ${voidTarget.id} has been voided.` })
    } else {
      setVoidTarget(null)
      setVoidReason('')
      setFeedback({ type: 'error', message: result.error })
    }
  }

  return (
    <AppShell currentPath="/app/stock-in">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[#8E827A]">Workspace / Stock / IN</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Record Stock IN</h1>
            <p className="mt-2 text-sm text-[#8E827A]">Log material deliveries into a project site with vendor and challan details.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E8EFE5] px-4 py-2 text-sm font-medium text-[#617858]">
            <ArrowDownToLine size={16} /> Stock received
          </span>
        </section>

        {feedback && (
          <p className={`rounded-xl px-4 py-3 text-sm ${feedback.type === 'success' ? 'bg-[#E8EFE5] text-[#617858]' : 'bg-[#F8ECEA] text-[#9B625A]'}`}>
            {feedback.message}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.35fr]">
          <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#323232]">Delivery Details</h2>
            <p className="mt-1 text-xs text-[#8E827A]">Fields marked optional can be left blank.</p>
            <form onSubmit={submitStockIn} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-[#595552]">Project
                <select required value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal outline-none">
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
                    <option key={material.id} value={material.id}>{material.name} ({material.unit})</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-medium text-[#595552]">Quantity {selectedMaterial ? `(${selectedMaterial.unit})` : ''}
                  <input required type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 500" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
                </label>
                <label className="text-sm font-medium text-[#595552]">Delivery Date
                  <input required type="date" max={todayISO()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
                </label>
              </div>

              <label className="block text-sm font-medium text-[#595552]">Vendor (optional)
                <select value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal outline-none">
                  <option value="">— Not linked —</option>
                  {vendors.map((name) => <option key={name}>{name}</option>)}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-medium text-[#595552]">Challan No. (optional)
                  <input value={form.challanNumber} onChange={(e) => setForm({ ...form, challanNumber: e.target.value })} placeholder="e.g. CH-8821" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
                </label>
                <label className="text-sm font-medium text-[#595552]">Rate ₹/unit (optional)
                  <input type="number" min="0" step="0.01" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="e.g. 395" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
                </label>
              </div>

              <label className="block text-sm font-medium text-[#595552]">Linked Bill No. (optional)
                <input value={form.billReference} onChange={(e) => setForm({ ...form, billReference: e.target.value })} placeholder="e.g. BILL-001" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>

              <label className="block text-sm font-medium text-[#595552]">Notes (optional)
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Delivery remarks" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setForm({ ...emptyForm })} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Reset</button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1E1E1E]">
                  <ArrowDownToLine size={16} /> Record Stock IN
                </button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
            <div className="border-b border-[#E8DCD4] p-5">
              <h2 className="font-semibold text-[#323232]">Recent Stock IN</h2>
              <p className="mt-1 text-xs text-[#8E827A]">Latest {recentIn.length} deliveries across projects</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                  <tr>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Project</th>
                    <th className="px-5 py-4 font-medium">Material</th>
                    <th className="px-5 py-4 font-medium">Qty</th>
                    <th className="px-5 py-4 font-medium">Vendor / Challan</th>
                    <th className="px-5 py-4 font-medium">Value</th>
                    <th className="px-5 py-4 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCD4]">
                  {recentIn.map((tx) => (
                    <tr key={tx.id} className={`hover:bg-[#F7F3EE]/60 ${tx.voided ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-4 text-sm text-[#595552]">{formatDate(tx.date)}</td>
                      <td className="px-5 py-4 text-sm text-[#595552]">{tx.projectCode}</td>
                      <td className="px-5 py-4 text-sm font-medium text-[#323232] line-through-offset-2">
                        <span className={tx.voided ? 'line-through' : ''}>{tx.materialName}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#595552]">+{formatQty(tx.quantity)} {tx.materialUnit}</td>
                      <td className="px-5 py-4 text-sm text-[#595552]">{tx.vendorName ?? '—'}{tx.challanNumber ? ` · ${tx.challanNumber}` : ''}</td>
                      <td className="px-5 py-4 text-sm text-[#595552]">{tx.rate != null ? formatINR(tx.quantity * tx.rate) : '—'}</td>
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
                  {recentIn.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8E827A]">No stock IN entries yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {voidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form onSubmit={confirmVoid} className="my-6 w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#323232]">Void Stock IN Entry</h2>
                <p className="mt-1 text-sm text-[#8E827A]">{voidTarget.id} · {formatQty(voidTarget.quantity)} {voidTarget.materialUnit} {voidTarget.materialName} · {voidTarget.projectCode}</p>
              </div>
              <button type="button" onClick={() => setVoidTarget(null)} className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]"><X size={19} /></button>
            </div>
            <p className="rounded-xl bg-[#F5EDE1] px-4 py-3 text-xs text-[#9A7950]">
              Voiding keeps the row for audit but removes it from stock balances. Admin can void anytime; PM entries only within 48 hours.
            </p>
            <label className="block text-sm font-medium text-[#595552]">Reason (required)
              <input required value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="e.g. Duplicate challan entry" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
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
