// Imports useEffect, useState from react so this module can reuse that component, helper, or library.
import { useEffect, useState } from 'react'
// Imports AlertCircle, ArrowLeft, CalendarDays, Plus, Save, Trash2 from lucide-react so this module can reuse that component, helper, or library.
import { AlertCircle, ArrowLeft, CalendarDays, Plus, Save, Trash2 } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  createDailyLog,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fetchAllDailyLogs,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fetchDailyLog,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  updateDailyLog,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type DailyLog,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type DailyLogInput,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from '../data/dailyLogApi'

// Continues the component or data expression so its related values and behavior stay grouped together.
interface ProjectLogFormPageProps {
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  logId?: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
interface LabourDraft {
  // Sets the key field so the surrounding object or component receives this setting.
  key: string
  // Sets the trade field so the surrounding object or component receives this setting.
  trade: string
  // Sets the contractorName field so the surrounding object or component receives this setting.
  contractorName: string
  // Sets the headCount field so the surrounding object or component receives this setting.
  headCount: string
  // Sets the hoursWorked field so the surrounding object or component receives this setting.
  hoursWorked: string
  // Sets the remarks field so the surrounding object or component receives this setting.
  remarks: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
interface MachineryDraft {
  // Sets the key field so the surrounding object or component receives this setting.
  key: string
  // Sets the machineName field so the surrounding object or component receives this setting.
  machineName: string
  // Sets the operatorName field so the surrounding object or component receives this setting.
  operatorName: string
  // Sets the hoursUsed field so the surrounding object or component receives this setting.
  hoursUsed: string
  // Sets the fuelLitres field so the surrounding object or component receives this setting.
  fuelLitres: string
  // Sets the remarks field so the surrounding object or component receives this setting.
  remarks: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
interface FormValues {
  // Sets the logDate field so the surrounding object or component receives this setting.
  logDate: string
  // Sets the progressPercent field so the surrounding object or component receives this setting.
  progressPercent: string
  // Sets the workSummary field so the surrounding object or component receives this setting.
  workSummary: string
  // Sets the weather field so the surrounding object or component receives this setting.
  weather: string
  // Sets the issues field so the surrounding object or component receives this setting.
  issues: string
  // Sets the labourEntries field so the surrounding object or component receives this setting.
  labourEntries: LabourDraft[]
  // Sets the machineryEntries field so the surrounding object or component receives this setting.
  machineryEntries: MachineryDraft[]
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in today so later lines can reuse this data or behavior for the current feature.
const today = new Date()
// Stores the value in localToday so later lines can reuse this data or behavior for the current feature.
const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

// Defines emptyValues so this module can perform its named task when needed.
function emptyValues(progress = 0): FormValues {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return {
    // Sets the logDate field so the surrounding object or component receives this setting.
    logDate: localToday,
    // Sets the progressPercent field so the surrounding object or component receives this setting.
    progressPercent: String(progress),
    // Sets the workSummary field so the surrounding object or component receives this setting.
    workSummary: '',
    // Sets the weather field so the surrounding object or component receives this setting.
    weather: '',
    // Sets the issues field so the surrounding object or component receives this setting.
    issues: '',
    // Sets the labourEntries field so the surrounding object or component receives this setting.
    labourEntries: [],
    // Sets the machineryEntries field so the surrounding object or component receives this setting.
    machineryEntries: [],
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines blankLabour so this module can perform its named task when needed.
function blankLabour(): LabourDraft {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return { key: crypto.randomUUID(), trade: '', contractorName: '', headCount: '', hoursWorked: '8', remarks: '' }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines blankMachinery so this module can perform its named task when needed.
function blankMachinery(): MachineryDraft {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return { key: crypto.randomUUID(), machineName: '', operatorName: '', hoursUsed: '', fuelLitres: '', remarks: '' }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines toValues so this module can perform its named task when needed.
function toValues(log: DailyLog): FormValues {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return {
    // Sets the logDate field so the surrounding object or component receives this setting.
    logDate: log.logDate.slice(0, 10),
    // Sets the progressPercent field so the surrounding object or component receives this setting.
    progressPercent: String(Number(log.progressPercent)),
    // Sets the workSummary field so the surrounding object or component receives this setting.
    workSummary: log.workSummary,
    // Sets the weather field so the surrounding object or component receives this setting.
    weather: log.weather ?? '',
    // Sets the issues field so the surrounding object or component receives this setting.
    issues: log.issues ?? '',
    // Transforms each collection item so the corresponding values or interface elements can be produced.
    labourEntries: log.labourEntries.map((entry) => ({
      // Sets the key field so the surrounding object or component receives this setting.
      key: String(entry.id),
      // Sets the trade field so the surrounding object or component receives this setting.
      trade: entry.trade,
      // Sets the contractorName field so the surrounding object or component receives this setting.
      contractorName: entry.contractorName ?? '',
      // Sets the headCount field so the surrounding object or component receives this setting.
      headCount: String(entry.headCount),
      // Sets the hoursWorked field so the surrounding object or component receives this setting.
      hoursWorked: String(Number(entry.hoursWorked)),
      // Sets the remarks field so the surrounding object or component receives this setting.
      remarks: entry.remarks ?? '',
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })),
    // Transforms each collection item so the corresponding values or interface elements can be produced.
    machineryEntries: log.machineryEntries.map((entry) => ({
      // Sets the key field so the surrounding object or component receives this setting.
      key: String(entry.id),
      // Sets the machineName field so the surrounding object or component receives this setting.
      machineName: entry.machineName,
      // Sets the operatorName field so the surrounding object or component receives this setting.
      operatorName: entry.operatorName ?? '',
      // Sets the hoursUsed field so the surrounding object or component receives this setting.
      hoursUsed: String(Number(entry.hoursUsed)),
      // Sets the fuelLitres field so the surrounding object or component receives this setting.
      fuelLitres: entry.fuelLitres == null ? '' : String(Number(entry.fuelLitres)),
      // Sets the remarks field so the surrounding object or component receives this setting.
      remarks: entry.remarks ?? '',
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })),
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines formatApiError so this module can perform its named task when needed.
function formatApiError(error: unknown) {
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (!(error instanceof ApiError)) return error instanceof Error ? error.message : 'Unable to save the daily log.'
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (error.status === 409) return `${error.message} Check the project and log date.`
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (error.status === 422) return error.message
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (error.status === 403) return `${error.message} Your account may not be assigned to this project or permitted to edit this log.`
  // Returns the result so the caller or React receives the value or interface this function provides.
  return error.message
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines navigate so this module can perform its named task when needed.
function navigate(path: string) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  window.history.pushState({}, '', path)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  window.dispatchEvent(new PopStateEvent('popstate'))
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ProjectLogFormPage so this module can perform its named task when needed.
export function ProjectLogFormPage({ projectId, logId }: ProjectLogFormPageProps) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects } = useProjects()
  // Stores the value in project so later lines can reuse this data or behavior for the current feature.
  const project = projects.find((entry) => String(entry.id) === projectId)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [values, setValues] = useState<FormValues>(() => emptyValues())
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loadResult, setLoadResult] = useState<{ key: string; error: string | null } | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [isSaving, setIsSaving] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [error, setError] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [success, setSuccess] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [retryCount, setRetryCount] = useState(0)
  // Stores the value in requestKey so later lines can reuse this data or behavior for the current feature.
  const requestKey = `${projectId}:${logId ?? 'new'}:${retryCount}`

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Stores the value in setLoadError so later lines can reuse this data or behavior for the current feature.
    const setLoadError = (cause: unknown) => setLoadResult({
      // Sets the key field so the surrounding object or component receives this setting.
      key: requestKey,
      // Sets the error field so the surrounding object or component receives this setting.
      error: formatApiError(cause),
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (logId) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      fetchDailyLog(logId, controller.signal)
        // Continues the component or data expression so its related values and behavior stay grouped together.
        .then((log) => {
          // Checks this condition before continuing so the code can choose the correct path for the current state.
          if (String(log.projectId) !== projectId) throw new Error('This log does not belong to the selected project.')
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setValues(toValues(log))
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setLoadResult({ key: requestKey, error: null })
        // Continues the component or data expression so its related values and behavior stay grouped together.
        })
        // Continues the component or data expression so its related values and behavior stay grouped together.
        .catch((cause: unknown) => {
          // Checks this condition before continuing so the code can choose the correct path for the current state.
          if (!controller.signal.aborted) setLoadError(cause)
        // Continues the component or data expression so its related values and behavior stay grouped together.
        })
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } else {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      fetchAllDailyLogs(projectId, {}, controller.signal)
        // Continues the component or data expression so its related values and behavior stay grouped together.
        .then((logs) => {
          // Checks this condition before continuing so the code can choose the correct path for the current state.
          if (controller.signal.aborted) return
          // Stores the value in previous so later lines can reuse this data or behavior for the current feature.
          const previous = logs
            // Keeps only items matching this condition so the result contains relevant data.
            .filter((log) => log.logDate.slice(0, 10) < localToday)
            // Continues the component or data expression so its related values and behavior stay grouped together.
            .sort((a, b) => b.logDate.localeCompare(a.logDate))[0]
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setValues(emptyValues(previous ? Number(previous.progressPercent) : 0))
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setLoadResult({ key: requestKey, error: null })
        // Continues the component or data expression so its related values and behavior stay grouped together.
        })
        // Continues the component or data expression so its related values and behavior stay grouped together.
        .catch((cause: unknown) => {
          // Checks this condition before continuing so the code can choose the correct path for the current state.
          if (!controller.signal.aborted) setLoadError(cause)
        // Continues the component or data expression so its related values and behavior stay grouped together.
        })
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => controller.abort()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [projectId, logId, requestKey])

  // Stores the value in currentLoadResult so later lines can reuse this data or behavior for the current feature.
  const currentLoadResult = loadResult?.key === requestKey ? loadResult : null
  // Stores the value in isLoading so later lines can reuse this data or behavior for the current feature.
  const isLoading = !currentLoadResult
  // Stores the value in displayError so later lines can reuse this data or behavior for the current feature.
  const displayError = error ?? currentLoadResult?.error ?? null

  // Stores the value in update so later lines can reuse this data or behavior for the current feature.
  const update = (patch: Partial<FormValues>) => setValues((current) => ({ ...current, ...patch }))
  // Stores the value in editRow so later lines can reuse this data or behavior for the current feature.
  const editRow = <T extends { key: string }>(rows: T[], key: string, patch: Partial<T>) =>
    /* Transforms each collection item so the corresponding values or interface elements can be produced. */
    /* Transforms each collection item so the corresponding values or interface elements can be produced. */
    rows.map((row) => row.key === key ? { ...row, ...patch } : row)

  /* Stores the value in submit so later lines can reuse this data or behavior for the current feature. */
  /* Stores the value in submit so later lines can reuse this data or behavior for the current feature. */
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    event.preventDefault()
    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    setError(null)
    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    setSuccess(null)

    /* Checks this condition before continuing so the code can choose the correct path for the current state. */
    /* Checks this condition before continuing so the code can choose the correct path for the current state. */
    if (values.logDate > localToday) {
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      setError('Log date cannot be in the future.')
      /* Returns the result so the caller or React receives the value or interface this function provides. */
      /* Returns the result so the caller or React receives the value or interface this function provides. */
      return
    /* Closes the current block or object so the grouped statements or settings end here. */
    /* Closes the current block or object so the grouped statements or settings end here. */
    }
    /* Stores the value in progress so later lines can reuse this data or behavior for the current feature. */
    /* Stores the value in progress so later lines can reuse this data or behavior for the current feature. */
    const progress = Number(values.progressPercent)
    /* Checks this condition before continuing so the code can choose the correct path for the current state. */
    /* Checks this condition before continuing so the code can choose the correct path for the current state. */
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      setError('Progress must be a number from 0 to 100.')
      /* Returns the result so the caller or React receives the value or interface this function provides. */
      /* Returns the result so the caller or React receives the value or interface this function provides. */
      return
    /* Closes the current block or object so the grouped statements or settings end here. */
    /* Closes the current block or object so the grouped statements or settings end here. */
    }
    /* Checks this condition before continuing so the code can choose the correct path for the current state. */
    /* Checks this condition before continuing so the code can choose the correct path for the current state. */
    if (!values.workSummary.trim()) {
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      setError('Work summary is required.')
      /* Returns the result so the caller or React receives the value or interface this function provides. */
      /* Returns the result so the caller or React receives the value or interface this function provides. */
      return
    /* Closes the current block or object so the grouped statements or settings end here. */
    /* Closes the current block or object so the grouped statements or settings end here. */
    }

    /* Stores the value in labourEntries so later lines can reuse this data or behavior for the current feature. */
    /* Stores the value in labourEntries so later lines can reuse this data or behavior for the current feature. */
    const labourEntries: DailyLogInput['labourEntries'] = []
    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    for (const [index, row] of values.labourEntries.entries()) {
      /* Checks this condition before continuing so the code can choose the correct path for the current state. */
      /* Checks this condition before continuing so the code can choose the correct path for the current state. */
      if (!row.trade.trim() && !row.contractorName.trim() && !row.headCount.trim() && !row.remarks.trim()) continue
      /* Stores the value in headCount so later lines can reuse this data or behavior for the current feature. */
      /* Stores the value in headCount so later lines can reuse this data or behavior for the current feature. */
      const headCount = Number(row.headCount)
      /* Stores the value in hoursWorked so later lines can reuse this data or behavior for the current feature. */
      /* Stores the value in hoursWorked so later lines can reuse this data or behavior for the current feature. */
      const hoursWorked = Number(row.hoursWorked)
      /* Checks this condition before continuing so the code can choose the correct path for the current state. */
      /* Checks this condition before continuing so the code can choose the correct path for the current state. */
      if (!row.trade.trim() || !Number.isInteger(headCount) || headCount <= 0 || !Number.isFinite(hoursWorked) || hoursWorked < 0 || hoursWorked > 24) {
        /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
        /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
        setError(`Labour group ${index + 1} needs a trade, positive whole-number headcount, and hours from 0 to 24.`)
        /* Returns the result so the caller or React receives the value or interface this function provides. */
        /* Returns the result so the caller or React receives the value or interface this function provides. */
        return
      /* Closes the current block or object so the grouped statements or settings end here. */
      /* Closes the current block or object so the grouped statements or settings end here. */
      }
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      labourEntries.push({
        /* Sets the trade field so the surrounding object or component receives this setting. */
        /* Sets the trade field so the surrounding object or component receives this setting. */
        trade: row.trade.trim(),
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        ...(row.contractorName.trim() ? { contractorName: row.contractorName.trim() } : {}),
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        headCount,
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        hoursWorked,
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        ...(row.remarks.trim() ? { remarks: row.remarks.trim() } : {}),
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      })
    /* Closes the current block or object so the grouped statements or settings end here. */
    /* Closes the current block or object so the grouped statements or settings end here. */
    }

    /* Stores the value in machineryEntries so later lines can reuse this data or behavior for the current feature. */
    /* Stores the value in machineryEntries so later lines can reuse this data or behavior for the current feature. */
    const machineryEntries: DailyLogInput['machineryEntries'] = []
    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    for (const [index, row] of values.machineryEntries.entries()) {
      /* Checks this condition before continuing so the code can choose the correct path for the current state. */
      /* Checks this condition before continuing so the code can choose the correct path for the current state. */
      if (!row.machineName.trim() && !row.operatorName.trim() && !row.hoursUsed.trim() && !row.fuelLitres.trim() && !row.remarks.trim()) continue
      /* Stores the value in hoursUsed so later lines can reuse this data or behavior for the current feature. */
      /* Stores the value in hoursUsed so later lines can reuse this data or behavior for the current feature. */
      const hoursUsed = Number(row.hoursUsed)
      /* Stores the value in fuelLitres so later lines can reuse this data or behavior for the current feature. */
      /* Stores the value in fuelLitres so later lines can reuse this data or behavior for the current feature. */
      const fuelLitres = row.fuelLitres === '' ? undefined : Number(row.fuelLitres)
      /* Checks this condition before continuing so the code can choose the correct path for the current state. */
      /* Checks this condition before continuing so the code can choose the correct path for the current state. */
      if (!row.machineName.trim() || !Number.isFinite(hoursUsed) || hoursUsed < 0 || hoursUsed > 24 || (fuelLitres !== undefined && (!Number.isFinite(fuelLitres) || fuelLitres < 0))) {
        /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
        /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
        setError(`Machinery entry ${index + 1} needs a machine name, hours from 0 to 24, and non-negative fuel quantity.`)
        /* Returns the result so the caller or React receives the value or interface this function provides. */
        /* Returns the result so the caller or React receives the value or interface this function provides. */
        return
      /* Closes the current block or object so the grouped statements or settings end here. */
      /* Closes the current block or object so the grouped statements or settings end here. */
      }
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      machineryEntries.push({
        /* Sets the machineName field so the surrounding object or component receives this setting. */
        /* Sets the machineName field so the surrounding object or component receives this setting. */
        machineName: row.machineName.trim(),
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        ...(row.operatorName.trim() ? { operatorName: row.operatorName.trim() } : {}),
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        hoursUsed,
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        ...(fuelLitres !== undefined ? { fuelLitres } : {}),
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        ...(row.remarks.trim() ? { remarks: row.remarks.trim() } : {}),
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      })
    /* Closes the current block or object so the grouped statements or settings end here. */
    /* Closes the current block or object so the grouped statements or settings end here. */
    }

    /* Stores the value in payload so later lines can reuse this data or behavior for the current feature. */
    /* Stores the value in payload so later lines can reuse this data or behavior for the current feature. */
    const payload: DailyLogInput = {
      /* Sets the logDate field so the surrounding object or component receives this setting. */
      /* Sets the logDate field so the surrounding object or component receives this setting. */
      logDate: values.logDate,
      /* Sets the progressPercent field so the surrounding object or component receives this setting. */
      /* Sets the progressPercent field so the surrounding object or component receives this setting. */
      progressPercent: progress,
      /* Sets the workSummary field so the surrounding object or component receives this setting. */
      /* Sets the workSummary field so the surrounding object or component receives this setting. */
      workSummary: values.workSummary.trim(),
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      ...(values.weather.trim() ? { weather: values.weather.trim() } : {}),
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      ...(values.issues.trim() ? { issues: values.issues.trim() } : {}),
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      labourEntries,
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      machineryEntries,
    /* Closes the current block or object so the grouped statements or settings end here. */
    /* Closes the current block or object so the grouped statements or settings end here. */
    }

    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
    setIsSaving(true)
    /* Starts an error-handling region so failures can be caught and handled safely. */
    /* Starts an error-handling region so failures can be caught and handled safely. */
    try {
      /* Stores the value in saved so later lines can reuse this data or behavior for the current feature. */
      /* Stores the value in saved so later lines can reuse this data or behavior for the current feature. */
      const saved = logId
        /* Waits for the asynchronous result before using it, so later work receives completed data. */
        /* Waits for the asynchronous result before using it, so later work receives completed data. */
        ? await updateDailyLog(logId, payload)
        /* Waits for the asynchronous result before using it, so later work receives completed data. */
        /* Waits for the asynchronous result before using it, so later work receives completed data. */
        : await createDailyLog(projectId, payload)
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      setSuccess(logId ? 'Daily log updated successfully.' : 'Daily log created successfully.')
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      navigate(`/projects/${projectId}/logs/${saved.id}?saved=${logId ? 'updated' : 'created'}`)
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    } catch (cause) {
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      setError(formatApiError(cause))
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    } finally {
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
      setIsSaving(false)
    /* Closes the current block or object so the grouped statements or settings end here. */
    /* Closes the current block or object so the grouped statements or settings end here. */
    }
  /* Closes the current block or object so the grouped statements or settings end here. */
  /* Closes the current block or object so the grouped statements or settings end here. */
  }

  /* Returns the result so the caller or React receives the value or interface this function provides. */
  /* Returns the result so the caller or React receives the value or interface this function provides. */
  return <AppShell currentPath={`/projects/${projectId}/logs`}>
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6 lg:px-10">
      {/* Starts the <button> element to provide an action the user can activate. */}
      <button type="button" onClick={() => navigate(`/projects/${projectId}/logs`)} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#8E827A] hover:text-[#323232]"><ArrowLeft size={16} /> Back to logs</button>
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mb-7">
        {/* Starts the <p> element to organize this part of the interface. */}
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5E3A]">{project?.name ?? `Project ${projectId}`} · {project?.code ?? projectId}</p>
        {/* Starts the <h1> element to organize this part of the interface. */}
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{logId ? 'Edit Daily Log' : 'Create Daily Log'}</h1>
        {/* Starts the <p> element to organize this part of the interface. */}
        <p className="mt-2 text-sm text-[#8E827A]">Record work, progress, labour groups, and machinery used on site.</p>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {displayError && <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><p>{displayError}</p></div>}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {success && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {isLoading ? <div aria-live="polite" className="rounded-2xl border border-[#E8E0DA] bg-white p-8 text-sm text-[#8E827A]">Loading daily log…</div> : currentLoadResult?.error && (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="rounded-xl bg-[#323232] px-4 py-2.5 text-sm font-semibold text-white">Retry</button>
      // Continues the component or data expression so its related values and behavior stay grouped together.
      )}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {!isLoading && !(currentLoadResult?.error && logId) && <form onSubmit={submit} className="space-y-5">
        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="rounded-2xl border border-[#E8E0DA] bg-white p-6">
          {/* Starts the <h2> element to organize this part of the interface. */}
          <h2 className="mb-5 font-semibold">Daily information</h2>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Log date
              {/* Starts the <span> element to organize this part of the interface. */}
              <span className="relative mt-2 block"><CalendarDays className="absolute left-3 top-3 h-4 w-4 text-[#9A5E3A]" /><input required type="date" max={localToday} value={values.logDate} onChange={(event) => update({ logDate: event.target.value })} className="w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#9A5E3A]" /></span>
            {/* Closes the <label> element so later content is no longer part of this region. */}
            </label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Cumulative project progress (%)
              {/* Starts the <input> element to collect or display a value. */}
              <input required type="number" min="0" max="100" step="0.01" value={values.progressPercent} onChange={(event) => update({ progressPercent: event.target.value })} className="mt-2 w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] px-3 py-3 text-sm outline-none focus:border-[#9A5E3A]" />
            {/* Closes the <label> element so later content is no longer part of this region. */}
            </label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552] md:col-span-2">Work summary
              {/* Starts the <textarea> element to collect or display a value. */}
              <textarea required maxLength={5000} value={values.workSummary} onChange={(event) => update({ workSummary: event.target.value })} className="mt-2 min-h-28 w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] p-3 text-sm outline-none focus:border-[#9A5E3A]" placeholder="Summarise work completed, inspections, deliveries, and next steps..." />
            {/* Closes the <label> element so later content is no longer part of this region. */}
            </label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Weather
              {/* Starts the <input> element to collect or display a value. */}
              <input maxLength={150} value={values.weather} onChange={(event) => update({ weather: event.target.value })} className="mt-2 w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] px-3 py-3 text-sm outline-none focus:border-[#9A5E3A]" placeholder="Optional" />
            {/* Closes the <label> element so later content is no longer part of this region. */}
            </label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Issues or delays
              {/* Starts the <input> element to collect or display a value. */}
              <input maxLength={5000} value={values.issues} onChange={(event) => update({ issues: event.target.value })} className="mt-2 w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] px-3 py-3 text-sm outline-none focus:border-[#9A5E3A]" placeholder="Optional" />
            {/* Closes the <label> element so later content is no longer part of this region. */}
            </label>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="rounded-2xl border border-[#E8E0DA] bg-white p-6">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Labour attendance</h2><p className="mt-1 text-xs text-[#8E827A]">Record headcount by trade or contractor; individual attendance statuses are not supported.</p></div><button type="button" onClick={() => update({ labourEntries: [...values.labourEntries, blankLabour()] })} className="inline-flex items-center gap-1 rounded-lg border border-[#E8E0DA] px-3 py-2 text-xs font-semibold text-[#9A5E3A]"><Plus size={14} /> Add group</button></div>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {values.labourEntries.length === 0 ? <p className="mt-5 text-sm text-[#8E827A]">No labour groups added.</p> : <div className="mt-4 space-y-3">{values.labourEntries.map((row) => <div key={row.key} className="grid gap-3 rounded-xl bg-[#FBF9F7] p-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Starts the <Field> element to organize this part of the interface. */}
            <Field label="Trade"><input value={row.trade} onChange={(event) => update({ labourEntries: editRow(values.labourEntries, row.key, { trade: event.target.value }) })} className={inputClass} /></Field>
            {/* Starts the <Field> element to organize this part of the interface. */}
            <Field label="Contractor"><input value={row.contractorName} onChange={(event) => update({ labourEntries: editRow(values.labourEntries, row.key, { contractorName: event.target.value }) })} className={inputClass} /></Field>
            {/* Starts the <Field> element to organize this part of the interface. */}
            <Field label="Headcount"><input type="number" min="1" step="1" value={row.headCount} onChange={(event) => update({ labourEntries: editRow(values.labourEntries, row.key, { headCount: event.target.value }) })} className={inputClass} /></Field>
            {/* Starts the <Field> element to organize this part of the interface. */}
            <Field label="Hours worked (0–24)"><input type="number" min="0" max="24" step="0.25" value={row.hoursWorked} onChange={(event) => update({ labourEntries: editRow(values.labourEntries, row.key, { hoursWorked: event.target.value }) })} className={inputClass} /></Field>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-end gap-2"><Field label="Remarks" className="min-w-0 flex-1"><input value={row.remarks} onChange={(event) => update({ labourEntries: editRow(values.labourEntries, row.key, { remarks: event.target.value }) })} className={inputClass} /></Field><button type="button" aria-label="Remove labour group" onClick={() => update({ labourEntries: values.labourEntries.filter((entry) => entry.key !== row.key) })} className="mb-1 rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Trash2 size={16} /></button></div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>)}</div>}
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="rounded-2xl border border-[#E8E0DA] bg-white p-6">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Machinery usage</h2><p className="mt-1 text-xs text-[#8E827A]">Record each machine, operating hours, and optional fuel quantity.</p></div><button type="button" onClick={() => update({ machineryEntries: [...values.machineryEntries, blankMachinery()] })} className="inline-flex items-center gap-1 rounded-lg border border-[#E8E0DA] px-3 py-2 text-xs font-semibold text-[#9A5E3A]"><Plus size={14} /> Add machine</button></div>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {values.machineryEntries.length === 0 ? <p className="mt-5 text-sm text-[#8E827A]">No machinery entries added.</p> : <div className="mt-4 space-y-3">{values.machineryEntries.map((row) => <div key={row.key} className="grid gap-3 rounded-xl bg-[#FBF9F7] p-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Starts the <Field> element to organize this part of the interface. */}
            <Field label="Machine name"><input value={row.machineName} onChange={(event) => update({ machineryEntries: editRow(values.machineryEntries, row.key, { machineName: event.target.value }) })} className={inputClass} /></Field>
            {/* Starts the <Field> element to organize this part of the interface. */}
            <Field label="Operator"><input value={row.operatorName} onChange={(event) => update({ machineryEntries: editRow(values.machineryEntries, row.key, { operatorName: event.target.value }) })} className={inputClass} /></Field>
            {/* Starts the <Field> element to organize this part of the interface. */}
            <Field label="Hours used (0–24)"><input type="number" min="0" max="24" step="0.25" value={row.hoursUsed} onChange={(event) => update({ machineryEntries: editRow(values.machineryEntries, row.key, { hoursUsed: event.target.value }) })} className={inputClass} /></Field>
            {/* Starts the <Field> element to organize this part of the interface. */}
            <Field label="Fuel litres"><input type="number" min="0" step="0.01" value={row.fuelLitres} onChange={(event) => update({ machineryEntries: editRow(values.machineryEntries, row.key, { fuelLitres: event.target.value }) })} className={inputClass} /></Field>
            {/* Starts the <Field> element to organize this part of the interface. */}
            <Field label="Remarks"><input value={row.remarks} onChange={(event) => update({ machineryEntries: editRow(values.machineryEntries, row.key, { remarks: event.target.value }) })} className={inputClass} /></Field>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-end"><button type="button" onClick={() => update({ machineryEntries: values.machineryEntries.filter((entry) => entry.key !== row.key) })} className="mb-1 inline-flex items-center gap-2 rounded-lg p-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"><Trash2 size={15} /> Remove entry</button></div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>)}</div>}
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex justify-end gap-3"><button type="button" onClick={() => navigate(`/projects/${projectId}/logs`)} className="rounded-xl border border-[#E8E0DA] bg-white px-5 py-3 text-sm font-semibold text-[#595552]">Cancel</button><button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} /> {isSaving ? 'Saving…' : logId ? 'Save changes' : 'Create daily log'}</button></div>
      {/* Closes the <form> element so later content is no longer part of this region. */}
      </form>}
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>
  {/* Closes the <AppShell> element so later content is no longer part of this region. */}
  </AppShell>
/* Closes the current block or object so the grouped statements or settings end here. */
/* Closes the current block or object so the grouped statements or settings end here. */
}

/* Stores the value in inputClass so later lines can reuse this data or behavior for the current feature. */
/* Stores the value in inputClass so later lines can reuse this data or behavior for the current feature. */
const inputClass = 'mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9A5E3A]'

/* Defines Field so this module can perform its named task when needed. */
/* Defines Field so this module can perform its named task when needed. */
function Field({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  /* Returns the result so the caller or React receives the value or interface this function provides. */
  /* Returns the result so the caller or React receives the value or interface this function provides. */
  return <label className={`block text-xs font-medium text-[#595552] ${className}`}>{label}{children}</label>
/* Closes the current block or object so the grouped statements or settings end here. */
/* Closes the current block or object so the grouped statements or settings end here. */
}
// File purpose: Renders the daily logs screen and coordinates its page-level interactions.
