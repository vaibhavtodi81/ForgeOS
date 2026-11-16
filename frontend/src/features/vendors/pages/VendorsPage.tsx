// Imports useCallback, useEffect, useMemo, useState from react so this module can reuse that component, helper, or library.
import { useCallback, useEffect, useMemo, useState } from 'react'
// Imports type  FormEvent from react so this module can reuse that component, helper, or library.
import type { FormEvent } from 'react'
// Imports useAuth from ../../authentication/auth/useAuth so this module can reuse that component, helper, or library.
import { useAuth } from '../../authentication/auth/useAuth'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  assignVendor,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  createVendor,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  deactivateVendor,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  listProjectVendors,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  listVendors,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  unassignVendor,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  updateVendor,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type Vendor,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type VendorInput,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type VendorType,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from '../../bills/data/vendorBillingApi'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'

// Stores the value in vendorTypes so later lines can reuse this data or behavior for the current feature.
const vendorTypes: VendorType[] = ['MATERIAL_SUPPLIER', 'LABOUR_CONTRACTOR', 'MACHINERY_RENTAL', 'SERVICE_PROVIDER', 'OTHER']
// Stores the value in emptyVendor so later lines can reuse this data or behavior for the current feature.
const emptyVendor: VendorInput = { name: '', vendorType: 'MATERIAL_SUPPLIER', contactPerson: '', phone: '', email: '', gstin: '', address: '' }

// Defines messageOf so this module can perform its named task when needed.
function messageOf(error: unknown) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Something went wrong. Please try again.'
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines VendorsPage so this module can perform its named task when needed.
export function VendorsPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { user } = useAuth()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, selectedProject, selectedProjectId, selectProject } = useProjects()
  // Stores the value in isAdmin so later lines can reuse this data or behavior for the current feature.
  const isAdmin = user?.role === 'ADMIN'
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [vendors, setVendors] = useState<Vendor[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [assignments, setAssignments] = useState<Array<{ id: number; vendorId: number; vendor: Vendor }>>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [draft, setDraft] = useState<VendorInput>(emptyVendor)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [editing, setEditing] = useState<number | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [search, setSearch] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loading, setLoading] = useState(true)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [saving, setSaving] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [error, setError] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [success, setSuccess] = useState<string | null>(null)

  // Stores the value in load so later lines can reuse this data or behavior for the current feature.
  const load = useCallback(async () => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setLoading(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      const [vendorRows, assignmentRows] = await Promise.all([
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        listVendors({ search: search.trim() || undefined, isActive: undefined }),
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        selectedProjectId ? listProjectVendors(selectedProjectId) : Promise.resolve([]),
      // Continues the component or data expression so its related values and behavior stay grouped together.
      ])
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setVendors(vendorRows)
      // Keeps only items matching this condition so the result contains relevant data.
      setAssignments(assignmentRows.filter((assignment) => assignment.vendor?.isActive))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (loadError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(loadError))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setLoading(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [search, selectedProjectId])

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => { void load() }, [load])

  // Caches assignedVendorIds so its calculation is repeated only when its inputs change.
  // Caches assignedVendorIds so its calculation is repeated only when its inputs change.
  const assignedVendorIds = useMemo(() => new Set(assignments.map((item) => item.vendorId)), [assignments])
  // Stores the value in availableVendors so later lines can reuse this data or behavior for the current feature.
  const availableVendors = vendors.filter((vendor) => vendor.isActive && !assignedVendorIds.has(vendor.id))

  // Stores the value in resetForm so later lines can reuse this data or behavior for the current feature.
  const resetForm = () => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setDraft(emptyVendor)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setEditing(null)
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in submitVendor so later lines can reuse this data or behavior for the current feature.
  const submitVendor = async (event: FormEvent<HTMLFormElement>) => {
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
      const input = {
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...draft,
        // Sets the name field so the surrounding object or component receives this setting.
        name: draft.name.trim(),
        // Sets the contactPerson field so the surrounding object or component receives this setting.
        contactPerson: draft.contactPerson?.trim() || null,
        // Sets the phone field so the surrounding object or component receives this setting.
        phone: draft.phone?.trim() || null,
        // Sets the email field so the surrounding object or component receives this setting.
        email: draft.email?.trim() || null,
        // Sets the gstin field so the surrounding object or component receives this setting.
        gstin: draft.gstin?.trim().toUpperCase() || null,
        // Sets the address field so the surrounding object or component receives this setting.
        address: draft.address?.trim() || null,
      // Closes the current block or object so the grouped statements or settings end here.
      }
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (editing !== null) await updateVendor(editing, input)
      // Handles the alternative branch when the preceding condition was not met.
      else {
        // Stores the value in vendor so later lines can reuse this data or behavior for the current feature.
        const vendor = await createVendor(input)
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (!isAdmin && selectedProjectId) {
          // Starts an error-handling region so failures can be caught and handled safely.
          try {
            // Waits for the asynchronous result before using it, so later work receives completed data.
            await assignVendor(selectedProjectId, vendor.id)
          // Continues the component or data expression so its related values and behavior stay grouped together.
          } catch (assignError) {
            // Calls this helper or component so the feature can perform the operation or render the control represented here.
            setError(`Vendor created, but assignment failed: ${messageOf(assignError)}`)
            // Calls this helper or component so the feature can perform the operation or render the control represented here.
            resetForm()
            // Waits for the asynchronous result before using it, so later work receives completed data.
            await load()
            // Returns the result so the caller or React receives the value or interface this function provides.
            return
          // Closes the current block or object so the grouped statements or settings end here.
          }
        // Closes the current block or object so the grouped statements or settings end here.
        }
      // Closes the current block or object so the grouped statements or settings end here.
      }
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess(editing === null ? (!isAdmin ? 'Vendor created and assigned to the selected project.' : 'Vendor created.') : 'Vendor updated.')
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      resetForm()
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await load()
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

  // Stores the value in beginEdit so later lines can reuse this data or behavior for the current feature.
  const beginEdit = (vendor: Vendor) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setEditing(vendor.id)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setDraft({
      // Sets the name field so the surrounding object or component receives this setting.
      name: vendor.name,
      // Sets the vendorType field so the surrounding object or component receives this setting.
      vendorType: vendor.vendorType,
      // Sets the contactPerson field so the surrounding object or component receives this setting.
      contactPerson: vendor.contactPerson ?? '',
      // Sets the phone field so the surrounding object or component receives this setting.
      phone: vendor.phone ?? '',
      // Sets the email field so the surrounding object or component receives this setting.
      email: vendor.email ?? '',
      // Sets the gstin field so the surrounding object or component receives this setting.
      gstin: vendor.gstin ?? '',
      // Sets the address field so the surrounding object or component receives this setting.
      address: vendor.address ?? '',
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in doAssign so later lines can reuse this data or behavior for the current feature.
  const doAssign = async (vendorId: number) => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!selectedProjectId) return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSuccess(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await assignVendor(selectedProjectId, vendorId)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess('Vendor assigned to the selected project.')
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await load()
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (assignError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(assignError))
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in doUnassign so later lines can reuse this data or behavior for the current feature.
  const doUnassign = async (vendorId: number) => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!selectedProjectId) return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSuccess(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await unassignVendor(selectedProjectId, vendorId)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess('Vendor removed from the selected project.')
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await load()
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (unassignError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(unassignError))
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in doDeactivate so later lines can reuse this data or behavior for the current feature.
  const doDeactivate = async (vendor: Vendor) => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!window.confirm(`Deactivate ${vendor.name}?`)) return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSuccess(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await deactivateVendor(vendor.id)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess('Vendor deactivated.')
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await load()
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (deactivateError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(deactivateError))
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <AppShell currentPath="/app/vendors">
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="min-h-screen bg-[#F7F3EE] px-4 py-8 text-[#323232] sm:px-8">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Starts the <header> element to organize this part of the interface. */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="text-sm font-medium uppercase tracking-wide text-[#8A6F52]">Procurement</p>
            {/* Starts the <h1> element to organize this part of the interface. */}
            <h1 className="text-3xl font-semibold">Vendors</h1>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-1 text-sm text-gray-600">Manage vendor records and project assignments.</p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="flex flex-col gap-1 text-sm">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Project assignments
            {/* Starts the <select> element to collect or display a value. */}
            <select className="rounded border bg-white px-3 py-2" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)}>
              {/* Starts the <option> element to organize this part of the interface. */}
              <option value="">Select a project</option>
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              {projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}
            {/* Closes the <select> element so later content is no longer part of this region. */}
            </select>
          {/* Closes the <label> element so later content is no longer part of this region. */}
          </label>
        {/* Closes the <header> element so later content is no longer part of this region. */}
        </header>

        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {error && <div role="alert" className="flex items-center justify-between rounded border border-red-300 bg-red-50 p-3 text-red-800"><span>{error}</span><button className="underline" onClick={() => void load()}>Retry</button></div>}
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {success && <p role="status" className="rounded border border-green-300 bg-green-50 p-3 text-green-800">{success}</p>}

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)]">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              {/* Starts the <h2> element to organize this part of the interface. */}
              <h2 className="text-xl font-semibold">Vendor directory</h2>
              {/* Starts the <input> element to collect or display a value. */}
              <input aria-label="Search vendors" className="rounded border px-3 py-2" placeholder="Search vendors" value={search} onChange={(event) => setSearch(event.target.value)} />
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {loading ? <p className="py-8 text-center text-gray-500">Loading vendors…</p> : vendors.length === 0 ? <p className="py-8 text-center text-gray-500">No vendors found.</p> : (
              // Continues the component or data expression so its related values and behavior stay grouped together.
              <div className="overflow-x-auto">
                {/* Starts the <table> element to organize this part of the interface. */}
                <table className="w-full min-w-[650px] text-left text-sm">
                  {/* Starts the <thead> element to organize this part of the interface. */}
                  <thead><tr className="border-b text-gray-500"><th className="py-2">Vendor</th><th>Type</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
                  {/* Starts the <tbody> element to organize this part of the interface. */}
                  <tbody>{vendors.map((vendor) => <tr key={vendor.id} className="border-b last:border-0">
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="py-3"><strong>{vendor.name}</strong><div className="text-xs text-gray-500">{vendor.gstin || 'No GSTIN'}</div></td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td>{vendor.vendorType.replaceAll('_', ' ')}</td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td>{vendor.contactPerson || vendor.phone || vendor.email || '—'}</td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td>{vendor.isActive ? 'Active' : 'Inactive'}</td>
                    {/* Starts the <td> element to organize this part of the interface. */}
                    <td className="space-x-2 whitespace-nowrap">
                      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                      {isAdmin && vendor.isActive && <button className="text-blue-700 underline" onClick={() => beginEdit(vendor)}>Edit</button>}
                      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                      {isAdmin && vendor.isActive && <button className="text-red-700 underline" onClick={() => void doDeactivate(vendor)}>Deactivate</button>}
                      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                      {!isAdmin && selectedProject && vendor.isActive && !assignedVendorIds.has(vendor.id) && <button className="text-blue-700 underline" onClick={() => void doAssign(vendor.id)}>Assign</button>}
                    {/* Closes the <td> element so later content is no longer part of this region. */}
                    </td>
                  {/* Closes the <tr> element so later content is no longer part of this region. */}
                  </tr>)}</tbody>
                {/* Closes the <table> element so later content is no longer part of this region. */}
                </table>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            // Continues the component or data expression so its related values and behavior stay grouped together.
            )}
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="space-y-6">
            {/* Starts the <form> element to group controls that submit related information. */}
            <form onSubmit={(event) => void submitVendor(event)} className="space-y-3 rounded-lg border bg-white p-5 shadow-sm">
              {/* Starts the <h2> element to organize this part of the interface. */}
              <h2 className="text-xl font-semibold">{editing === null ? 'Add vendor' : 'Edit vendor'}</h2>
              {/* Starts the <label> element to name a form control for users and assistive technology. */}
              <label className="block text-sm">Name<input required maxLength={200} className="mt-1 w-full rounded border px-3 py-2" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
              {/* Starts the <label> element to name a form control for users and assistive technology. */}
              <label className="block text-sm">Vendor type<select className="mt-1 w-full rounded border px-3 py-2" value={draft.vendorType} onChange={(event) => setDraft({ ...draft, vendorType: event.target.value as VendorType })}>{vendorTypes.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}</select></label>
              {/* Starts the <label> element to name a form control for users and assistive technology. */}
              <label className="block text-sm">Contact person<input className="mt-1 w-full rounded border px-3 py-2" value={draft.contactPerson ?? ''} onChange={(event) => setDraft({ ...draft, contactPerson: event.target.value })} /></label>
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="grid grid-cols-2 gap-3">
                {/* Starts the <label> element to name a form control for users and assistive technology. */}
                <label className="block text-sm">Phone<input className="mt-1 w-full rounded border px-3 py-2" value={draft.phone ?? ''} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label>
                {/* Starts the <label> element to name a form control for users and assistive technology. */}
                <label className="block text-sm">Email<input type="email" className="mt-1 w-full rounded border px-3 py-2" value={draft.email ?? ''} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <label> element to name a form control for users and assistive technology. */}
              <label className="block text-sm">GSTIN<input className="mt-1 w-full rounded border px-3 py-2 uppercase" value={draft.gstin ?? ''} onChange={(event) => setDraft({ ...draft, gstin: event.target.value })} /></label>
              {/* Starts the <label> element to name a form control for users and assistive technology. */}
              <label className="block text-sm">Address<textarea rows={2} className="mt-1 w-full rounded border px-3 py-2" value={draft.address ?? ''} onChange={(event) => setDraft({ ...draft, address: event.target.value })} /></label>
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              {!isAdmin && editing === null && !selectedProject && <p className="text-sm text-amber-700">Select a project before creating a vendor so it can be assigned to that project.</p>}
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="flex gap-2"><button disabled={saving || (!isAdmin && editing === null && !selectedProject)} className="rounded bg-[#323232] px-4 py-2 text-white disabled:opacity-50">{saving ? 'Saving…' : editing === null ? 'Create vendor' : 'Save changes'}</button>{editing !== null && <button type="button" className="rounded border px-4 py-2" onClick={resetForm}>Cancel</button>}</div>
            {/* Closes the <form> element so later content is no longer part of this region. */}
            </form>

            {/* Starts the <section> element to group related content into a meaningful region. */}
            <section className="rounded-lg border bg-white p-5 shadow-sm">
              {/* Starts the <h2> element to organize this part of the interface. */}
              <h2 className="text-xl font-semibold">Project vendors</h2>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="mb-3 text-sm text-gray-500">{selectedProject?.name ?? 'Select a project to view assignments.'}</p>
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              {!selectedProject ? <p className="text-sm text-gray-500">Choose an accessible project above.</p> : loading ? <p className="text-sm text-gray-500">Loading assignments…</p> : assignments.length === 0 ? <p className="text-sm text-gray-500">No vendors assigned.</p> : (
                // Transforms each collection item so the corresponding values or interface elements can be produced.
                <ul className="space-y-2">{assignments.map((assignment) => <li key={assignment.id} className="flex items-center justify-between gap-2 border-b pb-2 text-sm"><span>{assignment.vendor.name}</span><button className="text-red-700 underline" onClick={() => void doUnassign(assignment.vendorId)}>Remove</button></li>)}</ul>
              // Continues the component or data expression so its related values and behavior stay grouped together.
              )}
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              {isAdmin && selectedProject && availableVendors.length > 0 && <label className="mt-4 block text-sm">Assign vendor<select defaultValue="" className="mt-1 w-full rounded border px-3 py-2" onChange={(event) => { if (event.target.value) void doAssign(Number(event.target.value)); event.target.value = '' }}><option value="">Choose vendor…</option>{availableVendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></label>}
            {/* Closes the <section> element so later content is no longer part of this region. */}
            </section>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>
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
// File purpose: Renders the vendors screen and coordinates its page-level interactions.
