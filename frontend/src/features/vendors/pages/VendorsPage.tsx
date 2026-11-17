import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../authentication/auth/useAuth'
import { useProjects } from '../../projects/useProjects'
import { AppShell } from '../../app-shell/components/AppShell'
import {
  assignVendor,
  createVendor,
  deactivateVendor,
  listProjectVendors,
  listVendors,
  unassignVendor,
  updateVendor,
  type Vendor,
  type VendorInput,
  type VendorType,
} from '../../bills/data/vendorBillingApi'
import { ApiError } from '../../../lib/api'

const vendorTypes: VendorType[] = ['MATERIAL_SUPPLIER', 'LABOUR_CONTRACTOR', 'MACHINERY_RENTAL', 'SERVICE_PROVIDER', 'OTHER']
const emptyVendor: VendorInput = { name: '', vendorType: 'MATERIAL_SUPPLIER', contactPerson: '', phone: '', email: '', gstin: '', address: '' }

function messageOf(error: unknown) {
  return error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export function VendorsPage() {
  const { user } = useAuth()
  const { projects, selectedProject, selectedProjectId, selectProject } = useProjects()
  const isAdmin = user?.role === 'ADMIN'
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [assignments, setAssignments] = useState<Array<{ id: number; vendorId: number; vendor: Vendor }>>([])
  const [draft, setDraft] = useState<VendorInput>(emptyVendor)
  const [editing, setEditing] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [vendorRows, assignmentRows] = await Promise.all([
        listVendors({ search: search.trim() || undefined, isActive: undefined }),
        selectedProjectId ? listProjectVendors(selectedProjectId) : Promise.resolve([]),
      ])
      setVendors(vendorRows)
      setAssignments(assignmentRows.filter((assignment) => assignment.vendor?.isActive))
    } catch (loadError) {
      setError(messageOf(loadError))
    } finally {
      setLoading(false)
    }
  }, [search, selectedProjectId])

  useEffect(() => { void load() }, [load])

  const assignedVendorIds = useMemo(() => new Set(assignments.map((item) => item.vendorId)), [assignments])
  const availableVendors = vendors.filter((vendor) => vendor.isActive && !assignedVendorIds.has(vendor.id))

  const resetForm = () => {
    setDraft(emptyVendor)
    setEditing(null)
  }

  const submitVendor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const input = {
        ...draft,
        name: draft.name.trim(),
        contactPerson: draft.contactPerson?.trim() || null,
        phone: draft.phone?.trim() || null,
        email: draft.email?.trim() || null,
        gstin: draft.gstin?.trim().toUpperCase() || null,
        address: draft.address?.trim() || null,
      }
      if (editing !== null) await updateVendor(editing, input)
      else {
        const vendor = await createVendor(input)
        if (!isAdmin && selectedProjectId) {
          try {
            await assignVendor(selectedProjectId, vendor.id)
          } catch (assignError) {
            setError(`Vendor created, but assignment failed: ${messageOf(assignError)}`)
            resetForm()
            await load()
            return
          }
        }
      }
      setSuccess(editing === null ? (!isAdmin ? 'Vendor created and assigned to the selected project.' : 'Vendor created.') : 'Vendor updated.')
      resetForm()
      await load()
    } catch (saveError) {
      setError(messageOf(saveError))
    } finally {
      setSaving(false)
    }
  }

  const beginEdit = (vendor: Vendor) => {
    setEditing(vendor.id)
    setDraft({
      name: vendor.name,
      vendorType: vendor.vendorType,
      contactPerson: vendor.contactPerson ?? '',
      phone: vendor.phone ?? '',
      email: vendor.email ?? '',
      gstin: vendor.gstin ?? '',
      address: vendor.address ?? '',
    })
  }

  const doAssign = async (vendorId: number) => {
    if (!selectedProjectId) return
    setError(null)
    setSuccess(null)
    try {
      await assignVendor(selectedProjectId, vendorId)
      setSuccess('Vendor assigned to the selected project.')
      await load()
    } catch (assignError) {
      setError(messageOf(assignError))
    }
  }

  const doUnassign = async (vendorId: number) => {
    if (!selectedProjectId) return
    setError(null)
    setSuccess(null)
    try {
      await unassignVendor(selectedProjectId, vendorId)
      setSuccess('Vendor removed from the selected project.')
      await load()
    } catch (unassignError) {
      setError(messageOf(unassignError))
    }
  }

  const doDeactivate = async (vendor: Vendor) => {
    if (!window.confirm(`Deactivate ${vendor.name}?`)) return
    setError(null)
    setSuccess(null)
    try {
      await deactivateVendor(vendor.id)
      setSuccess('Vendor deactivated.')
      await load()
    } catch (deactivateError) {
      setError(messageOf(deactivateError))
    }
  }

  return (
    <AppShell currentPath="/app/vendors">
    <div className="min-h-screen bg-[#F7F3EE] px-4 py-8 text-[#323232] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[#8A6F52]">Procurement</p>
            <h1 className="text-3xl font-semibold">Vendors</h1>
            <p className="mt-1 text-sm text-gray-600">Manage vendor records and project assignments.</p>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Project assignments
            <select className="rounded border bg-white px-3 py-2" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)}>
              <option value="">Select a project</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}
            </select>
          </label>
        </header>

        {error && <div role="alert" className="flex items-center justify-between rounded border border-red-300 bg-red-50 p-3 text-red-800"><span>{error}</span><button className="underline" onClick={() => void load()}>Retry</button></div>}
        {success && <p role="status" className="rounded border border-green-300 bg-green-50 p-3 text-green-800">{success}</p>}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)]">
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Vendor directory</h2>
              <input aria-label="Search vendors" className="rounded border px-3 py-2" placeholder="Search vendors" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            {loading ? <p className="py-8 text-center text-gray-500">Loading vendors…</p> : vendors.length === 0 ? <p className="py-8 text-center text-gray-500">No vendors found.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead><tr className="border-b text-gray-500"><th className="py-2">Vendor</th><th>Type</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{vendors.map((vendor) => <tr key={vendor.id} className="border-b last:border-0">
                    <td className="py-3"><strong>{vendor.name}</strong><div className="text-xs text-gray-500">{vendor.gstin || 'No GSTIN'}</div></td>
                    <td>{vendor.vendorType.replaceAll('_', ' ')}</td>
                    <td>{vendor.contactPerson || vendor.phone || vendor.email || '—'}</td>
                    <td>{vendor.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="space-x-2 whitespace-nowrap">
                      {isAdmin && vendor.isActive && <button className="text-blue-700 underline" onClick={() => beginEdit(vendor)}>Edit</button>}
                      {isAdmin && vendor.isActive && <button className="text-red-700 underline" onClick={() => void doDeactivate(vendor)}>Deactivate</button>}
                      {!isAdmin && selectedProject && vendor.isActive && !assignedVendorIds.has(vendor.id) && <button className="text-blue-700 underline" onClick={() => void doAssign(vendor.id)}>Assign</button>}
                    </td>
                  </tr>)}</tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <form onSubmit={(event) => void submitVendor(event)} className="space-y-3 rounded-lg border bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">{editing === null ? 'Add vendor' : 'Edit vendor'}</h2>
              <label className="block text-sm">Name<input required maxLength={200} className="mt-1 w-full rounded border px-3 py-2" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
              <label className="block text-sm">Vendor type<select className="mt-1 w-full rounded border px-3 py-2" value={draft.vendorType} onChange={(event) => setDraft({ ...draft, vendorType: event.target.value as VendorType })}>{vendorTypes.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}</select></label>
              <label className="block text-sm">Contact person<input className="mt-1 w-full rounded border px-3 py-2" value={draft.contactPerson ?? ''} onChange={(event) => setDraft({ ...draft, contactPerson: event.target.value })} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">Phone<input className="mt-1 w-full rounded border px-3 py-2" value={draft.phone ?? ''} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label>
                <label className="block text-sm">Email<input type="email" className="mt-1 w-full rounded border px-3 py-2" value={draft.email ?? ''} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
              </div>
              <label className="block text-sm">GSTIN<input className="mt-1 w-full rounded border px-3 py-2 uppercase" value={draft.gstin ?? ''} onChange={(event) => setDraft({ ...draft, gstin: event.target.value })} /></label>
              <label className="block text-sm">Address<textarea rows={2} className="mt-1 w-full rounded border px-3 py-2" value={draft.address ?? ''} onChange={(event) => setDraft({ ...draft, address: event.target.value })} /></label>
              {!isAdmin && editing === null && !selectedProject && <p className="text-sm text-amber-700">Select a project before creating a vendor so it can be assigned to that project.</p>}
              <div className="flex gap-2"><button disabled={saving || (!isAdmin && editing === null && !selectedProject)} className="rounded bg-[#323232] px-4 py-2 text-white disabled:opacity-50">{saving ? 'Saving…' : editing === null ? 'Create vendor' : 'Save changes'}</button>{editing !== null && <button type="button" className="rounded border px-4 py-2" onClick={resetForm}>Cancel</button>}</div>
            </form>

            <section className="rounded-lg border bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Project vendors</h2>
              <p className="mb-3 text-sm text-gray-500">{selectedProject?.name ?? 'Select a project to view assignments.'}</p>
              {!selectedProject ? <p className="text-sm text-gray-500">Choose an accessible project above.</p> : loading ? <p className="text-sm text-gray-500">Loading assignments…</p> : assignments.length === 0 ? <p className="text-sm text-gray-500">No vendors assigned.</p> : (
                <ul className="space-y-2">{assignments.map((assignment) => <li key={assignment.id} className="flex items-center justify-between gap-2 border-b pb-2 text-sm"><span>{assignment.vendor.name}</span><button className="text-red-700 underline" onClick={() => void doUnassign(assignment.vendorId)}>Remove</button></li>)}</ul>
              )}
              {isAdmin && selectedProject && availableVendors.length > 0 && <label className="mt-4 block text-sm">Assign vendor<select defaultValue="" className="mt-1 w-full rounded border px-3 py-2" onChange={(event) => { if (event.target.value) void doAssign(Number(event.target.value)); event.target.value = '' }}><option value="">Choose vendor…</option>{availableVendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></label>}
            </section>
          </div>
        </section>
      </div>
    </div>
    </AppShell>
  )
}
