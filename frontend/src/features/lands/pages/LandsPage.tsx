// Imports useEffect, useMemo, useState, type FormEvent from react so this module can reuse that component, helper, or library.
import { useEffect, useMemo, useState, type FormEvent } from 'react'
// Imports Map, Plus, Search, Pencil, Trash2, X, MapPin, Ruler, Building2 from lucide-react so this module can reuse that component, helper, or library.
import { Map, Plus, Search, Pencil, Trash2, X, MapPin, Ruler, Building2 } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useAuth from ../../authentication/auth/useAuth so this module can reuse that component, helper, or library.
import { useAuth } from '../../authentication/auth/useAuth'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'
// Imports createLand, deleteLand, fetchLands, updateLand, type ApiLand, type AreaUnit, type LandInput from ../data/landsApi so this module can reuse that component, helper, or library.
import { createLand, deleteLand, fetchLands, updateLand, type ApiLand, type AreaUnit, type LandInput } from '../data/landsApi'

// Stores the value in pageSize so later lines can reuse this data or behavior for the current feature.
const pageSize = 20
// Stores the value in areaUnits so later lines can reuse this data or behavior for the current feature.
const areaUnits: AreaUnit[] = ['ACRE', 'SQFT', 'SQYD', 'SQM']
// Stores the value in emptyForm so later lines can reuse this data or behavior for the current feature.
const emptyForm: LandInput = {
  // Sets the name field so the surrounding object or component receives this setting.
  name: '',
  // Sets the addressLine field so the surrounding object or component receives this setting.
  addressLine: '',
  // Sets the city field so the surrounding object or component receives this setting.
  city: '',
  // Sets the state field so the surrounding object or component receives this setting.
  state: '',
  // Sets the pincode field so the surrounding object or component receives this setting.
  pincode: '',
  // Sets the areaValue field so the surrounding object or component receives this setting.
  areaValue: 0,
  // Sets the areaUnit field so the surrounding object or component receives this setting.
  areaUnit: 'ACRE',
  // Sets the surveyNumber field so the surrounding object or component receives this setting.
  surveyNumber: '',
  // Sets the ownerName field so the surrounding object or component receives this setting.
  ownerName: '',
  // Sets the purchaseDate field so the surrounding object or component receives this setting.
  purchaseDate: '',
  // Sets the purchaseCost field so the surrounding object or component receives this setting.
  purchaseCost: null,
  // Sets the notes field so the surrounding object or component receives this setting.
  notes: '',
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines messageOf so this module can perform its named task when needed.
function messageOf(error: unknown) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Something went wrong. Please try again.'
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines dateLabel so this module can perform its named task when needed.
function dateLabel(value: string) {
  // Stores the value in date so later lines can reuse this data or behavior for the current feature.
  const date = new Date(value)
  // Returns the result so the caller or React receives the value or interface this function provides.
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines unitLabel so this module can perform its named task when needed.
function unitLabel(unit: AreaUnit) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return { SQFT: 'sq ft', SQYD: 'sq yd', SQM: 'sq m', ACRE: 'acres' }[unit]
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines LandsPage so this module can perform its named task when needed.
export function LandsPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { user } = useAuth()
  // Stores the value in isAdmin so later lines can reuse this data or behavior for the current feature.
  const isAdmin = user?.role === 'ADMIN'
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [lands, setLands] = useState<ApiLand[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [total, setTotal] = useState(0)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [totalPages, setTotalPages] = useState(1)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [page, setPage] = useState(1)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [search, setSearch] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [refreshVersion, setRefreshVersion] = useState(0)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loadedRequest, setLoadedRequest] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [saving, setSaving] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [deletingId, setDeletingId] = useState<number | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [error, setError] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [success, setSuccess] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [showForm, setShowForm] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [editing, setEditing] = useState<ApiLand | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [form, setForm] = useState<LandInput>(emptyForm)

  // Stores the value in requestKey so later lines can reuse this data or behavior for the current feature.
  const requestKey = `${page}:${search}:${refreshVersion}`
  // Stores the value in loading so later lines can reuse this data or behavior for the current feature.
  const loading = loadedRequest !== requestKey

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    void fetchLands({ page, pageSize, search }, controller.signal)
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .then((result) => {
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (controller.signal.aborted) return
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setLands(result.lands)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setTotal(result.total)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setTotalPages(Math.max(1, result.totalPages))
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setError(null)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setLoadedRequest(requestKey)
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
      // Continues the component or data expression so its related values and behavior stay grouped together.
      .catch((loadError: unknown) => {
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (controller.signal.aborted) return
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setError(messageOf(loadError))
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setLoadedRequest(requestKey)
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => controller.abort()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [page, search, requestKey])

  // Caches pageArea so its calculation is repeated only when its inputs change.
  // Caches pageArea so its calculation is repeated only when its inputs change.
  const pageArea = useMemo(() => lands.reduce<Record<AreaUnit, number>>((sum, land) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    sum[land.areaUnit] += Number(land.areaValue)
    // Returns the result so the caller or React receives the value or interface this function provides.
    return sum
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, { SQFT: 0, SQYD: 0, SQM: 0, ACRE: 0 }), [lands])

  // Stores the value in openAdd so later lines can reuse this data or behavior for the current feature.
  const openAdd = () => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setEditing(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setForm(emptyForm)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setShowForm(true)
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in openEdit so later lines can reuse this data or behavior for the current feature.
  const openEdit = (land: ApiLand) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setEditing(land)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setForm({
      // Sets the name field so the surrounding object or component receives this setting.
      name: land.name,
      // Sets the addressLine field so the surrounding object or component receives this setting.
      addressLine: land.addressLine ?? '',
      // Sets the city field so the surrounding object or component receives this setting.
      city: land.city,
      // Sets the state field so the surrounding object or component receives this setting.
      state: land.state,
      // Sets the pincode field so the surrounding object or component receives this setting.
      pincode: land.pincode ?? '',
      // Sets the areaValue field so the surrounding object or component receives this setting.
      areaValue: Number(land.areaValue),
      // Sets the areaUnit field so the surrounding object or component receives this setting.
      areaUnit: land.areaUnit,
      // Sets the surveyNumber field so the surrounding object or component receives this setting.
      surveyNumber: land.surveyNumber ?? '',
      // Sets the ownerName field so the surrounding object or component receives this setting.
      ownerName: land.ownerName ?? '',
      // Sets the purchaseDate field so the surrounding object or component receives this setting.
      purchaseDate: land.purchaseDate?.slice(0, 10) ?? '',
      // Sets the purchaseCost field so the surrounding object or component receives this setting.
      purchaseCost: land.purchaseCost === null ? null : Number(land.purchaseCost),
      // Sets the notes field so the surrounding object or component receives this setting.
      notes: land.notes ?? '',
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setShowForm(true)
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in saveLand so later lines can reuse this data or behavior for the current feature.
  const saveLand = async (event: FormEvent<HTMLFormElement>) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    event.preventDefault()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSaving(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSuccess(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Stores the value in input so later lines can reuse this data or behavior for the current feature.
      const input: LandInput = {
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...form,
        // Sets the name field so the surrounding object or component receives this setting.
        name: form.name.trim(),
        // Sets the city field so the surrounding object or component receives this setting.
        city: form.city.trim(),
        // Sets the state field so the surrounding object or component receives this setting.
        state: form.state.trim(),
        // Sets the addressLine field so the surrounding object or component receives this setting.
        addressLine: form.addressLine?.trim() || null,
        // Sets the pincode field so the surrounding object or component receives this setting.
        pincode: form.pincode?.trim() || null,
        // Sets the surveyNumber field so the surrounding object or component receives this setting.
        surveyNumber: form.surveyNumber?.trim() || null,
        // Sets the ownerName field so the surrounding object or component receives this setting.
        ownerName: form.ownerName?.trim() || null,
        // Sets the purchaseDate field so the surrounding object or component receives this setting.
        purchaseDate: form.purchaseDate || null,
        // Sets the purchaseCost field so the surrounding object or component receives this setting.
        purchaseCost: form.purchaseCost === null || form.purchaseCost === undefined ? null : Number(form.purchaseCost),
        // Sets the notes field so the surrounding object or component receives this setting.
        notes: form.notes?.trim() || null,
      // Closes the current block or object so the grouped statements or settings end here.
      }
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (editing) {
        // Waits for the asynchronous result before using it, so later work receives completed data.
        await updateLand(editing.id, input)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setSuccess('Land details updated.')
      // Continues the component or data expression so its related values and behavior stay grouped together.
      } else {
        // Waits for the asynchronous result before using it, so later work receives completed data.
        await createLand(input)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setSuccess('Land record created.')
      // Closes the current block or object so the grouped statements or settings end here.
      }
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setShowForm(false)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setRefreshVersion((version) => version + 1)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (saveError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(saveError))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSaving(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in removeLand so later lines can reuse this data or behavior for the current feature.
  const removeLand = async (land: ApiLand) => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!window.confirm(`Delete "${land.name}"? This is only allowed when no projects depend on this land.`)) return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setDeletingId(land.id)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSuccess(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await deleteLand(land.id)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess('Land record deleted.')
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (lands.length === 1 && page > 1) setPage((current) => current - 1)
      // Handles the alternative branch when the preceding condition was not met.
      else setRefreshVersion((version) => version + 1)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (deleteError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(deleteError))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setDeletingId(null)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in stats so later lines can reuse this data or behavior for the current feature.
  const stats = [
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Matching Lands', value: total, icon: Map },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Records on This Page', value: lands.length, icon: Building2 },
    // Transforms each collection item so the corresponding values or interface elements can be produced.
    ...areaUnits.filter((unit) => pageArea[unit] > 0).slice(0, 2).map((unit) => ({
      // Sets the label field so the surrounding object or component receives this setting.
      label: `Page area (${unitLabel(unit)})`,
      // Sets the value field so the surrounding object or component receives this setting.
      value: pageArea[unit].toLocaleString(undefined, { maximumFractionDigits: 2 }),
      // Sets the icon field so the surrounding object or component receives this setting.
      icon: Ruler,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })),
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ]

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <AppShell currentPath="/app/lands">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="text-sm text-[#8E827A]">Workspace / Land Management</p>
            {/* Starts the <h1> element to organize this part of the interface. */}
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Land Management</h1>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-2 text-sm text-[#8E827A]">{isAdmin ? 'Manage land records, ownership, locations, and area details.' : 'Land records associated with your assigned projects.'}</p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {isAdmin && <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-medium text-white hover:bg-[#1E1E1E]"><Plus size={17} /> Add Land</button>}
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><span>{error}</span><button onClick={() => setRefreshVersion((version) => version + 1)} className="shrink-0 underline">Retry</button></div>}
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {success && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</p>}

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {stats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-[#8E827A]">{label}</p><h2 className="mt-3 text-3xl font-semibold text-[#323232]">{value}</h2></div><div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div></div></div>)}
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div><h2 className="font-semibold text-[#323232]">Land Records</h2><p className="mt-1 text-xs text-[#8E827A]">{total} records found</p></div>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2"><Search size={17} className="text-[#8E827A]" /><input aria-label="Search lands" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search name or city..." className="w-full bg-transparent text-sm outline-none sm:w-56" /></div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="overflow-x-auto">
            {/* Starts the <table> element to organize this part of the interface. */}
            <table className="w-full min-w-[900px] text-left">
              {/* Starts the <thead> element to organize this part of the interface. */}
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Land Details</th><th className="px-5 py-4 font-medium">Location</th><th className="px-5 py-4 font-medium">Ownership</th><th className="px-5 py-4 font-medium">Area</th><th className="px-5 py-4 font-medium">Created</th><th className="px-5 py-4 text-right font-medium">Actions</th></tr></thead>
              {/* Starts the <tbody> element to organize this part of the interface. */}
              <tbody className="divide-y divide-[#E8DCD4]">
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading land records…</td></tr>
                  // Continues the component or data expression so its related values and behavior stay grouped together.
                  : lands.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8E827A]">{search.trim() ? 'No lands match your search.' : 'No land records found.'}</td></tr>
                    // Transforms each collection item so the corresponding values or interface elements can be produced.
                    : lands.map((land) => <tr key={land.id} className="hover:bg-[#F7F3EE]/60">
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{land.name}</p><p className="mt-1 text-xs text-[#8E827A]">{land.surveyNumber || 'No survey number'}</p></td>
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="px-5 py-4 text-sm text-[#595552]"><span className="flex items-center gap-1"><MapPin size={14} />{[land.city, land.state].filter(Boolean).join(', ')}{land.pincode ? ` ${land.pincode}` : ''}</span>{land.addressLine && <p className="mt-1 text-xs text-[#8E827A]">{land.addressLine}</p>}</td>
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="px-5 py-4 text-sm text-[#595552]">{land.ownerName || '—'}</td>
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="px-5 py-4 text-sm text-[#595552]">{Number(land.areaValue).toLocaleString()} {unitLabel(land.areaUnit)}</td>
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="px-5 py-4 text-sm text-[#595552]">{dateLabel(land.createdAt)}</td>
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="px-5 py-4"><div className="flex justify-end gap-2">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {isAdmin && <button onClick={() => openEdit(land)} title="Edit land" aria-label={`Edit ${land.name}`} className="rounded-lg p-2 text-[#595552] hover:bg-[#F7F3EE]"><Pencil size={16} /></button>}
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {isAdmin && <button disabled={deletingId === land.id} onClick={() => void removeLand(land)} title="Delete land" aria-label={`Delete ${land.name}`} className="rounded-lg p-2 text-[#9B625A] hover:bg-[#F8ECEA] disabled:opacity-50"><Trash2 size={16} /></button>}
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {!isAdmin && <span className="px-2 py-1 text-xs text-[#8E827A]">Read only</span>}
                      {/* Closes the <div> element so later content is no longer part of this region. */}
                      </div></td>
                    {/* Closes the <tr> element so later content is no longer part of this region. */}
                    </tr>)}
              {/* Closes the <tbody> element so later content is no longer part of this region. */}
              </tbody>
            {/* Closes the <table> element so later content is no longer part of this region. */}
            </table>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-center justify-between border-t border-[#E8DCD4] px-5 py-3 text-sm text-[#595552]"><span>Page {page} of {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-[#C8BCB4] px-3 py-1.5 disabled:opacity-50">Previous</button><button disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-[#C8BCB4] px-3 py-1.5 disabled:opacity-50">Next</button></div></div>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
        {/* Starts the <form> element to group controls that submit related information. */}
        <form onSubmit={(event) => void saveLand(event)} className="my-6 w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold text-[#323232]">{editing ? 'Edit Land Details' : 'Add New Land'}</h2><p className="mt-1 text-sm text-[#8E827A]">Enter land information below.</p></div><button type="button" onClick={() => setShowForm(false)} aria-label="Close land form" className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]"><X size={19} /></button></div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Land Name<input required maxLength={255} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter land name" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Survey / Plot Number<input maxLength={100} value={form.surveyNumber ?? ''} onChange={(event) => setForm({ ...form, surveyNumber: event.target.value })} placeholder="Optional" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">City<input required maxLength={100} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">State<input required maxLength={100} value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Address<input maxLength={500} value={form.addressLine ?? ''} onChange={(event) => setForm({ ...form, addressLine: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Pincode<input maxLength={20} value={form.pincode ?? ''} onChange={(event) => setForm({ ...form, pincode: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Land Area<input required type="number" min="0.01" step="0.01" value={form.areaValue || ''} onChange={(event) => setForm({ ...form, areaValue: Number(event.target.value) })} placeholder="Enter area" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Area Unit<select value={form.areaUnit} onChange={(event) => setForm({ ...form, areaUnit: event.target.value as AreaUnit })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-3 font-normal outline-none">{areaUnits.map((unit) => <option key={unit} value={unit}>{unitLabel(unit)}</option>)}</select></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Owner Name<input maxLength={255} value={form.ownerName ?? ''} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Purchase Date<input type="date" value={form.purchaseDate ?? ''} onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552]">Purchase Cost<input type="number" min="0" step="0.01" value={form.purchaseCost ?? ''} onChange={(event) => setForm({ ...form, purchaseCost: event.target.value ? Number(event.target.value) : null })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="text-sm font-medium text-[#595552] sm:col-span-2">Notes<textarea maxLength={2000} rows={3} value={form.notes ?? ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" /></label>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Land'}</button></div>
        {/* Closes the <form> element so later content is no longer part of this region. */}
        </form>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>}
    {/* Closes the <AppShell> element so later content is no longer part of this region. */}
    </AppShell>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the lands screen and coordinates its page-level interactions.
