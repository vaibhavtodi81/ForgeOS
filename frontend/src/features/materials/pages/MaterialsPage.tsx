// Imports useEffect, useMemo, useState, type FormEvent from react so this module can reuse that component, helper, or library.
import { useEffect, useMemo, useState, type FormEvent } from 'react'
// Imports Boxes, Plus, Search, Pencil, X, CheckCircle2, PackageX, RefreshCw from lucide-react so this module can reuse that component, helper, or library.
import { Boxes, Plus, Search, Pencil, X, CheckCircle2, PackageX, RefreshCw } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useAuth from ../../authentication/auth/useAuth so this module can reuse that component, helper, or library.
import { useAuth } from '../../authentication/auth/useAuth'
// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  createMaterial,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fetchMaterials,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  updateMaterial,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type ApiMaterial,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type MaterialCategory,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type MaterialInput,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from '../../stock/data/inventoryApi'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'

// Stores the value in categories so later lines can reuse this data or behavior for the current feature.
const categories: { value: MaterialCategory; label: string }[] = [
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'CEMENT', label: 'Cement' },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'STEEL', label: 'Steel' },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'SAND_AGGREGATE', label: 'Sand & Aggregate' },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'BRICKS_BLOCKS', label: 'Bricks & Blocks' },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'TIMBER', label: 'Timber' },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'ELECTRICAL', label: 'Electrical' },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'PLUMBING', label: 'Plumbing' },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'PAINT_FINISH', label: 'Paint & Finish' },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'OTHER', label: 'Other' },
// Continues the component or data expression so its related values and behavior stay grouped together.
]

// Stores the value in emptyForm so later lines can reuse this data or behavior for the current feature.
const emptyForm = { name: '', category: 'CEMENT' as MaterialCategory, unit: 'Bag', description: '' }

// Defines MaterialsPage so this module can perform its named task when needed.
export function MaterialsPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { user } = useAuth()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [materials, setMaterials] = useState<ApiMaterial[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loading, setLoading] = useState(true)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loadError, setLoadError] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [retry, setRetry] = useState(0)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [search, setSearch] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [categoryFilter, setCategoryFilter] = useState('All')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [statusFilter, setStatusFilter] = useState('All')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [showForm, setShowForm] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [editing, setEditing] = useState<ApiMaterial | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [form, setForm] = useState(emptyForm)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [formError, setFormError] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [success, setSuccess] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [saving, setSaving] = useState(false)
  // Stores the value in isAdmin so later lines can reuse this data or behavior for the current feature.
  const isAdmin = user?.role === 'ADMIN'

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setLoading(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    fetchMaterials(controller.signal).then(setMaterials).then(() => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) setLoadError(null)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }).catch((cause: unknown) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) setLoadError(cause instanceof Error ? cause.message : 'Unable to load the material catalogue.')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }).finally(() => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) setLoading(false)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => controller.abort()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [retry])

  // Caches filtered so its calculation is repeated only when its inputs change.
  // Caches filtered so its calculation is repeated only when its inputs change.
  const filtered = useMemo(() => materials.filter((material) => {
    // Stores the value in matchesText so later lines can reuse this data or behavior for the current feature.
    const matchesText = `${material.name} ${material.category} ${material.unit}`.toLowerCase().includes(search.toLowerCase())
    // Returns the result so the caller or React receives the value or interface this function provides.
    return matchesText
      // Continues the component or data expression so its related values and behavior stay grouped together.
      && (categoryFilter === 'All' || material.category === categoryFilter)
      // Continues the component or data expression so its related values and behavior stay grouped together.
      && (statusFilter === 'All' || (statusFilter === 'Active') === material.isActive)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }), [materials, search, categoryFilter, statusFilter])

  // Stores the value in openAdd so later lines can reuse this data or behavior for the current feature.
  const openAdd = () => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setEditing(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setForm(emptyForm)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setFormError('')
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSuccess('')
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setShowForm(true)
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in openEdit so later lines can reuse this data or behavior for the current feature.
  const openEdit = (material: ApiMaterial) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setEditing(material)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setForm({ name: material.name, category: material.category, unit: material.unit, description: material.description ?? '' })
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setFormError('')
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSuccess('')
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setShowForm(true)
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in save so later lines can reuse this data or behavior for the current feature.
  const save = async (event: FormEvent<HTMLFormElement>) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    event.preventDefault()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setFormError('')
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSaving(true)
    // Stores the value in input so later lines can reuse this data or behavior for the current feature.
    const input: MaterialInput = {
      // Sets the name field so the surrounding object or component receives this setting.
      name: form.name.trim(),
      // Sets the category field so the surrounding object or component receives this setting.
      category: form.category,
      // Sets the unit field so the surrounding object or component receives this setting.
      unit: form.unit.trim(),
      // Sets the description field so the surrounding object or component receives this setting.
      description: form.description.trim() || null,
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Stores the value in saved so later lines can reuse this data or behavior for the current feature.
      const saved = editing ? await updateMaterial(editing.id, input) : await createMaterial(input)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setMaterials((current) => editing
        // Transforms each collection item so the corresponding values or interface elements can be produced.
        ? current.map((item) => item.id === saved.id ? saved : item)
        // Continues the component or data expression so its related values and behavior stay grouped together.
        : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)))
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setShowForm(false)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess(`Material ${editing ? 'updated' : 'created'} successfully.`)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (cause) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setFormError(cause instanceof ApiError ? cause.message : 'Unable to save this material.')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSaving(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in categoryLabel so later lines can reuse this data or behavior for the current feature.
  const categoryLabel = (category: string) => categories.find((entry) => entry.value === category)?.label ?? category
  // Stores the value in activeCount so later lines can reuse this data or behavior for the current feature.
  const activeCount = materials.filter((item) => item.isActive).length
  // Stores the value in stats so later lines can reuse this data or behavior for the current feature.
  const stats = [
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Total Materials', value: materials.length, icon: Boxes },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Active', value: activeCount, icon: CheckCircle2 },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { label: 'Inactive', value: materials.length - activeCount, icon: PackageX },
    // Transforms each collection item so the corresponding values or interface elements can be produced.
    { label: 'Categories', value: new Set(materials.map((item) => item.category)).size, icon: Boxes },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ]

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AppShell currentPath="/app/materials">
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div><p className="text-sm text-[#8E827A]">Workspace / Materials</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Materials Master</h1><p className="mt-2 text-sm text-[#8E827A]">Shared material catalogue from ForgeOS.</p></div>
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {isAdmin && <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-medium text-white"><Plus size={17} /> Add Material</button>}
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {success && <p role="status" className="rounded-xl bg-[#E8EFE5] px-4 py-3 text-sm text-[#617858]">{success}</p>}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {loadError && <ErrorBanner message={loadError} retry={() => setRetry((value) => value + 1)} />}

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {stats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-[#8E827A]">{label}</p><h2 className="mt-3 text-3xl font-semibold text-[#323232]">{loading ? '—' : value}</h2></div><div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div></div></div>)}
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 lg:flex-row lg:items-center">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div><h2 className="font-semibold text-[#323232]">Material Catalogue</h2><p className="mt-1 text-xs text-[#8E827A]">{filtered.length} materials</p></div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2"><Search size={17} className="text-[#8E827A]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search material..." className="w-full bg-transparent text-sm outline-none sm:w-44" /></div>
            {/* Starts the <select> element to collect or display a value. */}
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm"><option value="All">All categories</option>{categories.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}</select>
            {/* Starts the <select> element to collect or display a value. */}
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm"><option>All</option><option>Active</option><option>Inactive</option></select>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left">
          {/* Starts the <thead> element to organize this part of the interface. */}
          <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Category</th><th className="px-5 py-4 font-medium">Unit</th><th className="px-5 py-4 font-medium">Description</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4 text-right font-medium">Actions</th></tr></thead>
          {/* Starts the <tbody> element to organize this part of the interface. */}
          <tbody className="divide-y divide-[#E8DCD4]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {filtered.map((material) => <tr key={material.id} className={`hover:bg-[#F7F3EE]/60 ${!material.isActive ? 'opacity-60' : ''}`}>
              {/* Starts the <td> element to organize this part of the interface. */}
              <td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{material.name}</p><p className="mt-1 text-xs text-[#8E827A]">#{material.id}</p></td>
              {/* Starts the <td> element to organize this part of the interface. */}
              <td className="px-5 py-4 text-sm text-[#595552]">{categoryLabel(material.category)}</td><td className="px-5 py-4 text-sm text-[#595552]">{material.unit}</td><td className="max-w-sm px-5 py-4 text-sm text-[#595552]">{material.description || '—'}</td>
              {/* Starts the <td> element to organize this part of the interface. */}
              <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${material.isActive ? 'bg-[#E8EFE5] text-[#617858]' : 'bg-[#F8ECEA] text-[#9B625A]'}`}>{material.isActive ? 'Active' : 'Inactive'}</span></td>
              {/* Starts the <td> element to organize this part of the interface. */}
              <td className="px-5 py-4 text-right">{isAdmin ? <button onClick={() => openEdit(material)} title="Edit material" className="rounded-lg p-2 text-[#595552] hover:bg-[#F7F3EE]"><Pencil size={16} /></button> : <span className="text-xs text-[#8E827A]">View only</span>}</td>
            {/* Closes the <tr> element so later content is no longer part of this region. */}
            </tr>)}
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8E827A]">{loadError ? 'Catalogue unavailable.' : 'No materials found.'}</td></tr>}
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {loading && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading materials…</td></tr>}
          {/* Closes the <tbody> element so later content is no longer part of this region. */}
          </tbody>
        {/* Closes the <table> element so later content is no longer part of this region. */}
        </table></div>
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>

    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
    {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      {/* Starts the <form> element to group controls that submit related information. */}
      <form onSubmit={(event) => void save(event)} className="my-6 w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold text-[#323232]">{editing ? 'Edit Material' : 'Add New Material'}</h2><p className="mt-1 text-sm text-[#8E827A]">Catalogue entries are shared across projects.</p></div><button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-[#8E827A]"><X size={19} /></button></div>
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {formError && <p role="alert" className="rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]">{formError}</p>}
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-sm font-medium text-[#595552]">Material Name<input required maxLength={255} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-sm font-medium text-[#595552]">Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as MaterialCategory })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal">{categories.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}</select></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-sm font-medium text-[#595552]">Unit<input required maxLength={30} value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="e.g. Bag, Kg, m³" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-sm font-medium text-[#595552]">Description<textarea maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm">Cancel</button><button disabled={saving} type="submit" className="rounded-xl bg-[#323232] px-5 py-2.5 text-sm text-white disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Material'}</button></div>
      {/* Closes the <form> element so later content is no longer part of this region. */}
      </form>
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>}
  {/* Closes the <AppShell> element so later content is no longer part of this region. */}
  </AppShell>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ErrorBanner so this module can perform its named task when needed.
function ErrorBanner({ message, retry }: { message: string; retry: () => void }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{message}</span><button type="button" onClick={retry} className="font-semibold underline"><RefreshCw className="mr-1 inline h-4 w-4" />Retry</button></div>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the materials screen and coordinates its page-level interactions.
