import { useEffect, useMemo, useState } from 'react'
import {
  ClipboardCheck, Plus, Search, Pencil, Trash2, X, IndianRupee, TrendingUp,
} from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import type { Material, MaterialPlan } from '../types/material'
import {
  getStoredMaterials,
  getStoredPlans,
  getProjectProgress,
  setProjectProgress,
  removePlan,
  upsertPlan,
} from '../data/materialStore'
import { formatINR, formatQty } from '../../stock/data/stockStore'

type Project = {
  id: number
  code: string
  name: string
  location: string
  manager: string
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
}

const emptyForm = {
  materialId: '',
  plannedQty: '',
  plannedRate: '',
  lowStockThreshold: '',
  wastageThreshold: '',
}

export function MaterialPlanningPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [materials] = useState<Material[]>(() => getStoredMaterials())
  const [plans, setPlans] = useState<MaterialPlan[]>(() => getStoredPlans())
  const [progress, setProgress] = useState(0)
  const [progressInput, setProgressInput] = useState('0')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<MaterialPlan | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('forgeos_projects')
      const parsed: Project[] = saved ? JSON.parse(saved) : []
      setProjects(parsed)
      if (parsed.length > 0 && parsed.some((p) => String(p.id) === selectedProjectId) === false) {
        setSelectedProjectId(String(parsed[0].id))
      }
    } catch {
      setProjects([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedProjectId) return
    const value = getProjectProgress(selectedProjectId)
    setProgress(value)
    setProgressInput(String(value))
  }, [selectedProjectId])

  const selectedProject = projects.find((p) => String(p.id) === selectedProjectId)

  const projectPlans = useMemo(
    () => plans
      .filter((plan) => plan.projectId === selectedProjectId)
      .sort((a, b) => {
        const ma = materials.find((m) => m.id === a.materialId)?.name ?? ''
        const mb = materials.find((m) => m.id === b.materialId)?.name ?? ''
        return ma.localeCompare(mb)
      }),
    [plans, selectedProjectId, materials]
  )

  const filteredPlans = useMemo(() => projectPlans.filter((plan) => {
    const material = materials.find((m) => m.id === plan.materialId)
    return `${material?.name ?? plan.materialId}`.toLowerCase().includes(search.toLowerCase())
  }), [projectPlans, materials, search])

  const plannedValue = useMemo(() => projectPlans.reduce((total, plan) => (
    total + plan.plannedQty * (plan.plannedRate ?? 0)
  ), 0), [projectPlans])

  const saveProgress = () => {
    const value = Number(progressInput)
    if (Number.isNaN(value) || value < 0 || value > 100) return
    setProjectProgress(selectedProjectId, value)
    setProgress(value)
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm, materialId: '' })
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (plan: MaterialPlan) => {
    setEditing(plan)
    setForm({
      materialId: plan.materialId,
      plannedQty: String(plan.plannedQty),
      plannedRate: plan.plannedRate != null ? String(plan.plannedRate) : '',
      lowStockThreshold: plan.lowStockThreshold != null ? String(plan.lowStockThreshold) : '',
      wastageThreshold: plan.wastageThreshold != null ? String(plan.wastageThreshold) : '',
    })
    setFormError('')
    setShowForm(true)
  }

  const savePlan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    const plannedQty = Number(form.plannedQty)
    if (!Number.isFinite(plannedQty) || plannedQty <= 0) {
      setFormError('Planned quantity must be greater than 0.')
      return
    }
    if (!editing && projectPlans.some((p) => p.materialId === form.materialId)) {
      setFormError('This material is already planned for the project. Edit the existing row instead.')
      return
    }

    const saved = upsertPlan(selectedProjectId, form.materialId, {
      plannedQty,
      plannedRate: form.plannedRate.trim() ? Number(form.plannedRate) : undefined,
      lowStockThreshold: form.lowStockThreshold.trim() ? Number(form.lowStockThreshold) : undefined,
      wastageThreshold: form.wastageThreshold.trim() ? Number(form.wastageThreshold) : undefined,
    })
    setPlans(getStoredPlans())
    void saved
    setShowForm(false)
  }

  const deletePlan = (plan: MaterialPlan) => {
    const material = materials.find((m) => m.id === plan.materialId)
    if (window.confirm(`Remove "${material?.name ?? plan.materialId}" from this project's plan?`)) {
      removePlan(plan.id)
      setPlans(getStoredPlans())
    }
  }

  const stats = [
    { label: 'Materials Planned', value: projectPlans.length, icon: ClipboardCheck },
    { label: 'Planned Value', value: plannedValue > 0 ? formatINR(plannedValue) : '—', icon: IndianRupee },
    { label: 'Site Progress', value: `${progress}%`, icon: TrendingUp },
  ]

  return (
    <AppShell currentPath="/app/material-planning">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm text-[#8E827A]">Workspace / Materials / Planning</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Project Material Planning</h1>
            <p className="mt-2 text-sm text-[#8E827A]">Plan material quantities, rates and thresholds per project. Plans drive stock and wastage tracking.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm text-[#595552] outline-none">
              {projects.length === 0 && <option value="">No projects found</option>}
              {projects.map((project) => (
                <option key={project.id} value={String(project.id)}>
                  {project.code} — {project.name}
                </option>
              ))}
            </select>
            <button onClick={openAdd} disabled={!selectedProjectId} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-medium text-white hover:bg-[#1E1E1E] disabled:opacity-50">
              <Plus size={17} /> Plan Material
            </button>
          </div>
        </section>

        {selectedProject && (
          <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#C8BCB4]/70 bg-[#E8DCD4] p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-[#323232]">{selectedProject.code} · {selectedProject.name}</h2>
              <p className="mt-1 text-xs text-[#595552]">{selectedProject.location} · PM: {selectedProject.manager} · Status: {selectedProject.status}</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-3">
              <label className="text-sm font-medium text-[#595552]">Site progress %
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressInput}
                  onChange={(e) => setProgressInput(e.target.value)}
                  onBlur={saveProgress}
                  className="ml-3 w-20 rounded-lg border border-[#C8BCB4] px-3 py-2 font-normal outline-none"
                />
              </label>
              <span className="text-xs text-[#8E827A]">Used as the wastage baseline<br />(expected = planned × progress%)</span>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8E827A]">{stat.label}</p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#323232]">{stat.value}</h2>
                  </div>
                  <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div>
                </div>
              </div>
            )
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-[#323232]">Planned Materials</h2>
              <p className="mt-1 text-xs text-[#8E827A]">{filteredPlans.length} materials planned for this project</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2">
              <Search size={17} className="text-[#8E827A]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search planned material..." className="w-full bg-transparent text-sm outline-none sm:w-52" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                <tr>
                  <th className="px-5 py-4 font-medium">Material</th>
                  <th className="px-5 py-4 font-medium">Planned Qty</th>
                  <th className="px-5 py-4 font-medium">Planned Rate</th>
                  <th className="px-5 py-4 font-medium">Planned Value</th>
                  <th className="px-5 py-4 font-medium">Low-Stock Alert At</th>
                  <th className="px-5 py-4 font-medium">Wastage Limit</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCD4]">
                {filteredPlans.map((plan) => {
                  const material = materials.find((m) => m.id === plan.materialId)
                  return (
                    <tr key={plan.id} className="hover:bg-[#F7F3EE]/60">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#323232]">{material?.name ?? plan.materialId}</p>
                        <p className="mt-1 text-xs text-[#8E827A]">{material?.category ?? ''}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#595552]">{formatQty(plan.plannedQty)} {material?.unit ?? ''}</td>
                      <td className="px-5 py-4 text-sm text-[#595552]">{plan.plannedRate != null ? formatINR(plan.plannedRate) : '—'}</td>
                      <td className="px-5 py-4 text-sm text-[#595552]">{plan.plannedRate != null ? formatINR(plan.plannedQty * plan.plannedRate) : '—'}</td>
                      <td className="px-5 py-4 text-sm text-[#595552]">
                        {plan.lowStockThreshold != null ? `${formatQty(plan.lowStockThreshold)} ${material?.unit ?? ''}` : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[#F5EDE1] px-2.5 py-1 text-xs font-medium text-[#9A7950]">
                          {plan.wastageThreshold != null ? `${plan.wastageThreshold}%` : '10% default'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(plan)} title="Edit plan" className="rounded-lg p-2 text-[#595552] hover:bg-[#F7F3EE]"><Pencil size={16} /></button>
                          <button onClick={() => deletePlan(plan)} title="Remove plan" className="rounded-lg p-2 text-[#9B625A] hover:bg-[#F8ECEA]"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredPlans.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8E827A]">No materials planned for this project yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form onSubmit={savePlan} className="my-6 w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#323232]">{editing ? 'Edit Planned Material' : 'Plan a Material'}</h2>
                <p className="mt-1 text-sm text-[#8E827A]">{selectedProject?.code} — {selectedProject?.name}</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]"><X size={19} /></button>
            </div>

            {formError && (
              <p className="rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]">{formError}</p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#595552] sm:col-span-2">Material
                <select
                  required
                  value={form.materialId}
                  onChange={(e) => setForm({ ...form, materialId: e.target.value })}
                  disabled={editing != null}
                  className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal outline-none disabled:bg-[#F7F3EE]"
                >
                  <option value="" disabled>Select material</option>
                  {materials
                    .filter((m) => m.status === 'Active')
                    .filter((m) => editing != null || !projectPlans.some((p) => p.materialId === m.id))
                    .map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                    ))}
                </select>
              </label>
              <label className="text-sm font-medium text-[#595552]">Planned Quantity
                <input required type="number" min="0.01" step="0.01" value={form.plannedQty} onChange={(e) => setForm({ ...form, plannedQty: e.target.value })} placeholder="e.g. 8000" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <label className="text-sm font-medium text-[#595552]">Planned Rate (₹ per unit, optional)
                <input type="number" min="0" step="0.01" value={form.plannedRate} onChange={(e) => setForm({ ...form, plannedRate: e.target.value })} placeholder="e.g. 395" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <label className="text-sm font-medium text-[#595552]">Low-Stock Alert At (qty, optional)
                <input type="number" min="0" step="0.01" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} placeholder="e.g. 800" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <label className="text-sm font-medium text-[#595552]">Wastage Limit (%, optional)
                <input type="number" min="0" max="100" step="0.5" value={form.wastageThreshold} onChange={(e) => setForm({ ...form, wastageThreshold: e.target.value })} placeholder="Default 10%" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Cancel</button>
              <button type="submit" className="rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white">{editing ? 'Save Changes' : 'Add to Plan'}</button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  )
}
