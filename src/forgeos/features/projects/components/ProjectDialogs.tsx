import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Loader2, X } from 'lucide-react'
import { ApiError } from '../../../lib/api'
import {
  assignProjectPm,
  createProject,
  fetchLandOptions,
  fetchManagerOptions,
  fetchProjectForEdit,
  updateProject,
  updateProjectStatus,
  type ApiProjectDetailRow,
  type LandOption,
  type ManagerOption,
  type ProjectFormInput,
} from '../data/projectsAdminApi'
import type { ApiProject } from '../project-utils'
import type { Project } from '../projects-context'

const statusLabels: Record<Project['status'], string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
}

const allowedTransitions: Record<Project['status'], Project['status'][]> = {
  PLANNING: ['ACTIVE'],
  ACTIVE: ['ON_HOLD', 'COMPLETED'],
  ON_HOLD: ['ACTIVE'],
  COMPLETED: [],
}

const transitionLabels: Record<Project['status'], string> = {
  PLANNING: 'Mark as Active',
  ACTIVE: 'Mark as Active',
  ON_HOLD: 'Put on Hold',
  COMPLETED: 'Mark as Completed',
}

const inputClasses = 'w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-2.5 text-sm text-[#595552] outline-none transition focus:border-[#323232]'
const labelClasses = 'text-sm font-medium text-[#323232]'
const primaryButtonClasses = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1E1E1E] disabled:cursor-wait disabled:opacity-60'
const secondaryButtonClasses = 'rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm font-medium text-[#595552] transition hover:border-[#323232] hover:text-[#323232]'

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function DialogShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string
  description: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#C8BCB4]/70 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#323232]">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-[#8E827A]">{description}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1.5 text-[#8E827A] transition hover:bg-[#F7F3EE] hover:text-[#323232]">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

function DialogError({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-xl border border-[#E8C7BD] bg-white p-3 text-sm leading-5 text-[#8A5143]">
      {message}
    </div>
  )
}

function toDay(value: string | null): string {
  return value ? value.slice(0, 10) : ''
}

export function ProjectFormDialog({
  project,
  onClose,
  onSaved,
}: {
  project: Project | null
  onClose: () => void
  onSaved: (project: ApiProject, mode: 'created' | 'updated') => void
}) {
  const isEdit = Boolean(project)
  const [form, setForm] = useState<ProjectFormInput>({
    name: project?.name ?? '',
    location: '',
    landId: '',
    totalBudget: project ? Number(project.totalBudget) || 0 : 0,
    startDate: toDay(project?.startDate ?? null),
    expectedEndDate: toDay(project?.expectedEndDate ?? null),
    wastageThresholdPct: project?.wastageThresholdPct ?? 10,
  })
  const [lands, setLands] = useState<LandOption[] | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchLandOptions(controller.signal)
      .then((options) => setLands(options))
      .catch(() => {
        if (!controller.signal.aborted) setLands([])
      })
    if (project) {
      fetchProjectForEdit(project.id, controller.signal)
        .then((detail: ApiProjectDetailRow) => {
          setForm({
            name: detail.name,
            location: detail.location ?? '',
            landId: detail.landId ?? '',
            totalBudget: Number(detail.totalBudget) || 0,
            startDate: toDay(detail.startDate),
            expectedEndDate: toDay(detail.expectedEndDate),
            wastageThresholdPct: detail.wastageThresholdPct ?? 10,
          })
        })
        .catch((cause: unknown) => {
          if (!controller.signal.aborted) setError(errorMessage(cause))
        })
    }
    return () => controller.abort()
  }, [project])

  const setField = <K extends keyof ProjectFormInput>(key: K, value: ProjectFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.name.trim().length < 3) {
      setError('Project name must be at least 3 characters.')
      return
    }
    if (!form.landId) {
      setError('Please select the land parcel for this project.')
      return
    }
    if (!(form.totalBudget > 0)) {
      setError('Total budget must be greater than zero.')
      return
    }
    if (!form.startDate) {
      setError('Please provide a start date.')
      return
    }
    if (!isEdit && !form.expectedEndDate) {
      setError('Please provide an expected end date.')
      return
    }
    if (form.expectedEndDate && form.expectedEndDate <= form.startDate) {
      setError('Expected end date must be after the start date.')
      return
    }
    if (!(form.wastageThresholdPct >= 0 && form.wastageThresholdPct <= 100)) {
      setError('Wastage threshold must be between 0 and 100 percent.')
      return
    }

    setIsSubmitting(true)
    setError('')
    const payload: ProjectFormInput = {
      name: form.name.trim(),
      location: form.location.trim(),
      landId: form.landId,
      totalBudget: Number(form.totalBudget),
      startDate: form.startDate,
      expectedEndDate: form.expectedEndDate,
      wastageThresholdPct: Number(form.wastageThresholdPct),
    }
    try {
      const saved = isEdit && project
        ? await updateProject(project.id, payload)
        : await createProject(payload)
      onSaved(saved, isEdit ? 'updated' : 'created')
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogShell
      title={isEdit ? `Edit ${project?.code}` : 'New project'}
      description={isEdit ? 'Update the project record. Changes are audited.' : 'Register a new construction project on a land parcel.'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="project-name" className={labelClasses}>Project name</label>
          <input
            id="project-name"
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder="e.g. Skyline Heights Phase 2"
            disabled={isSubmitting}
            className={inputClasses}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="project-location" className={labelClasses}>Location</label>
          <input
            id="project-location"
            value={form.location}
            onChange={(event) => setField('location', event.target.value)}
            placeholder="Site location (optional)"
            disabled={isSubmitting}
            className={inputClasses}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="project-land" className={labelClasses}>Land parcel</label>
          <select
            id="project-land"
            value={form.landId}
            onChange={(event) => setField('landId', event.target.value)}
            disabled={isSubmitting || lands === null}
            className={inputClasses}
          >
            <option value="">{lands === null ? 'Loading land parcels…' : 'Select a land parcel'}</option>
            {lands?.map((land) => (
              <option value={land.id} key={land.id}>{land.name}{land.city ? ` — ${land.city}` : ''}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="project-budget" className={labelClasses}>Total budget (INR)</label>
            <input
              id="project-budget"
              type="number"
              min={1}
              step="0.01"
              value={form.totalBudget || ''}
              onChange={(event) => setField('totalBudget', Number(event.target.value))}
              disabled={isSubmitting}
              className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="project-wastage" className={labelClasses}>Wastage threshold (%)</label>
            <input
              id="project-wastage"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={form.wastageThresholdPct}
              onChange={(event) => setField('wastageThresholdPct', Number(event.target.value))}
              disabled={isSubmitting}
              className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="project-start" className={labelClasses}>Start date</label>
            <input
              id="project-start"
              type="date"
              value={form.startDate}
              onChange={(event) => setField('startDate', event.target.value)}
              disabled={isSubmitting}
              className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="project-end" className={labelClasses}>Expected end date</label>
            <input
              id="project-end"
              type="date"
              value={form.expectedEndDate}
              onChange={(event) => setField('expectedEndDate', event.target.value)}
              disabled={isSubmitting}
              className={inputClasses}
            />
          </div>
        </div>

        {error && <DialogError message={error} />}

        <div className="flex items-center justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className={secondaryButtonClasses}>Cancel</button>
          <button type="submit" disabled={isSubmitting || lands === null} className={primaryButtonClasses}>
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </form>
    </DialogShell>
  )
}

export function AssignPmDialog({
  project,
  onClose,
  onUpdated,
}: {
  project: Project
  onClose: () => void
  onUpdated: (project: ApiProject) => void
}) {
  const [managers, setManagers] = useState<ManagerOption[] | null>(null)
  const [pmId, setPmId] = useState(project.assignedPm?.id ?? '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchManagerOptions(controller.signal)
      .then((options) => setManagers(options))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(cause))
      })
    return () => controller.abort()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const updated = await assignProjectPm(project.id, pmId === '' ? null : pmId)
      onUpdated(updated)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogShell
      title={`Assign project manager — ${project.code}`}
      description="Choose the project manager responsible for this project, or unassign it."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="assign-pm" className={labelClasses}>Project manager</label>
          <select
            id="assign-pm"
            value={pmId}
            onChange={(event) => { setPmId(event.target.value); setError('') }}
            disabled={isSubmitting || managers === null}
            className={inputClasses}
          >
            <option value="">{managers === null ? 'Loading managers…' : 'Unassigned'}</option>
            {managers?.map((manager) => (
              <option value={manager.id} key={manager.id}>{manager.name}</option>
            ))}
          </select>
          <p className="text-xs text-[#8E827A]">Only active project managers are listed.</p>
        </div>

        {error && <DialogError message={error} />}

        <div className="flex items-center justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className={secondaryButtonClasses}>Cancel</button>
          <button type="submit" disabled={isSubmitting || managers === null} className={primaryButtonClasses}>
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            Save assignment
          </button>
        </div>
      </form>
    </DialogShell>
  )
}

export function StatusDialog({
  project,
  onClose,
  onUpdated,
}: {
  project: Project
  onClose: () => void
  onUpdated: (project: ApiProject) => void
}) {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<Project['status'] | null>(null)
  const transitions = allowedTransitions[project.status]

  const handleChange = async (status: Project['status']) => {
    setIsSubmitting(true)
    setPendingStatus(status)
    setError('')
    try {
      const updated = await updateProjectStatus(project.id, status)
      onUpdated(updated)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setIsSubmitting(false)
      setPendingStatus(null)
    }
  }

  return (
    <DialogShell
      title={`Project status — ${project.code}`}
      description={`Current status: ${statusLabels[project.status]}. Only allowed transitions are offered.`}
      onClose={onClose}
    >
      <div className="space-y-4">
        {transitions.length ? (
          <div className="grid gap-2">
            {transitions.map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => handleChange(status)}
                disabled={isSubmitting}
                className={primaryButtonClasses + ' w-full'}
              >
                {isSubmitting && pendingStatus === status && <Loader2 size={15} className="animate-spin" />}
                {transitionLabels[status]}
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-[#C8BCB4] bg-white p-3 text-sm leading-5 text-[#8E827A]">
            This project is completed. No further status changes are allowed.
          </p>
        )}
        <p className="text-xs leading-5 text-[#8E827A]">
          Marking a project as completed records its actual end date automatically.
        </p>
        {error && <DialogError message={error} />}
        <div className="flex items-center justify-end pt-1">
          <button type="button" onClick={onClose} className={secondaryButtonClasses}>Close</button>
        </div>
      </div>
    </DialogShell>
  )
}
