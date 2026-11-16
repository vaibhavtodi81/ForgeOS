// Imports isAdmin from ../../authentication/utils/permissions so this module can reuse that component, helper, or library.
import { isAdmin } from '../../authentication/utils/permissions'
// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ArrowUpRight,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Building2,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  CheckCircle2,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Clock3,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  FolderKanban,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Plus,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Users,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Wallet,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Activity,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  MoreHorizontal,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  TrendingUp,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from 'lucide-react'
// Imports AppShell from ../components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../components/AppShell'

// Stores the value in stats so later lines can reuse this data or behavior for the current feature.
const stats = [
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the label field so the surrounding object or component receives this setting.
    label: 'Total Projects',
    // Sets the value field so the surrounding object or component receives this setting.
    value: '24',
    // Sets the change field so the surrounding object or component receives this setting.
    change: '+12.5%',
    // Sets the note field so the surrounding object or component receives this setting.
    note: 'from last month',
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: FolderKanban,
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the label field so the surrounding object or component receives this setting.
    label: 'Active Projects',
    // Sets the value field so the surrounding object or component receives this setting.
    value: '08',
    // Sets the change field so the surrounding object or component receives this setting.
    change: '+2',
    // Sets the note field so the surrounding object or component receives this setting.
    note: 'new this month',
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: Building2,
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the label field so the surrounding object or component receives this setting.
    label: 'Completed Projects',
    // Sets the value field so the surrounding object or component receives this setting.
    value: '12',
    // Sets the change field so the surrounding object or component receives this setting.
    change: '+8.2%',
    // Sets the note field so the surrounding object or component receives this setting.
    note: 'from last month',
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: CheckCircle2,
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the label field so the surrounding object or component receives this setting.
    label: 'Total Users',
    // Sets the value field so the surrounding object or component receives this setting.
    value: '36',
    // Sets the change field so the surrounding object or component receives this setting.
    change: '+4',
    // Sets the note field so the surrounding object or component receives this setting.
    note: 'new team members',
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: Users,
  // Closes the current block or object so the grouped statements or settings end here.
  },
// Continues the component or data expression so its related values and behavior stay grouped together.
]

// Stores the value in projects so later lines can reuse this data or behavior for the current feature.
const projects = [
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the name field so the surrounding object or component receives this setting.
    name: 'Green Valley Residency',
    // Sets the id field so the surrounding object or component receives this setting.
    id: 'PRJ-001',
    // Sets the manager field so the surrounding object or component receives this setting.
    manager: 'Aarav Sharma',
    // Sets the progress field so the surrounding object or component receives this setting.
    progress: 76,
    // Sets the status field so the surrounding object or component receives this setting.
    status: 'In Progress',
    // Sets the color field so the surrounding object or component receives this setting.
    color: '#8A9B78',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the name field so the surrounding object or component receives this setting.
    name: 'Skyline Commercial Hub',
    // Sets the id field so the surrounding object or component receives this setting.
    id: 'PRJ-002',
    // Sets the manager field so the surrounding object or component receives this setting.
    manager: 'Priya Mehta',
    // Sets the progress field so the surrounding object or component receives this setting.
    progress: 52,
    // Sets the status field so the surrounding object or component receives this setting.
    status: 'In Progress',
    // Sets the color field so the surrounding object or component receives this setting.
    color: '#C39B6D',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the name field so the surrounding object or component receives this setting.
    name: 'Riverside Heights',
    // Sets the id field so the surrounding object or component receives this setting.
    id: 'PRJ-003',
    // Sets the manager field so the surrounding object or component receives this setting.
    manager: 'Rohan Verma',
    // Sets the progress field so the surrounding object or component receives this setting.
    progress: 100,
    // Sets the status field so the surrounding object or component receives this setting.
    status: 'Completed',
    // Sets the color field so the surrounding object or component receives this setting.
    color: '#8A9B78',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the name field so the surrounding object or component receives this setting.
    name: 'Urban Square',
    // Sets the id field so the surrounding object or component receives this setting.
    id: 'PRJ-004',
    // Sets the manager field so the surrounding object or component receives this setting.
    manager: 'Neha Kapoor',
    // Sets the progress field so the surrounding object or component receives this setting.
    progress: 28,
    // Sets the status field so the surrounding object or component receives this setting.
    status: 'Planning',
    // Sets the color field so the surrounding object or component receives this setting.
    color: '#9B8DB5',
  // Closes the current block or object so the grouped statements or settings end here.
  },
// Continues the component or data expression so its related values and behavior stay grouped together.
]

// Stores the value in activities so later lines can reuse this data or behavior for the current feature.
const activities = [
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Project progress updated',
    // Sets the detail field so the surrounding object or component receives this setting.
    detail: 'Green Valley Residency · 76% completed',
    // Sets the time field so the surrounding object or component receives this setting.
    time: '25 minutes ago',
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: TrendingUp,
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'New team member added',
    // Sets the detail field so the surrounding object or component receives this setting.
    detail: 'Priya Mehta · Project Manager',
    // Sets the time field so the surrounding object or component receives this setting.
    time: '2 hours ago',
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: Users,
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Project completed',
    // Sets the detail field so the surrounding object or component receives this setting.
    detail: 'Riverside Heights · PRJ-003',
    // Sets the time field so the surrounding object or component receives this setting.
    time: 'Yesterday',
    // Sets the icon field so the surrounding object or component receives this setting.
    icon: CheckCircle2,
  // Closes the current block or object so the grouped statements or settings end here.
  },
// Continues the component or data expression so its related values and behavior stay grouped together.
]

// Defines MetricCard so this module can perform its named task when needed.
function MetricCard({
  // Continues the component or data expression so its related values and behavior stay grouped together.
  label,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  value,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  change,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  note,
  // Sets the icon field so the surrounding object or component receives this setting.
  icon: Icon,
// Continues the component or data expression so its related values and behavior stay grouped together.
}: {
  // Sets the label field so the surrounding object or component receives this setting.
  label: string
  // Sets the value field so the surrounding object or component receives this setting.
  value: string
  // Sets the change field so the surrounding object or component receives this setting.
  change: string
  // Sets the note field so the surrounding object or component receives this setting.
  note: string
  // Sets the icon field so the surrounding object or component receives this setting.
  icon: typeof FolderKanban
// Continues the component or data expression so its related values and behavior stay grouped together.
}) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">

      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="flex items-start justify-between">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="text-sm font-medium text-[#8E827A]">{label}</p>
          {/* Starts the <h3> element to organize this part of the interface. */}
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[#323232]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {value}
          {/* Closes the <h3> element so later content is no longer part of this region. */}
          </h3>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">
          {/* Starts the <Icon> element to organize this part of the interface. */}
          <Icon size={21} strokeWidth={1.7} />
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mt-4 flex items-center gap-2 text-xs">
        {/* Starts the <span> element to organize this part of the interface. */}
        <span className="font-semibold text-[#71866A]">{change}</span>
        {/* Starts the <span> element to organize this part of the interface. */}
        <span className="text-[#8E827A]">{note}</span>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines DashboardPage so this module can perform its named task when needed.
export function DashboardPage() {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <AppShell currentPath="/app">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section data-role-dashboard className="rounded-xl border border-[#C8BCB4] bg-[#E8DCD4] p-5">
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="text-sm font-medium text-[#595552]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {isAdmin() ? 'Administrator Overview' : 'Project Manager Overview'}
          {/* Closes the <p> element so later content is no longer part of this region. */}
          </p>
          {/* Starts the <h2> element to organize this part of the interface. */}
          <h2 className="mt-1 text-xl font-semibold text-[#323232]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {isAdmin() ? 'Organization Dashboard' : 'My Project Workspace'}
          {/* Closes the <h2> element so later content is no longer part of this region. */}
          </h2>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-1 text-sm text-[#595552]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {isAdmin()
              // Continues the component or data expression so its related values and behavior stay grouped together.
              ? 'Monitor users, lands, projects and overall operations.'
              // Continues the component or data expression so its related values and behavior stay grouped together.
              : 'Focus on assigned projects, daily operations and progress.'}
          {/* Closes the <p> element so later content is no longer part of this region. */}
          </p>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="text-sm font-medium text-[#8E827A]">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Saturday, November 7, 2026
            {/* Closes the <p> element so later content is no longer part of this region. */}
            </p>
            {/* Starts the <h1> element to organize this part of the interface. */}
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#323232] sm:text-3xl">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              {isAdmin() ? 'Good morning, Admin' : 'Good morning, Project Manager'}
            {/* Closes the <h1> element so later content is no longer part of this region. */}
            </h1>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-2 text-sm text-[#8E827A]">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Here’s what’s happening across your construction projects.
            {/* Closes the <p> element so later content is no longer part of this region. */}
            </p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button
            /* Chooses the element’s browser behavior, such as a button action or input format. */
            type="button"
            /* Connects the Click event to its handler so the interface can respond to interaction. */
            onClick={() => { window.location.href = '/app/projects' }}
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1E1E1E]"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          >
            {/* Starts the <Plus> element to organize this part of the interface. */}
            <Plus size={17} />
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {isAdmin() ? 'Create Project' : 'View My Projects'}
          {/* Closes the <button> element so later content is no longer part of this region. */}
          </button>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {stats.map((stat) => (
            // Continues the component or data expression so its related values and behavior stay grouped together.
            <MetricCard key={stat.label} {...stat} />
          // Continues the component or data expression so its related values and behavior stay grouped together.
          ))}
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center justify-between border-b border-[#E8DCD4] px-5 py-5">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div>
                {/* Starts the <h2> element to organize this part of the interface. */}
                <h2 className="font-semibold text-[#323232]">Project Overview</h2>
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="mt-1 text-xs text-[#8E827A]">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  Track progress across your projects
                {/* Closes the <p> element so later content is no longer part of this region. */}
                </p>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <button> element to provide an action the user can activate. */}
              <button
                /* Chooses the element’s browser behavior, such as a button action or input format. */
                type="button"
                /* Connects the Click event to its handler so the interface can respond to interaction. */
                onClick={() => { window.location.href = '/app/projects' }}
                /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
                className="flex items-center gap-1 text-sm font-medium text-[#595552] hover:text-[#1E1E1E]"
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              >
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                View all <ArrowUpRight size={15} />
              {/* Closes the <button> element so later content is no longer part of this region. */}
              </button>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>

            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="overflow-x-auto">
              {/* Starts the <table> element to organize this part of the interface. */}
              <table className="w-full min-w-[580px] text-left">
                {/* Starts the <thead> element to organize this part of the interface. */}
                <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                  {/* Starts the <tr> element to organize this part of the interface. */}
                  <tr>
                    {/* Starts the <th> element to organize this part of the interface. */}
                    <th className="px-5 py-3 font-medium">Project</th>
                    {/* Starts the <th> element to organize this part of the interface. */}
                    <th className="px-5 py-3 font-medium">Project Manager</th>
                    {/* Starts the <th> element to organize this part of the interface. */}
                    <th className="px-5 py-3 font-medium">Progress</th>
                    {/* Starts the <th> element to organize this part of the interface. */}
                    <th className="px-5 py-3 font-medium">Status</th>
                  {/* Closes the <tr> element so later content is no longer part of this region. */}
                  </tr>
                {/* Closes the <thead> element so later content is no longer part of this region. */}
                </thead>
                {/* Starts the <tbody> element to organize this part of the interface. */}
                <tbody className="divide-y divide-[#E8DCD4]">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  {projects.map((project) => (
                    // Continues the component or data expression so its related values and behavior stay grouped together.
                    <tr key={project.id} className="hover:bg-[#F7F3EE]/60">
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="px-5 py-4">
                        {/* Starts the <p> element to organize this part of the interface. */}
                        <p className="text-sm font-medium text-[#323232]">
                          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                          {project.name}
                        {/* Closes the <p> element so later content is no longer part of this region. */}
                        </p>
                        {/* Starts the <p> element to organize this part of the interface. */}
                        <p className="mt-1 text-xs text-[#8E827A]">{project.id}</p>
                      {/* Closes the <td> element so later content is no longer part of this region. */}
                      </td>
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="px-5 py-4 text-sm text-[#595552]">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {project.manager}
                      {/* Closes the <td> element so later content is no longer part of this region. */}
                      </td>
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="px-5 py-4">
                        {/* Starts the <div> element to organize this part of the interface. */}
                        <div className="flex items-center gap-3">
                          {/* Starts the <div> element to organize this part of the interface. */}
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#E8DCD4]">
                            {/* Starts the <div> element to organize this part of the interface. */}
                            <div
                              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
                              className="h-full rounded-full"
                              /* Sets the style property so this element receives the data or behavior required by this screen. */
                              /* Sets the style property so this element receives the data or behavior required by this screen. */
                              style={{
                                /* Sets the width field so the surrounding object or component receives this setting. */
                                /* Sets the width field so the surrounding object or component receives this setting. */
                                width: `${project.progress}%`,
                                /* Sets the backgroundColor field so the surrounding object or component receives this setting. */
                                /* Sets the backgroundColor field so the surrounding object or component receives this setting. */
                                backgroundColor: project.color,
                              /* Continues the component or data expression so its related values and behavior stay grouped together. */
                              /* Continues the component or data expression so its related values and behavior stay grouped together. */
                              }}
                            /* Continues the component or data expression so its related values and behavior stay grouped together. */
                            /* Continues the component or data expression so its related values and behavior stay grouped together. */
                            />
                          {/* Closes the <div> element so later content is no longer part of this region. */}
                          </div>
                          {/* Starts the <span> element to organize this part of the interface. */}
                          <span className="text-xs font-medium text-[#595552]">
                            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                            {project.progress}%
                          {/* Closes the <span> element so later content is no longer part of this region. */}
                          </span>
                        {/* Closes the <div> element so later content is no longer part of this region. */}
                        </div>
                      {/* Closes the <td> element so later content is no longer part of this region. */}
                      </td>
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="px-5 py-4">
                        {/* Starts the <span> element to organize this part of the interface. */}
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          /* Sets the project.status property so this element receives the data or behavior required by this screen. */
                          /* Sets the project.status property so this element receives the data or behavior required by this screen. */
                          project.status === 'Completed'
                            /* Continues the component or data expression so its related values and behavior stay grouped together. */
                            /* Continues the component or data expression so its related values and behavior stay grouped together. */
                            ? 'bg-[#E8EFE5] text-[#617858]'
                            /* Continues the component or data expression so its related values and behavior stay grouped together. */
                            /* Continues the component or data expression so its related values and behavior stay grouped together. */
                            : project.status === 'Planning'
                              /* Continues the component or data expression so its related values and behavior stay grouped together. */
                              /* Continues the component or data expression so its related values and behavior stay grouped together. */
                              ? 'bg-[#F1EAF6] text-[#806B96]'
                              /* Continues the component or data expression so its related values and behavior stay grouped together. */
                              /* Continues the component or data expression so its related values and behavior stay grouped together. */
                              : 'bg-[#F5EDE1] text-[#9A7950]'
                        /* Continues the component or data expression so its related values and behavior stay grouped together. */
                        /* Continues the component or data expression so its related values and behavior stay grouped together. */
                        }`}>
                          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                          {project.status}
                        {/* Closes the <span> element so later content is no longer part of this region. */}
                        </span>
                      {/* Closes the <td> element so later content is no longer part of this region. */}
                      </td>
                    {/* Closes the <tr> element so later content is no longer part of this region. */}
                    </tr>
                  ))}
                {/* Closes the <tbody> element so later content is no longer part of this region. */}
                </tbody>
              {/* Closes the <table> element so later content is no longer part of this region. */}
              </table>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center justify-between">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div>
                {/* Starts the <h2> element to organize this part of the interface. */}
                <h2 className="font-semibold text-[#323232]">Recent Activity</h2>
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="mt-1 text-xs text-[#8E827A]">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  Latest updates from your workspace
                {/* Closes the <p> element so later content is no longer part of this region. */}
                </p>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <button> element to provide an action the user can activate. */}
              <button type="button" className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]">
                {/* Starts the <MoreHorizontal> element to organize this part of the interface. */}
                <MoreHorizontal size={19} />
              {/* Closes the <button> element so later content is no longer part of this region. */}
              </button>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>

            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="mt-6 space-y-6">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              {activities.map((activity) => {
                // Stores the value in Icon so later lines can reuse this data or behavior for the current feature.
                const Icon = activity.icon
                // Returns the result so the caller or React receives the value or interface this function provides.
                return (
                  // Continues the component or data expression so its related values and behavior stay grouped together.
                  <div key={activity.title} className="flex gap-3">
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F3EE] text-[#595552]">
                      {/* Starts the <Icon> element to organize this part of the interface. */}
                      <Icon size={18} strokeWidth={1.7} />
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="min-w-0">
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="text-sm font-medium text-[#323232]">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {activity.title}
                      {/* Closes the <p> element so later content is no longer part of this region. */}
                      </p>
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="mt-1 text-xs text-[#8E827A]">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {activity.detail}
                      {/* Closes the <p> element so later content is no longer part of this region. */}
                      </p>
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="mt-2 text-[11px] text-[#A69A92]">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {activity.time}
                      {/* Closes the <p> element so later content is no longer part of this region. */}
                      </p>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                // Closes this function call or grouped expression so the surrounding code can continue.
                )
              // Continues the component or data expression so its related values and behavior stay grouped together.
              })}
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-center gap-4 rounded-2xl border border-[#C8BCB4]/70 bg-white p-5">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">
              {/* Starts the <Plus> element to organize this part of the interface. */}
              <Plus size={20} />
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="text-sm font-semibold text-[#323232]">Create a project</p>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="mt-1 text-xs text-[#8E827A]">Start a new construction project</p>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <ArrowUpRight> element to organize this part of the interface. */}
            <ArrowUpRight className="ml-auto text-[#8E827A]" size={17} />
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-center gap-4 rounded-2xl border border-[#C8BCB4]/70 bg-white p-5">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">
              {/* Starts the <Users> element to organize this part of the interface. */}
              <Users size={20} />
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="text-sm font-semibold text-[#323232]">Manage users</p>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="mt-1 text-xs text-[#8E827A]">Manage your team and roles</p>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <ArrowUpRight> element to organize this part of the interface. */}
            <ArrowUpRight className="ml-auto text-[#8E827A]" size={17} />
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-center gap-4 rounded-2xl border border-[#C8BCB4]/70 bg-white p-5">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]">
              {/* Starts the <Wallet> element to organize this part of the interface. */}
              <Wallet size={20} />
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="text-sm font-semibold text-[#323232]">Manage land</p>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="mt-1 text-xs text-[#8E827A]">View and manage land records</p>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <ArrowUpRight> element to organize this part of the interface. */}
            <ArrowUpRight className="ml-auto text-[#8E827A]" size={17} />
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-center justify-center gap-2 pb-2 text-xs text-[#A69A92]">
          {/* Starts the <Activity> element to organize this part of the interface. */}
          <Activity size={14} />
          {/* Starts the <span> element to organize this part of the interface. */}
          <span>ForgeOS Workspace · Demo dashboard data</span>
          {/* Starts the <Clock3> element to organize this part of the interface. */}
          <Clock3 size={13} className="ml-2" />
          {/* Starts the <span> element to organize this part of the interface. */}
          <span>Last updated just now</span>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <AppShell> element so later content is no longer part of this region. */}
    </AppShell>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the app shell screen and coordinates its page-level interactions.
