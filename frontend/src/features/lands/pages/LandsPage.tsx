import { useMemo, useState, useEffect } from 'react'
import {
  Map, Plus, Search, Pencil, Trash2, X,
  MapPin, Ruler, Building2, CheckCircle2
} from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'

type Land = {
  id: number
  name: string
  surveyNumber: string
  location: string
  owner: string
  area: string
  unit: string
  status: 'Available' | 'Allocated' | 'Under Development'
}

const initialLands: Land[] = [
  { id: 1, name: 'Green Valley Land', surveyNumber: 'SV-101', location: 'Gurugram, Haryana', owner: 'ForgeOS Properties', area: '12', unit: 'Acres', status: 'Allocated' },
  { id: 2, name: 'Skyline Commercial Plot', surveyNumber: 'SV-102', location: 'Delhi, India', owner: 'Skyline Developers', area: '8', unit: 'Acres', status: 'Under Development' },
  { id: 3, name: 'Riverside Land', surveyNumber: 'SV-103', location: 'Noida, UP', owner: 'ForgeOS Properties', area: '15', unit: 'Acres', status: 'Available' },
  { id: 4, name: 'Urban Square Plot', surveyNumber: 'SV-104', location: 'Jaipur, Rajasthan', owner: 'Urban Developers', area: '6', unit: 'Acres', status: 'Available' },
]

const emptyForm = {
  name: '', surveyNumber: '', location: '',
  owner: '', area: '', unit: 'Acres',
  status: 'Available' as Land['status'],
}

const statusStyles: Record<Land['status'], string> = {
  Available: 'bg-[#E8EFE5] text-[#617858]',
  Allocated: 'bg-[#F5EDE1] text-[#9A7950]',
  'Under Development': 'bg-[#F1EAF6] text-[#806B96]',
}

export function LandsPage() {
  const [lands, setLands] = useState<Land[]>(() => {
    try {
      const saved = localStorage.getItem('forgeos_lands')
      return saved ? JSON.parse(saved) : initialLands
    } catch {
      return initialLands
    }
  })

  useEffect(() => {
    localStorage.setItem('forgeos_lands', JSON.stringify(lands))
  }, [lands])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Land | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filteredLands = useMemo(() => lands.filter((land) => {
    const query = search.toLowerCase()
    const matchesSearch = `${land.name} ${land.surveyNumber} ${land.location} ${land.owner}`.toLowerCase().includes(query)
    return matchesSearch && (filter === 'All' || land.status === filter)
  }), [lands, search, filter])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (land: Land) => {
    setEditing(land)
    setForm({
      name: land.name,
      surveyNumber: land.surveyNumber,
      location: land.location,
      owner: land.owner,
      area: land.area,
      unit: land.unit,
      status: land.status,
    })
    setShowForm(true)
  }

  const saveLand = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (editing) {
      setLands((current) => current.map((land) =>
        land.id === editing.id ? { ...land, ...form } : land
      ))
    } else {
      setLands((current) => [...current, {
        id: Date.now(),
        ...form,
      }])
    }
    setShowForm(false)
  }

  const deleteLand = (id: number) => {
    if (window.confirm('Are you sure you want to delete this land record?')) {
      setLands((current) => current.filter((land) => land.id !== id))
    }
  }

  const stats = [
    { label: 'Total Lands', value: lands.length, icon: Map },
    { label: 'Available', value: lands.filter((l) => l.status === 'Available').length, icon: CheckCircle2 },
    { label: 'Allocated', value: lands.filter((l) => l.status === 'Allocated').length, icon: Building2 },
    { label: 'Under Development', value: lands.filter((l) => l.status === 'Under Development').length, icon: Ruler },
  ]

  return (
    <AppShell currentPath="/app/lands">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[#8E827A]">Workspace / Land Management</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Land Management</h1>
            <p className="mt-2 text-sm text-[#8E827A]">Manage land records, ownership, locations and allocation status.</p>
          </div>
          <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-medium text-white hover:bg-[#1E1E1E]">
            <Plus size={17} /> Add Land
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8E827A]">{stat.label}</p>
                    <h2 className="mt-3 text-3xl font-semibold text-[#323232]">{stat.value}</h2>
                  </div>
                  <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div>
                </div>
              </div>
            )
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-[#323232]">Land Records</h2>
              <p className="mt-1 text-xs text-[#8E827A]">{filteredLands.length} land records found</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2">
                <Search size={17} className="text-[#8E827A]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search land..." className="w-full bg-transparent text-sm outline-none sm:w-48" />
              </div>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm text-[#595552] outline-none">
                <option>All</option>
                <option>Available</option>
                <option>Allocated</option>
                <option>Under Development</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                <tr>
                  <th className="px-5 py-4 font-medium">Land Details</th>
                  <th className="px-5 py-4 font-medium">Location</th>
                  <th className="px-5 py-4 font-medium">Ownership</th>
                  <th className="px-5 py-4 font-medium">Area</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCD4]">
                {filteredLands.map((land) => (
                  <tr key={land.id} className="hover:bg-[#F7F3EE]/60">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#323232]">{land.name}</p>
                      <p className="mt-1 text-xs text-[#8E827A]">{land.surveyNumber}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#595552]"><span className="flex items-center gap-1"><MapPin size={14} />{land.location}</span></td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{land.owner}</td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{land.area} {land.unit}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[land.status]}`}>{land.status}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(land)} title="Edit land" className="rounded-lg p-2 text-[#595552] hover:bg-[#F7F3EE]"><Pencil size={16} /></button>
                        <button onClick={() => deleteLand(land.id)} title="Delete land" className="rounded-lg p-2 text-[#9B625A] hover:bg-[#F8ECEA]"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLands.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8E827A]">No land records found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form onSubmit={saveLand} className="my-6 w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#323232]">{editing ? 'Edit Land Details' : 'Add New Land'}</h2>
                <p className="mt-1 text-sm text-[#8E827A]">Enter land information below.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]"><X size={19} /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#595552]">Land Name
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter land name" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <label className="text-sm font-medium text-[#595552]">Survey / Plot Number
                <input required value={form.surveyNumber} onChange={(e) => setForm({ ...form, surveyNumber: e.target.value })} placeholder="e.g. SV-105" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <label className="text-sm font-medium text-[#595552]">Location
                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <label className="text-sm font-medium text-[#595552]">Owner Name
                <input required value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Enter owner name" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
              </label>
              <div className="grid grid-cols-[1fr_120px] gap-3">
                <label className="text-sm font-medium text-[#595552]">Land Area
                  <input required type="number" min="0.01" step="0.01" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Enter area" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
                </label>
                <label className="text-sm font-medium text-[#595552]">Unit
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-3 font-normal outline-none">
                    <option>Acres</option><option>Sq. Ft.</option><option>Sq. Yards</option><option>Hectares</option>
                  </select>
                </label>
              </div>
              <label className="text-sm font-medium text-[#595552]">Land Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Land['status'] })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal outline-none">
                  <option>Available</option><option>Allocated</option><option>Under Development</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Cancel</button>
              <button type="submit" className="rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white">{editing ? 'Save Changes' : 'Add Land'}</button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  )
}
