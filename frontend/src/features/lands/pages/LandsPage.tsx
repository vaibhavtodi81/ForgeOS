import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Map, Plus, Search, Pencil, Trash2, X, MapPin, Ruler, Building2 } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { useAuth } from '../../authentication/auth/useAuth'
import { ApiError } from '../../../lib/api'
import { createLand, deleteLand, fetchLands, updateLand, type ApiLand, type AreaUnit, type LandInput } from '../data/landsApi'

const pageSize = 20
const areaUnits: AreaUnit[] = ['ACRE', 'SQFT', 'SQYD', 'SQM']
const emptyForm: LandInput = {
  name: '',
  addressLine: '',
  city: '',
  state: '',
  pincode: '',
  areaValue: 0,
  areaUnit: 'ACRE',
  surveyNumber: '',
  ownerName: '',
  purchaseDate: '',
  purchaseCost: null,
  notes: '',
}

function messageOf(error: unknown) {
  return error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function dateLabel(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function unitLabel(unit: AreaUnit) {
  return { SQFT: 'sq ft', SQYD: 'sq yd', SQM: 'sq m', ACRE: 'acres' }[unit]
}

export function LandsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [lands, setLands] = useState<ApiLand[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [loadedRequest, setLoadedRequest] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ApiLand | null>(null)
  const [form, setForm] = useState<LandInput>(emptyForm)

  const requestKey = `${page}:${search}:${refreshVersion}`
  const loading = loadedRequest !== requestKey

  useEffect(() => {
    const controller = new AbortController()
    void fetchLands({ page, pageSize, search }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setLands(result.lands)
        setTotal(result.total)
        setTotalPages(Math.max(1, result.totalPages))
        setError(null)
        setLoadedRequest(requestKey)
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return
        setError(messageOf(loadError))
        setLoadedRequest(requestKey)
      })
    return () => controller.abort()
  }, [page, search, requestKey])

  const pageArea = useMemo(() => lands.reduce<Record<AreaUnit, number>>((sum, land) => {
    sum[land.areaUnit] += Number(land.areaValue)
    return sum
  }, { SQFT: 0, SQYD: 0, SQM: 0, ACRE: 0 }), [lands])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setError(null)
    setShowForm(true)
  }

  const openEdit = (land: ApiLand) => {
    setEditing(land)
    setForm({
      name: land.name,
      addressLine: land.addressLine ?? '',
      city: land.city,
      state: land.state,
      pincode: land.pincode ?? '',
      areaValue: Number(land.areaValue),
      areaUnit: land.areaUnit,
      surveyNumber: land.surveyNumber ?? '',
      ownerName: land.ownerName ?? '',
      purchaseDate: land.purchaseDate?.slice(0, 10) ?? '',
      purchaseCost: land.purchaseCost === null ? null : Number(land.purchaseCost),
      notes: land.notes ?? '',
    })
    setError(null)
    setShowForm(true)
  }

  const saveLand = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const input: LandInput = {
        ...form,
        name: form.name.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        addressLine: form.addressLine?.trim() || null,
        pincode: form.pincode?.trim() || null,
        surveyNumber: form.surveyNumber?.trim() || null,
        ownerName: form.ownerName?.trim() || null,
        purchaseDate: form.purchaseDate || null,
        purchaseCost: form.purchaseCost === null || form.purchaseCost === undefined ? null : Number(form.purchaseCost),
        notes: form.notes?.trim() || null,
      }
      if (editing) {
        await updateLand(editing.id, input)
        setSuccess('Land details updated.')
      } else {
        await createLand(input)
        setSuccess('Land record created.')
      }
      setShowForm(false)
      setRefreshVersion((version) => version + 1)
    } catch (saveError) {
      setError(messageOf(saveError))
    } finally {
      setSaving(false)
    }
  }

  const removeLand = async (land: ApiLand) => {
    if (!window.confirm(`Delete "${land.name}"? This is only allowed when no projects depend on this land.`)) return
    setDeletingId(land.id)
    setError(null)
    setSuccess(null)
    try {
      await deleteLand(land.id)
      setSuccess('Land record deleted.')
      if (lands.length === 1 && page > 1) setPage((current) => current - 1)
      else setRefreshVersion((version) => version + 1)
    } catch (deleteError) {
      setError(messageOf(deleteError))
    } finally {
      setDeletingId(null)
    }
  }

  const stats = [
    { label: 'Matching Lands', value: total, icon: Map },
    { label: 'Records on This Page', value: lands.length, icon: Building2 },
    ...areaUnits.filter((unit) => pageArea[unit] > 0).slice(0, 2).map((unit) => ({
      label: `Page area (${unitLabel(unit)})`,
      value: pageArea[unit].toLocaleString(undefined, { maximumFractionDigits: 2 }),
      icon: Ruler,
    })),
  ]

  return (
    <AppShell currentPath="/app/lands">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[#8E827A]">Workspace / Land Management</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Land Management</h1>
            <p className="mt-2 text-sm text-[#8E827A]">{isAdmin ? 'Manage land records, ownership, locations, and area details.' : 'Land records associated with your assigned projects.'}</p>
          </div>
          {isAdmin && <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-medium text-white hover:bg-[#1E1E1E]"><Plus size={17} /> Add Land</button>}
        </section>

        {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><span>{error}</span><button onClick={() => setRefreshVersion((version) => version + 1)} className="shrink-0 underline">Retry</button></div>}
        {success && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</p>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-[#8E827A]">{label}</p><h2 className="mt-3 text-3xl font-semibold text-[#323232]">{value}</h2></div><div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div></div></div>)}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center">
            <div><h2 className="font-semibold text-[#323232]">Land Records</h2><p className="mt-1 text-xs text-[#8E827A]">{total} records found</p></div>
            <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2"><Search size={17} className="text-[#8E827A]" /><input aria-label="Search lands" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search name or city..." className="w-full bg-transparent text-sm outline-none sm:w-56" /></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Land Details</th><th className="px-5 py-4 font-medium">Location</th><th className="px-5 py-4 font-medium">Ownership</th><th className="px-5 py-4 font-medium">Area</th><th className="px-5 py-4 font-medium">Created</th><th className="px-5 py-4 text-right font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#E8DCD4]">
                {loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading land records…</td></tr>
                  : lands.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8E827A]">{search.trim() ? 'No lands match your search.' : 'No land records found.'}</td></tr>
                    : lands.map((land) => <tr key={land.id} className="hover:bg-[#F7F3EE]/60">
                      <td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{land.name}</p><p className="mt-1 text-xs text-[#8E827A]">{land.surveyNumber || 'No survey number'}</p></td>
                      <td className="px-5 py-4 text-sm text-[#595552]"><span className="flex items-center gap-1"><MapPin size={14} />{[land.city, land.state].filter(Boolean).join(', ')}{land.pincode ? ` ${land.pincode}` : ''}</span>{land.addressLine && <p className="mt-1 text-xs text-[#8E827A]">{land.addressLine}</p>}</td>
                      <td className="px-5 py-4 text-sm text-[#595552]">{land.ownerName || '—'}</td>
                      <td className="px-5 py-4 text-sm text-[#595552]">{Number(land.areaValue).toLocaleString()} {unitLabel(land.areaUnit)}</td>
                      <td className="px-5 py-4 text-sm text-[#595552]">{dateLabel(land.createdAt)}</td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2">
                        {isAdmin && <button onClick={() => openEdit(land)} title="Edit land" aria-label={`Edit ${land.name}`} className="rounded-lg p-2 text-[#595552] hover:bg-[#F7F3EE]"><Pencil size={16} /></button>}
                        {isAdmin && <button disabled={deletingId === land.id} onClick={() => void removeLand(land)} title="Delete land" aria-label={`Delete ${land.name}`} className="rounded-lg p-2 text-[#9B625A] hover:bg-[#F8ECEA] disabled:opacity-50"><Trash2 size={16} /></button>}
                        {!isAdmin && <span className="px-2 py-1 text-xs text-[#8E827A]">Read only</span>}
                      </div></td>
                    </tr>)}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[#E8DCD4] px-5 py-3 text-sm text-[#595552]"><span>Page {page} of {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-[#C8BCB4] px-3 py-1.5 disabled:opacity-50">Previous</button><button disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-[#C8BCB4] px-3 py-1.5 disabled:opacity-50">Next</button></div></div>
        </section>
      </div>

      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
        <form onSubmit={(event) => void saveLand(event)} className="my-6 w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold text-[#323232]">{editing ? 'Edit Land Details' : 'Add New Land'}</h2><p className="mt-1 text-sm text-[#8E827A]">Enter land information below.</p></div><button type="button" onClick={() => setShowForm(false)} aria-label="Close land form" className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]"><X size={19} /></button></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#595552]">Land Name<input required maxLength={255} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter land name" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            <label className="text-sm font-medium text-[#595552]">Survey / Plot Number<input maxLength={100} value={form.surveyNumber ?? ''} onChange={(event) => setForm({ ...form, surveyNumber: event.target.value })} placeholder="Optional" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            <label className="text-sm font-medium text-[#595552]">City<input required maxLength={100} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            <label className="text-sm font-medium text-[#595552]">State<input required maxLength={100} value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            <label className="text-sm font-medium text-[#595552]">Address<input maxLength={500} value={form.addressLine ?? ''} onChange={(event) => setForm({ ...form, addressLine: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            <label className="text-sm font-medium text-[#595552]">Pincode<input maxLength={20} value={form.pincode ?? ''} onChange={(event) => setForm({ ...form, pincode: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            <label className="text-sm font-medium text-[#595552]">Land Area<input required type="number" min="0.01" step="0.01" value={form.areaValue || ''} onChange={(event) => setForm({ ...form, areaValue: Number(event.target.value) })} placeholder="Enter area" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            <label className="text-sm font-medium text-[#595552]">Area Unit<select value={form.areaUnit} onChange={(event) => setForm({ ...form, areaUnit: event.target.value as AreaUnit })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-3 font-normal outline-none">{areaUnits.map((unit) => <option key={unit} value={unit}>{unitLabel(unit)}</option>)}</select></label>
            <label className="text-sm font-medium text-[#595552]">Owner Name<input maxLength={255} value={form.ownerName ?? ''} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            <label className="text-sm font-medium text-[#595552]">Purchase Date<input type="date" value={form.purchaseDate ?? ''} onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            <label className="text-sm font-medium text-[#595552]">Purchase Cost<input type="number" min="0" step="0.01" value={form.purchaseCost ?? ''} onChange={(event) => setForm({ ...form, purchaseCost: event.target.value ? Number(event.target.value) : null })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            <label className="text-sm font-medium text-[#595552] sm:col-span-2">Notes<textarea maxLength={2000} rows={3} value={form.notes ?? ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
          </div>
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Land'}</button></div>
        </form>
      </div>}
    </AppShell>
  )
}
