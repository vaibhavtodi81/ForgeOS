import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ClipboardCheck, Search, RefreshCw, PackageSearch, Plus, Pencil, Trash2, CheckCircle2, Archive, X } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { useProjects } from '../../projects/useProjects'
import { useAuth } from '../../authentication/auth/useAuth'
import { ApiError } from '../../../lib/api'
import { fetchMaterials, fetchProjectInventory, type ApiMaterial, type InventoryRow } from '../../stock/data/inventoryApi'
import {
  createMaterialPlan,
  deleteMaterialPlan,
  fetchProjectMaterialPlans,
  updateMaterialPlan,
  type MaterialPlanInput,
  type MaterialPlanRow,
  type PlanStatus,
} from '../data/materialPlansApi'
import { formatQty } from '../../stock/data/formatting'

const statusStyles: Record<PlanStatus, string> = {
  DRAFT: 'bg-[#F5EDE1] text-[#9A7950]',
  APPROVED: 'bg-[#E8EFE5] text-[#617858]',
  ARCHIVED: 'bg-[#F7F3EE] text-[#8E827A]',
}

const emptyForm = { materialId: '', openingQuantity: '0', plannedQuantity: '', plannedUnitRate: '', lowStockThreshold: '', wastageThresholdPct: '', notes: '' }

interface PlanSnapshot {
  key: string
  plans: MaterialPlanRow[]
  inventory: InventoryRow[]
}

export function MaterialPlanningPage() {
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN' || user?.role === 'PM'
  const [catalogue, setCatalogue] = useState<ApiMaterial[]>([])
  const [catalogueError, setCatalogueError] = useState<string | null>(null)
  const [catalogueRetry, setCatalogueRetry] = useState(0)
  const [snapshot, setSnapshot] = useState<PlanSnapshot | null>(null)
  const [settledKey, setSettledKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MaterialPlanRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const requestKey = selectedProjectId ? `${selectedProjectId}#${retry}` : ''
  const current = snapshot?.key === requestKey ? snapshot : null
  const loading = requestKey !== '' && settledKey !== requestKey
  const plans = current?.plans ?? []
  const inventory = current?.inventory ?? []

  useEffect(() => {
    const controller = new AbortController()
    fetchMaterials(controller.signal).then((rows) => {
      if (!controller.signal.aborted) {
        setCatalogue(rows)
        setCatalogueError(null)
      }
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) {
        setCatalogue([])
        setCatalogueError(cause instanceof Error ? cause.message : 'Unable to load the materials catalogue.')
      }
    })
    return () => controller.abort()
  }, [catalogueRetry])

  useEffect(() => {
    if (!selectedProjectId) return
    const controller = new AbortController()
    Promise.all([
      fetchProjectMaterialPlans(selectedProjectId, controller.signal),
      fetchProjectInventory(selectedProjectId, controller.signal),
    ]).then(([planRows, inventoryRows]) => {
      if (!controller.signal.aborted) {
        setSnapshot({ key: requestKey, plans: planRows, inventory: inventoryRows })
        setError(null)
        setSettledKey(requestKey)
      }
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : 'Unable to load project material plans.')
        setSettledKey(requestKey)
      }
    })
    return () => controller.abort()
  }, [selectedProjectId, requestKey])

  const inventoryByMaterial = useMemo(() => new Map(inventory.map((row) => [row.materialId, row])), [inventory])
  const plannedMaterialIds = useMemo(() => new Set(plans.map((plan) => plan.materialId)), [plans])
  const addableMaterials = useMemo(() => catalogue.filter((material) => material.isActive && !plannedMaterialIds.has(material.id)), [catalogue, plannedMaterialIds])
  const filtered = useMemo(() => plans.filter((plan) => plan.material.name.toLowerCase().includes(search.toLowerCase())), [plans, search])
  const lowStock = inventory.filter((row) => row.isLowStock).length
  const draftCount = plans.filter((plan) => plan.status === 'DRAFT').length

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm, materialId: addableMaterials[0]?.id ?? '' })
    setFormError('')
    setSuccess('')
    setFormOpen(true)
  }

  const openEdit = (plan: MaterialPlanRow) => {
    setEditing(plan)
    setForm({
      materialId: plan.materialId,
      openingQuantity: String(plan.openingQuantity),
      plannedQuantity: String(plan.plannedQuantity),
      plannedUnitRate: plan.plannedUnitRate == null ? '' : String(plan.plannedUnitRate),
      lowStockThreshold: plan.lowStockThreshold == null ? '' : String(plan.lowStockThreshold),
      wastageThresholdPct: plan.wastageThresholdPct == null ? '' : String(plan.wastageThresholdPct),
      notes: plan.notes ?? '',
    })
    setFormError('')
    setSuccess('')
    setFormOpen(true)
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const plannedQuantity = Number(form.plannedQuantity)
    const openingQuantity = Number(form.openingQuantity)
    if (!(plannedQuantity > 0)) {
      setFormError('Planned quantity must be greater than zero.')
      return
    }
    if (!(openingQuantity >= 0)) {
      setFormError('Opening quantity must be zero or more.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const numericFields = {
        openingQuantity,
        plannedQuantity,
        ...(form.plannedUnitRate ? { plannedUnitRate: Number(form.plannedUnitRate) } : { plannedUnitRate: null }),
        ...(form.lowStockThreshold ? { lowStockThreshold: Number(form.lowStockThreshold) } : { lowStockThreshold: null }),
        ...(form.wastageThresholdPct ? { wastageThresholdPct: Number(form.wastageThresholdPct) } : { wastageThresholdPct: null }),
        notes: form.notes.trim() || null,
      }
      if (editing) {
        await updateMaterialPlan(editing.id, numericFields)
        setSuccess(`Plan updated for ${editing.material.name}.`)
      } else {
        if (!form.materialId) {
          setFormError('Select a material to plan.')
          setSaving(false)
          return
        }
        if (!selectedProjectId) {
          setFormError('Select a project first.')
          setSaving(false)
          return
        }
        const input: MaterialPlanInput = { projectId: selectedProjectId, materialId: form.materialId, ...numericFields }
        const created = await createMaterialPlan(input)
        setSuccess(`Plan created for ${created.material.name}.`)
      }
      setFormOpen(false)
      setRetry((value) => value + 1)
    } catch (cause) {
      setFormError(cause instanceof ApiError ? cause.message : 'Unable to save this plan.')
    } finally {
      setSaving(false)
    }
  }

  const runAction = async (plan: MaterialPlanRow, run: () => Promise<unknown>, message: string) => {
    setBusyId(plan.id)
    setActionError(null)
    setSuccess('')
    try {
      await run()
      setSuccess(message)
      setRetry((value) => value + 1)
    } catch (cause) {
      setActionError(cause instanceof ApiError ? cause.message : 'Unable to update this plan.')
    } finally {
      setBusyId(null)
    }
  }

  const removePlan = async (plan: MaterialPlanRow) => {
    if (!window.confirm(`Delete the plan for ${plan.material.name}? Only draft plans can be deleted.`)) return
    await runAction(plan, () => deleteMaterialPlan(plan.id), `Plan deleted for ${plan.material.name}.`)
  }

  const selectedMaterialName = editing
    ? `${editing.material.name} (${editing.material.unit})`
    : addableMaterials.find((material) => material.id === form.materialId)?.name

  return <AppShell currentPath="/app/material-planning">
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div><p className="text-sm text-[#8E827A]">Workspace / Materials / Planning</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Project Material Planning</h1><p className="mt-2 text-sm text-[#8E827A]">Plan material quantities per project and track live stock against them.</p></div>
        <div className="flex flex-wrap gap-3">
          <select aria-label="Select project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || projects.length === 0} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm text-[#595552]">
            {projects.length === 0 && <option value="">No accessible projects</option>}
            {projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}
          </select>
          {catalogueError && <div role="alert" className="flex items-center gap-3 rounded-xl border border-[#E8C7BD] bg-white px-4 py-2.5 text-sm text-[#8A5143]">{catalogueError}<button type="button" onClick={() => setCatalogueRetry((n) => n + 1)} className="font-semibold underline">Retry</button></div>}
          {canManage && <button type="button" onClick={openAdd} disabled={!selectedProjectId || catalogue.length === 0} title={catalogue.length === 0 ? 'No materials available to plan' : undefined} className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"><Plus size={17} />Add plan</button>}
        </div>
      </section>

      {projectsError && <ErrorBanner message={projectsError} retry={retryProjects} />}
      {error && <ErrorBanner message={error} retry={() => setRetry((value) => value + 1)} />}
      {actionError && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{actionError}</span><button type="button" onClick={() => setActionError(null)} className="font-semibold underline">Dismiss</button></div>}
      {success && <p role="status" className="rounded-xl bg-[#E8EFE5] px-4 py-3 text-sm text-[#617858]">{success}</p>}
      {selectedProject && <section className="rounded-2xl border border-[#C8BCB4]/70 bg-[#E8DCD4] p-5">
        <h2 className="font-semibold text-[#323232]">{selectedProject.code} · {selectedProject.name}</h2>
        <p className="mt-1 text-xs text-[#595552]">{selectedProject.location} · {selectedProject.status.replace('_', ' ')}</p>
        <p className="mt-3 text-sm text-[#595552]">Plans start as drafts. Approve a draft to lock it into project reporting, archive an approved plan to retire it; only drafts can be deleted.</p>
      </section>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Materials Planned" value={loading ? '—' : plans.length} icon={<ClipboardCheck size={20} />} />
        <Stat label="Draft Plans" value={loading ? '—' : draftCount} icon={<PackageSearch size={20} />} />
        <Stat label="Low Stock Items" value={loading ? '—' : lowStock} icon={<PackageSearch size={20} />} />
        <Stat label="Unplanned Materials" value={loading ? '—' : addableMaterials.length} icon={<ClipboardCheck size={20} />} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center">
          <div><h2 className="font-semibold text-[#323232]">Planned Materials & Inventory</h2><p className="mt-1 text-xs text-[#8E827A]">{filtered.length} materials in this project plan</p></div>
          <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2"><Search size={17} className="text-[#8E827A]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search material..." className="w-full bg-transparent text-sm outline-none sm:w-52" /></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1200px] text-left">
          <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Planned</th><th className="px-5 py-4 font-medium">Unit Rate</th><th className="px-5 py-4 font-medium">Opening</th><th className="px-5 py-4 font-medium">Available</th><th className="px-5 py-4 font-medium">Low-stock Threshold</th><th className="px-5 py-4 font-medium">Wastage %</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4 text-right font-medium">Actions</th></tr></thead>
          <tbody className="divide-y divide-[#E8DCD4]">
            {filtered.map((plan) => {
              const stock = inventoryByMaterial.get(plan.materialId)
              return <tr key={plan.id} className={`hover:bg-[#F7F3EE]/60 ${plan.status === 'ARCHIVED' ? 'opacity-60' : ''}`}>
                <td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{plan.material.name}</p><p className="mt-1 text-xs text-[#8E827A]">{plan.material.category.replaceAll('_', ' ')}</p>{plan.notes && <p className="mt-1 max-w-xs text-xs text-[#8E827A]">{plan.notes}</p>}</td>
                <td className="px-5 py-4 text-sm">{formatQty(plan.plannedQuantity)} {plan.material.unit}</td>
                <td className="px-5 py-4 text-sm">{plan.plannedUnitRate == null ? '—' : `₹${plan.plannedUnitRate.toLocaleString('en-IN')}`}</td>
                <td className="px-5 py-4 text-sm">{formatQty(plan.openingQuantity)} {plan.material.unit}</td>
                <td className="px-5 py-4 text-sm font-semibold">{stock ? formatQty(stock.availableStock) : '—'} {plan.material.unit}{stock && <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${stock.isLowStock ? 'bg-[#F8ECEA] text-[#9B625A]' : 'bg-[#E8EFE5] text-[#617858]'}`}>{stock.isLowStock ? 'Low stock' : 'Healthy'}</span>}</td>
                <td className="px-5 py-4 text-sm">{plan.lowStockThreshold == null ? '—' : `${formatQty(plan.lowStockThreshold)} ${plan.material.unit}`}</td>
                <td className="px-5 py-4 text-sm">{plan.wastageThresholdPct == null ? '—' : `${plan.wastageThresholdPct}%`}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[plan.status]}`}>{plan.status.charAt(0)}{plan.status.slice(1).toLowerCase()}</span></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    {canManage && plan.status !== 'ARCHIVED' && <button type="button" onClick={() => openEdit(plan)} title={`Edit ${plan.material.name} plan`} className="rounded-lg p-2 text-[#595552] hover:bg-[#F7F3EE]"><Pencil size={16} /></button>}
                    {canManage && plan.status === 'DRAFT' && <button type="button" disabled={busyId === plan.id} onClick={() => void runAction(plan, () => updateMaterialPlan(plan.id, { status: 'APPROVED' }), `Plan approved for ${plan.material.name}.`)} title="Approve plan" className="rounded-lg p-2 text-[#617858] hover:bg-[#E8EFE5] disabled:opacity-50"><CheckCircle2 size={16} /></button>}
                    {canManage && plan.status === 'APPROVED' && <button type="button" disabled={busyId === plan.id} onClick={() => void runAction(plan, () => updateMaterialPlan(plan.id, { status: 'ARCHIVED' }), `Plan archived for ${plan.material.name}.`)} title="Archive plan" className="rounded-lg p-2 text-[#9A7950] hover:bg-[#F5EDE1] disabled:opacity-50"><Archive size={16} /></button>}
                    {canManage && plan.status === 'DRAFT' && <button type="button" disabled={busyId === plan.id} onClick={() => void removePlan(plan)} title="Delete draft plan" className="rounded-lg p-2 text-[#9B625A] hover:bg-[#F8ECEA] disabled:opacity-50"><Trash2 size={16} /></button>}
                    {!canManage && <span className="px-2 py-1 text-xs text-[#8E827A]">View only</span>}
                  </div>
                </td>
              </tr>
            })}
            {loading && <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading project plans…</td></tr>}
            {!loading && !error && filtered.length === 0 && <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-[#8E827A]">No material plans returned for this project.</td></tr>}
          </tbody>
        </table></div>
      </section>
    </div>

    {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form onSubmit={(event) => void save(event)} className="my-6 w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold text-[#323232]">{editing ? 'Edit Material Plan' : 'Add Material Plan'}</h2><p className="mt-1 text-sm text-[#8E827A]">{selectedProject ? `${selectedProject.code} · ${selectedProject.name}` : 'Select a project to plan materials.'}</p></div><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]"><X size={19} /></button></div>
        {formError && <p role="alert" className="rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]">{formError}</p>}
        <label className="block text-sm font-medium text-[#595552]">Material{editing ? <input disabled value={selectedMaterialName ?? ''} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-[#F7F3EE] px-4 py-3 font-normal text-[#8E827A]" /> : <><select required value={form.materialId} onChange={(event) => setForm({ ...form, materialId: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal"><option value="">Select material</option>{addableMaterials.map((material) => <option key={material.id} value={material.id}>{material.name} ({material.unit})</option>)}</select>{addableMaterials.length === 0 && <span className="mt-1 block text-xs font-normal text-[#9A7950]">Every active material already has a plan on this project.</span>}</>}</label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[#595552]">Opening Quantity (≥ 0)<input required type="number" min="0" step="0.001" value={form.openingQuantity} onChange={(event) => setForm({ ...form, openingQuantity: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
          <label className="text-sm font-medium text-[#595552]">Planned Quantity (&gt; 0)<input required type="number" min="0.001" step="0.001" value={form.plannedQuantity} onChange={(event) => setForm({ ...form, plannedQuantity: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
          <label className="text-sm font-medium text-[#595552]">Planned Unit Rate (optional)<input type="number" min="0" step="0.01" value={form.plannedUnitRate} onChange={(event) => setForm({ ...form, plannedUnitRate: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
          <label className="text-sm font-medium text-[#595552]">Low-stock Threshold (optional)<input type="number" min="0" step="0.001" value={form.lowStockThreshold} onChange={(event) => setForm({ ...form, lowStockThreshold: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
          <label className="text-sm font-medium text-[#595552]">Wastage Threshold % (0–100, optional)<input type="number" min="0" max="100" step="0.1" value={form.wastageThresholdPct} onChange={(event) => setForm({ ...form, wastageThresholdPct: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
        </div>
        <label className="block text-sm font-medium text-[#595552]">Notes (optional)<textarea maxLength={1000} rows={2} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
        <div className="flex justify-end gap-3"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Cancel</button><button disabled={saving || (!editing && !form.materialId)} type="submit" className="rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Plan'}</button></div>
      </form>
    </div>}
  </AppShell>
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return <div className="flex items-center justify-between rounded-2xl border border-[#C8BCB4]/70 bg-white p-5"><div><p className="text-sm text-[#8E827A]">{label}</p><p className="mt-2 text-2xl font-semibold text-[#323232]">{value}</p></div><div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">{icon}</div></div>
}

function ErrorBanner({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{message}</span><button type="button" onClick={retry} className="inline-flex items-center gap-1 font-semibold underline"><RefreshCw size={14} />Retry</button></div>
}
