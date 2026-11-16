// Imports useEffect, useState, type FormEvent from react so this module can reuse that component, helper, or library.
import { useEffect, useState, type FormEvent } from 'react'
// Imports Activity, AlertCircle, HardHat, Plus, RefreshCw, Trash2, Wrench from lucide-react so this module can reuse that component, helper, or library.
import { Activity, AlertCircle, HardHat, Plus, RefreshCw, Trash2, Wrench } from 'lucide-react'
// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  createProjectMilestone,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  deleteProjectMilestone,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fetchLabourSummary,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fetchMachinerySummary,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fetchMachineryUsageHistory,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fetchProjectActivity,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fetchProjectMilestones,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fetchWorkerCountHistory,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  updateProjectMilestone,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type ActivityPage,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type LabourSummary,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type MachinerySummary,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type MachineryUsageHistory,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type MilestoneInput,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type MilestoneStatus,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type ProjectMilestone,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type WorkerCountHistory,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from '../../daily-logs/data/projectReportingApi'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'

// Continues the component or data expression so its related values and behavior stay grouped together.
interface ProjectOperationsReportsProps {
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: string
  // Sets the fromDate field so the surrounding object or component receives this setting.
  fromDate: string
  // Sets the toDate field so the surrounding object or component receives this setting.
  toDate: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
interface ReportResults {
  // Sets the key field so the surrounding object or component receives this setting.
  key: string
  // Sets the activity field so the surrounding object or component receives this setting.
  activity: ReportValue<ActivityPage>
  // Sets the labour field so the surrounding object or component receives this setting.
  labour: ReportValue<LabourSummary>
  // Sets the workerHistory field so the surrounding object or component receives this setting.
  workerHistory: ReportValue<WorkerCountHistory[]>
  // Sets the machinery field so the surrounding object or component receives this setting.
  machinery: ReportValue<MachinerySummary>
  // Sets the machineryHistory field so the surrounding object or component receives this setting.
  machineryHistory: ReportValue<MachineryUsageHistory[]>
  // Sets the milestones field so the surrounding object or component receives this setting.
  milestones: ReportValue<ProjectMilestone[]>
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
interface ReportValue<T> {
  // Sets the data field so the surrounding object or component receives this setting.
  data: T | null
  // Sets the error field so the surrounding object or component receives this setting.
  error: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in statuses so later lines can reuse this data or behavior for the current feature.
const statuses: MilestoneStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']

// Defines loadReport so this module can perform its named task when needed.
async function loadReport<T>(request: Promise<T>): Promise<ReportValue<T>> {
  // Starts an error-handling region so failures can be caught and handled safely.
  try {
    // Returns the result so the caller or React receives the value or interface this function provides.
    return { data: await request, error: null }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  } catch (cause) {
    // Returns the result so the caller or React receives the value or interface this function provides.
    return { data: null, error: cause instanceof Error ? cause.message : 'Unable to load this report.' }
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines displayDate so this module can perform its named task when needed.
function displayDate(value: string) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString()
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines dateInputValue so this module can perform its named task when needed.
function dateInputValue(value: string | null) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return value?.slice(0, 10) ?? ''
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ProjectOperationsReports so this module can perform its named task when needed.
export function ProjectOperationsReports({ projectId, fromDate, toDate }: ProjectOperationsReportsProps) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [results, setResults] = useState<ReportResults | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [retry, setRetry] = useState(0)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [mutation, setMutation] = useState(0)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [editing, setEditing] = useState<ProjectMilestone | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [isFormOpen, setIsFormOpen] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [isSaving, setIsSaving] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [mutationError, setMutationError] = useState<string | null>(null)
  // Stores the value in requestKey so later lines can reuse this data or behavior for the current feature.
  const requestKey = `${projectId}:${fromDate}:${toDate}:${retry}:${mutation}`

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Stores the value in range so later lines can reuse this data or behavior for the current feature.
    const range = { from: fromDate || undefined, to: toDate || undefined }
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    void Promise.all([
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      loadReport(fetchProjectActivity(projectId, 1, 20, controller.signal)),
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      loadReport(fetchLabourSummary(projectId, range.from, range.to, controller.signal)),
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      loadReport(fetchWorkerCountHistory(projectId, range.from, range.to, controller.signal)),
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      loadReport(fetchMachinerySummary(projectId, range.from, range.to, controller.signal)),
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      loadReport(fetchMachineryUsageHistory(projectId, range.from, range.to, controller.signal)),
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      loadReport(fetchProjectMilestones(projectId, controller.signal)),
    // Continues the component or data expression so its related values and behavior stay grouped together.
    ]).then(([activity, labour, workerHistory, machinery, machineryHistory, milestones]) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setResults({ key: requestKey, activity, labour, workerHistory, machinery, machineryHistory, milestones })
      // Closes the current block or object so the grouped statements or settings end here.
      }
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => controller.abort()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [projectId, fromDate, toDate, requestKey])

  // Stores the value in data so later lines can reuse this data or behavior for the current feature.
  const data = results?.key === requestKey ? results : null
  // Stores the value in refresh so later lines can reuse this data or behavior for the current feature.
  const refresh = () => setRetry((value) => value + 1)

  // Stores the value in saveMilestone so later lines can reuse this data or behavior for the current feature.
  const saveMilestone = async (event: FormEvent<HTMLFormElement>) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    event.preventDefault()
    // Stores the value in form so later lines can reuse this data or behavior for the current feature.
    const form = new FormData(event.currentTarget)
    // Stores the value in input so later lines can reuse this data or behavior for the current feature.
    const input: MilestoneInput = {
      // Sets the name field so the surrounding object or component receives this setting.
      name: String(form.get('name') ?? '').trim(),
      // Sets the description field so the surrounding object or component receives this setting.
      description: String(form.get('description') ?? '').trim() || null,
      // Sets the sequence field so the surrounding object or component receives this setting.
      sequence: Number(form.get('sequence')),
      // Sets the plannedStartDate field so the surrounding object or component receives this setting.
      plannedStartDate: String(form.get('plannedStartDate') ?? '') || null,
      // Sets the plannedEndDate field so the surrounding object or component receives this setting.
      plannedEndDate: String(form.get('plannedEndDate') ?? '') || null,
      // Sets the actualStartDate field so the surrounding object or component receives this setting.
      actualStartDate: String(form.get('actualStartDate') ?? '') || null,
      // Sets the actualEndDate field so the surrounding object or component receives this setting.
      actualEndDate: String(form.get('actualEndDate') ?? '') || null,
      // Sets the status field so the surrounding object or component receives this setting.
      status: String(form.get('status')) as MilestoneStatus,
      // Sets the progressPercent field so the surrounding object or component receives this setting.
      progressPercent: Number(form.get('progressPercent')),
    // Closes the current block or object so the grouped statements or settings end here.
    }

    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setIsSaving(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setMutationError(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (editing) await updateProjectMilestone(editing.id, input)
      // Handles the alternative branch when the preceding condition was not met.
      else await createProjectMilestone(projectId, input)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setEditing(null)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setIsFormOpen(false)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setMutation((value) => value + 1)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (cause) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setMutationError(cause instanceof ApiError ? cause.message : 'Unable to save the milestone.')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setIsSaving(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in removeMilestone so later lines can reuse this data or behavior for the current feature.
  const removeMilestone = async (milestone: ProjectMilestone) => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!window.confirm(`Delete milestone "${milestone.name}"?`)) return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setMutationError(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await deleteProjectMilestone(milestone.id)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setMutation((value) => value + 1)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (cause) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setMutationError(cause instanceof ApiError ? cause.message : 'Unable to delete the milestone.')
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div className="mt-6 space-y-5">
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="grid gap-5 xl:grid-cols-2">
      {/* Starts the <ReportPanel> element to organize this part of the interface. */}
      <ReportPanel
        /* Sets the title property so this element receives the data or behavior required by this screen. */
        /* Sets the title property so this element receives the data or behavior required by this screen. */
        title="Labour attendance"
        /* Sets the icon property so this element receives the data or behavior required by this screen. */
        /* Sets the icon property so this element receives the data or behavior required by this screen. */
        icon={<HardHat size={17} />}
        /* Sets the error property so this element receives the data or behavior required by this screen. */
        /* Sets the error property so this element receives the data or behavior required by this screen. */
        error={data?.labour.error ?? data?.workerHistory.error ?? null}
        /* Sets the loading property so this element receives the data or behavior required by this screen. */
        /* Sets the loading property so this element receives the data or behavior required by this screen. */
        loading={!data}
        /* Connects the Retry event to its handler so the interface can respond to interaction. */
        onRetry={refresh}
        /* Sets the empty property so this element receives the data or behavior required by this screen. */
        /* Sets the empty property so this element receives the data or behavior required by this screen. */
        empty={!data?.labour.data?.byTrade.length && !data?.workerHistory.data?.length}
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      >
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {data?.labour.data && <>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="grid grid-cols-3 gap-3">
            {/* Starts the <SmallMetric> element to organize this part of the interface. */}
            <SmallMetric label="Recorded worker count" value={data.labour.data.totalWorkerCount} />
            {/* Starts the <SmallMetric> element to organize this part of the interface. */}
            <SmallMetric label="Labour hours" value={data.labour.data.totalLabourHours} />
            {/* Starts the <SmallMetric> element to organize this part of the interface. */}
            <SmallMetric label="Entries" value={data.labour.data.totalLabourEntries} />
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {data.labour.data.byTrade.length > 0 && <div className="mt-4 divide-y divide-[#F1EBE6]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {data.labour.data.byTrade.map((trade) => <div key={trade.trade} className="flex items-center justify-between gap-3 py-3 text-sm">
              {/* Starts the <span> element to organize this part of the interface. */}
              <span>{trade.trade}</span><span className="text-right text-[#8E827A]">{trade.workerCount} workers · {trade.labourHours}h · {trade.entries} entries</span>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>)}
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>}
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        </>}
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {data?.workerHistory.data && data.workerHistory.data.length > 0 && <div className="mt-4 border-t border-[#E8E0DA] pt-3">
          {/* Starts the <h3> element to organize this part of the interface. */}
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8E827A]">Worker-count history</h3>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {data.workerHistory.data.map((record) => <div key={record.dailyLogId} className="flex justify-between py-2 text-sm">
            {/* Starts the <span> element to organize this part of the interface. */}
            <span>{displayDate(record.logDate)}</span><span>{record.totalWorkerCount} workers · {record.labourHours}h</span>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>)}
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>}
      {/* Closes the <ReportPanel> element so later content is no longer part of this region. */}
      </ReportPanel>

      {/* Starts the <ReportPanel> element to organize this part of the interface. */}
      <ReportPanel
        /* Sets the title property so this element receives the data or behavior required by this screen. */
        /* Sets the title property so this element receives the data or behavior required by this screen. */
        title="Machinery usage"
        /* Sets the icon property so this element receives the data or behavior required by this screen. */
        /* Sets the icon property so this element receives the data or behavior required by this screen. */
        icon={<Wrench size={17} />}
        /* Sets the error property so this element receives the data or behavior required by this screen. */
        /* Sets the error property so this element receives the data or behavior required by this screen. */
        error={data?.machinery.error ?? data?.machineryHistory.error ?? null}
        /* Sets the loading property so this element receives the data or behavior required by this screen. */
        /* Sets the loading property so this element receives the data or behavior required by this screen. */
        loading={!data}
        /* Connects the Retry event to its handler so the interface can respond to interaction. */
        onRetry={refresh}
        /* Sets the empty property so this element receives the data or behavior required by this screen. */
        /* Sets the empty property so this element receives the data or behavior required by this screen. */
        empty={!data?.machinery.data?.byMachine.length && !data?.machineryHistory.data?.length}
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      >
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {data?.machinery.data && <>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="grid grid-cols-3 gap-3">
            {/* Starts the <SmallMetric> element to organize this part of the interface. */}
            <SmallMetric label="Hours used" value={data.machinery.data.totalMachineryHours} />
            {/* Starts the <SmallMetric> element to organize this part of the interface. */}
            <SmallMetric label="Fuel consumption" value={data.machinery.data.totalFuelConsumption} suffix=" L" />
            {/* Starts the <SmallMetric> element to organize this part of the interface. */}
            <SmallMetric label="Entries" value={data.machinery.data.totalMachineryEntries} />
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {data.machinery.data.byMachine.length > 0 && <div className="mt-4 divide-y divide-[#F1EBE6]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {data.machinery.data.byMachine.map((machine) => <div key={machine.machineName} className="flex items-center justify-between gap-3 py-3 text-sm">
              {/* Starts the <span> element to organize this part of the interface. */}
              <span>{machine.machineName}</span><span className="text-right text-[#8E827A]">{machine.hoursUsed}h · {machine.fuelConsumption} L · {machine.entries} entries</span>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>)}
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>}
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        </>}
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {data?.machineryHistory.data && data.machineryHistory.data.length > 0 && <div className="mt-4 border-t border-[#E8E0DA] pt-3">
          {/* Starts the <h3> element to organize this part of the interface. */}
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8E827A]">Usage history</h3>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {data.machineryHistory.data.map((record, index) => <div key={`${record.dailyLogId}:${record.machineName}:${index}`} className="flex justify-between gap-3 py-2 text-sm">
            {/* Starts the <span> element to organize this part of the interface. */}
            <span>{displayDate(record.logDate)} · {record.machineName}{record.operatorName ? ` · ${record.operatorName}` : ''}</span><span className="whitespace-nowrap">{record.hoursUsed}h · {record.fuelConsumption} L</span>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>)}
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>}
      {/* Closes the <ReportPanel> element so later content is no longer part of this region. */}
      </ReportPanel>
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>

    {/* Starts the <ReportPanel> element to organize this part of the interface. */}
    <ReportPanel
      /* Sets the title property so this element receives the data or behavior required by this screen. */
      /* Sets the title property so this element receives the data or behavior required by this screen. */
      title="Project activity"
      /* Sets the icon property so this element receives the data or behavior required by this screen. */
      /* Sets the icon property so this element receives the data or behavior required by this screen. */
      icon={<Activity size={17} />}
      /* Sets the error property so this element receives the data or behavior required by this screen. */
      /* Sets the error property so this element receives the data or behavior required by this screen. */
      error={data?.activity.error ?? null}
      /* Sets the loading property so this element receives the data or behavior required by this screen. */
      /* Sets the loading property so this element receives the data or behavior required by this screen. */
      loading={!data}
      /* Connects the Retry event to its handler so the interface can respond to interaction. */
      onRetry={refresh}
      /* Sets the empty property so this element receives the data or behavior required by this screen. */
      /* Sets the empty property so this element receives the data or behavior required by this screen. */
      empty={!data?.activity.data?.activities.length}
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    >
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {data?.activity.data?.activities.map((entry) => <article key={entry.id} className="border-b border-[#F1EBE6] py-3 last:border-0">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="text-sm font-semibold">{entry.action.replaceAll('_', ' ')} · {entry.entityType} #{entry.entityId}</p>
          {/* Starts the <time> element to organize this part of the interface. */}
          <time className="text-xs text-[#8E827A]" dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <p> element to organize this part of the interface. */}
        <p className="mt-1 text-xs text-[#8E827A]">{entry.userName ? `By ${entry.userName}` : 'User unavailable'}</p>
      {/* Closes the <article> element so later content is no longer part of this region. */}
      </article>)}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {data?.activity.data && data.activity.data.total > data.activity.data.activities.length && <p className="pt-3 text-xs text-[#8E827A]">Showing {data.activity.data.activities.length} of {data.activity.data.total} activity records.</p>}
    {/* Closes the <ReportPanel> element so later content is no longer part of this region. */}
    </ReportPanel>

    {/* Starts the <section> element to group related content into a meaningful region. */}
    <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)] sm:p-6">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div><h2 className="font-semibold">Project milestones</h2><p className="mt-1 text-xs text-[#8E827A]">Milestone dates, progress, and status recorded by the backend.</p></div>
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {!isFormOpen && <button type="button" onClick={() => { setEditing(null); setIsFormOpen(true); setMutationError(null) }} className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-3 py-2 text-xs font-semibold text-white"><Plus size={14} /> Add milestone</button>}
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {mutationError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{mutationError}</p>}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {(!data || data.milestones.error) && <InlineLoadState loading={!data} error={data?.milestones.error ?? null} onRetry={refresh} />}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {data?.milestones.data && data.milestones.data.length === 0 && <p className="py-6 text-center text-sm text-[#8E827A]">No milestones have been recorded for this project.</p>}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {data?.milestones.data?.map((milestone) => <div key={milestone.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F1EBE6] py-4">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="min-w-[220px] flex-1">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{milestone.sequence}. {milestone.name}</h3><span className="rounded-full bg-[#F3E9E1] px-2 py-1 text-[10px] font-semibold">{milestone.status.replaceAll('_', ' ')}</span></div>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {milestone.description && <p className="mt-1 text-sm text-[#595552]">{milestone.description}</p>}
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-1 text-xs text-[#8E827A]">Planned: {milestone.plannedStartDate ? displayDate(milestone.plannedStartDate) : '—'} to {milestone.plannedEndDate ? displayDate(milestone.plannedEndDate) : '—'} · Actual: {milestone.actualStartDate ? displayDate(milestone.actualStartDate) : '—'} to {milestone.actualEndDate ? displayDate(milestone.actualEndDate) : '—'}</p>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-center gap-3"><span className="text-sm font-semibold">{Number(milestone.progressPercent)}%</span>
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button type="button" onClick={() => { setEditing(milestone); setIsFormOpen(true); setMutationError(null) }} className="rounded-lg border border-[#E8E0DA] px-3 py-2 text-xs font-semibold">Edit</button>
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button type="button" onClick={() => void removeMilestone(milestone)} aria-label={`Delete ${milestone.name}`} className="rounded-lg border border-rose-200 p-2 text-rose-700"><Trash2 size={14} /></button>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>)}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {isFormOpen && <form key={editing?.id ?? 'new'} className="mt-4 grid gap-3 rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] p-4 sm:grid-cols-2" onSubmit={(event) => void saveMilestone(event)}>
        {/* Starts the <label> element to name a form control for users and assistive technology. */}
        <label className="text-xs text-[#8E827A] sm:col-span-2">Name<input required name="name" maxLength={255} defaultValue={editing?.name ?? ''} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        {/* Starts the <label> element to name a form control for users and assistive technology. */}
        <label className="text-xs text-[#8E827A] sm:col-span-2">Description<textarea name="description" maxLength={5000} defaultValue={editing?.description ?? ''} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        {/* Starts the <label> element to name a form control for users and assistive technology. */}
        <label className="text-xs text-[#8E827A]">Sequence<input required type="number" min="1" step="1" name="sequence" defaultValue={editing?.sequence ?? (data?.milestones.data?.length ?? 0) + 1} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        {/* Starts the <label> element to name a form control for users and assistive technology. */}
        <label className="text-xs text-[#8E827A]">Status<select name="status" defaultValue={editing?.status ?? 'PLANNED'} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]">{statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label>
        {/* Starts the <label> element to name a form control for users and assistive technology. */}
        <label className="text-xs text-[#8E827A]">Progress (%)<input required type="number" min="0" max="100" step="0.01" name="progressPercent" defaultValue={Number(editing?.progressPercent ?? 0)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="grid grid-cols-2 gap-3">
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-xs text-[#8E827A]">Planned start<input type="date" name="plannedStartDate" defaultValue={dateInputValue(editing?.plannedStartDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-xs text-[#8E827A]">Planned end<input type="date" name="plannedEndDate" defaultValue={dateInputValue(editing?.plannedEndDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="grid grid-cols-2 gap-3">
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-xs text-[#8E827A]">Actual start<input type="date" name="actualStartDate" defaultValue={dateInputValue(editing?.actualStartDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-xs text-[#8E827A]">Actual end<input type="date" name="actualEndDate" defaultValue={dateInputValue(editing?.actualEndDate ?? null)} className="mt-1 w-full rounded-lg border border-[#E8E0DA] bg-white p-2 text-sm text-[#323232]" /></label>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex justify-end gap-2 sm:col-span-2">
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button type="button" onClick={() => { setEditing(null); setIsFormOpen(false); setMutationError(null) }} className="rounded-lg border border-[#E8E0DA] px-3 py-2 text-xs font-semibold">Cancel</button>
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button disabled={isSaving} type="submit" className="rounded-lg bg-[#323232] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{isSaving ? 'Saving…' : 'Save milestone'}</button>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <form> element so later content is no longer part of this region. */}
      </form>}
    {/* Closes the <section> element so later content is no longer part of this region. */}
    </section>
  {/* Closes the <div> element so later content is no longer part of this region. */}
  </div>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ReportPanel so this module can perform its named task when needed.
function ReportPanel({
  // Continues the component or data expression so its related values and behavior stay grouped together.
  title,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  icon,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  error,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  loading,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  empty,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  onRetry,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  children,
// Continues the component or data expression so its related values and behavior stay grouped together.
}: {
  // Sets the title field so the surrounding object or component receives this setting.
  title: string
  // Sets the icon field so the surrounding object or component receives this setting.
  icon: React.ReactNode
  // Sets the error field so the surrounding object or component receives this setting.
  error: string | null
  // Sets the loading field so the surrounding object or component receives this setting.
  loading: boolean
  // Sets the empty field so the surrounding object or component receives this setting.
  empty: boolean
  // Sets the onRetry field so the surrounding object or component receives this setting.
  onRetry: () => void
  // Sets the children field so the surrounding object or component receives this setting.
  children: React.ReactNode
// Continues the component or data expression so its related values and behavior stay grouped together.
}) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)] sm:p-6">
    {/* Starts the <h2> element to organize this part of the interface. */}
    <h2 className="mb-4 flex items-center gap-2 font-semibold"><span className="text-[#9A5E3A]">{icon}</span>{title}</h2>
    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
    {loading ? <p aria-live="polite" className="py-8 text-center text-sm text-[#8E827A]">Loading {title.toLowerCase()}…</p>
      // Continues the component or data expression so its related values and behavior stay grouped together.
      : error ? <InlineLoadState loading={false} error={error} onRetry={onRetry} />
        // Continues the component or data expression so its related values and behavior stay grouped together.
        : empty ? <p className="py-8 text-center text-sm text-[#8E827A]">No {title.toLowerCase()} data for this project and date range.</p>
          // Continues the component or data expression so its related values and behavior stay grouped together.
          : children}
  {/* Closes the <section> element so later content is no longer part of this region. */}
  </section>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines InlineLoadState so this module can perform its named task when needed.
function InlineLoadState({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry: () => void }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div role={error ? 'alert' : 'status'} className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
    {/* Starts the <span> element to organize this part of the interface. */}
    <span className="flex items-center gap-2">{error ? <AlertCircle size={15} /> : <RefreshCw size={15} />}{error ?? (loading ? 'Loading…' : '')}</span>
    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
    {error && <button type="button" onClick={onRetry} className="font-semibold underline">Retry</button>}
  {/* Closes the <div> element so later content is no longer part of this region. */}
  </div>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines SmallMetric so this module can perform its named task when needed.
function SmallMetric({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div className="rounded-xl bg-[#FBF9F7] p-3"><p className="text-[10px] leading-4 text-[#8E827A]">{label}</p><p className="mt-1 text-lg font-semibold">{value}{suffix}</p></div>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the reusable ProjectOperationsReports interface component.
