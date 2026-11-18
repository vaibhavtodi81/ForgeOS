import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Plus, Wallet, RefreshCw } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { useAuth } from '../../authentication/auth/useAuth'
import { useProjects } from '../../projects/useProjects'
import { ApiError } from '../../../lib/api'
import {
  createInvoice,
  fetchInvoicePayments,
  fetchInvoices,
  recordPayment,
  setInvoiceStatus,
  type InvoiceRow,
  type InvoiceStatus,
  type PaymentMethod,
  type PaymentRow,
} from '../data/invoicesApi'

const statusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  VOID: 'Void',
}
const statusStyles: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-[#F5EDE1] text-[#9A7950]',
  SENT: 'bg-[#F1EAF6] text-[#806B96]',
  PARTIALLY_PAID: 'bg-[#F8ECEA] text-[#9B625A]',
  PAID: 'bg-[#E8EFE5] text-[#617858]',
  VOID: 'bg-[#F7F3EE] text-[#8E827A]',
}
const statuses: InvoiceStatus[] = ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'VOID']
const gstRates = [0, 5, 12, 18, 28]
const methods: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CHEQUE', label: 'Cheque' },
]
const today = new Date().toISOString().slice(0, 10)

function messageOf(error: unknown) {
  return error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
function amount(value: number | null | undefined) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value ?? 0))
}
function dateLabel(value?: string | null) {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function BillsPage({ openUpload = false }: { openUpload?: boolean }) {
  const { user } = useAuth()
  const { projects, selectedProjectId, selectProject } = useProjects()
  const isAdmin = user?.role === 'ADMIN'
  const [items, setItems] = useState<InvoiceRow[]>([])
  const [summary, setSummary] = useState({ invoiced: 0, collected: 0, receivables: 0, overdue: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(openUpload)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({ projectId: '', amount: '', gstPct: 18, issueDate: today, dueDate: '' })
  const [paymentsTarget, setPaymentsTarget] = useState<InvoiceRow | null>(null)
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'BANK' as PaymentMethod, paidAt: today, reference: '' })
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchInvoices({
        status: statusFilter || undefined,
        projectId: selectedProjectId || undefined,
      }, signal)
      if (!signal?.aborted) {
        setItems(result.items)
        setSummary(result.summary)
      }
    } catch (loadError) {
      if (!signal?.aborted) setError(messageOf(loadError))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [statusFilter, selectedProjectId])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  useEffect(() => {
    if (selectedProjectId) setForm((current) => ({ ...current, projectId: current.projectId || selectedProjectId }))
  }, [selectedProjectId])

  const openPayments = async (invoice: InvoiceRow) => {
    setPaymentsTarget(invoice)
    setPaymentsError(null)
    setPaymentError(null)
    setPaymentForm({ amount: '', method: 'BANK', paidAt: today, reference: '' })
    setPaymentsLoading(true)
    try {
      setPayments(await fetchInvoicePayments(invoice.id))
    } catch (detailError) {
      setPaymentsError(messageOf(detailError))
      setPayments([])
    } finally {
      setPaymentsLoading(false)
    }
  }

  const submitInvoice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setFormError(null)
    setError(null)
    setSuccess(null)
    try {
      const created = await createInvoice({
        projectId: form.projectId,
        amount: Number(form.amount),
        gstPct: Number(form.gstPct),
        issueDate: form.issueDate,
        dueDate: form.dueDate,
      })
      setSuccess(`Invoice ${created.invoiceNo} created as draft.`)
      setFormOpen(false)
      setForm({ projectId: selectedProjectId || '', amount: '', gstPct: 18, issueDate: today, dueDate: '' })
      await load()
    } catch (submitError) {
      setFormError(messageOf(submitError))
    } finally {
      setSaving(false)
    }
  }

  const action = async (run: () => Promise<unknown>, message: string) => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await run()
      setSuccess(message)
      await load()
    } catch (actionError) {
      setError(messageOf(actionError))
    } finally {
      setSaving(false)
    }
  }

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!paymentsTarget) return
    setPaymentError(null)
    setSaving(true)
    try {
      await recordPayment({
        invoiceId: paymentsTarget.id,
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        ...(paymentForm.reference.trim() ? { reference: paymentForm.reference.trim() } : {}),
        paidAt: paymentForm.paidAt,
      })
      setSuccess(`Payment recorded for ${paymentsTarget.invoiceNo}.`)
      setPaymentsTarget(null)
      await load()
    } catch (paymentSubmitError) {
      setPaymentError(messageOf(paymentSubmitError))
    } finally {
      setSaving(false)
    }
  }

  const cards = [
    { label: 'Invoiced', value: amount(summary.invoiced) },
    { label: 'Collected', value: amount(summary.collected) },
    { label: 'Receivables', value: amount(summary.receivables) },
    { label: 'Overdue', value: amount(summary.overdue) },
  ]
  const dueDateWarning = (invoice: InvoiceRow) => invoice.status === 'SENT' || invoice.status === 'PARTIALLY_PAID'
    ? new Date(invoice.dueDate).getTime() < Date.now()
    : false

  return (
    <AppShell currentPath="/app/bills">
      <div className="min-h-screen bg-[#F7F3EE] px-4 py-8 text-[#323232] sm:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-medium uppercase tracking-wide text-[#8A6F52]">Finance</p><h1 className="text-3xl font-semibold">Invoices &amp; Payments</h1><p className="mt-1 text-sm text-gray-600">Project invoices, GST, collections, and outstanding balances.</p></div>
            {isAdmin && <button onClick={() => setFormOpen(true)} className="inline-flex items-center gap-2 rounded bg-[#323232] px-4 py-2 text-white"><Plus size={16} /> New invoice</button>}
          </header>

          {error && <div role="alert" className="flex items-center justify-between rounded border border-red-300 bg-red-50 p-3 text-red-800"><span>{error}</span><button className="underline" onClick={() => void load()}>Retry</button></div>}
          {success && <p role="status" className="rounded border border-green-300 bg-green-50 p-3 text-green-800">{success}</p>}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value }) => <div key={label} className="rounded-lg border bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-xl font-semibold">{loading ? '—' : value}</p></div>)}
          </div>

          <section className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <label className="text-sm">Status<select className="mt-1 block rounded border px-3 py-2" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
              <label className="text-sm">Project<select className="mt-1 block rounded border px-3 py-2" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)}><option value="">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}</select></label>
              <button className="inline-flex items-center gap-1 rounded border px-3 py-2 text-sm" onClick={() => void load()}><RefreshCw size={14} /> Refresh</button>
            </div>
            {loading ? <p className="py-10 text-center text-gray-500">Loading invoices…</p> : items.length === 0 ? <p className="py-10 text-center text-gray-500">No invoices match these filters.</p> : (
              <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm">
                <thead><tr className="border-b text-gray-500"><th className="py-2">Invoice</th><th>Project</th><th>Amount</th><th>GST</th><th>Total incl. GST</th><th>Paid</th><th>Balance</th><th>Status</th><th>Issue → Due</th><th className="text-right">Actions</th></tr></thead>
                <tbody>{items.map((invoice) => <tr key={invoice.id} className={`border-b last:border-0 ${invoice.status === 'VOID' ? 'opacity-60' : ''}`}>
                  <td className="py-3"><span className="font-medium font-mono">{invoice.invoiceNo}</span></td>
                  <td>{invoice.project?.code ?? invoice.projectId}<div className="text-xs text-gray-500">{invoice.project?.name}</div></td>
                  <td>{amount(invoice.amount)}</td>
                  <td>{invoice.gstPct}%</td>
                  <td>{amount(invoice.totalWithGst)}</td>
                  <td>{amount(invoice.paidAmount)}</td>
                  <td>{invoice.balance > 0 ? amount(invoice.balance) : '—'}</td>
                  <td><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[invoice.status]}`}>{statusLabels[invoice.status]}</span></td>
                  <td>{dateLabel(invoice.issueDate)} → <span className={dueDateWarning(invoice) ? 'font-semibold text-red-700' : ''}>{dateLabel(invoice.dueDate)}</span>{dueDateWarning(invoice) && <span className="ml-1 text-xs text-red-700">overdue</span>}</td>
                  <td className="space-x-2 whitespace-nowrap text-right">
                    {isAdmin && invoice.status === 'DRAFT' && <button className="text-blue-700 underline" disabled={saving} onClick={() => void action(() => setInvoiceStatus(invoice.id, 'SENT'), `Invoice ${invoice.invoiceNo} sent.`)}>Send</button>}
                    {isAdmin && (invoice.status === 'DRAFT' || invoice.status === 'SENT') && <button className="text-red-700 underline" disabled={saving} onClick={() => { if (window.confirm(`Void invoice ${invoice.invoiceNo}? This cannot be undone.`)) void action(() => setInvoiceStatus(invoice.id, 'VOID'), `Invoice ${invoice.invoiceNo} voided.`) }}>Void</button>}
                    <button className="text-blue-700 underline" onClick={() => void openPayments(invoice)}>Payments</button>
                  </td>
                </tr>)}</tbody>
              </table></div>
            )}
            <p className="mt-4 text-xs text-gray-500">Summary covers every non-draft, non-void invoice you can access; the table honours the filters above.</p>
          </section>
        </div>
      </div>

      {formOpen && <Modal title="New invoice" onClose={() => setFormOpen(false)}>
        <form className="space-y-3" onSubmit={(event) => void submitInvoice(event)}>
          <label className="block text-sm">Project<select required className="mt-1 w-full rounded border px-3 py-2" value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })}><option value="">Choose project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm">Amount<input type="number" min="0.01" step="0.01" required className="mt-1 w-full rounded border px-3 py-2" value={form.amount || ''} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label><label className="block text-sm">GST<select className="mt-1 w-full rounded border px-3 py-2" value={form.gstPct} onChange={(event) => setForm({ ...form, gstPct: Number(event.target.value) })}>{gstRates.map((rate) => <option key={rate} value={rate}>{rate}%</option>)}</select></label></div>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm">Issue date<input type="date" required className="mt-1 w-full rounded border px-3 py-2" value={form.issueDate} onChange={(event) => setForm({ ...form, issueDate: event.target.value })} /></label><label className="block text-sm">Due date<input type="date" required min={form.issueDate} className="mt-1 w-full rounded border px-3 py-2" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label></div>
          <p className="text-sm text-gray-600">Total incl. GST: {amount(Number(form.amount || 0) * (1 + form.gstPct / 100))}</p>
          {formError && <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
          <div className="flex gap-2"><button disabled={saving || !projects.length} className="rounded bg-[#323232] px-4 py-2 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Create invoice'}</button><button type="button" className="rounded border px-4 py-2" onClick={() => setFormOpen(false)}>Cancel</button></div>
        </form>
      </Modal>}

      {paymentsTarget && <Modal title={`Payments · ${paymentsTarget.invoiceNo}`} onClose={() => setPaymentsTarget(null)}>
        <div className="space-y-4 text-sm">
          <p className="text-gray-600">{paymentsTarget.project?.name ?? paymentsTarget.projectId} · Total {amount(paymentsTarget.totalWithGst)} · Paid {amount(paymentsTarget.paidAmount)} · Balance {amount(paymentsTarget.balance)}</p>
          {paymentsError && <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-red-800">{paymentsError}</p>}
          <div>
            <h3 className="font-semibold">Recorded payments</h3>
            {paymentsLoading ? <p className="py-4 text-center text-gray-500">Loading payments…</p>
              : payments.length === 0 ? <p className="py-2 text-gray-500">No payments recorded yet.</p>
                : <ul className="divide-y">{payments.map((payment) => <li key={payment.id} className="flex items-center justify-between gap-3 py-2"><span>{dateLabel(payment.paidAt)} · {amount(payment.amount)} · {methods.find((method) => method.value === payment.method)?.label ?? payment.method}</span><span className="text-gray-500">{payment.reference || '—'}</span></li>)}</ul>}
          </div>
          {isAdmin && (paymentsTarget.status === 'SENT' || paymentsTarget.status === 'PARTIALLY_PAID') && (
            <form className="space-y-3 border-t pt-4" onSubmit={(event) => void submitPayment(event)}>
              <h3 className="font-semibold">Record payment</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">Amount<input required type="number" min="0.01" max={paymentsTarget.balance} step="0.01" className="mt-1 w-full rounded border px-3 py-2" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} /></label>
                <label className="block text-sm">Method<select className="mt-1 w-full rounded border px-3 py-2" value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value as PaymentMethod })}>{methods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}</select></label>
                <label className="block text-sm">Paid on<input required type="date" className="mt-1 w-full rounded border px-3 py-2" value={paymentForm.paidAt} onChange={(event) => setPaymentForm({ ...paymentForm, paidAt: event.target.value })} /></label>
                <label className="block text-sm">Reference (optional)<input maxLength={255} className="mt-1 w-full rounded border px-3 py-2" value={paymentForm.reference} onChange={(event) => setPaymentForm({ ...paymentForm, reference: event.target.value })} /></label>
              </div>
              {paymentError && <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-red-800">{paymentError}</p>}
              <button disabled={saving} className="inline-flex items-center gap-2 rounded bg-[#323232] px-4 py-2 text-white disabled:opacity-50"><Wallet size={15} />{saving ? 'Recording…' : 'Record payment'}</button>
            </form>
          )}
          {isAdmin && paymentsTarget.status === 'DRAFT' && <p className="text-gray-500">Send the invoice before recording payments against it.</p>}
          {paymentsTarget.status === 'PAID' && <p className="text-gray-500">This invoice is fully paid.</p>}
          {paymentsTarget.status === 'VOID' && <p className="text-gray-500">This invoice is void; no payments can be recorded.</p>}
        </div>
      </Modal>}
    </AppShell>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"><div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">{title}</h2><button aria-label="Close dialog" className="rounded border px-3 py-1" onClick={onClose}>Close</button></div>{children}</section></div>
}
