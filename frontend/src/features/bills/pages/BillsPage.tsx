import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { AppShell } from '../../app-shell/components/AppShell'
import { useAuth } from '../../authentication/auth/useAuth'
import { useProjects } from '../../projects/useProjects'
import { ApiError } from '../../../lib/api'
import {
  approveBill,
  assignVendor,
  createBill,
  createVendor,
  deleteBill,
  listBillPayments,
  listBills,
  listVendors,
  paymentHistory,
  projectExpenses,
  recordPayment,
  rejectBill,
  updateBill,
  vendorOutstanding,
  type Bill,
  type BillCategory,
  type BillInput,
  type Payment,
  type PaymentHistoryEntry,
  type PaymentMode,
  type Vendor,
  type VendorOutstanding,
} from '../data/vendorBillingApi'

type View = 'bills' | 'expenses' | 'outstanding' | 'payments'
const categories: BillCategory[] = ['MATERIAL', 'LABOUR', 'MACHINERY', 'SERVICES', 'OTHER']
const modes: PaymentMode[] = ['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'OTHER']
const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_PAID', 'PAID']
const today = new Date().toISOString().slice(0, 10)

function messageOf(error: unknown) {
  return error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
function amount(value: number | string | null | undefined) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value ?? 0))
}
function dateLabel(value?: string | null) {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function BillsPage({ openUpload = false }: { openUpload?: boolean }) {
  const { user } = useAuth()
  const { projects, selectedProject, selectedProjectId, selectProject } = useProjects()
  const isAdmin = user?.role === 'ADMIN'
  const [view, setView] = useState<View>('bills')
  const [bills, setBills] = useState<Bill[]>([])
  const [billPage, setBillPage] = useState(1)
  const [totalBillPages, setTotalBillPages] = useState(1)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [expenses, setExpenses] = useState<Bill[]>([])
  const [outstanding, setOutstanding] = useState<VendorOutstanding[]>([])
  const [history, setHistory] = useState<PaymentHistoryEntry[]>([])
  const [billPayments, setBillPayments] = useState<Payment[]>([])
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [overdue, setOverdue] = useState(false)
  const [formOpen, setFormOpen] = useState(openUpload)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [paymentTarget, setPaymentTarget] = useState<Bill | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(today)
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('BANK_TRANSFER')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentRemarks, setPaymentRemarks] = useState('')
  const [vendorFormOpen, setVendorFormOpen] = useState(false)
  const [newVendorName, setNewVendorName] = useState('')
  const [form, setForm] = useState<BillInput>({
    projectId: Number(selectedProjectId) || 0,
    vendorId: 0,
    billNumber: '',
    billDate: today,
    dueDate: '',
    category: 'MATERIAL',
    description: '',
    baseAmount: 0,
    gstPercent: 18,
  })

  useEffect(() => {
    if (selectedProjectId) setForm((current) => ({ ...current, projectId: Number(selectedProjectId) }))
  }, [selectedProjectId])

  const loadVendors = useCallback(async () => {
    try {
      setVendors(await listVendors({ isActive: true }))
    } catch (loadError) {
      setError(messageOf(loadError))
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const filters = {
        projectId: selectedProjectId ? Number(selectedProjectId) : undefined,
        status: statusFilter || undefined,
        category: (categoryFilter || undefined) as BillCategory | undefined,
        search: search.trim() || undefined,
        overdue: overdue || undefined,
        from: from || undefined,
        to: to || undefined,
        page: billPage,
        pageSize: 20,
      }
      const requests = await Promise.all([
        listBills(filters),
        selectedProjectId ? projectExpenses(selectedProjectId, from || undefined, to || undefined) : Promise.resolve([]),
        vendorOutstanding(from || undefined, to || undefined),
        paymentHistory(from || undefined, to || undefined),
      ])
      setBills(requests[0].bills)
      setTotalBillPages(requests[0].meta.totalPages)
      setExpenses(requests[1])
      setOutstanding(requests[2])
      setHistory(requests[3])
    } catch (loadError) {
      setError(messageOf(loadError))
    } finally {
      setLoading(false)
    }
  }, [selectedProjectId, statusFilter, categoryFilter, search, overdue, from, to, billPage])

  useEffect(() => { setBillPage(1) }, [selectedProjectId, statusFilter, categoryFilter, search, overdue, from, to])

  useEffect(() => { void load() }, [load])
  useEffect(() => { void loadVendors() }, [loadVendors])

  const totals = useMemo(() => bills.reduce((sum, bill) => ({
    total: sum.total + Number(bill.totalAmount),
    paid: sum.paid + Number(bill.paidAmount ?? 0),
    outstanding: sum.outstanding + Number(bill.outstandingAmount ?? 0),
  }), { total: 0, paid: 0, outstanding: 0 }), [bills])
  const expenseTotals = useMemo(() => expenses.reduce((sum, bill) => ({
    total: sum.total + Number(bill.totalAmount),
    paid: sum.paid + Number(bill.paidAmount ?? 0),
    outstanding: sum.outstanding + Number(bill.outstandingAmount ?? 0),
  }), { total: 0, paid: 0, outstanding: 0 }), [expenses])

  const resetBillForm = () => {
    setForm({ projectId: Number(selectedProjectId) || 0, vendorId: 0, billNumber: '', billDate: today, dueDate: '', category: 'MATERIAL', description: '', baseAmount: 0, gstPercent: 18 })
    setEditingId(null)
    setFormOpen(false)
  }

  const submitBill = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true); setError(null); setSuccess(null)
    try {
      const input: BillInput = { ...form, dueDate: form.dueDate || null, description: form.description?.trim() || null }
      if (editingId !== null) {
        await updateBill(editingId, input)
        setSuccess('Bill updated.')
      } else {
        await createBill(input)
        setSuccess('Bill submitted for review.')
      }
      resetBillForm()
      await load()
    } catch (submitError) {
      setError(messageOf(submitError))
    } finally {
      setSaving(false)
    }
  }

  const beginEdit = (bill: Bill) => {
    setForm({
      projectId: bill.projectId,
      vendorId: bill.vendorId,
      billNumber: bill.billNumber,
      billDate: bill.billDate.slice(0, 10),
      dueDate: bill.dueDate?.slice(0, 10) ?? '',
      category: bill.category,
      description: bill.description ?? '',
      baseAmount: Number(bill.baseAmount),
      gstPercent: Number(bill.gstPercent) as BillInput['gstPercent'],
    })
    setEditingId(bill.id)
    setFormOpen(true)
  }

  const chooseBill = async (bill: Bill) => {
    setRejecting(false)
    setSelectedBill(bill)
    setError(null)
    try {
      setBillPayments(await listBillPayments(bill.id))
    } catch (detailError) {
      setError(messageOf(detailError))
      setBillPayments([])
    }
  }

  const action = async (run: () => Promise<unknown>, message: string) => {
    setSaving(true); setError(null); setSuccess(null)
    try {
      await run()
      setSuccess(message)
      setSelectedBill(null)
      await load()
    } catch (actionError) {
      setError(messageOf(actionError))
    } finally {
      setSaving(false)
    }
  }

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!paymentTarget) return
    await action(() => recordPayment(paymentTarget.id, {
      amount: Number(paymentAmount),
      paymentDate,
      mode: paymentMode,
      referenceNumber: paymentReference.trim() || null,
      remarks: paymentRemarks.trim() || null,
    }), 'Payment recorded.')
    setPaymentTarget(null)
    setPaymentAmount('')
    setPaymentReference('')
    setPaymentRemarks('')
  }

  const createQuickVendor = async () => {
    if (!isAdmin && !selectedProjectId) {
      setError('Select a project before creating a vendor.')
      return
    }
    setSaving(true); setError(null)
    try {
      const vendor = await createVendor({ name: newVendorName.trim(), vendorType: 'OTHER' })
      if (!isAdmin && selectedProjectId) {
        try {
          await assignVendor(selectedProjectId, vendor.id)
        } catch (assignError) {
          setError(`Vendor created, but assignment failed: ${messageOf(assignError)}`)
          setVendors((current) => [...current, vendor])
          setForm((current) => ({ ...current, vendorId: vendor.id }))
          setNewVendorName('')
          setVendorFormOpen(false)
          return
        }
      }
      setVendors((current) => [...current, vendor])
      setForm((current) => ({ ...current, vendorId: vendor.id }))
      setNewVendorName('')
      setVendorFormOpen(false)
      setSuccess('Vendor created. It is now available for this bill.')
    } catch (createError) {
      setError(messageOf(createError))
    } finally {
      setSaving(false)
    }
  }

  const tableBills = view === 'expenses' ? expenses : bills

  return (
    <AppShell currentPath="/app/bills">
      <div className="min-h-screen bg-[#F7F3EE] px-4 py-8 text-[#323232] sm:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-medium uppercase tracking-wide text-[#8A6F52]">Finance</p><h1 className="text-3xl font-semibold">Bills & Payments</h1><p className="mt-1 text-sm text-gray-600">Track project bills, approvals, balances, and payment history.</p>{selectedProject && <p className="mt-1 text-sm text-gray-500">Selected project: {selectedProject.code} — {selectedProject.name}</p>}</div>
            <button onClick={() => { setEditingId(null); setFormOpen(true) }} className="rounded bg-[#323232] px-4 py-2 text-white">Create bill</button>
          </header>

          {error && <div role="alert" className="flex items-center justify-between rounded border border-red-300 bg-red-50 p-3 text-red-800"><span>{error}</span><button className="underline" onClick={() => void load()}>Retry</button></div>}
          {success && <p role="status" className="rounded border border-green-300 bg-green-50 p-3 text-green-800">{success}</p>}

          <nav className="flex flex-wrap gap-2" aria-label="Finance views">
            {([['bills', 'Bills'], ['expenses', 'Project expenses'], ['outstanding', 'Vendor outstanding'], ['payments', 'Payment history']] as const).map(([key, label]) => <button key={key} onClick={() => setView(key)} className={`rounded border px-4 py-2 ${view === key ? 'border-[#323232] bg-[#323232] text-white' : 'bg-white'}`}>{label}</button>)}
          </nav>

          {(view === 'bills' || view === 'expenses') && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {view === 'expenses' && <>
                  <Metric label="Project expenses" value={amount(expenseTotals.total)} />
                  <Metric label="Paid" value={amount(expenseTotals.paid)} />
                  <Metric label="Outstanding" value={amount(expenseTotals.outstanding)} />
                </>}
                {view === 'bills' && <>
                <Metric label="Bills on this page" value={amount(totals.total)} />
                <Metric label="Paid on this page" value={amount(totals.paid)} />
                <Metric label="Outstanding on this page" value={amount(totals.outstanding)} />
                </>}
              </div>
              <section className="rounded-lg border bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-end gap-3">
                  {view === 'bills' && <>
                    <label className="text-sm">Status<select className="mt-1 block rounded border px-3 py-2" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
                    <label className="text-sm">Category<select className="mt-1 block rounded border px-3 py-2" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                    <label className="text-sm">Search<input className="mt-1 block rounded border px-3 py-2" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Bill or vendor" /></label>
                    <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={overdue} onChange={(event) => setOverdue(event.target.checked)} />Overdue only</label>
                  </>}
                  {view === 'expenses' && <label className="text-sm">Project<select className="mt-1 block rounded border px-3 py-2" value={selectedProjectId} onChange={(event) => {
                    selectProject(event.target.value)
                  }}>{projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}</select></label>}
                  <label className="text-sm">From<input type="date" className="mt-1 block rounded border px-3 py-2" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
                  <label className="text-sm">To<input type="date" className="mt-1 block rounded border px-3 py-2" value={to} onChange={(event) => setTo(event.target.value)} /></label>
                </div>
                {loading ? <p className="py-10 text-center text-gray-500">Loading finance records…</p> : tableBills.length === 0 ? <p className="py-10 text-center text-gray-500">{view === 'expenses' ? 'No expenses recorded for this project and date range.' : 'No bills match these filters.'}</p> : (
                  <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
                    <thead><tr className="border-b text-gray-500"><th className="py-2">Bill</th><th>Project</th><th>Vendor</th><th>Date</th><th>Total</th><th>Paid / outstanding</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>{tableBills.map((bill) => <tr key={bill.id} className="border-b last:border-0">
                      <td className="py-3"><button className="font-medium text-blue-700 underline" onClick={() => void chooseBill(bill)}>{bill.billNumber}</button><div className="text-xs text-gray-500">{bill.category}</div></td>
                      <td>{bill.project?.code ?? bill.projectId}</td><td>{bill.vendor?.name ?? '—'}</td><td>{dateLabel(bill.billDate)}</td><td>{amount(bill.totalAmount)}</td>
                      <td>{amount(bill.paidAmount)} / {amount(bill.outstandingAmount)}</td><td>{bill.status.replaceAll('_', ' ')}</td>
                      <td className="space-x-2 whitespace-nowrap">
                        {isAdmin && bill.status === 'PENDING' && <button className="text-green-700 underline" disabled={saving} onClick={() => void action(() => approveBill(bill.id), 'Bill approved.')}>Approve</button>}
                        {isAdmin && bill.status === 'PENDING' && <button className="text-red-700 underline" disabled={saving} onClick={() => { setRejecting(true); setSelectedBill(bill) }}>Reject</button>}
                        {isAdmin && ['APPROVED', 'PARTIALLY_PAID'].includes(bill.status) && <button className="text-blue-700 underline" onClick={() => setPaymentTarget(bill)}>Record payment</button>}
                        {(isAdmin || bill.submittedById === user?.id) && ['PENDING', 'REJECTED'].includes(bill.status) && <button className="text-blue-700 underline" onClick={() => beginEdit(bill)}>Edit</button>}
                        {(isAdmin || bill.submittedById === user?.id) && bill.status === 'PENDING' && <button className="text-red-700 underline" disabled={saving} onClick={() => { if (window.confirm(`Delete bill ${bill.billNumber}?`)) void action(() => deleteBill(bill.id), 'Bill deleted.') }}>Delete</button>}
                      </td>
                    </tr>)}</tbody>
                  </table></div>
                )}
                {view === 'bills' && totalBillPages > 1 && <div className="mt-4 flex items-center justify-between text-sm"><span>Page {billPage} of {totalBillPages}</span><div className="flex gap-2"><button className="rounded border px-3 py-1 disabled:opacity-50" disabled={billPage <= 1 || loading} onClick={() => setBillPage((page) => page - 1)}>Previous</button><button className="rounded border px-3 py-1 disabled:opacity-50" disabled={billPage >= totalBillPages || loading} onClick={() => setBillPage((page) => page + 1)}>Next</button></div></div>}
              </section>
            </>
          )}

          {view === 'outstanding' && <ReportSection title="Vendor outstanding" loading={loading} empty={!outstanding.length} emptyText="No outstanding balances for this date range.">
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="py-2">Vendor</th><th>Total</th><th>Paid</th><th>Outstanding</th></tr></thead><tbody>{outstanding.map((row) => <tr key={row.vendorId} className="border-b"><td className="py-3">{row.vendorName}</td><td>{amount(row.totalAmount)}</td><td>{amount(row.paidAmount)}</td><td>{amount(row.outstandingAmount)}</td></tr>)}</tbody></table></div>
          </ReportSection>}

          {view === 'payments' && <ReportSection title="Payment history" loading={loading} empty={!history.length} emptyText="No payments found for this date range.">
            <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="py-2">Payment date</th><th>Bill</th><th>Vendor</th><th>Project</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Recorded by</th></tr></thead><tbody>{history.map((payment) => <tr key={payment.id} className="border-b"><td className="py-3">{dateLabel(payment.paymentDate)}</td><td>{payment.bill.billNumber}</td><td>{payment.bill.vendor.name}</td><td>{projects.find((project) => project.id === payment.bill.projectId)?.code ?? payment.bill.projectId}</td><td>{amount(payment.amount)}</td><td>{payment.mode.replaceAll('_', ' ')}</td><td>{payment.referenceNumber || '—'}</td><td>{payment.recordedBy.name}</td></tr>)}</tbody></table></div>
          </ReportSection>}
        </div>
      </div>

      {formOpen && <Modal title={editingId === null ? 'Create and submit bill' : 'Edit bill'} onClose={resetBillForm}>
        <form className="space-y-3" onSubmit={(event) => void submitBill(event)}>
          <label className="block text-sm">Project<select required className="mt-1 w-full rounded border px-3 py-2" value={form.projectId || ''} disabled={editingId !== null} onChange={(event) => setForm({ ...form, projectId: Number(event.target.value) })}><option value="">Choose project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}</select></label>
          <div className="flex items-end gap-2"><label className="block flex-1 text-sm">Vendor<select required className="mt-1 w-full rounded border px-3 py-2" value={form.vendorId || ''} onChange={(event) => setForm({ ...form, vendorId: Number(event.target.value) })}><option value="">Choose vendor</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></label><button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => setVendorFormOpen((value) => !value)}>Add</button></div>
          {vendorFormOpen && <div className="flex gap-2"><input required className="min-w-0 flex-1 rounded border px-3 py-2" placeholder="Vendor name" value={newVendorName} onChange={(event) => setNewVendorName(event.target.value)} /><button type="button" className="rounded border px-3 py-2" disabled={saving || !newVendorName.trim()} onClick={() => void createQuickVendor()}>Create</button></div>}
          <label className="block text-sm">Invoice number<input required maxLength={100} className="mt-1 w-full rounded border px-3 py-2" value={form.billNumber} onChange={(event) => setForm({ ...form, billNumber: event.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm">Invoice date<input type="date" required className="mt-1 w-full rounded border px-3 py-2" value={form.billDate} onChange={(event) => setForm({ ...form, billDate: event.target.value })} /></label><label className="block text-sm">Due date<input type="date" min={form.billDate} className="mt-1 w-full rounded border px-3 py-2" value={form.dueDate ?? ''} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label></div>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm">Category<select className="mt-1 w-full rounded border px-3 py-2" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as BillCategory })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="block text-sm">GST<select className="mt-1 w-full rounded border px-3 py-2" value={form.gstPercent} onChange={(event) => setForm({ ...form, gstPercent: Number(event.target.value) as BillInput['gstPercent'] })}>{[0, 5, 12, 18, 28].map((rate) => <option key={rate} value={rate}>{rate}%</option>)}</select></label></div>
          <label className="block text-sm">Base amount<input type="number" min="0.01" step="0.01" required className="mt-1 w-full rounded border px-3 py-2" value={form.baseAmount || ''} onChange={(event) => setForm({ ...form, baseAmount: Number(event.target.value) })} /></label>
          <label className="block text-sm">Description<textarea maxLength={5000} rows={2} className="mt-1 w-full rounded border px-3 py-2" value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <p className="text-sm text-gray-600">GST amount: {amount(Number(form.baseAmount || 0) * form.gstPercent / 100)} · Total: {amount(Number(form.baseAmount || 0) * (1 + form.gstPercent / 100))}</p>
          <div className="flex gap-2"><button disabled={saving || !projects.length} className="rounded bg-[#323232] px-4 py-2 text-white disabled:opacity-50">{saving ? 'Saving…' : editingId === null ? 'Submit bill' : 'Save changes'}</button><button type="button" className="rounded border px-4 py-2" onClick={resetBillForm}>Cancel</button></div>
        </form>
      </Modal>}

      {selectedBill && <Modal title={rejecting ? `Reject ${selectedBill.billNumber}` : `Bill ${selectedBill.billNumber}`} onClose={() => { setSelectedBill(null); setRejecting(false); setRejectionReason('') }}>
        {rejecting && isAdmin ? <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void action(() => rejectBill(selectedBill.id, rejectionReason), 'Bill rejected.'); setRejectionReason('') }}><label className="block text-sm">Reason (5–1000 characters)<textarea minLength={5} maxLength={1000} required rows={4} className="mt-1 w-full rounded border px-3 py-2" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} /></label><button disabled={saving} className="rounded bg-red-700 px-4 py-2 text-white">Reject bill</button></form> : <div className="space-y-3 text-sm">
          <p><strong>Vendor:</strong> {selectedBill.vendor.name}</p><p><strong>Project:</strong> {selectedBill.project?.name ?? selectedBill.projectId}</p><p><strong>Status:</strong> {selectedBill.status.replaceAll('_', ' ')}</p><p><strong>Invoice date:</strong> {dateLabel(selectedBill.billDate)} · <strong>Due:</strong> {dateLabel(selectedBill.dueDate)}</p><p><strong>Amount:</strong> {amount(selectedBill.totalAmount)} · <strong>Paid:</strong> {amount(selectedBill.paidAmount)} · <strong>Outstanding:</strong> {amount(selectedBill.outstandingAmount)}</p>
          {selectedBill.rejectionReason && <p className="rounded bg-red-50 p-2 text-red-800">Rejection: {selectedBill.rejectionReason}</p>}
          <h3 className="font-semibold">Payments</h3>{billPayments.length ? <ul className="divide-y">{billPayments.map((payment) => <li key={payment.id} className="py-2">{dateLabel(payment.paymentDate)} · {amount(payment.amount)} · {payment.mode.replaceAll('_', ' ')} {payment.referenceNumber ? `· ${payment.referenceNumber}` : ''}</li>)}</ul> : <p className="text-gray-500">No payments recorded.</p>}
        </div>}
      </Modal>}

      {paymentTarget && <Modal title={`Record payment · ${paymentTarget.billNumber}`} onClose={() => setPaymentTarget(null)}>
        <form className="space-y-3" onSubmit={(event) => void submitPayment(event)}>
          <p className="text-sm text-gray-600">Outstanding balance: {amount(paymentTarget.outstandingAmount)}</p>
          <label className="block text-sm">Amount<input required type="number" min="0.01" max={paymentTarget.outstandingAmount} step="0.01" className="mt-1 w-full rounded border px-3 py-2" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /></label>
          <label className="block text-sm">Payment date<input required type="date" min={paymentTarget.billDate.slice(0, 10)} max={today} className="mt-1 w-full rounded border px-3 py-2" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} /></label>
          <label className="block text-sm">Mode<select className="mt-1 w-full rounded border px-3 py-2" value={paymentMode} onChange={(event) => setPaymentMode(event.target.value as PaymentMode)}>{modes.map((mode) => <option key={mode}>{mode}</option>)}</select></label>
          <label className="block text-sm">Reference number<input maxLength={255} className="mt-1 w-full rounded border px-3 py-2" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} /></label>
          <label className="block text-sm">Remarks<textarea maxLength={1000} rows={2} className="mt-1 w-full rounded border px-3 py-2" value={paymentRemarks} onChange={(event) => setPaymentRemarks(event.target.value)} /></label>
          <button disabled={saving} className="rounded bg-[#323232] px-4 py-2 text-white">Record payment</button>
        </form>
      </Modal>}
    </AppShell>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>
}

function ReportSection({ title, loading, empty, emptyText, children }: { title: string; loading: boolean; empty: boolean; emptyText: string; children: ReactNode }) {
  return <section className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="mb-4 text-xl font-semibold">{title}</h2>{loading ? <p className="py-10 text-center text-gray-500">Loading report…</p> : empty ? <p className="py-10 text-center text-gray-500">{emptyText}</p> : children}</section>
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"><div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">{title}</h2><button aria-label="Close dialog" className="rounded border px-3 py-1" onClick={onClose}>Close</button></div>{children}</section></div>
}
