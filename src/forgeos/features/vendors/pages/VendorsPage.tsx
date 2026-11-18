import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, Search, Pencil, X, Building2, Phone, Mail, PackageCheck } from 'lucide-react'
import { useAuth } from '../../authentication/auth/useAuth'
import { AppShell } from '../../app-shell/components/AppShell'
import { createSupplier, fetchSuppliers, updateSupplier, type SupplierRow } from '../data/suppliersApi'
import { ApiError } from '../../../lib/api'

const emptyForm = { name: '', phone: '', email: '', address: '' }

function messageOf(error: unknown) {
  return error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export function VendorsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SupplierRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchSuppliers(signal)
      if (!signal?.aborted) setSuppliers(rows)
    } catch (loadError) {
      if (!signal?.aborted) setError(messageOf(loadError))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return suppliers
    return suppliers.filter((supplier) => `${supplier.name} ${supplier.phone} ${supplier.email ?? ''} ${supplier.address ?? ''}`.toLowerCase().includes(query))
  }, [suppliers, search])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (supplier: SupplierRow) => {
    setEditing(supplier)
    setForm({ name: supplier.name, phone: supplier.phone, email: supplier.email ?? '', address: supplier.address ?? '' })
    setFormError(null)
    setFormOpen(true)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setFormError(null)
    setError(null)
    setSuccess(null)
    try {
      const input = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim() || null,
      }
      if (editing) {
        await updateSupplier(editing.id, input)
        setSuccess('Vendor updated.')
      } else {
        await createSupplier(input)
        setSuccess('Vendor added.')
      }
      setFormOpen(false)
      await load()
    } catch (saveError) {
      setFormError(messageOf(saveError))
    } finally {
      setSaving(false)
    }
  }

  const totalTxns = suppliers.reduce((sum, supplier) => sum + supplier.supplyTxnCount, 0)
  const withEmail = suppliers.filter((supplier) => supplier.email).length
  const cards = [
    { label: 'Vendors', value: suppliers.length, icon: Building2 },
    { label: 'With Email on File', value: withEmail, icon: Mail },
    { label: 'Supply Transactions', value: totalTxns, icon: PackageCheck },
  ]

  return (
    <AppShell currentPath="/app/vendors">
      <div className="min-h-screen bg-[#F7F3EE] px-4 py-8 text-[#323232] sm:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-[#8A6F52]">Procurement</p>
              <h1 className="text-3xl font-semibold">Vendors</h1>
              <p className="mt-1 text-sm text-gray-600">Vendor directory used when recording stock receipts.</p>
            </div>
            {isAdmin && <button onClick={openAdd} className="inline-flex items-center gap-2 rounded bg-[#323232] px-4 py-2 text-white"><Plus size={16} /> Add vendor</button>}
          </header>

          {error && <div role="alert" className="flex items-center justify-between rounded border border-red-300 bg-red-50 p-3 text-red-800"><span>{error}</span><button className="underline" onClick={() => void load()}>Retry</button></div>}
          {success && <p role="status" className="rounded border border-green-300 bg-green-50 p-3 text-green-800">{success}</p>}

          <div className="grid gap-3 sm:grid-cols-3">
            {cards.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-lg border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-xl font-semibold">{loading ? '—' : value}</p></div><Icon size={20} className="text-[#8A6F52]" /></div></div>)}
          </div>

          <section className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Vendor directory</h2>
              <div className="flex items-center gap-2 rounded border px-3 py-2">
                <Search size={16} className="text-gray-400" />
                <input aria-label="Search vendors" className="bg-transparent text-sm outline-none" placeholder="Search vendors" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
            </div>
            {loading ? <p className="py-10 text-center text-gray-500">Loading vendors…</p> : filtered.length === 0 ? <p className="py-10 text-center text-gray-500">{search.trim() ? 'No vendors match your search.' : 'No vendors found.'}</p> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead><tr className="border-b text-gray-500"><th className="py-2">Vendor</th><th>Phone</th><th>Email</th><th>Supply txns</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>{filtered.map((supplier) => <tr key={supplier.id} className="border-b last:border-0">
                    <td className="py-3"><strong>{supplier.name}</strong><div className="text-xs text-gray-500">{supplier.address || 'No address on file'}</div></td>
                    <td className="py-3"><span className="inline-flex items-center gap-1"><Phone size={13} className="text-gray-400" />{supplier.phone || '—'}</span></td>
                    <td className="py-3"><span className="inline-flex items-center gap-1"><Mail size={13} className="text-gray-400" />{supplier.email || '—'}</span></td>
                    <td className="py-3">{supplier.supplyTxnCount}</td>
                    <td className="py-3 text-right">{isAdmin
                      ? <button className="inline-flex items-center gap-1 text-blue-700 underline" onClick={() => openEdit(supplier)}><Pencil size={13} /> Edit</button>
                      : <span className="text-xs text-gray-500">View only</span>}</td>
                  </tr>)}</tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false) }}>
        <form onSubmit={(event) => void submit(event)} className="w-full max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-label={editing ? 'Edit vendor' : 'Add vendor'}>
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">{editing ? 'Edit vendor' : 'Add vendor'}</h2><button type="button" aria-label="Close vendor form" className="rounded p-2 text-gray-500 hover:bg-gray-100" onClick={() => setFormOpen(false)}><X size={18} /></button></div>
          {formError && <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
          <label className="block text-sm">Name<input required maxLength={200} className="mt-1 w-full rounded border px-3 py-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="block text-sm">Phone<input required maxLength={50} className="mt-1 w-full rounded border px-3 py-2" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="At least 6 characters" /></label>
          <label className="block text-sm">Email (optional)<input type="email" maxLength={200} className="mt-1 w-full rounded border px-3 py-2" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="block text-sm">Address (optional)<textarea rows={2} maxLength={500} className="mt-1 w-full rounded border px-3 py-2" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
          <div className="flex justify-end gap-2 pt-1"><button type="button" className="rounded border px-4 py-2" onClick={() => setFormOpen(false)}>Cancel</button><button disabled={saving} className="rounded bg-[#323232] px-4 py-2 text-white disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save changes' : 'Add vendor'}</button></div>
        </form>
      </div>}
    </AppShell>
  )
}
