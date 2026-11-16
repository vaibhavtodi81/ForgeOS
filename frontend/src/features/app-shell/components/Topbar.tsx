// Imports useEffect, useState from react so this module can reuse that component, helper, or library.
import { useEffect, useState } from 'react'
// Imports Bell, ChevronDown, Command, FolderKanban, LogOut, Menu, Search, UserCircle, X from lucide-react so this module can reuse that component, helper, or library.
import { Bell, ChevronDown, Command, FolderKanban, LogOut, Menu, Search, UserCircle, X } from 'lucide-react'
// Imports ProjectSelector from ./ProjectSelector so this module can reuse that component, helper, or library.
import { ProjectSelector } from './ProjectSelector'
// Imports useAuth from ../../authentication/auth/useAuth so this module can reuse that component, helper, or library.
import { useAuth } from '../../authentication/auth/useAuth'

// Continues the component or data expression so its related values and behavior stay grouped together.
interface TopbarProps {
  // Sets the collapsed field so the surrounding object or component receives this setting.
  collapsed: boolean
  // Sets the onOpenMobileNav field so the surrounding object or component receives this setting.
  onOpenMobileNav: () => void
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines Topbar so this module can perform its named task when needed.
export function Topbar({ collapsed, onOpenMobileNav }: TopbarProps) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { user, logout } = useAuth()
  // Stores the value in isPm so later lines can reuse this data or behavior for the current feature.
  const isPm = user?.role === 'PM'

  // Stores the value in roleTitle so later lines can reuse this data or behavior for the current feature.
  const roleTitle = isPm ? 'Project Manager' : 'Administrator'
  // Stores the value in email so later lines can reuse this data or behavior for the current feature.
  const email = user?.email ?? ''
  // Stores the value in initials so later lines can reuse this data or behavior for the current feature.
  const initials = user?.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() ?? ''

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [profileOpen, setProfileOpen] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [commandOpen, setCommandOpen] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [commandQuery, setCommandQuery] = useState('')

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Stores the value in handleShortcut so later lines can reuse this data or behavior for the current feature.
    const handleShortcut = (event: KeyboardEvent) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        event.preventDefault()
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setCommandOpen((value) => !value)
      // Closes the current block or object so the grouped statements or settings end here.
      }
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (event.key === 'Escape') {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setCommandOpen(false)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setNotificationsOpen(false)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setProfileOpen(false)
      // Closes the current block or object so the grouped statements or settings end here.
      }
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    window.addEventListener('keydown', handleShortcut)
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => window.removeEventListener('keydown', handleShortcut)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [])

  // Stores the value in commands so later lines can reuse this data or behavior for the current feature.
  const commands = [
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Open dashboard', detail: isPm ? 'Project Manager cockpit' : 'Portfolio command center', icon: FolderKanban, path: isPm ? '/app/pm/dashboard' : '/app/admin/dashboard' },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'View projects', detail: 'Browse the project workspace', icon: FolderKanban, path: '/app/projects' },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Open daily logs', detail: 'Review site activity and logs', icon: FolderKanban, path: '/app/daily-logs' },
  // Keeps only items matching this condition so the result contains relevant data.
  ].filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(commandQuery.toLowerCase()))

  // Stores the value in openCommand so later lines can reuse this data or behavior for the current feature.
  const openCommand = () => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setProfileOpen(false)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setNotificationsOpen(false)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setCommandOpen(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setCommandQuery('')
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <header className={`dashboard-topbar fixed inset-x-0 top-0 z-20 h-16 border-b backdrop-blur-xl transition-[left] duration-200 ${collapsed ? 'lg:left-[76px]' : 'lg:left-[250px]'}`}>
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="rounded-lg p-2 text-white/55 hover:bg-white/10 hover:text-white lg:hidden"
            /* Connects the Click event to its handler so the interface can respond to interaction. */
            onClick={onOpenMobileNav}
            /* Chooses the element’s browser behavior, such as a button action or input format. */
            type="button"
            /* Provides aria-label accessibility information so assistive technology can describe the element. */
            aria-label="Open navigation"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          >
            {/* Starts the <Menu> element to organize this part of the interface. */}
            <Menu className="h-5 w-5" />
          {/* Closes the <button> element so later content is no longer part of this region. */}
          </button>
          {/* Starts the <ProjectSelector> element to organize this part of the interface. */}
          <ProjectSelector />
          {/* Starts the <span> element to organize this part of the interface. */}
          <span className="dashboard-live-pill hidden rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide sm:inline-flex">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {isPm ? 'ACTIVE SITE' : 'ORGANIZATION VIEW'}
          {/* Closes the <span> element so later content is no longer part of this region. */}
          </span>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>

        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"
            /* Chooses the element’s browser behavior, such as a button action or input format. */
            type="button"
            /* Provides aria-label accessibility information so assistive technology can describe the element. */
            aria-label="Search"
            /* Connects the Click event to its handler so the interface can respond to interaction. */
            onClick={openCommand}
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          >
            {/* Starts the <Search> element to organize this part of the interface. */}
            <Search className="h-4 w-4" />
          {/* Closes the <button> element so later content is no longer part of this region. */}
          </button>
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button type="button" onClick={openCommand} className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-white/35 md:flex" aria-label="Open command menu">
            {/* Starts the <Command> element to organize this part of the interface. */}
            <Command size={12} /> <span>Search</span><kbd className="rounded border border-white/10 px-1 text-[9px]">⌘K</kbd>
          {/* Closes the <button> element so later content is no longer part of this region. */}
          </button>

          {/* Starts the <button> element to provide an action the user can activate. */}
          <button
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="relative rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"
            /* Chooses the element’s browser behavior, such as a button action or input format. */
            type="button"
            /* Provides aria-label accessibility information so assistive technology can describe the element. */
            aria-label="Notifications"
            /* Connects the Click event to its handler so the interface can respond to interaction. */
            onClick={() => { setNotificationsOpen((value) => !value); setCommandOpen(false); setProfileOpen(false) }}
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          >
            {/* Starts the <Bell> element to organize this part of the interface. */}
            <Bell className="h-4 w-4" />
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#F2A65A]" />
          {/* Closes the <button> element so later content is no longer part of this region. */}
          </button>

          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="relative ml-1 border-l border-white/10 pl-3">
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button
              /* Chooses the element’s browser behavior, such as a button action or input format. */
              type="button"
              /* Connects the Click event to its handler so the interface can respond to interaction. */
              onClick={() => setProfileOpen(!profileOpen)}
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className="flex items-center gap-2 rounded-xl p-1.5 text-left hover:bg-white/10"
              /* Provides aria-expanded accessibility information so assistive technology can describe the element. */
              aria-expanded={profileOpen}
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2A65A] text-xs font-bold text-[#171717]">
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {initials}
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="hidden md:block">
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="text-xs font-semibold text-white">{user?.name ?? roleTitle}</p>
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="max-w-40 truncate text-[10px] text-white/40">{roleTitle} · {email}</p>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <ChevronDown> element to organize this part of the interface. */}
              <ChevronDown className="h-3.5 w-3.5 text-[#8E827A]" />
            {/* Closes the <button> element so later content is no longer part of this region. */}
            </button>

            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {profileOpen && (
              // Continues the component or data expression so its related values and behavior stay grouped together.
              <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[#C8BCB4] bg-white p-2 shadow-xl">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="border-b border-[#E8DCD4] px-3 py-3">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#323232]">
                    {/* Starts the <UserCircle> element to organize this part of the interface. */}
                    <UserCircle size={17} />
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    {user?.name ?? roleTitle}
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <p> element to organize this part of the interface. */}
                  <p className="mt-1 truncate text-xs text-[#8E827A]">{email}</p>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
                {/* Starts the <button> element to provide an action the user can activate. */}
                <button
                  /* Chooses the element’s browser behavior, such as a button action or input format. */
                  type="button"
                  /* Connects the Click event to its handler so the interface can respond to interaction. */
                  onClick={() => { logout(); window.history.replaceState({}, '', '/login'); window.dispatchEvent(new PopStateEvent('popstate')) }}
                  /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#8A5143] hover:bg-[#F7F3EE]"
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                >
                  {/* Starts the <LogOut> element to organize this part of the interface. */}
                  <LogOut size={16} />
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  Logout
                {/* Closes the <button> element so later content is no longer part of this region. */}
                </button>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            // Continues the component or data expression so its related values and behavior stay grouped together.
            )}
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {notificationsOpen && (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <div className="dashboard-popover absolute right-4 top-[4.25rem] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#151a1d] shadow-2xl sm:right-8">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div><p className="text-sm font-semibold text-white">Notifications</p><p className="mt-0.5 text-[10px] text-white/40">Latest workspace signals</p></div><button type="button" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications" className="text-white/35 hover:text-white"><X size={15} /></button></div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="divide-y divide-white/[0.08]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {[['Material delivery update', 'Steel delivery checked at Green Valley Residency', '8 min ago'], ['Progress review due', 'Skyline Commercial Hub milestone review is due Friday', '1 hr ago'], ['Daily log submitted', 'Aarav Sharma submitted today’s site log', '2 hr ago']].map(([title, detail, time]) => <button type="button" key={title} onClick={() => setNotificationsOpen(false)} className="flex w-full gap-3 px-4 py-3 text-left hover:bg-white/[0.04]"><span className="dashboard-icon dashboard-icon-amber h-8 w-8 shrink-0 p-2"><Bell size={14} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-white">{title}</span><span className="mt-1 block text-[11px] leading-4 text-white/45">{detail}</span><span className="mt-1 block text-[10px] text-white/25">{time}</span></span></button>)}
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      // Continues the component or data expression so its related values and behavior stay grouped together.
      )}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {commandOpen && (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => setCommandOpen(false)}>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="dashboard-popover w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#151a1d] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4"><Search size={17} className="text-white/35" /><input autoFocus value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Search pages, projects, and tools..." className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" /><kbd className="rounded border border-white/10 px-1.5 py-1 text-[10px] text-white/35">ESC</kbd></div>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="p-2">{commands.length ? commands.map(({ label, detail, icon: Icon, path }) => <button type="button" key={label} onClick={() => { setCommandOpen(false); window.location.href = path }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-white/[0.05]"><span className="dashboard-icon dashboard-icon-amber p-2"><Icon size={15} /></span><span><span className="block text-sm font-medium text-white">{label}</span><span className="mt-0.5 block text-xs text-white/40">{detail}</span></span></button>) : <div className="px-3 py-8 text-center text-sm text-white/40">No matching workspace actions.</div>}</div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      // Continues the component or data expression so its related values and behavior stay grouped together.
      )}
    {/* Closes the <header> element so later content is no longer part of this region. */}
    </header>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// Exports Topbar as this file’s default value so other modules can load the main feature.
export default Topbar
// File purpose: Renders the reusable Topbar interface component.
