// Imports useEffect, useState from react so this module can reuse that component, helper, or library.
import { useEffect, useState } from 'react'
// Imports ArrowLeft, CalendarDays, MapPin, UserRound, Wallet from lucide-react so this module can reuse that component, helper, or library.
import { ArrowLeft, CalendarDays, MapPin, UserRound, Wallet } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports apiGet, ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { apiGet, ApiError } from '../../../lib/api'
// Imports mapProject, type ApiProject from ../project-utils so this module can reuse that component, helper, or library.
import { mapProject, type ApiProject } from '../project-utils'
// Imports type  Project from ../projects-context so this module can reuse that component, helper, or library.
import type { Project } from '../projects-context'

// Stores the value in statusLabels so later lines can reuse this data or behavior for the current feature.
const statusLabels: Record<Project['status'], string> = {
  // Sets the PLANNING field so the surrounding object or component receives this setting.
  PLANNING: 'Planning',
  // Sets the ACTIVE field so the surrounding object or component receives this setting.
  ACTIVE: 'Active',
  // Sets the ON_HOLD field so the surrounding object or component receives this setting.
  ON_HOLD: 'On Hold',
  // Sets the COMPLETED field so the surrounding object or component receives this setting.
  COMPLETED: 'Completed',
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines formatDate so this module can perform its named task when needed.
function formatDate(value: string | null) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return value ? new Date(value).toLocaleDateString() : 'Not specified'
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines formatBudget so this module can perform its named task when needed.
function formatBudget(value: string | number) {
  // Stores the value in amount so later lines can reuse this data or behavior for the current feature.
  const amount = Number(value)
  // Returns the result so the caller or React receives the value or interface this function provides.
  return Number.isFinite(amount)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    : 'Not specified'
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ProjectDetailsPage so this module can perform its named task when needed.
export function ProjectDetailsPage() {
  // Stores the value in projectId so later lines can reuse this data or behavior for the current feature.
  const projectId = window.location.pathname.split('/').filter(Boolean)[2]
  // Continues the component or data expression so its related values and behavior stay grouped together.
  const [result, setResult] = useState<{
    // Sets the key field so the surrounding object or component receives this setting.
    key: string
    // Sets the project field so the surrounding object or component receives this setting.
    project: Project | null
    // Sets the error field so the surrounding object or component receives this setting.
    error: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  } | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [retryCount, setRetryCount] = useState(0)
  // Stores the value in requestKey so later lines can reuse this data or behavior for the current feature.
  const requestKey = `${projectId ?? ''}:${retryCount}`
  // Stores the value in validProjectId so later lines can reuse this data or behavior for the current feature.
  const validProjectId = /^\d+$/.test(projectId ?? '')

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!validProjectId) return
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    apiGet<ApiProject>(`/projects/${encodeURIComponent(projectId)}`, { signal: controller.signal })
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .then(({ data }) => {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setResult({ key: requestKey, project: mapProject(data), error: null })
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .catch((cause: unknown) => {
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (controller.signal.aborted) return
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setResult({
          // Sets the key field so the surrounding object or component receives this setting.
          key: requestKey,
          // Sets the project field so the surrounding object or component receives this setting.
          project: null,
          // Sets the error field so the surrounding object or component receives this setting.
          error: cause instanceof ApiError && cause.status === 404
            // Continues the component or data expression so its related values and behavior stay grouped together.
            ? 'This project is unavailable to your account.'
            // Continues the component or data expression so its related values and behavior stay grouped together.
            : cause instanceof Error ? cause.message : 'Unable to load project details.',
        // Continues the component or data expression so its related values and behavior stay grouped together.
        })
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })

    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => controller.abort()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [projectId, requestKey, validProjectId])

  // Stores the value in currentResult so later lines can reuse this data or behavior for the current feature.
  const currentResult = result?.key === requestKey ? result : null
  // Stores the value in project so later lines can reuse this data or behavior for the current feature.
  const project = currentResult?.project ?? null
  // Stores the value in error so later lines can reuse this data or behavior for the current feature.
  const error = validProjectId ? currentResult?.error ?? null : 'The project ID is invalid.'
  // Stores the value in isLoading so later lines can reuse this data or behavior for the current feature.
  const isLoading = validProjectId && !currentResult

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <AppShell currentPath="/app/projects">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-7 lg:p-8">
        {/* Starts the <button> element to provide an action the user can activate. */}
        <button
          /* Chooses the element’s browser behavior, such as a button action or input format. */
          type="button"
          /* Connects the Click event to its handler so the interface can respond to interaction. */
          onClick={() => { window.location.href = '/app/projects' }}
          /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
          className="inline-flex items-center gap-2 text-sm font-medium text-[#595552] hover:text-[#323232]"
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        >
          {/* Starts the <ArrowLeft> element to organize this part of the interface. */}
          <ArrowLeft size={17} /> Back to Projects
        {/* Closes the <button> element so later content is no longer part of this region. */}
        </button>

        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {isLoading ? (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <section aria-live="polite" className="rounded-2xl border border-[#C8BCB4] bg-white p-8 text-sm text-[#8E827A]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Loading project details…
          {/* Closes the <section> element so later content is no longer part of this region. */}
          </section>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ) : error ? (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <section role="alert" className="rounded-2xl border border-[#C8BCB4] bg-white p-8">
            {/* Starts the <h1> element to organize this part of the interface. */}
            <h1 className="text-xl font-semibold text-[#323232]">Project unavailable</h1>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-2 text-sm text-[#8E827A]">{error}</p>
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="mt-5 rounded-xl bg-[#323232] px-4 py-2 text-sm font-medium text-white">Retry</button>
          {/* Closes the <section> element so later content is no longer part of this region. */}
          </section>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ) : project ? (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <>
            {/* Starts the <section> element to group related content into a meaningful region. */}
            <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6">
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="text-sm font-medium text-[#8E827A]">{project.code}</p>
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div>
                  {/* Starts the <h1> element to organize this part of the interface. */}
                  <h1 className="text-2xl font-semibold text-[#323232]">{project.name}</h1>
                  {/* Starts the <p> element to organize this part of the interface. */}
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#8E827A]">
                    {/* Starts the <MapPin> element to organize this part of the interface. */}
                    <MapPin size={16} /> {project.location}
                  {/* Closes the <p> element so later content is no longer part of this region. */}
                  </p>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
                {/* Starts the <span> element to organize this part of the interface. */}
                <span className="rounded-full bg-[#F7F3EE] px-3 py-1.5 text-sm font-medium text-[#595552]">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  {statusLabels[project.status]}
                {/* Closes the <span> element so later content is no longer part of this region. */}
                </span>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            {/* Closes the <section> element so later content is no longer part of this region. */}
            </section>

            {/* Starts the <section> element to group related content into a meaningful region. */}
            <section className="grid gap-4 sm:grid-cols-2">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              {[
                { label: 'Project Manager', value: project.assignedPm?.name ?? 'Unassigned', icon: UserRound },
                { label: 'Budget', value: formatBudget(project.totalBudget), icon: Wallet },
                { label: 'Start Date', value: formatDate(project.startDate), icon: CalendarDays },
                { label: 'Expected End Date', value: formatDate(project.expectedEndDate), icon: CalendarDays },
                { label: 'Actual End Date', value: formatDate(project.actualEndDate), icon: CalendarDays },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="flex items-center gap-2 text-sm text-[#8E827A]">
                    {/* Starts the <Icon> element to organize this part of the interface. */}
                    <Icon size={17} /> {label}
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <p> element to organize this part of the interface. */}
                  <p className="mt-3 font-semibold text-[#323232]">{value}</p>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              ))}
            {/* Closes the <section> element so later content is no longer part of this region. */}
            </section>
          </>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ) : null}
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <AppShell> element so later content is no longer part of this region. */}
    </AppShell>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the projects screen and coordinates its page-level interactions.
