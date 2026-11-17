import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, CalendarDays, Plus, Save, Trash2 } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { ApiError } from '../../../lib/api'
import { useProjects } from '../../projects/useProjects'
import {
  createDailyLog,
  fetchAllDailyLogs,
  fetchDailyLog,
  updateDailyLog,
  type DailyLog,
  type DailyLogInput,
} from '../data/dailyLogApi'

interface ProjectLogFormPageProps {
  projectId: string
  logId?: string
}

interface LabourDraft {
  key: string
  trade: string
  contractorName: string
  headCount: string
  hoursWorked: string
  remarks: string
}

interface MachineryDraft {
  key: string
  machineName: string
  operatorName: string
  hoursUsed: string
  fuelLitres: string
  remarks: string
}

interface FormValues {
  logDate: string
  progressPercent: string
  workSummary: string
  weather: string
  issues: string
  labourEntries: LabourDraft[]
  machineryEntries: MachineryDraft[]
}

const today = new Date()
const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

function emptyValues(progress = 0): FormValues {
  return {
    logDate: localToday,
    progressPercent: String(progress),
    workSummary: '',
    weather: '',
    issues: '',
    labourEntries: [],
    machineryEntries: [],
  }
}

function blankLabour(): LabourDraft {
  return { key: crypto.randomUUID(), trade: '', contractorName: '', headCount: '', hoursWorked: '8', remarks: '' }
}

function blankMachinery(): MachineryDraft {
  return { key: crypto.randomUUID(), machineName: '', operatorName: '', hoursUsed: '', fuelLitres: '', remarks: '' }
}

function toValues(log: DailyLog): FormValues {
  return {
    logDate: log.logDate.slice(0, 10),
    progressPercent: String(Number(log.progressPercent)),
    workSummary: log.workSummary,
    weather: log.weather ?? '',
    issues: log.issues ?? '',
    labourEntries: log.labourEntries.map((entry) => ({
      key: String(entry.id),
      trade: entry.trade,
      contractorName: entry.contractorName ?? '',
      headCount: String(entry.headCount),
      hoursWorked: String(Number(entry.hoursWorked)),
      remarks: entry.remarks ?? '',
    })),
    machineryEntries: log.machineryEntries.map((entry) => ({
      key: String(entry.id),
      machineName: entry.machineName,
      operatorName: entry.operatorName ?? '',
      hoursUsed: String(Number(entry.hoursUsed)),
      fuelLitres: entry.fuelLitres == null ? '' : String(Number(entry.fuelLitres)),
      remarks: entry.remarks ?? '',
    })),
  }
}

function formatApiError(error: unknown) {
  if (!(error instanceof ApiError)) return error instanceof Error ? error.message : 'Unable to save the daily log.'
  if (error.status === 409) return `${error.message} Check the project and log date.`
  if (error.status === 422) return error.message
  if (error.status === 403) return `${error.message} Your account may not be assigned to this project or permitted to edit this log.`
  return error.message
}

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function ProjectLogFormPage({ projectId, logId }: ProjectLogFormPageProps) {
  const { projects } = useProjects()
  const project = projects.find((entry) => String(entry.id) === projectId)
  const [values, setValues] = useState<FormValues>(() => emptyValues())
  const [loadResult, setLoadResult] = useState<{ key: string; error: string | null } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const requestKey = `${projectId}:${logId ?? 'new'}:${retryCount}`

  useEffect(() => {
    const controller = new AbortController()
    const setLoadError = (cause: unknown) => setLoadResult({
      key: requestKey,
      error: formatApiError(cause),
    })
    if (logId) {
      fetchDailyLog(logId, controller.signal)
        .then((log) => {
          if (String(log.projectId) !== projectId) throw new Error('This log does not belong to the selected project.')
          setValues(toValues(log))
          setLoadResult({ key: requestKey, error: null })
        })
        .catch((cause: unknown) => {
          if (!controller.signal.aborted) setLoadError(cause)
        })
    } else {
      fetchAllDailyLogs(projectId, {}, controller.signal)
        .then((logs) => {
          if (controller.signal.aborted) return
          const previous = logs
            .filter((log) => log.logDate.slice(0, 10) < localToday)
            .sort((a, b) => b.logDate.localeCompare(a.logDate))[0]
          setValues(emptyValues(previous ? Number(previous.progressPercent) : 0))
          setLoadResult({ key: requestKey, error: null })
        })
        .catch((cause: unknown) => {
          if (!controller.signal.aborted) setLoadError(cause)
        })
    }
    return () => controller.abort()
  }, [projectId, logId, requestKey])

  const currentLoadResult = loadResult?.key === requestKey ? loadResult : null
  const isLoading = !currentLoadResult
  const displayError = error ?? currentLoadResult?.error ?? null

  const update = (patch: Partial<FormValues>) => setValues((current) => ({ ...current, ...patch }))
  const editRow = <T extends { key: string }>(rows: T[], key: string, patch: Partial<T>) =>
    rows.map((row) => row.key === key ? { ...row, ...patch } : row)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (values.logDate > localToday) {
      setError('Log date cannot be in the future.')
      return
    }
    const progress = Number(values.progressPercent)
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      setError('Progress must be a number from 0 to 100.')
      return
    }
    if (!values.workSummary.trim()) {
      setError('Work summary is required.')
      return
    }

    const labourEntries: DailyLogInput['labourEntries'] = []
    for (const [index, row] of values.labourEntries.entries()) {
      if (!row.trade.trim() && !row.contractorName.trim() && !row.headCount.trim() && !row.remarks.trim()) continue
      const headCount = Number(row.headCount)
      const hoursWorked = Number(row.hoursWorked)
      if (!row.trade.trim() || !Number.isInteger(headCount) || headCount <= 0 || !Number.isFinite(hoursWorked) || hoursWorked < 0 || hoursWorked > 24) {
        setError(`Labour group ${index + 1} needs a trade, positive whole-number headcount, and hours from 0 to 24.`)
        return
      }
      labourEntries.push({
        trade: row.trade.trim(),
        ...(row.contractorName.trim() ? { contractorName: row.contractorName.trim() } : {}),
        headCount,
        hoursWorked,
        ...(row.remarks.trim() ? { remarks: row.remarks.trim() } : {}),
      })
    }

    const machineryEntries: DailyLogInput['machineryEntries'] = []
    for (const [index, row] of values.machineryEntries.entries()) {
      if (!row.machineName.trim() && !row.operatorName.trim() && !row.hoursUsed.trim() && !row.fuelLitres.trim() && !row.remarks.trim()) continue
      const hoursUsed = Number(row.hoursUsed)
      const fuelLitres = row.fuelLitres === '' ? undefined : Number(row.fuelLitres)
      if (!row.machineName.trim() || !Number.isFinite(hoursUsed) || hoursUsed < 0 || hoursUsed > 24 || (fuelLitres !== undefined && (!Number.isFinite(fuelLitres) || fuelLitres < 0))) {
        setError(`Machinery entry ${index + 1} needs a machine name, hours from 0 to 24, and non-negative fuel quantity.`)
        return
      }
      machineryEntries.push({
        machineName: row.machineName.trim(),
        ...(row.operatorName.trim() ? { operatorName: row.operatorName.trim() } : {}),
        hoursUsed,
        ...(fuelLitres !== undefined ? { fuelLitres } : {}),
        ...(row.remarks.trim() ? { remarks: row.remarks.trim() } : {}),
      })
    }

    const payload: DailyLogInput = {
      logDate: values.logDate,
      progressPercent: progress,
      workSummary: values.workSummary.trim(),
      ...(values.weather.trim() ? { weather: values.weather.trim() } : {}),
      ...(values.issues.trim() ? { issues: values.issues.trim() } : {}),
      labourEntries,
      machineryEntries,
    }

    setIsSaving(true)
    try {
      const saved = logId
        ? await updateDailyLog(logId, payload)
        : await createDailyLog(projectId, payload)
      setSuccess(logId ? 'Daily log updated successfully.' : 'Daily log created successfully.')
      navigate(`/projects/${projectId}/logs/${saved.id}?saved=${logId ? 'updated' : 'created'}`)
    } catch (cause) {
      setError(formatApiError(cause))
    } finally {
      setIsSaving(false)
    }
  }

  return <AppShell currentPath={`/projects/${projectId}/logs`}>
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6 lg:px-10">
      <button type="button" onClick={() => navigate(`/projects/${projectId}/logs`)} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#8E827A] hover:text-[#323232]"><ArrowLeft size={16} /> Back to logs</button>
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5E3A]">{project?.name ?? `Project ${projectId}`} · {project?.code ?? projectId}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{logId ? 'Edit Daily Log' : 'Create Daily Log'}</h1>
        <p className="mt-2 text-sm text-[#8E827A]">Record work, progress, labour groups, and machinery used on site.</p>
      </div>

      {displayError && <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><p>{displayError}</p></div>}
      {success && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}

      {isLoading ? <div aria-live="polite" className="rounded-2xl border border-[#E8E0DA] bg-white p-8 text-sm text-[#8E827A]">Loading daily log…</div> : currentLoadResult?.error && (
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="rounded-xl bg-[#323232] px-4 py-2.5 text-sm font-semibold text-white">Retry</button>
      )}
      {!isLoading && !(currentLoadResult?.error && logId) && <form onSubmit={submit} className="space-y-5">
        <section className="rounded-2xl border border-[#E8E0DA] bg-white p-6">
          <h2 className="mb-5 font-semibold">Daily information</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-[#595552]">Log date
              <span className="relative mt-2 block"><CalendarDays className="absolute left-3 top-3 h-4 w-4 text-[#9A5E3A]" /><input required type="date" max={localToday} value={values.logDate} onChange={(event) => update({ logDate: event.target.value })} className="w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#9A5E3A]" /></span>
            </label>
            <label className="text-sm font-medium text-[#595552]">Cumulative project progress (%)
              <input required type="number" min="0" max="100" step="0.01" value={values.progressPercent} onChange={(event) => update({ progressPercent: event.target.value })} className="mt-2 w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] px-3 py-3 text-sm outline-none focus:border-[#9A5E3A]" />
            </label>
            <label className="text-sm font-medium text-[#595552] md:col-span-2">Work summary
              <textarea required maxLength={5000} value={values.workSummary} onChange={(event) => update({ workSummary: event.target.value })} className="mt-2 min-h-28 w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] p-3 text-sm outline-none focus:border-[#9A5E3A]" placeholder="Summarise work completed, inspections, deliveries, and next steps..." />
            </label>
            <label className="text-sm font-medium text-[#595552]">Weather
              <input maxLength={150} value={values.weather} onChange={(event) => update({ weather: event.target.value })} className="mt-2 w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] px-3 py-3 text-sm outline-none focus:border-[#9A5E3A]" placeholder="Optional" />
            </label>
            <label className="text-sm font-medium text-[#595552]">Issues or delays
              <input maxLength={5000} value={values.issues} onChange={(event) => update({ issues: event.target.value })} className="mt-2 w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] px-3 py-3 text-sm outline-none focus:border-[#9A5E3A]" placeholder="Optional" />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E8E0DA] bg-white p-6">
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Labour attendance</h2><p className="mt-1 text-xs text-[#8E827A]">Record headcount by trade or contractor; individual attendance statuses are not supported.</p></div><button type="button" onClick={() => update({ labourEntries: [...values.labourEntries, blankLabour()] })} className="inline-flex items-center gap-1 rounded-lg border border-[#E8E0DA] px-3 py-2 text-xs font-semibold text-[#9A5E3A]"><Plus size={14} /> Add group</button></div>
          {values.labourEntries.length === 0 ? <p className="mt-5 text-sm text-[#8E827A]">No labour groups added.</p> : <div className="mt-4 space-y-3">{values.labourEntries.map((row) => <div key={row.key} className="grid gap-3 rounded-xl bg-[#FBF9F7] p-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Trade"><input value={row.trade} onChange={(event) => update({ labourEntries: editRow(values.labourEntries, row.key, { trade: event.target.value }) })} className={inputClass} /></Field>
            <Field label="Contractor"><input value={row.contractorName} onChange={(event) => update({ labourEntries: editRow(values.labourEntries, row.key, { contractorName: event.target.value }) })} className={inputClass} /></Field>
            <Field label="Headcount"><input type="number" min="1" step="1" value={row.headCount} onChange={(event) => update({ labourEntries: editRow(values.labourEntries, row.key, { headCount: event.target.value }) })} className={inputClass} /></Field>
            <Field label="Hours worked (0–24)"><input type="number" min="0" max="24" step="0.25" value={row.hoursWorked} onChange={(event) => update({ labourEntries: editRow(values.labourEntries, row.key, { hoursWorked: event.target.value }) })} className={inputClass} /></Field>
            <div className="flex items-end gap-2"><Field label="Remarks" className="min-w-0 flex-1"><input value={row.remarks} onChange={(event) => update({ labourEntries: editRow(values.labourEntries, row.key, { remarks: event.target.value }) })} className={inputClass} /></Field><button type="button" aria-label="Remove labour group" onClick={() => update({ labourEntries: values.labourEntries.filter((entry) => entry.key !== row.key) })} className="mb-1 rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Trash2 size={16} /></button></div>
          </div>)}</div>}
        </section>

        <section className="rounded-2xl border border-[#E8E0DA] bg-white p-6">
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Machinery usage</h2><p className="mt-1 text-xs text-[#8E827A]">Record each machine, operating hours, and optional fuel quantity.</p></div><button type="button" onClick={() => update({ machineryEntries: [...values.machineryEntries, blankMachinery()] })} className="inline-flex items-center gap-1 rounded-lg border border-[#E8E0DA] px-3 py-2 text-xs font-semibold text-[#9A5E3A]"><Plus size={14} /> Add machine</button></div>
          {values.machineryEntries.length === 0 ? <p className="mt-5 text-sm text-[#8E827A]">No machinery entries added.</p> : <div className="mt-4 space-y-3">{values.machineryEntries.map((row) => <div key={row.key} className="grid gap-3 rounded-xl bg-[#FBF9F7] p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Machine name"><input value={row.machineName} onChange={(event) => update({ machineryEntries: editRow(values.machineryEntries, row.key, { machineName: event.target.value }) })} className={inputClass} /></Field>
            <Field label="Operator"><input value={row.operatorName} onChange={(event) => update({ machineryEntries: editRow(values.machineryEntries, row.key, { operatorName: event.target.value }) })} className={inputClass} /></Field>
            <Field label="Hours used (0–24)"><input type="number" min="0" max="24" step="0.25" value={row.hoursUsed} onChange={(event) => update({ machineryEntries: editRow(values.machineryEntries, row.key, { hoursUsed: event.target.value }) })} className={inputClass} /></Field>
            <Field label="Fuel litres"><input type="number" min="0" step="0.01" value={row.fuelLitres} onChange={(event) => update({ machineryEntries: editRow(values.machineryEntries, row.key, { fuelLitres: event.target.value }) })} className={inputClass} /></Field>
            <Field label="Remarks"><input value={row.remarks} onChange={(event) => update({ machineryEntries: editRow(values.machineryEntries, row.key, { remarks: event.target.value }) })} className={inputClass} /></Field>
            <div className="flex items-end"><button type="button" onClick={() => update({ machineryEntries: values.machineryEntries.filter((entry) => entry.key !== row.key) })} className="mb-1 inline-flex items-center gap-2 rounded-lg p-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"><Trash2 size={15} /> Remove entry</button></div>
          </div>)}</div>}
        </section>

        <div className="flex justify-end gap-3"><button type="button" onClick={() => navigate(`/projects/${projectId}/logs`)} className="rounded-xl border border-[#E8E0DA] bg-white px-5 py-3 text-sm font-semibold text-[#595552]">Cancel</button><button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} /> {isSaving ? 'Saving…' : logId ? 'Save changes' : 'Create daily log'}</button></div>
      </form>}
    </div>
  </AppShell>
}

const inputClass = 'mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9A5E3A]'

function Field({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`block text-xs font-medium text-[#595552] ${className}`}>{label}{children}</label>
}
