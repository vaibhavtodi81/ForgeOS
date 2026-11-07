import { Edit3, FileText, MapPin, Plus } from 'lucide-react'
import { useState } from 'react'
import { ActivityTimeline } from './ActivityTimeline'
import { DailyLogForm } from './DailyLogForm'
import { DailyLogsList } from './DailyLogsList'
import { LabourAttendance } from './LabourAttendance'
import { MachineryUsage } from './MachineryUsage'
import { ProgressHistory } from './ProgressHistory'
import type { DailyLog } from '../types/dailyLog'

interface DailyLogsShellProps {
  initialLogs: DailyLog[]
}

export function DailyLogsShell({ initialLogs }: DailyLogsShellProps) {
  const [logs, setLogs] = useState(initialLogs)
  const [selectedId, setSelectedId] = useState(initialLogs[0]?.id ?? '')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const selectedLog = logs.find((log) => log.id === selectedId) ?? logs[0]

  const handleSave = (summary: string) => {
    if (editingId) {
      setLogs((currentLogs) => currentLogs.map((log) => log.id === editingId ? { ...log, summary } : log))
      setIsCreating(false)
      setEditingId(null)
      return
    }

    const newLog: DailyLog = {
      id: `log-${Date.now()}`,
      date: '2024-06-19',
      project: 'Riverside Residences',
      weather: 'Not recorded',
      status: 'Draft',
      summary,
      progress: selectedLog?.progress ?? 68,
      labour: [],
      machinery: [],
      progressHistory: [],
      activity: [],
    }
    setLogs((currentLogs) => [newLog, ...currentLogs])
    setSelectedId(newLog.id)
    setIsCreating(false)
  }

  if (isCreating) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] text-[#323232]">
        <DailyLogForm initialSummary={editingId ? selectedLog?.summary : undefined} isEditing={Boolean(editingId)} onCancel={() => { setIsCreating(false); setEditingId(null) }} onSave={handleSave} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE] text-[#323232]">
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <div className="w-full shrink-0 shadow-sm lg:w-[330px] lg:shadow-none">
          <DailyLogsList logs={logs} onCreate={() => { setEditingId(null); setIsCreating(true) }} onSelect={setSelectedId} selectedId={selectedId} />
        </div>
        {selectedLog ? <main className="min-w-0 flex-1">
          <header className="border-b border-[#E8E0DA] bg-[#F7F3EE] px-6 py-6 lg:px-10">
            <div className="mx-auto flex max-w-5xl items-start justify-between gap-5">
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs text-[#8E827A]">
                  <span>Projects</span><span>/</span><span>Riverside Residences</span><span>/</span><span className="font-medium text-[#595552]">Daily logs</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-[#323232]">Wednesday, June 18</h1>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">{selectedLog.status}</span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-[#8E827A]"><MapPin className="h-3.5 w-3.5" /> Riverside Residences · Tower A</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="hidden items-center gap-2 rounded-xl border border-[#E8E0DA] bg-white px-3 py-2.5 text-xs font-semibold text-[#595552] hover:border-[#C8BCB4] sm:flex" type="button"><FileText className="h-3.5 w-3.5" /> Export</button>
                <button className="flex items-center gap-2 rounded-xl bg-[#323232] px-3 py-2.5 text-xs font-semibold text-[#F7F3EE] hover:bg-[#9A5E3A]" onClick={() => { setEditingId(selectedLog.id); setIsCreating(true) }} type="button"><Edit3 className="h-3.5 w-3.5" /> Edit log</button>
              </div>
            </div>
          </header>
          <div className="mx-auto max-w-5xl space-y-5 p-6 lg:p-10">
            <section className="rounded-2xl border border-[#E8E0DA] bg-white p-5 shadow-[0_8px_24px_rgba(50,50,50,0.04)]">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A5E3A]">Site summary</p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#595552]">{selectedLog.summary}</p>
                </div>
                <div className="shrink-0 sm:text-right"><p className="text-3xl font-bold text-[#323232]">{selectedLog.progress}%</p><p className="text-xs text-[#8E827A]">overall progress</p></div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#F0E9E4]"><div className="h-full rounded-full bg-[#9A5E3A]" style={{ width: `${selectedLog.progress}%` }} /></div>
            </section>
            <div className="grid gap-5 xl:grid-cols-2">
              <LabourAttendance entries={selectedLog.labour} />
              <MachineryUsage entries={selectedLog.machinery} />
              <ProgressHistory entries={selectedLog.progressHistory} />
              <ActivityTimeline entries={selectedLog.activity} />
            </div>
          </div>
        </main> : <EmptyState onCreate={() => setIsCreating(true)} />}
      </div>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return <main className="flex flex-1 items-center justify-center p-8"><div className="text-center"><h1 className="text-2xl font-bold">No daily log selected</h1><p className="mt-2 text-sm text-[#8E827A]">Create a site record to start tracking today’s operations.</p><button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#323232] px-4 py-3 text-sm font-semibold text-white" onClick={onCreate} type="button"><Plus className="h-4 w-4" /> Create daily log</button></div></main>
}
