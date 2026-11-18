import { useEffect, useState, type FormEvent } from 'react'
import { AlertCircle, Flag, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { ApiError } from '../../../lib/api'
import { useAuth } from '../../authentication/auth/useAuth'
import {
  createProjectMilestone,
  deleteProjectMilestone,
  fetchProjectMilestones,
  updateProjectMilestone,
  type MilestoneInput,
  type MilestoneStatus,
  type ProjectMilestone,
} from '../../daily-logs/data/projectReportingApi'

interface ProjectMilestonesProps {
  projectId: string
}

const statuses: MilestoneStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']

const statusLabels: Record<MilestoneStatus, string> = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  ON_HOLD: 'On hold',
  CANCELLED: 'Cancelled',
}

const statusStyles: Record<MilestoneStatus, string> = {
  PLANNED: 'bg-[#F1EAF6] text-[#806B96]',
  IN_PROGRESS: 'bg-[#F5EDE1] text-[#9A7950]',
  COMPLETED: 'bg-[#E8EFE5] text-[#617858]',
  ON_HOLD: 'bg-[#F8ECEA] text-[#9B625A]',
  CANCELLED: 'bg-[#F1EBE6] text-[#8E827A]',
}

function displayDate(value: string | null) {
  if (!value) return '—'
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function dateInputValue(value: string | null) {
  return value?.slice(0, 10) ?? ''
}

function milestoneFormError(error: unknown) {
  if (error instanceof ApiError) return error.message
  return error instanceof Error ? error.message : 'Unable to save the milestone.'
}

export function ProjectMilestones({ projectId }: ProjectMilestonesProps) {
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN' || user?.role === 'PM'
  const [loadResult, setLoadResult] = useState<{ key: string; milestones: ProjectMilestone[]; error: string | null } | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [mutationCount, setMutationCount] = useState(0)
  const [editing, setEditing] = useState<ProjectMilestone | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [busyMilestoneId, setBusyMilestoneId] = useState<string | null>(null)
  const requestKey = `${projectId}:${retryCount}:${mutationCount}`

  useEffect(() => {
    const controller = new AbortController()
    fetchProjectMilestones(projectId, controller.signal)
      .then((milestones) => setLoadResult({ key: requestKey, milestones, error: null }))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setLoadResult({
            key: requestKey,
            milestones: [],
            error: cause instanceof Error ? cause.message : 'Unable to load milestones.',
          })
        }
      })
    return () => controller.abort()
  }, [projectId, requestKey])

  useEffect(() => {
    if (!isFormOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEditing(null)
        setIsFormOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isFormOpen])

  const currentLoadResult = loadResult?.key === requestKey ? loadResult : null
  const milestones = currentLoadResult?.milestones ?? []
  const isLoading = !currentLoadResult

  const openCreate = () => {
    setEditing(null)
    setMutationError(null)
    setIsFormOpen(true)
  }

  const openEdit = (milestone: ProjectMilestone) => {
    setEditing(milestone)
    setMutationError(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setEditing(null)
    setIsFormOpen(false)
  }

  const refresh = () => setMutationCount((value) => value + 1)

  const saveMilestone = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const sequence = Number(form.get('sequence'))
    const progressPercent = Number(form.get('progressPercent'))
    const plannedStartDate = String(form.get('plannedStartDate') ?? '')
    const plannedEndDate = String(form.get('plannedEndDate') ?? '')
    const actualStartDate = String(form.get('actualStartDate') ?? '')
    const actualEndDate = String(form.get('actualEndDate') ?? '')

    if (name.length < 3) {
      setMutationError('Milestone name must be at least 3 characters.')
      return
    }
    if (!Number.isInteger(sequence) || sequence < 1) {
      setMutationError('Sequence must be a whole number of at least 1.')
      return
    }
    if (!Number.isFinite(progressPercent) || progressPercent < 0 || progressPercent > 100) {
      setMutationError('Progress must be a number from 0 to 100.')
      return
    }
    if (plannedStartDate && plannedEndDate && plannedEndDate < plannedStartDate) {
      setMutationError('Planned end date must be on or after planned start date.')
      return
    }
    if (actualStartDate && actualEndDate && actualEndDate < actualStartDate) {
      setMutationError('Actual end date must be on or after actual start date.')
      return
    }

    const input: MilestoneInput = {
      name,
      description: String(form.get('description') ?? '').trim() || null,
      sequence,
      plannedStartDate: plannedStartDate || null,
      plannedEndDate: plannedEndDate || null,
      actualStartDate: actualStartDate || null,
      actualEndDate: actualEndDate || null,
      status: String(form.get('status')) as MilestoneStatus,
      progressPercent,
    }

    setIsSaving(true)
    setMutationError(null)
    try {
      if (editing) await updateProjectMilestone(editing.id, input)
      else await createProjectMilestone(projectId, input)
      closeForm()
      refresh()
    } catch (cause) {
      setMutationError(milestoneFormError(cause))
    } finally {
      setIsSaving(false)
    }
  }

  const changeStatus = async (milestone: ProjectMilestone, status: MilestoneStatus) => {
    if (status === milestone.status) return
    setBusyMilestoneId(milestone.id)
    setMutationError(null)
    try {
      await updateProjectMilestone(milestone.id, { status })
      refresh()
    } catch (cause) {
      setMutationError(milestoneFormError(cause))
    } finally {
      setBusyMilestoneId(null)
    }
  }

  const removeMilestone = async (milestone: ProjectMilestone) => {
    if (!window.confirm(`Delete milestone "${milestone.name}"? This cannot be undone.`)) return
    setBusyMilestoneId(milestone.id)
    setMutationError(null)
    try {
      await deleteProjectMilestone(milestone.id)
      refresh()
    } catch (cause) {
      setMutationError(milestoneFormError(cause))
    } finally {
      setBusyMilestoneId(null)
    }
  }

  return <section className="mt-5 rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)] sm:p-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 font-semibold"><Flag size={17} className="text-[#9A5E3A]" /> Milestones</h2>
        <p className="mt-1 text-xs text-[#8E827A]">Planned checkpoints with dates, status, and completion progress.</p>
      </div>
      {canManage && !isFormOpen && <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-3 py-2 text-xs font-semibold text-white hover:bg-[#9A5E3A]"><Plus size={14} /> Add milestone</button>}
    </div>

    {mutationError && <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={15} className="mt-0.5 shrink-0" />{mutationError}</p>}

    {isLoading && <p aria-live="polite" className="py-8 text-center text-sm text-[#8E827A]">Loading milestones…</p>}
    {!isLoading && currentLoadResult?.error && (
      <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        <span className="flex items-center gap-2"><AlertCircle size={15} />{currentLoadResult.error}</span>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="font-semibold underline">Retry</button>
      </div>
    )}
    {!isLoading && !currentLoadResult?.error && milestones.length === 0 && (
      <p className="py-8 text-center text-sm text-[#8E827A]">No milestones have been recorded for this project.</p>
    )}
    {!isLoading && milestones.length > 0 && <div>
      {milestones.map((milestone) => <article key={milestone.id} className="border-t border-[#F1EBE6] py-4 first:border-t-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[220px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium">{milestone.sequence}. {milestone.name}</h3>
              {canManage ? (
                <label className="relative inline-flex items-center">
                  <span className="sr-only">Status for {milestone.name}</span>
                  <select
                    value={milestone.status}
                    disabled={busyMilestoneId === milestone.id}
                    onChange={(event) => void changeStatus(milestone, event.target.value as MilestoneStatus)}
                    className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide outline-none ${statusStyles[milestone.status]}`}
                  >
                    {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                  </select>
                </label>
              ) : (
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[milestone.status]}`}>{statusLabels[milestone.status]}</span>
              )}
            </div>
            {milestone.description && <p className="mt-1 text-sm text-[#595552]">{milestone.description}</p>}
            <p className="mt-1 text-xs text-[#8E827A]">Planned: {displayDate(milestone.plannedStartDate)} to {displayDate(milestone.plannedEndDate)} · Actual: {displayDate(milestone.actualStartDate)} to {displayDate(milestone.actualEndDate)}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 max-w-56 flex-1 overflow-hidden rounded-full bg-[#F0E9E4]"><div className="h-full rounded-full bg-[#B87A4F]" style={{ width: `${Math.min(100, Math.max(0, Number(milestone.progressPercent)))}%` }} /></div>
              <span className="text-xs font-semibold text-[#595552]">{Number(milestone.progressPercent)}%</span>
            </div>
          </div>
          {canManage && <div className="flex items-center gap-2">
            <button type="button" onClick={() => openEdit(milestone)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E0DA] px-3 py-2 text-xs font-semibold text-[#595552] hover:border-[#9A5E3A] hover:text-[#9A5E3A]"><Pencil size={13} /> Edit</button>
            <button type="button" aria-label={`Delete ${milestone.name}`} disabled={busyMilestoneId === milestone.id} onClick={() => void removeMilestone(milestone)} className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-50"><Trash2 size={14} /></button>
          </div>}
        </div>
      </article>)}
    </div>}

    {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#323232]/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={editing ? 'Edit milestone' : 'Add milestone'}>
      <div className="absolute inset-0" aria-hidden="true" onClick={closeForm} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#E8E0DA] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E8E0DA] px-6 py-4">
          <div>
            <h3 className="font-semibold">{editing ? 'Edit milestone' : 'Add milestone'}</h3>
            <p className="mt-0.5 text-xs text-[#8E827A]">{editing ? `Update “${editing.name}”` : 'Record a new project checkpoint'}</p>
          </div>
          <button type="button" onClick={closeForm} aria-label="Close dialog" className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE] hover:text-[#323232]"><X size={16} /></button>
        </div>
        <form key={editing?.id ?? 'new'} onSubmit={(event) => void saveMilestone(event)} className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {mutationError && <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={15} className="mt-0.5 shrink-0" />{mutationError}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-[#8E827A] sm:col-span-2">Name<input required name="name" maxLength={255} defaultValue={editing?.name ?? ''} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]" /></label>
            <label className="text-xs text-[#8E827A] sm:col-span-2">Description<textarea name="description" maxLength={5000} defaultValue={editing?.description ?? ''} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]" /></label>
            <label className="text-xs text-[#8E827A]">Sequence<input required type="number" min="1" step="1" name="sequence" defaultValue={editing?.sequence ?? (milestones.length + 1)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]" /></label>
            <label className="text-xs text-[#8E827A]">Status<select name="status" defaultValue={editing?.status ?? 'PLANNED'} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]">{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
            <label className="text-xs text-[#8E827A] sm:col-span-2">Progress (%)<input required type="number" min="0" max="100" step="0.01" name="progressPercent" defaultValue={Number(editing?.progressPercent ?? 0)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-[#8E827A]">Planned start<input type="date" name="plannedStartDate" defaultValue={dateInputValue(editing?.plannedStartDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]" /></label>
              <label className="text-xs text-[#8E827A]">Planned end<input type="date" name="plannedEndDate" defaultValue={dateInputValue(editing?.plannedEndDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]" /></label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-[#8E827A]">Actual start<input type="date" name="actualStartDate" defaultValue={dateInputValue(editing?.actualStartDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]" /></label>
              <label className="text-xs text-[#8E827A]">Actual end<input type="date" name="actualEndDate" defaultValue={dateInputValue(editing?.actualEndDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]" /></label>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={closeForm} className="rounded-xl border border-[#E8E0DA] px-4 py-2.5 text-sm font-semibold text-[#595552] hover:bg-[#FBF9F7]">Cancel</button>
            <button disabled={isSaving} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#9A5E3A] disabled:opacity-50">{isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />} {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Add milestone'}</button>
          </div>
        </form>
      </div>
    </div>}
  </section>
}
