import { ArrowLeft, CalendarDays, CloudSun, Save } from 'lucide-react'
import { useState } from 'react'

interface DailyLogFormProps {
  onCancel: () => void
  onSave: (summary: string) => void
  initialSummary?: string
  isEditing?: boolean
}

export function DailyLogForm({ onCancel, onSave, initialSummary = '', isEditing = false }: DailyLogFormProps) {
  const [summary, setSummary] = useState(initialSummary)

  return (
    <div className="mx-auto w-full max-w-3xl p-6 lg:p-10">
      <button className="mb-8 flex items-center gap-2 text-sm font-medium text-[#8E827A] hover:text-[#323232]" onClick={onCancel} type="button">
        <ArrowLeft className="h-4 w-4" /> Back to daily logs
      </button>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5E3A]">New site record</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#323232]">{isEditing ? 'Edit daily log' : 'Create daily log'}</h1>
        <p className="mt-2 text-sm text-[#8E827A]">Capture the day’s work, attendance, equipment, and progress in one place.</p>
      </div>
      <div className="space-y-6">
        <section className="rounded-2xl border border-[#E8E0DA] bg-white p-6">
          <h2 className="mb-5 font-semibold text-[#323232]">Log details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#595552]">Project
              <select className="mt-2 w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] px-3 py-3 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]">
                <option>Riverside Residences</option>
                <option>Northgate Commercial Park</option>
              </select>
            </label>
            <label className="text-sm font-medium text-[#595552]">Date
              <div className="relative mt-2">
                <CalendarDays className="absolute left-3 top-3.5 h-4 w-4 text-[#9A5E3A]" />
                <input className="w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] py-3 pl-10 pr-3 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]" type="date" defaultValue="2024-06-19" />
              </div>
            </label>
            <label className="text-sm font-medium text-[#595552] sm:col-span-2">Weather
              <div className="relative mt-2">
                <CloudSun className="absolute left-3 top-3.5 h-4 w-4 text-[#9A5E3A]" />
                <input className="w-full rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] py-3 pl-10 pr-3 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]" placeholder="e.g. Clear · 28°C" />
              </div>
            </label>
          </div>
        </section>
        <section className="rounded-2xl border border-[#E8E0DA] bg-white p-6">
          <h2 className="mb-2 font-semibold text-[#323232]">Site summary</h2>
          <p className="mb-4 text-xs text-[#8E827A]">Add a concise overview of what happened on site.</p>
          <textarea className="min-h-36 w-full resize-y rounded-xl border border-[#E8E0DA] bg-[#FBF9F7] p-3 text-sm text-[#323232] outline-none focus:border-[#9A5E3A]" onChange={(event) => setSummary(event.target.value)} placeholder="Describe completed work, constraints, incidents, and next steps..." value={summary} />
        </section>
        <div className="flex justify-end gap-3">
          <button className="rounded-xl border border-[#E8E0DA] px-5 py-3 text-sm font-semibold text-[#595552] hover:bg-white" onClick={onCancel} type="button">Cancel</button>
          <button className="flex items-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-semibold text-[#F7F3EE] hover:bg-[#9A5E3A]" onClick={() => onSave(summary || 'Daily site work recorded.')} type="button">
            <Save className="h-4 w-4" /> {isEditing ? 'Save changes' : 'Save as draft'}
          </button>
        </div>
      </div>
    </div>
  )
}
